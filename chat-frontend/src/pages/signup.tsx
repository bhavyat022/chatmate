import { useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "../store/authStore";

export default function Signup() {
  const { signupUser } = useAuthStore();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", username: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signupUser(form.email, form.password, form.username);
    alert("Signup successful! Please login.");
    router.push("/login");
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="p-6 shadow-lg rounded-lg bg-white w-80"
      >
        <h2 className="text-xl font-bold mb-4">Signup</h2>
        <input
          type="email"
          placeholder="Email"
          className="border p-2 mb-2 w-full"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 mb-2 w-full"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <input
          type="username"
          placeholder="Username"
          className="border p-2 mb-2 w-full"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">
          Signup
        </button>
      </form>
    </div>
  );
}
