"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [nazivAktivnosti, setNazivAktivnosti] = useState("");
  const [prosekKalorija, setProsekKalorija] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nazivAktivnosti.trim()) {
      alert("Naziv aktivnosti je obavezan");
      return;
    }

    const kcal = Number(prosekKalorija);
    if (!Number.isFinite(kcal) || kcal < 0) {
      alert("Prosek kalorija mora biti broj >= 0");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Niste ulogovani");
        router.replace("/login");
        return;
      }

      const res = await fetch("/api/aktivnost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nazivAktivnosti: nazivAktivnosti.trim(),
          prosekKalorija: kcal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error ?? "Greška pri dodavanju aktivnosti");
        return;
      }

      alert("Aktivnost dodata ✅");
      router.push("/activity");
    } catch (err: any) {
      alert(err?.message ?? "Greška");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-md rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Dodaj novu aktivnost
        </h1>
        <p className="mt-1 text-gray-600">Prosek kalorija je “kcal po satu”.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naziv aktivnosti
            </label>
            <input
              value={nazivAktivnosti}
              onChange={(e) => setNazivAktivnosti(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
              placeholder="npr. Trčanje"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prosek kalorija (kcal/h)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={prosekKalorija}
              onChange={(e) => setProsekKalorija(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Čuvam..." : "Sačuvaj"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/activity")}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition"
            >
              Nazad
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
