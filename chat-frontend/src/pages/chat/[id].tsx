import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useMessageStore } from "../../store/messageStore";
import { useAuthStore } from "../../store/authStore";
import { formatChatDate } from "../../services/dateHelpers";

export default function ChatPage() {
  const router = useRouter();
  const { id: otherUserId } = router.query;

  const { user, fetchUser } = useAuthStore();
  const { messages, fetchHistory, addOne, sendNewMessage } = useMessageStore();

  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [otherUserName, setOtherUserName] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ----------------------------
  // 🧠 Ensure user is loaded
  // ----------------------------
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);

  // ----------------------------
  // 📜 Load chat history
  // ----------------------------
  useEffect(() => {
    if (otherUserId && typeof otherUserId === "string") {
      fetchHistory(otherUserId);
    }
  }, [otherUserId, fetchHistory]);

  // ----------------------------
// 👤 Fetch other user's username
// ----------------------------
useEffect(() => {
  const fetchUsername = async () => {
    if (!otherUserId) return;
    try {
      const res = await fetch(`http://localhost:8000/profiles/by-id/${otherUserId}`);
      if (res.ok) {
        const data = await res.json();
        setOtherUserName(data.username || data.name || otherUserId as string);
      } else {
        setOtherUserName(otherUserId as string);
      }
    } catch (err) {
      console.error("Failed to fetch username:", err);
      setOtherUserName(otherUserId as string);
    }
  };

  fetchUsername();
}, [otherUserId]);

  // ----------------------------
  // 📜 Scroll to bottom on update
  // ----------------------------
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ----------------------------
  // ⚡ WebSocket setup
  // ----------------------------
  useEffect(() => {
    if (!router.isReady || !user?.id || !otherUserId) return;

    console.log("⚡ Connecting to WebSocket:", user.id);
    const ws = new WebSocket(`ws://localhost:8000/ws/chat/${user.id}`);

    ws.onopen = () => console.log("✅ WebSocket connected");
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const relevant =
        (String(msg.sender_id) === String(user.id) && String(msg.receiver_id) === String(otherUserId)) ||
        (String(msg.sender_id) === String(otherUserId) && String(msg.receiver_id) === String(user.id));
      if (relevant) addOne(msg);
    };
    ws.onclose = () => console.log("❌ WebSocket closed");
    ws.onerror = (e) => console.error("WebSocket error:", e);

    setSocket(ws);
    return () => {
      console.log("🧹 Closing WebSocket connection");
      ws.close();
    };
  }, [router.isReady, user?.id, otherUserId]);

  // ----------------------------
  // ✉️ Send Message via WebSocket
  // ----------------------------
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const saved = await sendNewMessage(otherUserId as string, newMessage.trim());
      // We already added it in the store in sendNewMessage (or do addOne(saved) here if you prefer)
      setNewMessage("");
    } catch (err) {
      console.error(err);
      alert("Failed to send message");
    }
  };

  // ----------------------------
  // 🧱 UI Layout
  // ----------------------------
  let lastDateLabel = "";
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white font-semibold text-lg flex items-center">
        <button onClick={() => router.push("/connections")} className="mr-4">
          ←
        </button>
        Chat with {otherUserName || otherUserId}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center">No messages yet.</p>
        )}
        {messages.map((m) => {
          const mine = String(m.sender_id) === String(user?.id);
          const dateLabel = formatChatDate(m.created_at);
          const showDate = dateLabel !== lastDateLabel;
          if (showDate) lastDateLabel = dateLabel;
          return (
          <div key={m.id}>
            {/* 🗓 Date separator */}
            {showDate && (
              <div className="text-center text-xs text-gray-400 my-3">
                ── {dateLabel} ──
              </div>
            )}

            <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`p-3 rounded-2xl max-w-xs break-words shadow ${
                  mine
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white text-gray-900 rounded-bl-none border"
                }`}
              >
                {/* ✨ Preserve line breaks and spacing */}
                <p className="whitespace-pre-wrap break-words">{m.body}</p>

                <div className="text-[10px] mt-1 opacity-70 text-right">
                  {m.created_at
                    ? new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>

      {/* Input */}
<form onSubmit={handleSend} className="p-3 flex gap-2 bg-white border-t">
  <textarea
  placeholder="Type a message..."
  value={newMessage}
  onChange={(e) => {
    setNewMessage(e.target.value);

    // Auto-resize logic with cap
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px"; // grows up to 200px, then scrolls
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  }}
  rows={1}
  className="flex-1 border rounded-lg p-2 resize-none leading-6 overflow-y-auto max-h-52"
  style={{
    minHeight: "40px",
    transition: "height 0.2s ease",
  }}
/>
  <button
    type="submit"
    className="bg-blue-600 text-white px-4 py-2 rounded-lg self-end"
  >
    Send
  </button>
</form>

    </div>
  );
}

