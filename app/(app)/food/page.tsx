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

// debounce helper
function useDebouncedValue<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default function FoodPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);

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
      .then((data) => setFoods(Array.isArray(data) ? data : []))
      .catch((e) => alert(e.message));
  }, []);

  // opcionalno: ako korisnik promeni search, a selektovana hrana više nije u rezultatima
  useEffect(() => {
    if (!selectedId) return;
    const existsInFiltered = foods.some(
      (f) => String(f.hranaId) === String(selectedId),
    );
    if (!existsInFiltered) setSelectedId("");
  }, [debouncedQuery]); // namerno debounce, da ne resetuje na svaki karakter

  const filteredFoods = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const list = !q
      ? foods
      : foods.filter((f) => (f.nazivHrane ?? "").toLowerCase().includes(q));

    return list.slice(0, 50);
  }, [foods, debouncedQuery]);

  const selectedFood = useMemo(() => {
    return foods.find((f) => String(f.hranaId) === String(selectedId));
  }, [foods, selectedId]);

  const gramsNum = useMemo(() => Number(kolicina), [kolicina]);

  const estimatedKcal = useMemo(() => {
    if (!selectedFood?.kalorije) return null;
    const kcalPer100 = Number(selectedFood.kalorije);
    if (!Number.isFinite(kcalPer100) || !Number.isFinite(gramsNum)) return null;
    return (gramsNum / 100) * kcalPer100;
  }, [selectedFood, gramsNum]);

  const estimatedMacros = useMemo(() => {
    if (!selectedFood || !Number.isFinite(gramsNum)) return null;

    const per100 = (val: string | null) => {
      if (val == null) return null;
      const n = Number(val);
      if (!Number.isFinite(n)) return null;
      return (gramsNum / 100) * n;
    };

    return {
      proteini: per100(selectedFood.proteini),
      masti: per100(selectedFood.masti),
      ugljeniHidrati: per100(selectedFood.ugljeniHidrati),
    };
  }, [selectedFood, gramsNum]);

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

    if (!Number.isFinite(gramsNum) || gramsNum <= 0) {
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
          kolicina: gramsNum, // server će pretvoriti u string za decimal
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error ?? "Greška pri unosu hrane");
        return;
      }

      alert("Unos hrane je sačuvan ✅");
      // opcionalno: reset
      // setKolicina("100");
      // setQuery("");
      // setSelectedId("");
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
            <div className="mt-1 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Prikazuje se do 50 rezultata u listi.
              </p>
              {!!debouncedQuery.trim() && (
                <p className="text-xs text-gray-500">
                  Rezultati: {filteredFoods.length}
                </p>
              )}
            </div>

            {debouncedQuery.trim() && filteredFoods.length === 0 && (
              <p className="mt-2 text-sm text-red-600">
                Nema rezultata za pretragu.
              </p>
            )}
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
              disabled={foods.length === 0}
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
