import { useState } from "react";
import { Spin } from "antd";
import "./StatusBubble.css";

// Seller can advnace through this chain only
const SELLER_NEXT = {
  paid: "processing",
  processing: "shipped",
};

// Label shown on the seller advance button
const SELLER_BTN_LABEL = {
  paid: "Mark as Processing",
  processing: "Mark as Shipped",
};

export default function StatusBubble({
  orderId,
  currentStatus,
  user,
  sellerIds = [],
  onStatusChange,
}) {
  const [status, setStatus] = useState(currentStatus || "paid");
  const [saving, setSaving] = useState(false);

  // Role Checks
  const isAdmin =
    user?.role === "admin" &&
    ["super_admin", "finance_admin"].includes(user?.admin_role);

  // Seller is involved in this order
  const isSeller =
    user?.role === "seller" &&
    (sellerIds ?? []).map(Number).includes(Number(user?.id));

  const isCustomer = user?.role === "customer";

  // API call
  const callUpdate = async (newStatus) => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost/LekkerList/backend/api/updateOrderStatus.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          requesting_id: user.id,
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      } else {
        alert(data.error || "Failed to update status");
      }
    } catch {
      alert("failed to connect to server");
    } finally {
      setSaving(false);
    }
  };

  // Seller advance button
  const sellerNextStatus = SELLER_NEXT[status];
  const showSellerBtn = isSeller && !!sellerNextStatus;

  // Customer confirms delivery
  const showDeliveryBtn = isCustomer && status === "shipped";

  // Admin cancel/refund
  const showAdminControls =
    isAdmin && !["cancelled", "refunded", "delivered"].includes(status);

  return (
    <div className={`statusBubble status-${status}`}>
      {/* Status Label */}
      <div className="statusHeader">
        <span className="statusDot" />
        <span className="statusText">
          Order Status: <strong>{status}</strong>
        </span>
        {saving && <Spin size="small" style={{ marginLeft: 8 }} />}
      </div>

      <div className="statusControls">
        {/* Seller */}
        {showSellerBtn && (
          <button
            className="statusAdvanceBtn"
            onClick={() => callUpdate(sellerNextStatus)}
            disabled={saving}
          >
            {SELLER_BTN_LABEL[status]}
          </button>
        )}

        {/* Customer */}
        {showDeliveryBtn && (
          <button
            className="statusDeliveryBtn"
            onClick={() => callUpdate("delivered")}
            disabled={saving}
          >
            Confirm Delivery
          </button>
        )}

        {/* Admin */}
        {showAdminControls && (
          <select
            className="statusAdminSelect"
            value=""
            onChange={(e) => {
              if (e.target.value) callUpdate(e.target.value);
            }}
            disabled={saving}
          >
            <option value="">Change Status</option>
            <option value="cancelled">Cancel Order</option>
            <option value="refunded">Refund Order</option>
          </select>
        )}
      </div>
    </div>
  );
}
