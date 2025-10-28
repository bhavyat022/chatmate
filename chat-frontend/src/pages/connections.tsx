import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useConnectionStore } from "../store/connectionStore";
import { useAuthStore } from "../store/authStore";

export default function ConnectionsPage() {
  const router = useRouter();
  const { connections, fetchConnections, acceptRequest, sendRequest } = useConnectionStore();
  const { user } = useAuthStore();

  const [target, setTarget] = useState("");

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // ✅ These are now based on backend `direction` + `status`
  const incoming = connections.filter(
    (c: any) => c.direction === "incoming" && c.status === "pending"
  );
  const outgoing = connections.filter(
    (c: any) => c.direction === "outgoing" && c.status === "pending"
  );
  const accepted = connections.filter((c: any) => c.status === "accepted");

  const nameOf = (p?: any) =>
    p?.username ||
    [p?.first_name, p?.last_name].filter(Boolean).join(" ") ||
    p?.id ||
    "(unknown)";

  return (
    <div className="p-6 space-y-6">
    {/* 🔙 Back Button */}
    <div className="flex items-center justify-between mb-4">
      <button
  onClick={() => {
    // Clear cache and force refetch
    localStorage.removeItem("profile_cache");
    router.push("/profile");
  }}
  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
>
  ← Back to Profile
</button>

      <h1 className="text-2xl font-bold">Connections</h1>
    </div>

      {/* ➕ Send connection request by user ID */}
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!target.trim()) return;
          try {
            await sendRequest(target.trim());
            setTarget("");
            await fetchConnections();
            alert("Request sent!");
          } catch (err) {
            console.error(err);
            alert("Failed to send request.");
          }
        }}
      >
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Enter user id (or search then paste id)"
          className="border p-2 rounded w-80"
        />
        <button className="bg-blue-600 text-white px-3 py-1 rounded">
          Send request
        </button>
      </form>

      {/* 📥 Incoming Requests */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Incoming Requests</h2>
        {incoming.length === 0 && <p>No incoming requests.</p>}
        {incoming.map((req: any) => (
          <div
            key={req.id}
            className="flex justify-between items-center p-3 border rounded mb-2"
          >
            <span>{nameOf(req.other)}</span>
            <div className="flex gap-2">
              <button
                onClick={() => acceptRequest(req.id)}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Accept
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* 📤 Outgoing Requests */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Outgoing Requests</h2>
        {outgoing.length === 0 && <p>No outgoing requests.</p>}
        {outgoing.map((req: any) => (
          <div key={req.id} className="p-3 border rounded mb-2">
            <span>{nameOf(req.other)}</span>
            <span className="text-gray-500 ml-2">(Pending)</span>
          </div>
        ))}
      </section>

      {/* 🤝 Accepted Connections */}
      <section>
        <h2 className="text-xl font-semibold mb-2">My Connections</h2>
        {accepted.length === 0 && <p>No accepted connections yet.</p>}
        {accepted.map((c: any) => (
          <div
            key={c.id}
            className="flex justify-between p-3 border rounded mb-2 cursor-pointer"
            onClick={() => router.push(`/chat/${c.other?.id}`)}
          >
            <span>{nameOf(c.other)}</span>
            <button className="bg-blue-500 text-white px-3 py-1 rounded">
              Message
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
