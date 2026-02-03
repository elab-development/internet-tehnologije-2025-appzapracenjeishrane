"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Uspešna registracija");
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
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Register
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600">
          Već imaš nalog?{" "}
          <Link href="/login" className="text-blue-500 hover:underline">
            Uloguj se
          </Link>
        </p>
      </div>
    </div>
  );
}
