"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewFoodPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [nazivHrane, setNazivHrane] = useState("");
  const [kalorije, setKalorije] = useState("");
  const [proteini, setProteini] = useState("");
  const [masti, setMasti] = useState("");
  const [ugljeniHidrati, setUgljeniHidrati] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nazivHrane.trim()) {
      alert("Naziv je obavezan");
      return;
    }

    const toNum = (v: string) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : NaN;
    };

    const kcal = toNum(kalorije);
    const p = toNum(proteini);
    const f = toNum(masti);
    const uh = toNum(ugljeniHidrati);

    if ([kcal, p, f, uh].some((x) => !Number.isFinite(x) || x < 0)) {
      alert("Sva nutritivna polja moraju biti brojevi >= 0");
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

      const res = await fetch("/api/hrana", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nazivHrane: nazivHrane.trim(),
          kalorije: kcal,
          proteini: p,
          masti: f,
          ugljeniHidrati: uh,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error ?? "Greška pri dodavanju hrane");
        return;
      }

      alert("Hrana je dodata ✅");
      router.push("/food");
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
        <h1 className="text-2xl font-bold text-gray-800">Dodaj novu hranu</h1>
        <p className="mt-1 text-gray-600">
          Unesi vrednosti na 100g (kcal, proteini, masti, UH).
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naziv hrane
            </label>
            <input
              value={nazivHrane}
              onChange={(e) => setNazivHrane(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
              placeholder="npr. Banana"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kalorije (kcal/100g)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={kalorije}
                onChange={(e) => setKalorije(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proteini (g/100g)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={proteini}
                onChange={(e) => setProteini(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Masti (g/100g)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={masti}
                onChange={(e) => setMasti(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ugljeni hidrati (g/100g)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={ugljeniHidrati}
                onChange={(e) => setUgljeniHidrati(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg text-gray-900"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Čuvam..." : "Sačuvaj hranu"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/food")}
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
