import { useState } from "react";
import { useRouter } from "next/router";
import API from "../../services/api";

export default function CreateProfile() {
    const router = useRouter();
    const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await API.post("/profiles", form);
        alert("Profile created!");
        router.push("/profile");
    } catch (err) {
        alert("Failed to create profile.");
    }
    };

    return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
        <form onSubmit={handleSubmit} className="p-6 shadow-lg rounded-lg bg-white w-96">
        <h2 className="text-xl font-bold mb-4">Create Profile</h2>
        <input
            placeholder="Username"
            className="border p-2 mb-2 w-full"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
            placeholder="First Name"
            className="border p-2 mb-2 w-full"
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />
        <input
            placeholder="Last Name"
            className="border p-2 mb-2 w-full"
            value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />
        <input
            placeholder="Phone"
            className="border p-2 mb-4 w-full"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            Save Profile
        </button>
        </form>
    </div>
    );
}
