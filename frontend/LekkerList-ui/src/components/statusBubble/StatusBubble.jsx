import { useState } from "react";
import { Spin } from "antd";
import "./StatusBubble.css";

const STATUS_OPTIONS = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default function StatusBubble({
  orderId,
  currentStatus,
  user,
  sellerId,
  onStatusChange,
}) {
  const [status, setStatus] = useState(currentStatus || "pending");
  const [saving, setSaving] = useState(false);

  const isSeller = Number(user?.id) === Number(sellerId);

  const updateStatus = async (newStatus) => {
    if (!isSeller) return;

    setStatus(newStatus);
    setSaving(true);

    try {
      const res = await fetch(
        "http://localhost/LekkerList/backend/api/updateOrderStatus.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: orderId,
            user_id: user.id,
            status: newStatus,
          }),
        },
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.error || "Failed to update status");
        setStatus(currentStatus);
      } else {
        onStatusChange?.(newStatus);
      }
    } catch {
      alert("Failed to connect to server");
      setStatus(currentStatus);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`statusBubble status-${status}`}>
      <div className="statusHeader">
        <span className="statusDot" />
        <span className="statusText">
          Order Status: <strong>{status}</strong>
        </span>
      </div>

      {isSeller && (
        <div className="statusControls">
          <select
            value={status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={saving}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {saving && <Spin size="small" />}
        </div>
      )}
    </div>
  );
}
