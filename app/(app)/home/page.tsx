"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CalorieCircle from "@/app/components/CalorieCircle/CalorieCircle";
import { useRouter } from "next/navigation";

type FoodTotals = {
  kalorije: number;
  proteini: number;
  masti: number;
  ugljeniHidrati: number;
};

export default function Home() {
  const router = useRouter();

  const BASE_GOAL = 2348;

  const [foodTotals, setFoodTotals] = useState<FoodTotals>({
    kalorije: 0,
    proteini: 0,
    masti: 0,
    ugljeniHidrati: 0,
  });

  const [burned, setBurned] = useState(0); // potrošeno kroz aktivnosti
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const dynamicGoal = useMemo(() => BASE_GOAL + burned, [BASE_GOAL, burned]);
  const netCalories = useMemo(
    () => foodTotals.kalorije - burned,
    [foodTotals.kalorije, burned],
  );

  // 🔒 zaštita rute
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);

    Promise.all([
      // hrana totals
      fetch(`/api/konzumirana-hrana?datum=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error ?? "Ne mogu da učitam hranu");
        return data;
      }),

      // aktivnosti totals
      fetch(`/api/odradjene-aktivnosti?datum=${today}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(async (r) => {
        const data = await r.json();
        if (!r.ok)
          throw new Error(data?.error ?? "Ne mogu da učitam aktivnosti");
        return data;
      }),
    ])
      .then(([foodData, actData]) => {
        setFoodTotals({
          kalorije: Number(foodData?.totals?.kalorije) || 0,
          proteini: Number(foodData?.totals?.proteini) || 0,
          masti: Number(foodData?.totals?.masti) || 0,
          ugljeniHidrati: Number(foodData?.totals?.ugljeniHidrati) || 0,
        });

        setBurned(Number(actData?.totals?.potroseneKalorije) || 0);
      })
      .catch((err) => {
        console.error(err);
        alert("Greška pri učitavanju dnevnih podataka");
      })
      .finally(() => setLoading(false));
  }, [today]);

  return (
    <main
      className="min-h-screen grid place-items-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-lg w-[420px] flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-gray-800">Dobrodošao 👋</h1>

        {/* Krug sada koristi dinamičan cilj */}
        <CalorieCircle eaten={foodTotals.kalorije} goal={dynamicGoal} />

        <div className="text-center">
          <p className="text-gray-600 text-sm">Danas si uneo</p>
          <p className="font-semibold text-gray-800">
            {Math.round(foodTotals.kalorije)} / {Math.round(dynamicGoal)} kcal
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Osnovni cilj {BASE_GOAL} + aktivnosti {Math.round(burned)} ={" "}
            {Math.round(dynamicGoal)}
          </p>
        </div>

        {/* Makroi */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Proteini</p>
            <p className="font-semibold text-gray-800">
              {foodTotals.proteini.toFixed(1)} g
            </p>
          </div>
          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Masti</p>
            <p className="font-semibold text-gray-800">
              {foodTotals.masti.toFixed(1)} g
            </p>
          </div>
          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">UH</p>
            <p className="font-semibold text-gray-800">
              {foodTotals.ugljeniHidrati.toFixed(1)} g
            </p>
          </div>
        </div>

        {/* Aktivnost summary */}
        <div className="w-full bg-gray-50 border rounded-lg p-3 text-center">
          <p className="text-sm text-gray-700">
            Potrošeno aktivnostima:{" "}
            <span className="font-semibold">{burned.toFixed(1)} kcal</span>
          </p>
          <p className="text-sm text-gray-700">
            Neto kalorije (uneo - potrošio):{" "}
            <span className="font-semibold">{netCalories.toFixed(1)} kcal</span>
          </p>
        </div>

        {/* Akcije */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <Link
            href="/food"
            className="bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition text-center"
          >
            Dodaj obrok
          </Link>

          <Link
            href="/activity"
            className="bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition text-center"
          >
            Dodaj aktivnost
          </Link>

          <Link
            href="/water"
            className="col-span-2 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition text-center"
          >
            Prati unos vode
          </Link>
        </div>

        {loading && (
          <p className="text-xs text-gray-400">Učitavanje podataka…</p>
        )}
      </div>
    </main>
  );
}
