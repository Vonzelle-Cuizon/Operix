import { useState, useEffect } from "react";
import { apiEndpoint } from "../config";
import "../App.css";

export default function ReorderModal({ inventory, onClose, onSaved }) {
  const [selectedItemId, setSelectedItemId] = useState("");
  const [newStock, setNewStock] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get selected item details
  const selectedItem = inventory.find((item) => item.id === parseInt(selectedItemId));

  // Update newStock when item is selected
  useEffect(() => {
    if (selectedItem) {
      setNewStock(selectedItem.stock || "");
    } else {
      setNewStock("");
    }
  }, [selectedItemId, selectedItem]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleStockChange = (delta) => {
    const currentStock = parseFloat(newStock || 0);
    const updatedStock = Math.max(0, currentStock + delta);
    setNewStock(updatedStock);
    setError("");
  };

  const handleSave = async () => {
    if (!selectedItemId) {
      setError("Please select an item");
      return;
    }

    if (newStock === "" || isNaN(parseFloat(newStock)) || parseFloat(newStock) < 0) {
      setError("Stock must be a valid number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Calculate the difference
      const currentStock = parseFloat(selectedItem.stock || 0);
      const updatedStock = parseFloat(newStock);
      const stockDifference = updatedStock - currentStock;

      if (stockDifference === 0) {
        // No change, just close
        onClose();
        return;
      }

      // Use PUT endpoint to update stock
      const response = await fetch(apiEndpoint(`/api/inventory/${selectedItemId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stock: updatedStock,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to update stock");
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error("Error updating stock:", err);
      setError(err.message || "Failed to update stock. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-container" onClick={handleBackdropClick}>
      <div className="modal-box" style={{ maxWidth: "500px", width: "90%" }}>
        {/* Header */}
        <div
          style={{
            marginBottom: "25px",
            borderBottom: "1px solid #e0e0e0",
            paddingBottom: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>📦</span>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#2e2e2e", fontWeight: "600" }}>
              Reorder Stock
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
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "12px",
              background: "#fee",
              color: "#c33",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {/* Item Selection Dropdown */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              fontSize: "14px",
              color: "#2e2e2e",
            }}
          >
            Select Item
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 35px 12px 12px",
                fontSize: "16px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                appearance: "none",
                backgroundImage:
                  "url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 4 5%22><path fill=%22%23666%22 d=%22M2 0L0 2h4zm0 5L0 3h4z%22/></svg>')",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "12px",
              }}
            >
              <option value="">-- Select an item --</option>
              {inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_type} - {item.item_variant} ({item.stock} {item.stock_unit})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Stock Display (Editable) */}
        {selectedItem && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "600",
                  fontSize: "14px",
                  color: "#2e2e2e",
                }}
              >
                Current Stock
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => {
                    setNewStock(e.target.value);
                    setError("");
                  }}
                  min="0"
                  step="0.01"
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "16px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    boxSizing: "border-box",
                  }}
                />
                <span style={{ fontSize: "14px", color: "#666", minWidth: "60px" }}>
                  {selectedItem.stock_unit}
                </span>
                <button
                  onClick={() => handleStockChange(1)}
                  disabled={loading}
                  style={{
                    padding: "8px 12px",
                    background: "#4b7bec",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                  onMouseOver={(e) => !loading && (e.target.style.background = "#3867d6")}
                  onMouseOut={(e) => !loading && (e.target.style.background = "#4b7bec")}
                >
                  ▲
                </button>
                <button
                  onClick={() => handleStockChange(-1)}
                  disabled={loading}
                  style={{
                    padding: "8px 12px",
                    background: "#eb3b5a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                  onMouseOver={(e) => !loading && (e.target.style.background = "#c0392b")}
                  onMouseOut={(e) => !loading && (e.target.style.background = "#eb3b5a")}
                >
                  ▼
                </button>
              </div>
              {selectedItem && (
                <p
                  style={{
                    margin: "8px 0 0 0",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  Original: {selectedItem.stock} {selectedItem.stock_unit} | Change:{" "}
                  {parseFloat(newStock || 0) - parseFloat(selectedItem.stock || 0) >= 0 ? "+" : ""}
                  {(parseFloat(newStock || 0) - parseFloat(selectedItem.stock || 0)).toFixed(2)}{" "}
                  {selectedItem.stock_unit}
                </p>
              )}
            </div>

            {/* Item Info Display */}
            <div
              style={{
                padding: "15px",
                background: "#f5f5f5",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              <p style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#2e2e2e" }}>
                Item Information:
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}>
                <strong>Type:</strong> {selectedItem.item_type}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}>
                <strong>Variant:</strong> {selectedItem.item_variant}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}>
                <strong>Supplier:</strong> {selectedItem.supplier || "N/A"}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "#666" }}>
                <strong>Status:</strong> {selectedItem.status}
              </p>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            marginTop: "25px",
          }}
        >
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
              transition: "0.2s",
            }}
            onMouseOver={(e) => !loading && (e.target.style.background = "#d0d0d0")}
            onMouseOut={(e) => !loading && (e.target.style.background = "#e0e0e0")}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !selectedItemId}
            style={{
              padding: "10px 20px",
              background: loading || !selectedItemId ? "#ccc" : "#4b7bec",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: loading || !selectedItemId ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "0.2s",
            }}
            onMouseOver={(e) =>
              !loading &&
              selectedItemId &&
              (e.target.style.background = "#3867d6")
            }
            onMouseOut={(e) =>
              !loading &&
              selectedItemId &&
              (e.target.style.background = "#4b7bec")
            }
          >
            {loading ? "Updating..." : "Update Stock"}
          </button>
        </div>
      </div>
    </div>
  );
}

