// Order-scoped chat between customer and seller
import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import WarningSign from "../../emoji/warning.png";
import Message from "../../emoji/comments.png";
import StatusBubble from "../../components/statusBubble/StatusBubble";
import "./OrderChat.css";

const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formateDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function OrderChat() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const authData = useSelector((s) => s.authentication?.authData);
  const user = authData?.user ?? null;

  const [orderStatus, setOrderStatus] = useState("pending");
  const [sellerId, setSellerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiverId, setReceiverId] = useState(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  // Fetch Messages
  const fetchMessages = useCallback(
    async (silent = false) => {
      if (!user?.id) return;
      if (!silent) setLoading(true);

      try {
        const res = await fetch(
          `http://localhost/LekkerList/backend/api/getMessages.php?order_id=${orderId}&user_id=${user.id}`,
        );
        const data = await res.json();

        if (!data.success) {
          setError(data.error || "Failed to load messages");
          return;
        }

        setMessages(data.messages ?? []);
        setOrderStatus(data.status ?? "pending");
        setSellerId(data.seller_ids?.[0] ?? null);

        // Determines receiver from response
        if (!receiverId) {
          const myId = Number(user.id);
          const sellerIds = (data.seller_ids ?? []).map(Number);
          const customerId = Number(data.customer_id ?? 0);

          const isSeller = sellerIds.includes(myId);

          if (isSeller) {
            // Seller messages the customer
            setReceiverId(customerId || null);
          } else {
            // Customer messages the seller
            setReceiverId(sellerIds[0] ?? null);
          }
        }
      } catch {
        if (!silent) setError("Failed to connect to server");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [orderId, user?.id, receiverId],
  );

  // Inital Load and poll every 5s
  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !user || !receiverId || sending) return;

    setSending(true);
    const msgText = text.trim();
    setText("");

    // Update
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        senderId: user.id,
        receiverId: receiverId,
        sender_id: user.id,
        message: msgText,
        created_at: new Date().toISOString(),
        firstname: user.firstname,
        lastname: user.lastname,
        optimistic: true,
      },
    ]);

    try {
      const res = await fetch(
        "http://localhost/LekkerList/backend/api/sendMessage.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            sender_id: user.id,
            receiver_id: receiverId,
            message: msgText,
          }),
        },
      );

      const data = await res.json();

      if (!data.success) {
        // Roll back message
        setMessages((prev) => prev.filter((m) => !m.optimistic));
        setText(msgText);
      } else {
        fetchMessages(true);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => !m.optimistic));
      setText(msgText);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const raw = msg.createdAt ?? msg.created_at ?? "";
    const day = raw.split("T")[0];

    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  // isMe helper
  const isMyMessage = (msg) => Number(msg.sender_id) === Number(user?.id);

  // Guard
  if (!user) {
    return (
      <div className="chatEmpty">
        <p>Please log in to view this chat</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="chatEmpty">
        <Spin size="large" description="Loading Chat..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="chatEmpty">
        <img src={WarningSign} alt="warning" className="txIcon" />
        <p>{error}</p>
        <button className="chatBackBtn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="chatPage">
      {/* Header */}
      <div className="chatHeader">
        <button
          className="chatBackBtn"
          onClick={() => navigate("/transactions")}
        >
          Back
        </button>
        <div className="chatHeaderInfo">
          <span className="chatOrderLabel">Order Chat</span>
          <span className="chatOrderId">#{orderId}</span>
        </div>
      </div>

      <StatusBubble
        orderId={orderId}
        currentStatus={orderStatus}
        user={user}
        sellerId={sellerId}
        onStatusChange={setOrderStatus}
      />
      {/* Messages */}
      <div className="chatMessages">
        {Object.keys(grouped).length === 0 ? (
          <div className="chatNoMessages">
            <img src={Message} alt="message" className="txIcon" />
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          Object.entries(grouped).map(([day, msgs]) => (
            <div key={day}>
              <div className="chatDateDivider">
                <span>{formateDate(day)}</span>
              </div>

              {msgs.map((m) => {
                const isMe = isMyMessage(m);
                return (
                  <div
                    key={m.id}
                    className={`chatBubbleWrap ${isMe ? "chatBubbleWrapMe" : "chatBubbleWrapThem"}`}
                  >
                    {isMe && (
                      <div className="chatAvatar">
                        {m.firstname?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div
                      className={`chatBubble ${isMe ? "chatBubbleMe" : "chatBubbleThem"} ${m.optimistic ? "chatBubbleOptimistic" : ""}`}
                    >
                      {!isMe && (
                        <div className="chatSenderName">
                          {m.firstname} {m.lastname}
                        </div>
                      )}
                      <div className="chatText">{m.message}</div>
                      <div className="chatTime">
                        {formatTime(m.createdAt ?? m.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chatInputRow">
        <textarea
          ref={inputRef}
          className="chatInput"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            receiverId
              ? "Type a messsage...(Enter to send)"
              : "Loading chat partner..."
          }
          rows={1}
          disabled={!receiverId}
        />
        <button
          className="chatSendBtn"
          onClick={sendMessage}
          disabled={!text.trim() || !receiverId || sending}
        >
          {sending ? (
            <Spin size="large" description="Sending message..." />
          ) : (
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
