import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import StatusBubble from "../statusBubble/StatusBubble";
import Box from "../../emoji/box.png";
import "./Orders.css";

const STATUS_COLORS = {
  paid: { bg: "rgba(43,191,179,0.12)", color: "#2bbfb3" },
  pending: { bg: "rgba(245,158,11,0.12)", color: "#d97706" },
  shipped: { bg: "rgba(59,130,246,0.12)", color: "#2563eb" },
  delivered: { bg: "rgba(34,197,94,0.12)", color: "#16a34a" },
  cancelled: { bg: "rgba(239,68,68,0.12)", color: "#dc2626" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
  return (
    <span
      className="orderStatusBadge"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function Orders() {
  const authData = useSelector((s) => s.authentication?.authData);
  const user = authData?.user ?? null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    if (!user?.id) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `http://localhost/LekkerList/backend/api/getTransactions.php?user_id=${user.id}&role=${user.role}`,
        );
        const json = await res.json();
        const txns = json.transactions ?? [];
        setOrders(txns);

        // ── Send statusMap from fetched orders ──
        const initial = {};
        txns.forEach((o) => {
          initial[o.order_id] = o.status;
        });
        setStatusMap(initial);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id, user?.role]);

  const toggleExpand = (id) => setExpanded((prev) => (prev === id ? null : id));

  const handleStatusChange = (orderId, newStatus) => {
    setStatusMap((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  if (!user) {
    return (
      <div className="ordersPage">
        <p className="ordersEmpty">Please log in to view orders.</p>
      </div>
    );
  }

  return (
    <div className="ordersPage">
      <div className="ordersHeader">
        <h1 className="ordersTitle">Order Management</h1>
        <p className="ordersSubtitle">
          {loading
            ? "Loading..."
            : `${orders.length} order${orders.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {loading ? (
        <div className="ordersLoading">
          <div className="ordersSpinner" />
          <p>Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="ordersEmpty">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="ordersList">
          {orders.map((o) => {
            const currentStatus = statusMap[o.order_id] ?? o.status;
            const isExpanded = expanded === o.order_id;
            const sellerIds = [
              ...new Set(
                (o.items ?? []).map((i) => i.seller_id).filter(Boolean),
              ),
            ];

            return (
              <div key={o.order_id} className="orderCard">
                {/* ── Card header — click to expand ── */}
                <div
                  className="orderCardHeader"
                  onClick={() => toggleExpand(o.order_id)}
                >
                  <div className="orderCardMeta">
                    <span className="orderCardId">Order #{o.order_id}</span>
                    <span className="orderCardDate">
                      {formatDate(o.created_at)}
                    </span>
                  </div>

                  <div className="orderCardRight">
                    {o.customer && (
                      <span className="orderCustomer">👤 {o.customer}</span>
                    )}
                    <StatusBadge status={currentStatus} />
                    <span className="orderTotal">
                      R {Number(o.total).toFixed(2)}
                    </span>
                    <span className="orderChevron">
                      {isExpanded ? "-" : "+"}
                    </span>
                  </div>
                </div>

                {/* ── Expanded body ── */}
                {isExpanded && (
                  <div className="orderCardBody">
                    {/* ── StatusBubble moved here from OrderChat ── */}
                    <div className="orderStatusSection">
                      <h4 className="orderSectionLabel">Update Status</h4>
                      <StatusBubble
                        orderId={o.order_id}
                        currentStatus={currentStatus}
                        user={user}
                        sellerId={sellerIds[0] ?? null}
                        onStatusChange={(newStatus) =>
                          handleStatusChange(o.order_id, newStatus)
                        }
                      />
                    </div>

                    {/* ── Shipping info ── */}
                    {o.city && (
                      <div className="orderShipping">
                        <h4 className="orderSectionLabel">Shipping</h4>
                        <p>
                          {o.city}, {o.province}
                        </p>
                      </div>
                    )}

                    {/* ── Items ── */}
                    <h4 className="orderSectionLabel">Items</h4>
                    <div className="orderItems">
                      {(o.items ?? []).map((item, idx) => (
                        <div key={idx} className="orderItem">
                          <div className="orderItemImg">
                            {item.image ? (
                              <img src={item.image} alt={item.title} />
                            ) : (
                              <span>
                                <Box />
                              </span>
                            )}
                          </div>
                          <div className="orderItemInfo">
                            <div className="orderItemTitle">{item.title}</div>
                            <div className="orderItemQty">Qty: {item.qty}</div>
                          </div>
                          <div className="orderItemPrice">
                            R {(item.price * item.qty).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── Summary ── */}
                    <div className="orderSummary">
                      <div className="orderSummaryRow orderSummaryTotal">
                        <span>Total</span>
                        <span>R {Number(o.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
