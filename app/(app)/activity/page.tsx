"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Activity = {
  aktivnostId: string;
  nazivAktivnosti: string | null;
  prosekKalorija: string | null; // decimal -> string
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [datum, setDatum] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [trajanjeMin, setTrajanjeMin] = useState("30");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/aktivnost")
      .then(async (r) => {
        if (!r.ok) throw new Error("Ne mogu da učitam aktivnosti");
        return r.json();
      })
      .then((data) => setActivities(data))
      .catch((e) => alert(e.message));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = !q
      ? activities
      : activities.filter((a) =>
          (a.nazivAktivnosti ?? "").toLowerCase().includes(q),
        );
    return list.slice(0, 50);
  }, [activities, query]);

  const selected = useMemo(
    () => activities.find((a) => String(a.aktivnostId) === String(selectedId)),
    [activities, selectedId],
  );

  const estimatedBurn = useMemo(() => {
    if (!selected?.prosekKalorija) return null;
    const kcalPerHour = Number(selected.prosekKalorija);
    const mins = Number(trajanjeMin);
    if (!Number.isFinite(kcalPerHour) || !Number.isFinite(mins)) return null;
    return (mins / 60) * kcalPerHour;
  }, [selected, trajanjeMin]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Niste ulogovani");
      return;
    }

    if (!selectedId) {
      alert("Izaberi aktivnost");
      return;
    }

    const mins = Number(trajanjeMin);
    if (!Number.isFinite(mins) || mins <= 0) {
      alert("Trajanje mora biti pozitivan broj");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/odradjene-aktivnosti", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          aktivnostId: selectedId,
          datum,
          trajanjeMin: mins,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error ?? "Greška pri unosu aktivnosti");
        return;
      }

      alert("Aktivnost je sačuvana ✅");
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Unos aktivnosti
            </h1>
            <p className="mt-1 text-gray-600">
              Izaberi aktivnost, unesi trajanje i sačuvaj.
            </p>
          </div>

          <Link
            href="/activity/new"
            className="shrink-0 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            + Nova aktivnost
          </Link>
        </div>

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
              Pretraga aktivnosti
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="npr. trčanje, teretana..."
              className="w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Izaberi aktivnost
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
              {filtered.map((a) => (
                <option
                  key={String(a.aktivnostId)}
                  value={String(a.aktivnostId)}
                >
                  {a.nazivAktivnosti ?? "Nepoznata aktivnost"}
                  {a.prosekKalorija ? ` (${a.prosekKalorija} kcal/h)` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trajanje (min)
            </label>
            <input
              type="number"
              min={1}
              step="1"
              value={trajanjeMin}
              onChange={(e) => setTrajanjeMin(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-gray-900"
              required
            />
          </div>

          <div className="bg-gray-50 border rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Izabrano:{" "}
              <span className="font-semibold">
                {selected?.nazivAktivnosti ?? "-"}
              </span>
            </p>
            <p className="text-sm text-gray-700">
              Procena potrošnje:{" "}
              <span className="font-semibold">
                {estimatedBurn == null
                  ? "-"
                  : `${estimatedBurn.toFixed(1)} kcal`}
              </span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? "Čuvam..." : "Sačuvaj aktivnost"}
          </button>
        </form>
      </div>
    </main>
  );
}
