"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [ime, setIme] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uloga, setUloga] = useState<"PREMIUM" | "ADMIN" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ime,
        email,
        sifra: password,
        uloga,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Uspesna registracija");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Register
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Ime"
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
            required
          />

          <div className="rounded-lg border border-gray-300 p-3">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Tip korisnika
            </p>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uloga === "PREMIUM"}
                  onChange={() =>
                    setUloga((prev) => (prev === "PREMIUM" ? null : "PREMIUM"))
                  }
                  className="h-4 w-4 accent-green-600"
                />
                <span>Premium</span>
              </label>

              <label className="flex items-center gap-2 text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uloga === "ADMIN"}
                  onChange={() =>
                    setUloga((prev) => (prev === "ADMIN" ? null : "ADMIN"))
                  }
                  className="h-4 w-4 accent-green-600"
                />
                <span>Admin</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Vec imas nalog?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Uloguj se
          </Link>
        </p>
      </div>
    </div>
  );
}
