import { useState, useEffect } from "react";
import "../App.css";

export default function AddItemModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    item_type_id: "",
    item_variant: "",
    stock: "",
    stock_unit_id: "",
    supplier_id: "",
    status: "Available",
  });

  const [itemTypes, setItemTypes] = useState([]);
  const [stockUnits, setStockUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load dropdown data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [typesRes, unitsRes, suppliersRes] = await Promise.all([
          fetch("http://localhost:5000/api/item-types"),
          fetch("http://localhost:5000/api/stock-units"),
          fetch("http://localhost:5000/api/suppliers"),
        ]);

        const [types, units, suppliers] = await Promise.all([
          typesRes.json(),
          unitsRes.json(),
          suppliersRes.json(),
        ]);

        setItemTypes(types);
        setStockUnits(units);
        setSuppliers(suppliers);
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
        setError("Failed to load form data");
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleAdd = async () => {
    // Validation
    if (!form.item_type_id || !form.item_variant || !form.stock || !form.stock_unit_id || !form.supplier_id) {
      setError("Please fill in all required fields");
      return;
    }

    if (isNaN(form.stock) || parseFloat(form.stock) < 0) {
      setError("Stock must be a valid number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_type_id: parseInt(form.item_type_id),
          item_variant: form.item_variant,
          stock: parseFloat(form.stock),
          stock_unit_id: parseInt(form.stock_unit_id),
          supplier_id: parseInt(form.supplier_id),
          status: form.status || "Available",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to add item");
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Error adding item:", err);
      setError(err.message || "Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Close modal when clicking backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-container" onClick={handleBackdropClick}>
      <div className="modal-box" style={{ maxWidth: "500px", width: "90%" }}>
        {/* Header */}
        <div style={{ marginBottom: "20px", borderBottom: "2px solid #f0f0f0", paddingBottom: "15px" }}>
          <h2 style={{ margin: 0, fontSize: "24px", color: "#2e2e2e", fontWeight: "600" }}>
            Add New Item
          </h2>
          <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#666" }}>
            Create a new inventory item
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            color: "#eb3b5a", 
            marginBottom: "15px", 
            padding: "10px", 
            background: "#ffe6e6", 
            borderRadius: "6px",
            fontSize: "14px"
          }}>
            {error}
          </div>
        )}

        {/* Form Fields */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2e2e2e" }}>
            Item Type *
          </label>
          <select
            name="item_type_id"
            value={form.item_type_id}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              fontSize: "14px", 
              borderRadius: "8px",
              border: "1px solid #ccc",
              boxSizing: "border-box"
            }}
            required
          >
            <option value="">Select Item Type</option>
            {itemTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2e2e2e" }}>
            Item Variant *
          </label>
          <input
            name="item_variant"
            type="text"
            placeholder="Item Variant"
            value={form.item_variant}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              fontSize: "14px", 
              borderRadius: "8px",
              border: "1px solid #ccc",
              boxSizing: "border-box"
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2e2e2e" }}>
            Stock *
          </label>
          <input
            name="stock"
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            min="0"
            step="0.01"
            style={{ 
              width: "100%", 
              padding: "10px", 
              fontSize: "14px", 
              borderRadius: "8px",
              border: "1px solid #ccc",
              boxSizing: "border-box"
            }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2e2e2e" }}>
            Stock Unit *
          </label>
          <select
            name="stock_unit_id"
            value={form.stock_unit_id}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              fontSize: "14px", 
              borderRadius: "8px",
              border: "1px solid #ccc",
              boxSizing: "border-box"
            }}
            required
          >
            <option value="">Select Stock Unit</option>
            {stockUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2e2e2e" }}>
            Supplier *
          </label>
          <select
            name="supplier_id"
            value={form.supplier_id}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              fontSize: "14px", 
              borderRadius: "8px",
              border: "1px solid #ccc",
              boxSizing: "border-box"
            }}
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "14px", color: "#2e2e2e" }}>
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            style={{ 
              width: "100%", 
              padding: "10px", 
              fontSize: "14px", 
              borderRadius: "8px",
              border: "1px solid #ccc",
              boxSizing: "border-box"
            }}
          >
            <option value="Available">Available</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Restocking">Restocking</option>
            <option value="Phased Out">Phased Out</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "25px" }}>
          <button 
            onClick={onClose} 
            disabled={loading}
            style={{ 
              padding: "10px 20px", 
              background: "#e0e0e0", 
              color: "#2e2e2e", 
              border: "none", 
              borderRadius: "8px", 
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "0.2s"
            }}
            onMouseOver={(e) => !loading && (e.target.style.background = "#d0d0d0")}
            onMouseOut={(e) => !loading && (e.target.style.background = "#e0e0e0")}
          >
            Cancel
          </button>
          <button 
            onClick={handleAdd} 
            disabled={loading}
            style={{ 
              padding: "10px 20px", 
              background: loading ? "#ccc" : "#4b7bec", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "0.2s"
            }}
            onMouseOver={(e) => !loading && (e.target.style.background = "#3867d6")}
            onMouseOut={(e) => !loading && (e.target.style.background = loading ? "#ccc" : "#4b7bec")}
          >
            {loading ? "Adding..." : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
