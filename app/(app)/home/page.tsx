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

type PremiumPlan = {
  maintenanceKcal: number;
  targetKcal: number;
  proteinG: number;
  mastiG: number;
  ugljeniHidratiG: number;
  vodaMl: number;
  bmi: number | null;
  razlikaDoCiljaKg: number;
  smer: "SMANJENJE" | "POVECANJE" | "ODRZAVANJE";
  procenaNedeljnogPomerajaKg: number;
  napomena: string;
};

type ProfilePayload = {
  user?: {
    uloga?: string | null;
    tezina?: number | null;
    ciljnaTezina?: number | null;
  };
  premiumPlan?: PremiumPlan | null;
};

export default function Home() {
  const DEFAULT_BASE_DAILY_GOAL = 2348;
  const WATER_GOAL = 2000;

  const [totals, setTotals] = useState<Totals>({
    kalorije: 0,
    proteini: 0,
    masti: 0,
    ugljeniHidrati: 0,
  });
  const [burnedKcal, setBurnedKcal] = useState(0);
  const [waterMl, setWaterMl] = useState(0);
  const [premiumPlan, setPremiumPlan] = useState<PremiumPlan | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [targetWeight, setTargetWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const premiumBaseGoal = premiumPlan?.targetKcal ?? DEFAULT_BASE_DAILY_GOAL;
  const isPremium = String(userRole ?? "").toUpperCase() === "PREMIUM";
  const effectiveWaterGoal =
    isPremium && premiumPlan ? premiumPlan.vodaMl : WATER_GOAL;
  const dailyGoal = useMemo(
    () => premiumBaseGoal + burnedKcal,
    [premiumBaseGoal, burnedKcal],
  );
  const remainingKg =
    currentWeight != null && targetWeight != null
      ? Math.abs(currentWeight - targetWeight)
      : null;
  const isGoalReached = remainingKg != null && remainingKg <= 0.1;
  const weightGoalProgress = useMemo(() => {
    if (remainingKg == null) return 0;
    const visualRangeKg = 10; // jednostavan vizuelni opseg, ne istorijski procenat
    const clamped = Math.min(Math.max(remainingKg, 0), visualRangeKg);
    return Math.round(((visualRangeKg - clamped) / visualRangeKg) * 100);
  }, [remainingKg]);

  const waterProgress = useMemo(() => {
    const p = Math.round((waterMl / effectiveWaterGoal) * 100);
    return Math.min(Math.max(p, 0), 100);
  }, [waterMl, effectiveWaterGoal]);

  useEffect(() => {
    const loadHome = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [foodData, activityData, waterData, profileData] = await Promise.all([
          fetch(`/api/konzumirana-hrana?datum=${today}`, { headers }).then(
            async (r) => {
              if (!r.ok) throw new Error("Ne mogu da ucitam unose hrane");
              return r.json();
            },
          ),
          fetch(`/api/odradjene-aktivnosti?datum=${today}`, { headers }).then(
            async (r) => {
              if (!r.ok) throw new Error("Ne mogu da ucitam aktivnosti");
              return r.json();
            },
          ),
          fetch(`/api/water?datum=${today}`, { headers }).then(async (r) => {
            if (!r.ok) throw new Error("Ne mogu da ucitam unos vode");
            return r.json();
          }),
          fetch("/api/profile", { headers }).then(async (r) => {
            if (!r.ok) throw new Error("Ne mogu da ucitam profil");
            return r.json();
          }),
        ]);

        const t = foodData?.totals ?? foodData ?? {};
        setTotals({
          kalorije: Number(t.kalorije) || 0,
          proteini: Number(t.proteini) || 0,
          masti: Number(t.masti) || 0,
          ugljeniHidrati: Number(t.ugljeniHidrati) || 0,
        });

        const at = activityData?.totals ?? activityData ?? {};
        const burned =
          Number(at.potroseneKalorije) ||
          Number(at.burnedKcal) ||
          Number(at.burned) ||
          0;
        setBurnedKcal(burned);

        const wm =
          Number(waterData?.kolicinaMl) ||
          Number(waterData?.intake) ||
          Number(waterData?.unos) ||
          0;
        setWaterMl(wm);

        const profile = (profileData ?? {}) as ProfilePayload;
        setPremiumPlan(profile.premiumPlan ?? null);
        setUserRole(String(profile.user?.uloga ?? ""));
        setCurrentWeight(
          profile.user?.tezina != null ? Number(profile.user.tezina) : null,
        );
        setTargetWeight(
          profile.user?.ciljnaTezina != null
            ? Number(profile.user.ciljnaTezina)
            : null,
        );
      } catch (err) {
        console.error(err);
        alert(
          err instanceof Error ? err.message : "Greska pri ucitavanju podataka",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadHome();
  }, [today]);

  return (
    <main
      className="min-h-screen grid place-items-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-xl w-[440px] max-w-full flex flex-col items-center gap-7">
        <h1 className="text-2xl font-bold text-gray-800">Dobrodosao</h1>

        <CalorieCircle eaten={totals.kalorije} goal={dailyGoal} />

        <div className="text-center">
          <p className="text-gray-600 text-sm">Danas si uneo</p>
          <p className="font-semibold text-gray-800">
            {Math.round(totals.kalorije)} / {Math.round(dailyGoal)} kcal
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isPremium ? "Premium cilj" : "Osnovni cilj"}:{" "}
            {Math.round(premiumBaseGoal)} kcal - Aktivnosti: +
            {Math.round(burnedKcal)} kcal
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Proteini</p>
            <p className="font-semibold text-gray-800">
              {totals.proteini.toFixed(1)} g
              {isPremium && premiumPlan ? ` / ${premiumPlan.proteinG} g` : ""}
            </p>
          </div>

          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Masti</p>
            <p className="font-semibold text-gray-800">
              {totals.masti.toFixed(1)} g
              {isPremium && premiumPlan ? ` / ${premiumPlan.mastiG} g` : ""}
            </p>
          </div>

          <div className="bg-white border rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">UH</p>
            <p className="font-semibold text-gray-800">
              {totals.ugljeniHidrati.toFixed(1)} g
              {isPremium && premiumPlan
                ? ` / ${premiumPlan.ugljeniHidratiG} g`
                : ""}
            </p>
          </div>
        </div>

        {isPremium && premiumPlan && currentWeight != null && targetWeight != null && (
          <div className="w-full rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-green-900">
                  Napredak ka ciljnoj tezini
                </p>
                <p className="text-xs text-green-800/80">
                  Napredak
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Preostalo</p>
                <p className="text-lg font-bold text-gray-800">
                  {remainingKg?.toFixed(1)} kg
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="relative h-6 rounded-full bg-white/80 border border-green-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isGoalReached
                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                      : "bg-gradient-to-r from-lime-400 to-green-500"
                  }`}
                  style={{ width: `${Math.max(6, weightGoalProgress)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-800">
                    {isGoalReached
                      ? "Cilj dostignut"
                      : `${weightGoalProgress}% blizu cilja`}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-white/90 border p-2 text-center">
                <p className="text-[11px] text-gray-500">Trenutna</p>
                <p className="font-semibold text-gray-800">
                  {currentWeight.toFixed(1)} kg
                </p>
              </div>
              <div className="rounded-lg bg-white/90 border p-2 text-center">
                <p className="text-[11px] text-gray-500">Zeljena</p>
                <p className="font-semibold text-gray-800">
                  {targetWeight.toFixed(1)} kg
                </p>
              </div>
              <div className="rounded-lg bg-white/90 border p-2 text-center">
                <p className="text-[11px] text-gray-500">Smer</p>
                <p className="font-semibold text-gray-800">
                  {premiumPlan.smer === "SMANJENJE" && "Smanjenje"}
                  {premiumPlan.smer === "POVECANJE" && "Povecanje"}
                  {premiumPlan.smer === "ODRZAVANJE" && "Odrzavanje"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="bg-white border rounded-lg p-3">
            <p className="text-xs text-gray-500">Potroseno (aktivnosti)</p>
            <p className="font-semibold text-gray-800">
              {burnedKcal.toFixed(1)} kcal
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Povecava dnevni cilj
            </p>
          </div>

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
              {Math.round(waterMl)} / {effectiveWaterGoal} ml
            </p>
          </div>
        </div>

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

        {loading && <p className="text-xs text-gray-400">Ucitavanje podataka...</p>}
      </div>
    </main>
  );
}
