// src/pages/index.tsx
// src/pages/index.tsx
//import { useEffect, useState } from "react";
//import { useRouter } from "next/router";
//import { useAuthStore } from "../store/authStore";

//export default function IndexPage() {
//  const router = useRouter();
//  const { token, fetchUser } = useAuthStore();
//  const [loading, setLoading] = useState(true);

//  useEffect(() => {
//    const init = async () => {
//      // If no token → go to login
//      if (!token) {
//        router.replace("/login");
//        return;
//      }

//      // Try to load user profile
//      await fetchUser();
//      const { user } = useAuthStore.getState();

//      if (!user) {
//        // Logged in but no profile yet
//        router.replace("/profile");
//      } else {
//        // Logged in and has profile
//        router.replace("/profile");
//      }
//    };

//    init().finally(() => setLoading(false));
//  }, [token, router]);

//  if (loading)
//    return (
//      <div className="flex justify-center items-center h-screen">
//        <p className="text-gray-500">Loading...</p>
//      </div>
//    );

//  return null;
//}


// src/pages/index.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return null;
}
