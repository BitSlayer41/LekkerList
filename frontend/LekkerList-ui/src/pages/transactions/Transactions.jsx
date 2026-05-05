import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./Transactions.css";
import cartIcon from "../../emoji/shopping-cart.png";
import Box from "../../emoji/box.png";
import Pin from "../../emoji/pin.png";
import Message from "../../emoji/comments.png";

const STATUS_COLORS = {
  paid: { bg: "rgba(43, 191, 179, 0.12)", color: "#2bbfb3" },
  pending: { bg: "rgba(245, 158, 11, 0.12)", color: "#d97706" },
  shipped: { bg: "rgba(59, 130, 246, 0.12)", color: "#2563eb" },
  delivered: { bg: "rgba(34, 197, 94, 0.12)", color: "#16a34a" },
  cancelled: { bg: "rgba(239, 68, 68, 0.12)", color: "#dc2626" },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] ?? STATUS_COLORS.paid;

  return (
    <span
      className="txStatusBadge"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";

  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Transactions() {
  const authData = useSelector((state) => state.authentication?.authData);
  const userInfo = authData?.user ?? null;
  const role = userInfo?.role ?? "guest";
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!userInfo?.id) return;

    const fetchTransactions = async () => {
      try {
        const res = await fetch(
          `http://localhost/LekkerList/backend/api/getTransactions.php?user_id=${userInfo.id}&role=${role}`,
        );

        const data = await res.json();

        if (data.success) {
          setTransactions(data.transactions || []);
        } else {
          setError(data.error || "Failed to load transactions");
        }
      } catch (err) {
        console.error(err);
        setError("Server error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userInfo?.id, role]);

  const toggleExpand = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const isSeller = role === "seller" || role === "admin";

  // Not Logged in
  if (!userInfo) {
    return (
      <div className="txEmpty">
        <span className="txEmptyIcon">
          <img src={Box} alt="box" />
        </span>
        <p>Please log in to view your transactions</p>
        <a
          href="http://localhost/LekkerList/backend/pages/login.html"
          className="txBtn"
        >
          Log In
        </a>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="txEmpty">
        <Spin size="large" description="Loading Transaction..." />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="txEmpty">
        <span className="txEmptyIcon">
          <img src={Box} alt="box" />
        </span>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="txPage">
      {/* Header */}
      <div className="txHeader">
        <div>
          <h1 className="txTitle">{isSeller ? "Sales" : "My Orders"}</h1>
          <p className="txSubtitle">
            {transactions.length} order
            {transactions.length !== 1 ? "s" : ""}
          </p>
        </div>

        {!isSeller && (
          <Link to="/browseProducts" className="txBtn">
            Shop More
          </Link>
        )}
      </div>

      {/* Empty */}
      {transactions.length === 0 ? (
        <div className="txEmpty">
          <img src={cartIcon} alt="cart" />
          <p>No Transactions found!</p>
        </div>
      ) : (
        <div className="txList">
          {transactions.map((tx) => (
            <div key={tx.order_id} className="txCard">
              {/* Header */}
              <div
                className="txCardHeader"
                onClick={() => toggleExpand(tx.order_id)}
              >
                <div className="txCardMeta">
                  <span>Order #{tx.order_id}</span>
                  <span className="txDate">{formatDate(tx.created_at)}</span>
                </div>

                <div className="txCardRight">
                  {tx.city && (
                    <span className="txLocation">
                      <img src={Pin} alt="pin" className="txIcon" />
                      {tx.city}, {tx.province}
                    </span>
                  )}

                  <StatusBadge status={tx.status} />

                  <span className="txTotal">
                    R{Number(tx.total).toFixed(2)}
                  </span>

                  <span className="txChevron">
                    {expanded === tx.order_id ? "-" : "+"}
                  </span>
                </div>
              </div>

              {/* Body */}
              {expanded === tx.order_id && (
                <div className="txCardBody">
                  <div className="txItemsTitle">Items</div>

                  {(tx.items ?? []).map((item, idx) => (
                    <div key={idx} className="txItem">
                      <div className="txItemImg">
                        {item.image ? (
                          <img src={item.image} alt={item.title} />
                        ) : (
                          <img src={Box} alt="box" />
                        )}
                      </div>

                      <div className="txItemInfo">
                        <div>{item.title}</div>
                        {item.seller_name && <div>By {item.seller_name}</div>}
                      </div>

                      <div className="txItemQtyPrice">
                        <div>Qty: {item.qty}</div>
                        <div>R{(item.price * item.qty).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}

                  {/* Message */}
                  <button
                    className="txMessageBtn"
                    onClick={() => navigate(`/chat/order/${tx.order_id}`)}
                  >
                    <img src={Message} alt="message" className="txIcon" />
                    {isSeller ? "Message Customer" : "Message Seller"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
