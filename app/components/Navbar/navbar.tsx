"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAdmin(false);
      return;
    }

    try {
      const [, payloadBase64] = token.split(".");
      const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(payloadJson) as { uloga?: string };
      setIsAdmin(String(payload.uloga ?? "").toUpperCase() === "ADMIN");
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setIsAdmin(false);
    router.push("/login");
  };

  return (
    <nav className="w-full h-14 bg-gray-900 text-white flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-lg">
          MyDietApp
        </Link>

        <Link href="/home">Home</Link>
        <Link href="/profile">Profil</Link>
        <Link href="/activity">Aktivnosti</Link>
        <Link href="/food">Unos hrane</Link>
        {isAdmin && <Link href="/swagger">API Docs</Link>}
      </div>

      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
      >
        Logout
      </button>
    </nav>
  );
}
