"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CalorieCircle from "@/app/components/CalorieCircle/CalorieCircle";
import { useRouter } from "next/navigation";

type Totals = {
  kalorije: number;
  proteini: number;
  masti: number;
  ugljeniHidrati: number;
};

export default function Home() {
  const router = useRouter();
  const DAILY_GOAL = 2348;

  const [totals, setTotals] = useState<Totals>({
    kalorije: 0,
    proteini: 0,
    masti: 0,
    ugljeniHidrati: 0,
  });

  const [loading, setLoading] = useState(true);

  // 🔒 zaštita rute (ako nema tokena → login)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
  }, [router]);

  // 📊 učitavanje dnevnih podataka
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    fetch(`/api/konzumirana-hrana?datum=${today}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("Ne mogu da učitam dnevne unose");
        return r.json();
      })
      .then((data) => {
        setTotals({
          kalorije: Number(data.totals.kalorije) || 0,
          proteini: Number(data.totals.proteini) || 0,
          masti: Number(data.totals.masti) || 0,
          ugljeniHidrati: Number(data.totals.ugljeniHidrati) || 0,
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Greška pri učitavanju dnevnih unosa");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main
      className="min-h-screen grid place-items-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-lg w-[380px] flex flex-col items-center gap-7">
        <h1 className="text-2xl font-bold text-gray-800">Dobrodošao 👋</h1>

        <CalorieCircle eaten={totals.kalorije} goal={DAILY_GOAL} />

        <div className="text-center">
          <p className="text-gray-600 text-sm">Danas si uneo</p>
          <p className="font-semibold text-gray-800">
            {Math.round(totals.kalorije)} / {DAILY_GOAL} kcal
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Proteini</p>
            <p className="font-semibold">{totals.proteini.toFixed(1)} g</p>
          </div>

          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Masti</p>
            <p className="font-semibold">{totals.masti.toFixed(1)} g</p>
          </div>

          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">UH</p>
            <p className="font-semibold">
              {totals.ugljeniHidrati.toFixed(1)} g
            </p>
          </div>
        </div>

        <Link
          href="/food"
          className="mt-2 w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition text-center"
        >
          Dodaj obrok
        </Link>

        <Link
          href="/water"
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition text-center"
        >
          Prati unos vode
        </Link>

        {loading && (
          <p className="text-xs text-gray-400">Učitavanje podataka…</p>
        )}
      </div>
    </main>
  );
}
