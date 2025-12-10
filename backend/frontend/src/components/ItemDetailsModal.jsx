import "../App.css";

export default function ItemDetailsModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="modal-container" onClick={(e) => e.target === e.currentTarget && onClose()}>
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
            <span style={{ fontSize: "20px" }}>ℹ️</span>
            <h2 style={{ margin: 0, fontSize: "20px", color: "#2e2e2e", fontWeight: "600" }}>
              Item Details
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

        {/* Details Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Item Type */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: "#666" 
            }}>
              Item Type
            </label>
            <div style={{ 
              padding: "12px", 
              fontSize: "16px", 
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              background: "#f9f9f9",
              color: "#2e2e2e"
            }}>
              {item.item_type || "N/A"}
            </div>
          </div>

          {/* Item Variant */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: "#666" 
            }}>
              Item Variant
            </label>
            <div style={{ 
              padding: "12px", 
              fontSize: "16px", 
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              background: "#f9f9f9",
              color: "#2e2e2e"
            }}>
              {item.item_variant || "N/A"}
            </div>
          </div>

          {/* Usable Stocks */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: "#666" 
            }}>
              Usable Stocks
            </label>
            <div style={{ 
              padding: "12px", 
              fontSize: "16px", 
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              background: "#f9f9f9",
              color: "#2e2e2e"
            }}>
              {item.stock !== undefined ? item.stock : "N/A"} {item.stock_unit || ""}
            </div>
          </div>

          {/* Reorder Point */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: "#666" 
            }}>
              Reorder Point
            </label>
            <div style={{ 
              padding: "12px", 
              fontSize: "16px", 
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              background: "#f9f9f9",
              color: "#2e2e2e"
            }}>
              {(item["reorder-point"] !== null && item["reorder-point"] !== undefined) || (item.reorder_point !== null && item.reorder_point !== undefined) 
                ? (item["reorder-point"] !== undefined ? item["reorder-point"] : item.reorder_point) 
                : "N/A"} {item.stock_unit || ""}
            </div>
          </div>

          {/* Stock Unit */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: "#666" 
            }}>
              Stock Unit
            </label>
            <div style={{ 
              padding: "12px", 
              fontSize: "16px", 
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              background: "#f9f9f9",
              color: "#2e2e2e"
            }}>
              {item.stock_unit || "N/A"}
            </div>
          </div>

          {/* Supplier */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: "#666" 
            }}>
              Supplier
            </label>
            <div style={{ 
              padding: "12px", 
              fontSize: "16px", 
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              background: "#f9f9f9",
              color: "#2e2e2e"
            }}>
              {item.supplier || "N/A"}
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={{ 
              display: "block", 
              marginBottom: "8px", 
              fontWeight: "600", 
              fontSize: "14px", 
              color: "#666" 
            }}>
              Status
            </label>
            <div style={{ 
              padding: "12px", 
              fontSize: "16px", 
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              background: "#f9f9f9",
              color: "#2e2e2e"
            }}>
              <span className={`status-tag status-${(item.status || "").toLowerCase().replace(" ", "")}`}>
                {item.status || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #e0e0e0" }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: "12px 24px", 
              background: "#4b7bec", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              transition: "0.2s"
            }}
            onMouseOver={(e) => e.target.style.background = "#3867d6"}
            onMouseOut={(e) => e.target.style.background = "#4b7bec"}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

