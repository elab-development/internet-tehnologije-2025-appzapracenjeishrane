"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

export default function WaterPage() {
  const DAILY_GOAL = 2000; // ml

  const [datum, setDatum] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [intake, setIntake] = useState(0);
  const [loading, setLoading] = useState(true);

  const progress = useMemo(() => {
    return Math.min(Math.round((intake / DAILY_GOAL) * 100), 100);
  }, [intake]);

  const isGoalReached = intake >= DAILY_GOAL;

  const loadForDate = async (d: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/water?datum=${d}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data?.error ?? "Greška pri učitavanju unosa vode");
        return;
      }

      setIntake(Number(data.kolicinaMl) || 0);
    } catch (e: any) {
      alert(e?.message ?? "Greška");
    } finally {
      setLoading(false);
    }
  };

  const saveTotal = async (newTotal: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Niste ulogovani");
      return;
    }

    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ datum, kolicinaMl: newTotal }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error ?? "Greška pri čuvanju unosa vode");
        return;
      }

      setIntake(newTotal);
    } catch (e: any) {
      alert(e?.message ?? "Greška");
    }
  };

  const addWater = (amount: number) => {
    // optimistički UI: odmah prikaži, pa upiši u bazu
    const newTotal = intake + amount;
    setIntake(newTotal);
    saveTotal(newTotal);
  };

  useEffect(() => {
    loadForDate(datum);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datum]);

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-6"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Praćenje unosa vode
        </h1>

        {/* Datum */}
        <div className="mb-4 text-left">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Datum
          </label>
          <input
            type="date"
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-gray-900"
          />
        </div>

        <p className="text-gray-600 mb-1">
          {loading ? (
            "Učitavanje..."
          ) : (
            <>
              Današnji unos: <b>{intake} ml</b>
            </>
          )}
        </p>

        <p className="text-sm text-gray-500 mb-4">
          {DAILY_GOAL} ml je prosečan dnevni unos (minimum)
        </p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden mb-2">
          <div
            className={`h-6 transition-all ${
              isGoalReached ? "bg-green-500" : "bg-blue-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-sm text-gray-500 mb-6">
          {isGoalReached
            ? "✅ Dostignut preporučeni minimum"
            : `Popunjeno: ${progress}%`}
        </div>

        {/* Dugmad */}
        <div className="flex justify-between gap-3">
          <button
            onClick={() => addWater(125)}
            disabled={loading}
            className="flex-1 bg-blue-100 hover:bg-blue-200 disabled:opacity-60 text-blue-700 py-2 rounded-lg"
          >
            🥛 Pola čaše <br /> (125 ml)
          </button>

          <button
            onClick={() => addWater(250)}
            disabled={loading}
            className="flex-1 bg-blue-100 hover:bg-blue-200 disabled:opacity-60 text-blue-700 py-2 rounded-lg"
          >
            🥤 Čaša <br /> (250 ml)
          </button>

          <button
            onClick={() => addWater(500)}
            disabled={loading}
            className="flex-1 bg-blue-100 hover:bg-blue-200 disabled:opacity-60 text-blue-700 py-2 rounded-lg"
          >
            🚰 Flašica <br /> (500 ml)
          </button>
        </div>

        {/* Reset (opciono) */}
        <button
          onClick={() => saveTotal(0)}
          disabled={loading}
          className="mt-4 w-full bg-gray-200 hover:bg-gray-300 disabled:opacity-60 text-gray-800 py-2 rounded-lg"
        >
          Reset
        </button>

        <Link
          href="/"
          className="inline-block mt-6 text-blue-700 hover:underline"
        >
          ⬅ Nazad na početnu
        </Link>
      </div>
    </main>
  );
}
