// Order-scoped chat between customer and seller
import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Input, message, Rate, Tabs, Button } from "antd";
import WarningSign from "../../emoji/warning.png";
import Message from "../../emoji/comments.png";
import StatusBubble from "../../components/statusBubble/StatusBubble";
import StatusBtn from "./StatusBtn";
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

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiverId, setReceiverId] = useState(null);
  const [sellerIdForReview, setSellerIdForReview] = useState(null);
  const [orderStatus, setOrderStatus] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);

  /* Review state */
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewDone, setReviewDone] = useState(false);

  /* Report state */
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);

  /* Role helpers */
  const isCustomer = user?.role === "customer";
  const isSeller = user?.role === "seller";

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
        console.log("order_items:", data.order_items);
        setOrderItems(data.order_items ?? []);
        setSelectedProductId(data.order_items?.[0]?.product_id || null);
        setMessages(data.messages ?? []);
        setOrderStatus(data.order_status ?? "");

        // Determines receiver from response
        if (!receiverId) {
          const myId = Number(user.id);
          const sellerIds = (data.seller_ids ?? []).map(Number);
          const customerId = Number(data.customer_id ?? 0);
          const amSeller = sellerIds.includes(myId);

          if (amSeller) {
            // Seller messages the customer
            setReceiverId(customerId || null);
            setSellerIdForReview(myId);
          } else {
            // Customer messages the seller
            setReceiverId(sellerIds[0] ?? null);
            setSellerIdForReview(sellerIds[0] ?? null);
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

  //Initial Load and poll every 5s
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

  const updateStatus = async (newStatus) => {
    if (confirming) return;

    try {
      setConfirming(true);

      const res = await fetch(
        "http://localhost/LekkerList/backend/api/updateOrderStatus.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            status: newStatus,
            user_id: user.id,
          }),
        },
      );

      const data = await res.json();

      console.log(data);

      if (!data.success) {
        console.error(data);
        return;
      }

      setOrderStatus(newStatus);

      await fetch("http://localhost/LekkerList/backend/api/sendMessage.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          sender_id: user.id,
          receiver_id: receiverId,
          message: `Order marked as ${newStatus}`,
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setConfirming(false);
    }
  };

  const submitReport = async () => {
    console.log({
      order_id: orderId,
      product_id: selectedProductId,
      reviewer_id: user.id,
      seller_id: receiverId,
      rating,
      comment,
    });
    if (!reportReason.trim()) {
      message.error("Please describe the issue");
      return;
    }

    try {
      setReporting(true);

      const res = await fetch(
        "http://localhost/LekkerList/backend/api/reportSeller.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_id: orderId,
            reporter_id: user.id,
            reported_user_id: sellerIdForReview,
            reason: reportReason,
          }),
        },
      );

      const data = await res.json();

      if (!data.success) {
        message.error(data.error || "Failed to submit report");
        return;
      }

      message.success("Report submitted. Our team will review it.");
      setReportDone(true);
      setReportReason("");
    } catch (err) {
      console.log(err);
      message.error("Server error");
    } finally {
      setReporting(false);
    }
  };

  const submitReview = async () => {
    if (rating === 0) {
      message.error("Please select a star rating");
      return;
    }
    try {
      const payload = {
        order_id: orderId,
        product_id: selectedProductId,
        reviewer_id: user.id,
        seller_id: sellerIdForReview,
        rating,
        comment,
      };

      console.log("Review payload:", payload);

      const res = await fetch(
        "http://localhost/LekkerList/backend/api/submitReview.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();

      if (!data.success) {
        message.error(data.error);
        return;
      }

      message.success("Review Submitted");
      setReviewDone(true);
      setRating(0);
      setComment("");
    } catch {
      message.error("Failed to submit review");
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

  const canReview = isCustomer && orderStatus === "delivered";
  const canReport = isCustomer;

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
          <StatusBtn
            role={user?.role}
            currentStatus={orderStatus}
            allowedRole="seller"
            onChangeStatus={updateStatus}
            loading={confirming}
          />
          <StatusBtn
            role={user?.role}
            currentStatus={orderStatus}
            allowedRole="customer"
            onChangeStatus={updateStatus}
            loading={confirming}
          />
          <span className="chatOrderLabel">Order Chat</span>
          <span className="chatOrderId">#{orderId}</span>
        </div>
      </div>

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
                      <div className="chatTime">{formatTime(m.created_at)}</div>
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
              ? "Type a message… (Enter to send)"
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
            <Spin size="small" />
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

      {/* Review + Report tabs — customers only */}
      {isCustomer && (canReview || canReport) && (
        <div className="actionPanel">
          <Tabs
            defaultActiveKey={canReview ? "review" : "report"}
            className="actionTabs"
            items={[
              /* Review tab — only on delivered orders */
              ...(canReview
                ? [
                    {
                      key: "review",
                      label: "Leave a Review",
                      children: reviewDone ? (
                        <p className="actionDoneMsg">
                          You have already reviewed this order. Thank you!
                        </p>
                      ) : (
                        <>
                          {orderItems.length > 1 && (
                            <select
                              className="actionProductSelect"
                              value={selectedProductId ?? ""}
                              onChange={(e) =>
                                setSelectedProductId(Number(e.target.value))
                              }
                            >
                              {orderItems.map((item) => (
                                <option
                                  key={item.product_id}
                                  value={item.product_id}
                                >
                                  {item.title}
                                </option>
                              ))}
                            </select>
                          )}
                          <Rate
                            value={rating}
                            onChange={setRating}
                            style={{ marginBottom: 12 }}
                          />
                          <Input.TextArea
                            rows={3}
                            placeholder="Write your review (optional)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          />
                          <Button
                            type="primary"
                            onClick={submitReview}
                            disabled={rating === 0}
                            style={{
                              marginTop: 10,
                              background: "#E8622A",
                              borderColor: "#E8622A",
                            }}
                          >
                            Submit Review
                          </Button>
                        </>
                      ),
                    },
                  ]
                : []),

              /* Report tab — any customer on any order */
              ...(canReport
                ? [
                    {
                      key: "report",
                      label: "Report Seller",
                      children: reportDone ? (
                        <p className="actionDoneMsg">
                          Your report has been submitted. Our team will review
                          it.
                        </p>
                      ) : (
                        <>
                          <p className="actionReportHint">
                            Describe the issue with this seller. Reports are
                            reviewed by our admin team.
                          </p>
                          <Input.TextArea
                            rows={4}
                            placeholder="Describe the issue..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                          />
                          <Button
                            danger
                            loading={reporting}
                            onClick={submitReport}
                            style={{ marginTop: 10 }}
                          >
                            Submit Report
                          </Button>
                        </>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      )}
    </div>
  );
}
