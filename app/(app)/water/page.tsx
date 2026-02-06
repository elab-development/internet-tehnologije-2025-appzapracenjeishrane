 "use client";

import { useState } from "react";
import Link from "next/link";

export default function WaterPage() {
  const DAILY_GOAL = 2000; // ml
  const [intake, setIntake] = useState(0);

  const addWater = (amount: number) => {
    setIntake((prev) => Math.min(prev + amount, DAILY_GOAL));
  };

  const progress = Math.round((intake / DAILY_GOAL) * 100);

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Praćenje unosa vode
        </h1>

        <p className="text-gray-600 mb-4">
          Današnji unos: <b>{intake} ml</b> / 2000 ml
        </p>

        {/* Skala / progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden mb-6">
          <div
            className="bg-blue-500 h-6 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-sm text-gray-500 mb-6">
          Popunjeno: {progress}%
        </div>

        {/* Dugmad */}
        <div className="flex justify-between gap-3">
          <button
            onClick={() => addWater(125)}
            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-lg"
          >
            🥛 Pola čaše <br /> (125 ml)
          </button>

          <button
            onClick={() => addWater(250)}
            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-lg"
          >
            🥤 Čaša <br /> (250 ml)
          </button>

          <button
            onClick={() => addWater(500)}
            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-lg"
          >
            🚰 Flašica <br /> (500 ml)
          </button>
        </div>

        <Link
          href="/"
          className="inline-block mt-6 text-blue-600 hover:underline"
        >
          ⬅ Nazad na početnu
        </Link>
      </div>
    </main>
  );
}
