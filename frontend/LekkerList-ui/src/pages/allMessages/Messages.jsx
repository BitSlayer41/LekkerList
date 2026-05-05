import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import "./Messages.css";

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Messages() {
  const authData = useSelector((s) => s.authentication?.authData);
  const user = authData?.user ?? null;

  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const pollRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch all messages
  const fetchMessages = useCallback(
    async (silent = false) => {
      if (!user.id) return;
      if (!silent) setLoading(true);

      try {
        const res = await fetch(
          `http://localhost/LekkerList/backend/api/getAllMessages.php?user_id=${user.id}`,
        );

        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }

        const data = await res.json();

        if (data.success) {
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.log("Fetch Failed: ", err);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [user?.id],
  );

  useEffect(() => {
    if (!user?.id) return;

    fetchMessages();
    pollRef.current = setInterval(() => fetchMessages(true), 5000);

    return () => clearInterval(pollRef.current);
  }, [fetchMessages, user?.id]);

  // Groups raw messages into per-user conversations
  const conversations = useMemo(() => {
    if (!user?.id) return {};

    return messages.reduce((acc, msg) => {
      const myId = Number(user.id);
      const isMe = msg.sender_id === myId;
      const otherId = isMe ? msg.receiver_id : msg.sender_id;
      const otherName = isMe
        ? `${msg.receiverFirstname ?? ""} ${msg.receiverLastname ?? ""}`.trim()
        : `${msg.senderFirstname ?? ""} ${msg.senderLastname ?? ""}`.trim();

      if (!acc[otherId]) {
        acc[otherId] = {
          userId: otherId,
          name: otherName || "Unknown",
          messages: [],
        };
      }

      acc[otherId].messages.push(msg);
      acc[otherId].messages.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at),
      );

      return acc;
    }, {});
  }, [messages, user?.id]);

  const conversationList = Object.values(conversations);

  const activeMessages = useMemo(() => {
    if (!selectedUser) return [];
    return conversations[selectedUser]?.messages || [];
  }, [selectedUser, conversations]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !selectedUser || sending) return;

    const msgText = text.trim();
    setText("");
    setSending(true);

    // Update
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender_id: user.id,
        receiver_id: selectedUser,
        message: msgText,
        created_at: new Date().toISOString(),
        senderFirstname: user.firstname,
        senderLastname: user.lastname,
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
            order_id: 0,
            sender_id: user.id,
            receiver_id: selectedUser,
            message: msgText,
          }),
        },
      );

      const data = await res.json();

      if (!data.success) {
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

  if (!user) {
    return (
      <div className="msgInbox">
        <div className="msgEmptyChat">Please Log in to view messages</div>
      </div>
    );
  }

  return (
    <div className="msgInbox">
      {/* Left: Conversations */}
      <div className="msgSidebar">
        <h3 className="msgSidebarHeading">Messages</h3>

        <div className="msgSidebarList">
          {loading ? (
            <div className="msgEmptyChat">
              <Spin size="large" />
            </div>
          ) : conversationList.length === 0 ? (
            <div className="msgEmptyChat">No conversations yet</div>
          ) : (
            conversationList.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1];
              const active = selectedUser === conv.userId;

              return (
                <div
                  key={conv.userId}
                  className={`msgConvRow ${active ? "msgConvRowActive" : ""}`}
                  onClick={() => setSelectedUser(conv.userId)}
                >
                  <div className="msgAvatar">{conv.name?.charAt(0)}</div>

                  <div className="msgConvInfo">
                    <div className="msgConvName">{conv.name}</div>
                    <div className="msgConvLast">{lastMsg?.message}</div>
                  </div>

                  <div className="msgConvTime">
                    {formatTime(lastMsg?.created_at)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Right: Chat */}
      <div className="msgChat">
        {!selectedUser ? (
          <div className="msgEmptyChat">
            Select a convsersation to start chatting
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="msgChatHeader">
              {conversations[selectedUser]?.name}
            </div>

            {/* Messages */}
            <div className="msgChatBox">
              {activeMessages.length === 0 ? (
                <div className="msgEmptyChat">No messages yet. Say Hello!</div>
              ) : (
                activeMessages.map((m) => {
                  const isMe = Number(m.sender_id) === Number(user.id);
                  return (
                    <div
                      key={m.id}
                      className={`msgBubbleWrap ${isMe ? "msgBubbleWrapMe" : "msgBubbleWrapThem"}`}
                    >
                      {!isMe && (
                        <div className="msgAvatar">
                          {conversations[selectedUser]?.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>
                      )}
                      <div
                        className={`msgBubble ${isMe ? "msgBubbleMe" : "msgBubbleThem"} ${m.optimistic ? "msgBubbleOptimistic" : ""}`}
                      >
                        {!isMe && (
                          <div className="msgSenderName">
                            {conversations[selectedUser]?.name}
                          </div>
                        )}
                        <div className="msgText">{m.message}</div>
                        <div className="msgTime">
                          {formatTime(m.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="msgInputRow">
              <textarea
                ref={inputRef}
                className="msgInput"
                value={text}
                rows={1}
                placeholder="Type a message... (Enter to send)"
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="msgSendBtn"
                onClick={sendMessage}
                disabled={!text.trim() || sending}
              >
                {sending ? (
                  <div className="msgSendSpinner" />
                ) : (
                  <svg
                    width="18"
                    height="18"
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
          </>
        )}
      </div>
    </div>
  );
}
