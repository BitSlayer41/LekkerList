// Dashboard widget: recent messages (Seller/customner only)
import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./RecentMessages.css";

export default function RecentMessages() {
  const authData = useSelector((state) => state.authentication?.authData);
  const userInfo = authData?.user;
  const isSeller = userInfo?.role === "seller" || userInfo?.role === "customer";

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!userInfo.id || !isSeller) return;
    try {
      const res = await fetch(
        `http://localhost/LekkerList/backend/api/getRecentMessages.php?user_id=${userInfo.id}`,
      );

      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (err) {
      console.error("Error fetching messages: ", err);
    } finally {
      setLoading(false);
    }
  }, [userInfo?.id, isSeller]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  if (!isSeller) return null;

  return (
    <div className="recentMessagesCard">
      <div className="cardHeader">
        <h3 className="cardTitle">Recent Messages</h3>
        <Link to="/messages" className="cardLink">
          View All
        </Link>
      </div>

      <div className="recentMessagesList">
        {loading ? (
          <div className="recentMessagesEmpty">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="recentMessagesEmpty">No Recent messages</div>
        ) : (
          messages.map((m, i) => (
            <div
              key={m.id}
              className={`recentMessagesRow ${i < messages.length - 1 ? "recentMessagesRowBordered" : ""}`}
            >
              <div className="recentMessagesAvatar">
                {m.name?.charAt(0) || "U"}
              </div>

              <div className="recentMessagesBody">
                <span className="recentMessagesName">{m.name}</span>
                <span className="recentMessagesText">{m.text}</span>
                <span className="recentMessagesTime">{m.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
