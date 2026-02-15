"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CalorieCircle from "@/app/components/CalorieCircle/CalorieCircle";

type Totals = {
  kalorije: number;
  proteini: number;
  masti: number;
  ugljeniHidrati: number;
};

export default function Home() {
  const BASE_DAILY_GOAL = 2348; // tvoj osnovni cilj
  const WATER_GOAL = 2000; // ml

  const [totals, setTotals] = useState<Totals>({
    kalorije: 0,
    proteini: 0,
    masti: 0,
    ugljeniHidrati: 0,
  });

  const [burnedKcal, setBurnedKcal] = useState(0);
  const [waterMl, setWaterMl] = useState(0);

  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Ako ste ranije dodavali logiku da aktivnosti povecavaju cilj:
  const dailyGoal = useMemo(() => BASE_DAILY_GOAL + burnedKcal, [burnedKcal]);

  const waterProgress = useMemo(() => {
    const p = Math.round((waterMl / WATER_GOAL) * 100);
    return Math.min(Math.max(p, 0), 100);
  }, [waterMl]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // ako nema tokena, UI može da ostane ali bez podataka (ili redirect kod vas)
      setLoading(false);
      return;
    }

    setLoading(true);

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`/api/konzumirana-hrana?datum=${today}`, { headers }).then(
        async (r) => {
          if (!r.ok) throw new Error("Ne mogu da učitam unose hrane");
          return r.json();
        },
      ),
      fetch(`/api/odradjene-aktivnosti?datum=${today}`, { headers }).then(
        async (r) => {
          if (!r.ok) throw new Error("Ne mogu da učitam aktivnosti");
          return r.json();
        },
      ),
      fetch(`/api/water?datum=${today}`, { headers }).then(async (r) => {
        if (!r.ok) throw new Error("Ne mogu da učitam unos vode");
        return r.json();
      }),
    ])
      .then(([foodData, activityData, waterData]) => {
        // Food totals (očekujemo foodData.totals)
        const t = foodData?.totals ?? foodData ?? {};
        setTotals({
          kalorije: Number(t.kalorije) || 0,
          proteini: Number(t.proteini) || 0,
          masti: Number(t.masti) || 0,
          ugljeniHidrati: Number(t.ugljeniHidrati) || 0,
        });

        // Activity totals (očekujemo activityData.totals.potroseneKalorije ili activityData.totals.burned)
        const at = activityData?.totals ?? activityData ?? {};
        const burned =
          Number(at.potroseneKalorije) ||
          Number(at.burnedKcal) ||
          Number(at.burned) ||
          0;
        setBurnedKcal(burned);

        // Water (očekujemo waterData.kolicinaMl ili waterData.intake)
        const wm =
          Number(waterData?.kolicinaMl) ||
          Number(waterData?.intake) ||
          Number(waterData?.unos) ||
          0;
        setWaterMl(wm);
      })
      .catch((err) => {
        console.error(err);
        alert(err?.message ?? "Greška pri učitavanju podataka");
      })
      .finally(() => setLoading(false));
  }, [today]);

  return (
    <main
      className="min-h-screen grid place-items-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-xl w-[440px] max-w-full flex flex-col items-center gap-7">
        <h1 className="text-2xl font-bold text-gray-800">Dobrodošao 👋</h1>

        {/* KRUG (kalorije / cilj) */}
        <CalorieCircle eaten={totals.kalorije} goal={dailyGoal} />

        {/* INFO */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">Danas si uneo</p>
          <p className="font-semibold text-gray-800">
            {Math.round(totals.kalorije)} / {Math.round(dailyGoal)} kcal
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Osnovni cilj: {BASE_DAILY_GOAL} kcal • Aktivnosti: +
            {Math.round(burnedKcal)} kcal
          </p>
        </div>

        {/* MAKROI */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Proteini</p>
            <p className="font-semibold text-gray-800">
              {totals.proteini.toFixed(1)} g
            </p>
          </div>

          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Masti</p>
            <p className="font-semibold text-gray-800">
              {totals.masti.toFixed(1)} g
            </p>
          </div>

          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">UH</p>
            <p className="font-semibold text-gray-800">
              {totals.ugljeniHidrati.toFixed(1)} g
            </p>
          </div>
        </div>

        {/* NOVA 2 POLJA: aktivnosti + voda */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Aktivnosti */}
          <div className="bg-white border rounded-lg p-3">
            <p className="text-xs text-gray-500">Potrošeno (aktivnosti)</p>
            <p className="font-semibold text-gray-800">
              {burnedKcal.toFixed(1)} kcal
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Povećava dnevni cilj
            </p>
          </div>

          {/* Voda */}
          <div className="bg-white border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Voda</p>
              <p className="text-xs text-gray-600">{waterProgress}%</p>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-2">
              <div
                className="h-2 bg-blue-500 transition-all"
                style={{ width: `${waterProgress}%` }}
              />
            </div>

            <p className="font-semibold text-gray-800 mt-2">
              {Math.round(waterMl)} / {WATER_GOAL} ml
            </p>
          </div>
        </div>

        {/* AKCIJE */}
        <Link
          href="/food"
          className="mt-2 w-full bg-green-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-green-600 transition text-center"
        >
          Dodaj obrok
        </Link>

        <Link
          href="/water"
          className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-600 transition text-center"
        >
          Prati unos vode
        </Link>

        <Link
          href="/activity"
          className="w-full bg-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition text-center"
        >
          Dodaj aktivnost
        </Link>

        {loading && (
          <p className="text-xs text-gray-400">Učitavanje podataka…</p>
        )}
      </div>
    </main>
  );
}
