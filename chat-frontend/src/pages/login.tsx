import { useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";

export default function Login() {
  const { loginUser, token } = useAuthStore();
  const { fetchProfile } = useProfileStore();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginUser(form.email, form.password);

      // ✅ Wait for token to appear in Zustand store
      const waitForToken = async () => {
        for (let i = 0; i < 10; i++) {
          if (useAuthStore.getState().token) break;
          await new Promise((res) => setTimeout(res, 100));
        }
      };
      await waitForToken();

      // ✅ Now fetch profile safely
      await fetchProfile();
      const { profile } = useProfileStore.getState();

      if (!profile) {
        router.replace("/profile"); // go to create profile
      } else {
        router.replace("/profile"); // view profile
      }
    } catch (err) {
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-6 shadow-lg rounded-lg bg-white w-80"
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="border p-2 mb-2 w-full"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 mb-4 w-full"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
