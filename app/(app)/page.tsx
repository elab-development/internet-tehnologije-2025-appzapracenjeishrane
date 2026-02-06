"use client";

import { useState } from "react";
import CalorieCircle from "@/app/components/CalorieCircle/CalorieCircle";

export default function Home() {
  const DAILY_GOAL = 2348;
  const STEP = 50;

  const [calories, setCalories] = useState(598);

  const changeCalories = (amount: number) => {
    setCalories((prev) => Math.max(prev + amount, 0));
  };

  return (
    <main
      className="min-h-screen grid place-items-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-lg w-[380px] flex flex-col items-center gap-7">

        {/* NASLOV */}
        <h1 className="text-2xl font-bold text-gray-800">
          Dobrodošao 👋
        </h1>

        {/* KRUG SA KALORIJAMA */}
        <CalorieCircle eaten={calories} goal={DAILY_GOAL} />

        {/* INFO TEKST */}
        <div className="text-center">
          <p className="text-gray-600 text-sm">Danas si uneo</p>
          <p className="font-semibold text-gray-800">
            {calories} / {DAILY_GOAL} kcal
          </p>
        </div>

        {/* PLUS / MINUS */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => changeCalories(-STEP)}
            className="w-14 h-14 rounded-full bg-gray-200 text-2xl font-bold text-gray-700 hover:bg-gray-300 transition"
          >
            –
          </button>

          <button
            onClick={() => changeCalories(STEP)}
            className="w-14 h-14 rounded-full bg-green-500 text-white text-2xl font-bold hover:bg-green-600 transition"
          >
            +
          </button>
        </div>

        {/* GLAVNO DUGME */}
        <button className="mt-2 w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition">
          Dodaj obrok
        </button>

      </div>
    </main>
  );
}
