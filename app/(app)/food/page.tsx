"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Food = {
  hranaId: string;
  nazivHrane: string | null;
  kalorije: string | null;
  proteini: string | null;
  masti: string | null;
  ugljeniHidrati: string | null;
};

export default function FoodPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [datum, setDatum] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [kolicina, setKolicina] = useState<string>("100");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/hrana")
      .then(async (r) => {
        if (!r.ok) throw new Error("Ne mogu da učitam hranu");
        return r.json();
      })
      .then((data) => setFoods(data))
      .catch((e) => alert(e.message));
  }, []);

  const filteredFoods = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? foods
      : foods.filter((f) => (f.nazivHrane ?? "").toLowerCase().includes(q));

    // da dropdown ne bude ogroman
    return list.slice(0, 50);
  }, [foods, query]);

  const selectedFood = useMemo(() => {
    return foods.find((f) => String(f.hranaId) === String(selectedId));
  }, [foods, selectedId]);

  const estimatedKcal = useMemo(() => {
    if (!selectedFood?.kalorije) return null;
    const kcalPer100 = Number(selectedFood.kalorije);
    const grams = Number(kolicina);
    if (!Number.isFinite(kcalPer100) || !Number.isFinite(grams)) return null;
    return (grams / 100) * kcalPer100;
  }, [selectedFood, kolicina]);

  const estimatedMacros = useMemo(() => {
    const grams = Number(kolicina);
    if (!selectedFood || !Number.isFinite(grams)) return null;

    const per100 = (val: string | null) => {
      if (val == null) return null;
      const n = Number(val);
      if (!Number.isFinite(n)) return null;
      return (grams / 100) * n;
    };

    return {
      proteini: per100(selectedFood.proteini),
      masti: per100(selectedFood.masti),
      ugljeniHidrati: per100(selectedFood.ugljeniHidrati),
    };
  }, [selectedFood, kolicina]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Niste ulogovani. Ulogujte se ponovo.");
      return;
    }

    if (!selectedId) {
      alert("Izaberi hranu.");
      return;
    }

    const grams = Number(kolicina);
    if (!Number.isFinite(grams) || grams <= 0) {
      alert("Količina mora biti pozitivan broj.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/konzumirana-hrana", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hranaId: selectedId,
          datum,
          kolicina: grams, // server će pretvoriti u string za decimal
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error ?? "Greška pri unosu hrane");
        return;
      }

      alert("Unos hrane je sačuvan ✅");
      // opcionalno: resetuj količinu / pretragu
      // setKolicina("100");
      // setQuery("");
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
      <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800">Unos hrane</h1>
        <p className="mt-1 text-gray-600">
          Izaberi namirnicu, unesi količinu i sačuvaj.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum
            </label>
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pretraga hrane
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="npr. banana, piletina..."
              className="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Prikazuje se do 50 rezultata u listi.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Izaberi hranu
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
              required
            >
              <option value="" disabled>
                -- izaberi --
              </option>
              {filteredFoods.map((f) => (
                <option key={String(f.hranaId)} value={String(f.hranaId)}>
                  {f.nazivHrane ?? "Nepoznata hrana"}
                  {f.kalorije ? ` (${f.kalorije} kcal/100g)` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Količina (g)
            </label>
            <input
              type="number"
              min={1}
              step="1"
              value={kolicina}
              onChange={(e) => setKolicina(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
              required
            />
          </div>

          <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-700">
              Izabrano:{" "}
              <span className="font-semibold">
                {selectedFood?.nazivHrane ?? "-"}
              </span>
            </p>

            <p className="text-sm text-gray-700">
              Procena kalorija:{" "}
              <span className="font-semibold">
                {estimatedKcal == null
                  ? "-"
                  : `${estimatedKcal.toFixed(1)} kcal`}
              </span>
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Proteini</p>
                <p className="font-semibold text-gray-800">
                  {estimatedMacros?.proteini == null
                    ? "-"
                    : `${estimatedMacros.proteini.toFixed(1)} g`}
                </p>
              </div>

              <div className="bg-white border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Masti</p>
                <p className="font-semibold text-gray-800">
                  {estimatedMacros?.masti == null
                    ? "-"
                    : `${estimatedMacros.masti.toFixed(1)} g`}
                </p>
              </div>

              <div className="bg-white border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">UH</p>
                <p className="font-semibold text-gray-800">
                  {estimatedMacros?.ugljeniHidrati == null
                    ? "-"
                    : `${estimatedMacros.ugljeniHidrati.toFixed(1)} g`}
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? "Čuvam..." : "Sačuvaj unos"}
          </button>

          <Link
            href="/food/new"
            className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            + Dodaj novu hranu
          </Link>
        </form>
      </div>
    </main>
  );
}
