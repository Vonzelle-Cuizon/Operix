import { useState, useEffect } from "react";
import { apiEndpoint } from "../config";
import "../App.css";

export default function EditItemModal({ item, onClose, onSaved, isAdminMode = true }) {
  const [form, setForm] = useState({
    item_type_id: item.item_type_id || "",
    item_variant: item.item_variant || "",
    stock: item.stock || "",
    stock_unit_id: item.stock_unit_id || "",
    supplier_id: item.supplier_id || "",
    status: item.status || "Available",
    reorder_point: (item["reorder-point"] !== null && item["reorder-point"] !== undefined) || (item.reorder_point !== null && item.reorder_point !== undefined)
      ? (item["reorder-point"] !== undefined ? item["reorder-point"] : item.reorder_point)
      : "",
    reorder_unit: item.stock_unit || "",
  });

  const [stockUnits, setStockUnits] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusManuallyChanged, setStatusManuallyChanged] = useState(false);

  // Load dropdown data (only for admin mode)
  useEffect(() => {
    if (isAdminMode) {
      const loadData = async () => {
        try {
          const unitsRes = await fetch(apiEndpoint("/api/stock-units"));
        const units = await unitsRes.json();
        setStockUnits(units);
        } catch (err) {
          console.error("Failed to load dropdown data:", err);
          setError("Failed to load form data");
        }
      };

      loadData();
    }
  }, [isAdminMode]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    // Track if status was manually changed
    if (e.target.name === "status") {
      setStatusManuallyChanged(true);
    }
  };

  const handleStockChange = (delta) => {
    const newStock = Math.max(0, parseFloat(form.stock || 0) + delta);
    setForm({ ...form, stock: newStock });
    setError("");
  };

  const handleSave = async () => {
    if (isAdminMode) {
      // Admin mode: Full update
      if (!form.item_type_id || !form.item_variant || form.stock === undefined || !form.stock_unit_id || !form.supplier_id) {
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
        // Build request body - only include status if it was manually changed
        const requestBody = {
          item_type_id: parseInt(form.item_type_id),
          item_variant: form.item_variant,
          stock: parseFloat(form.stock),
          stock_unit_id: parseInt(form.stock_unit_id),
          supplier_id: parseInt(form.supplier_id),
          reorder_point: form.reorder_point ? parseInt(form.reorder_point) : null,
        };
        
        // Only send status if it was manually changed (different from original)
        if (statusManuallyChanged || form.status !== item.status) {
          requestBody.status = form.status;
        }
        
        const response = await fetch(apiEndpoint(`/api/inventory/${item.id}`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || "Failed to update item");
        }

        onSaved();
        onClose();
      } catch (err) {
        console.error("Error updating item:", err);
        setError(err.message || "Failed to update item. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      // Production mode: Only reduce stock using reduce-stock API
      const currentStock = parseFloat(item.stock || 0);
      const newStock = parseFloat(form.stock || 0);

      if (isNaN(newStock) || newStock < 0) {
        setError("Stock must be a valid number");
        return;
      }

      if (newStock > currentStock) {
        setError("Production staff can only reduce stock, not increase it");
        return;
      }

      if (newStock === currentStock) {
        onClose(); // No change needed
        return;
      }

      const reduceAmount = currentStock - newStock;

      setLoading(true);
      setError("");

      try {
        const response = await fetch(apiEndpoint(`/api/inventory/${item.id}/reduce-stock`), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reduceAmount: reduceAmount,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || "Failed to reduce stock");
        }

        onSaved();
        onClose();
      } catch (err) {
        console.error("Error reducing stock:", err);
        setError(err.message || "Failed to reduce stock. Please try again.");
      } finally {
        setLoading(false);
      }
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
        <div style={{ 
          marginBottom: "25px", 
          borderBottom: "1px solid #e0e0e0", 
          paddingBottom: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>✏️</span>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#2e2e2e", fontWeight: "600" }}>
              Edit Material Details
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#666",
              padding: "0",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ×
          </button>
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
        {/* Usable Stocks - Always visible */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "18px" }}>📦</span>
            <label style={{ fontWeight: "600", fontSize: "14px", color: "#2e2e2e" }}>
              Usable Stocks
            </label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              name="stock"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              min="0"
              step="1"
              style={{ 
                flex: 1,
                padding: "12px", 
                fontSize: "16px", 
                borderRadius: "8px",
                border: "1px solid #ccc",
                boxSizing: "border-box"
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <button
                type="button"
                onClick={() => handleStockChange(1)}
                style={{
                  width: "30px",
                  height: "20px",
                  border: "1px solid #ccc",
                  background: "white",
                  cursor: "pointer",
                  borderRadius: "4px 4px 0 0",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => handleStockChange(-1)}
                style={{
                  width: "30px",
                  height: "20px",
                  border: "1px solid #ccc",
                  borderTop: "none",
                  background: "white",
                  cursor: "pointer",
                  borderRadius: "0 0 4px 4px",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* Admin Mode Only Fields */}
        {isAdminMode && (
          <>
            {/* Reorder Point */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#2e2e2e" }}>
                Reorder Point
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  name="reorder_point"
                  type="number"
                  value={form.reorder_point}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  style={{ 
                    flex: 1,
                    padding: "12px", 
                    fontSize: "16px", 
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    boxSizing: "border-box"
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, reorder_point: parseFloat(form.reorder_point || 0) + 1 })}
                    style={{
                      width: "30px",
                      height: "20px",
                      border: "1px solid #ccc",
                      background: "white",
                      cursor: "pointer",
                      borderRadius: "4px 4px 0 0",
                      fontSize: "12px"
                    }}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, reorder_point: Math.max(0, parseFloat(form.reorder_point || 0) - 1) })}
                    style={{
                      width: "30px",
                      height: "20px",
                      border: "1px solid #ccc",
                      borderTop: "none",
                      background: "white",
                      cursor: "pointer",
                      borderRadius: "0 0 4px 4px",
                      fontSize: "12px"
                    }}
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>

            {/* Reorder Unit */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#2e2e2e" }}>
                Reorder Unit
              </label>
              <div style={{ position: "relative" }}>
                <select
                  name="reorder_unit"
                  value={form.reorder_unit}
                  onChange={handleChange}
                  style={{ 
                    width: "100%", 
                    padding: "12px 35px 12px 12px", 
                    fontSize: "16px", 
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    boxSizing: "border-box",
                    appearance: "none",
                    backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 4 5%22><path fill=%22%23666%22 d=%22M2 0L0 2h4zm0 5L0 3h4z%22/></svg>')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    backgroundSize: "12px"
                  }}
                >
                  {stockUnits.map((unit) => (
                    <option key={unit.id} value={unit.name}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Item Type */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#2e2e2e" }}>
                Item Type
              </label>
              <input
                name="item_type"
                type="text"
                value={item.item_type || ""}
                readOnly
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  fontSize: "16px", 
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box",
                  background: "#f5f5f5",
                  color: "#666"
                }}
              />
            </div>

            {/* Item Variant */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#2e2e2e" }}>
                Item Variant
              </label>
              <input
                name="item_variant"
                type="text"
                value={form.item_variant}
                onChange={handleChange}
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  fontSize: "16px", 
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {/* Status */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px", color: "#2e2e2e" }}>
                Status
              </label>
              <div style={{ position: "relative" }}>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={{ 
                    width: "100%", 
                    padding: "12px 35px 12px 12px", 
                    fontSize: "16px", 
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    boxSizing: "border-box",
                    appearance: "none",
                    backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 4 5%22><path fill=%22%23666%22 d=%22M2 0L0 2h4zm0 5L0 3h4z%22/></svg>')",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    backgroundSize: "12px"
                  }}
                >
                  <option value="Available">Available</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Restocking">Restocking</option>
                  <option value="Phased Out">Phased Out</option>
                </select>
              </div>
            </div>

            {/* Flag as Phased Out */}
            <div style={{ 
              marginBottom: "20px", 
              padding: "15px", 
              background: form.status === "Phased Out" ? "#ffe6e6" : "#f5f5f5",
              borderRadius: "8px",
              border: form.status === "Phased Out" ? "2px solid #eb3b5a" : "1px solid #e0e0e0"
            }}>
              <label style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
                color: "#2e2e2e"
              }}>
                <input
                  type="checkbox"
                  checked={form.status === "Phased Out"}
                  onChange={(e) => {
                    setForm({ ...form, status: e.target.checked ? "Phased Out" : "Available" });
                  }}
                  style={{
                    width: "20px",
                    height: "20px",
                    cursor: "pointer"
                  }}
                />
                <span>Flag item as Phased Out</span>
              </label>
              {form.status === "Phased Out" && (
                <p style={{ 
                  margin: "8px 0 0 30px", 
                  fontSize: "12px", 
                  color: "#666",
                  fontStyle: "italic"
                }}>
                  This item will remain Phased Out until manually changed by admin.
                </p>
              )}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #e0e0e0" }}>
          <button 
            onClick={onClose} 
            disabled={loading}
            style={{ 
              padding: "12px 24px", 
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
            onClick={handleSave} 
            disabled={loading}
            style={{ 
              padding: "12px 24px", 
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
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
