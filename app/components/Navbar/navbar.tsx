"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="w-full h-14 bg-gray-900 text-white flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-lg">
          MyDietApp
        </Link>

        <Link href="/">Home</Link>
        <Link href="/profile">Profil</Link>
        <Link href="/activities">Aktivnosti</Link>
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
