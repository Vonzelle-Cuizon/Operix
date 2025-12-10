import { useEffect, useState } from "react";
import AddItemModal from "./components/AddItemModel";
import EditItemModal from "./components/EditItemModel";
import ItemDetailsModal from "./components/ItemDetailsModal";
import ReorderModal from "./components/ReorderModal";
import { apiEndpoint } from "./config";
import "./App.css";

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [isAdminMode, setIsAdminMode] = useState(true); // Toggle between Admin and Production

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);

  // Fetch inventory
  const fetchInventory = async () => {
    const res = await fetch(apiEndpoint("/api/inventory"));
    const data = await res.json();
    setInventory(data);
    setFilteredInventory(data);
  };

  useEffect(() => {
    // 1. Initial load
    fetchInventory();

    // 2. Connect to SSE stream for real-time updates
    const events = new EventSource(apiEndpoint("/events"));

    // When backend broadcasts "inventory_update", refresh data
    events.addEventListener("inventory_update", () => {
      console.log("🔄 Inventory update received (SSE)");
      fetchInventory();
    });

    // Cleanup connection when component unmounts
    return () => {
      events.close();
    };
  }, []);

  // Filter and search logic
  useEffect(() => {
    let list = [...inventory];

    // Search filter - searches in item_type, item_variant, and supplier
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((i) => {
        const itemType = (i.item_type || "").toLowerCase();
        const itemVariant = (i.item_variant || "").toLowerCase();
        const supplier = (i.supplier || "").toLowerCase();
        return itemType.includes(query) || itemVariant.includes(query) || supplier.includes(query);
      });
    }

    // Type filter
    if (selectedType) {
      list = list.filter((i) => i.item_type === selectedType);
    }

    // Status filter
    if (selectedStatus) {
      list = list.filter((i) => i.status === selectedStatus);
    }

    setFilteredInventory(list);
  }, [searchQuery, selectedType, selectedStatus, inventory]);

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    await fetch(apiEndpoint(`/api/inventory/${id}`), {
      method: "DELETE",
    });

    fetchInventory();
  };

  // Dashboard stats
  const stats = {
    total: inventory.length,
    available: inventory.filter((i) => i.status === "Available").length,
    low: inventory.filter((i) => i.status === "Low Stock").length,
    outOfStock: inventory.filter((i) => i.status === "Out of Stock").length,
    restocking: inventory.filter((i) => i.status === "Restocking").length,
    phasedOut: inventory.filter((i) => i.status === "Phased Out").length,
  };

  // Unique types for dropdown
  const itemTypes = [...new Set(inventory.map((i) => i.item_type))];

  return (
    <div className="app-container">
      {/* Header with Logo and Toggle */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "25px",
        padding: "15px 20px",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        {/* Logo on the left */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img 
            src="/operix-logo.png" 
            alt="OPERIX Logo" 
            style={{ 
              height: "60px", 
              width: "auto",
              objectFit: "contain"
            }}
          />
        </div>

        {/* Mode Toggle Switch on the right */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "10px" 
        }}>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "#666" }}>
            Production
          </span>
          <label style={{ 
            position: "relative", 
            display: "inline-block", 
            width: "50px", 
            height: "24px" 
          }}>
            <input
              type="checkbox"
              checked={isAdminMode}
              onChange={(e) => setIsAdminMode(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span style={{
              position: "absolute",
              cursor: "pointer",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: isAdminMode ? "#4b7bec" : "#ccc",
              transition: "0.3s",
              borderRadius: "24px"
            }}>
              <span style={{
                position: "absolute",
                content: '""',
                height: "18px",
                width: "18px",
                left: isAdminMode ? "26px" : "3px",
                bottom: "3px",
                backgroundColor: "white",
                transition: "0.3s",
                borderRadius: "50%",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
              }} />
            </span>
          </label>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "#666" }}>
            Admin
          </span>
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="dashboard">
        <div className="dashboard-card total">Total Materials: {stats.total}</div>
        <div className="dashboard-card available">Available: {stats.available}</div>
        <div className="dashboard-card low">Low Stock: {stats.low}</div>
        <div className="dashboard-card outofstock">Out of Stock: {stats.outOfStock}</div>
        <div className="dashboard-card restocking">Restocking: {stats.restocking}</div>
        <div className="dashboard-card phased">Phased Out: {stats.phasedOut}</div>
      </div>

      {/* Search Bar + Filters + Add Button */}
      <div className="top-bar">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by type, variant, or supplier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          style={{
            flex: "1",
            maxWidth: "400px",
            padding: "10px 15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            background: "white",
            fontSize: "14px",
            outline: "none",
            transition: "border-color 0.2s"
          }}
          onFocus={(e) => e.target.style.borderColor = "#4b7bec"}
          onBlur={(e) => e.target.style.borderColor = "#ccc"}
        />

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="filter-select"
        >
          <option value="">Filter by Type</option>
          {itemTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">Filter by Status</option>
          <option value="Available">Available</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
          <option value="Restocking">Restocking</option>
          <option value="Phased Out">Phased Out</option>
        </select>

        <button className="add-btn" onClick={() => setShowReorder(true)} style={{ background: "#20bf6b" }}>
          📦 Reorder
        </button>
        {isAdminMode && (
          <button className="add-btn" onClick={() => setShowAdd(true)}>
            + Add Item
          </button>
        )}
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item Type</th>
              <th>Item Variant</th>
              <th>Usable Stocks</th>
              <th>Stock Unit</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.id}>
                <td>{item.item_type}</td>
                <td>{item.item_variant}</td>
                <td>{item.stock}</td>
                <td>{item.stock_unit}</td>
                <td>{item.supplier || 'N/A'}</td>

                <td>
                  <span className={`status-tag status-${item.status.toLowerCase().replace(" ", "")}`}>
                    {item.status}
                  </span>
                </td>

                <td className="actions">
                  <button 
                    className="details-btn" 
                    onClick={() => setDetailsItem(item)}
                    style={{
                      border: "none",
                      background: "none",
                      fontSize: "18px",
                      cursor: "pointer",
                      padding: "5px",
                      transition: "0.2s",
                      color: "#4b7bec"
                    }}
                    onMouseOver={(e) => e.target.style.color = "#3867d6"}
                    onMouseOut={(e) => e.target.style.color = "#4b7bec"}
                    title="View Details"
                  >
                    👁️
                  </button>
                  <button className="edit-btn" onClick={() => setEditItem(item)}>✏</button>
                  {isAdminMode && (
                    <button className="delete-btn" onClick={() => handleDelete(item.id)}>🗑</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAdd && (
        <AddItemModal
          onClose={() => setShowAdd(false)}
          onSaved={fetchInventory}
        />
      )}

      {editItem && (
        <EditItemModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSaved={fetchInventory}
          isAdminMode={isAdminMode}
        />
      )}

      {detailsItem && (
        <ItemDetailsModal
          item={detailsItem}
          onClose={() => setDetailsItem(null)}
        />
      )}

      {showReorder && (
        <ReorderModal
          inventory={inventory}
          onClose={() => setShowReorder(false)}
          onSaved={fetchInventory}
        />
      )}
    </div>
  );
}
