// src/pages/profile.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useProfileStore } from "../store/profileStore";
import { useAuthStore } from "../store/authStore";

export default function Profile() {
  const { profile, loaded, loading, createUserProfile, fetchProfile, updateUserProfile } = useProfileStore();
  const { logout } = useAuthStore();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone: "",
  });

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.replace("/login");
    return;
  }

  const fetchData = async () => {
    try {
      await fetchProfile();
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  };

  fetchData();
}, [router.asPath]); // triggers when returning from /connections


  useEffect(() => {
    if (profile) {
      setForm({
        username: profile.username || "",
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUserProfile(form);
    alert("Profile created!");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile(form);
    alert("Profile updated!");
    setEditing(false);
  };


  if (!loaded || loading) {
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;
  }

  // No profile yet → show Create Profile form
  if (loaded && !profile) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="p-6 shadow-lg rounded-lg bg-white w-96 space-y-4">
          <h2 className="text-xl font-bold mb-4">Create Profile</h2>
          <form onSubmit={handleCreate} className="space-y-2">
            <input
              type="text"
              placeholder="Username"
              className="border p-2 w-full"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <input
              type="text"
              placeholder="First name"
              className="border p-2 w-full"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Last name"
              className="border p-2 w-full"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Phone"
              className="border p-2 w-full"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded w-full">
              Save Profile
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Profile exists → view / edit
  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="p-6 shadow-lg rounded-lg bg-white w-96 space-y-4">
        <h2 className="text-xl font-bold mb-4">My Profile</h2>

        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-2">
            <input
              type="text"
              placeholder="Username"
              className="border p-2 w-full"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <input
              type="text"
              placeholder="First name"
              className="border p-2 w-full"
              value={form.first_name}
              onChange={(e) =>
                setForm({ ...form, first_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Last name"
              className="border p-2 w-full"
              value={form.last_name}
              onChange={(e) =>
                setForm({ ...form, last_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Phone"
              className="border p-2 w-full"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <div className="flex justify-between mt-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-3 py-2 rounded"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-gray-400 text-white px-3 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p>
              <b>Username:</b> {profile.username}
            </p>
            <p>
              <b>Name:</b> {profile.first_name} {profile.last_name}
            </p>
            <p>
              <b>Phone:</b> {profile.phone}
            </p>

            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => router.push("/connections")}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Go to Connections
              </button>
              <button
                onClick={() => setEditing(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                Edit Profile
              </button>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}