"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [ime, setIme] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uloga, setUloga] = useState<"PREMIUM" | "ADMIN" | null>(null);
  const [trenutnaTezina, setTrenutnaTezina] = useState("");
  const [visina, setVisina] = useState("");
  const [zeljenaTezina, setZeljenaTezina] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const jePremium = uloga === "PREMIUM";

    if (jePremium && (!trenutnaTezina || !visina || !zeljenaTezina)) {
      alert("Za premium korisnika unesi visinu, trenutnu i zeljenu tezinu.");
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ime,
        email,
        sifra: password,
        uloga,
        tezina: jePremium ? Number(trenutnaTezina) : null,
        visina: jePremium ? Number(visina) : null,
        ciljnaTezina: jePremium ? Number(zeljenaTezina) : null,
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

          {uloga === "PREMIUM" && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-3">
              <p className="text-sm font-medium text-green-800">
                Premium plan podaci
              </p>

              <input
                type="number"
                min="1"
                step="0.1"
                placeholder="Trenutna tezina (kg)"
                value={trenutnaTezina}
                onChange={(e) => setTrenutnaTezina(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                required
              />

              <input
                type="number"
                min="1"
                step="0.1"
                placeholder="Visina (cm)"
                value={visina}
                onChange={(e) => setVisina(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                required
              />

              <input
                type="number"
                min="1"
                step="0.1"
                placeholder="Zeljena tezina (kg)"
                value={zeljenaTezina}
                onChange={(e) => setZeljenaTezina(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                required
              />
            </div>
          )}

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
