"use client";

import Script from "next/script";
import { useEffect, useMemo, useState } from "react";

type DayPoint = {
  date: string;
  caloriesIn: number;
  caloriesOut: number;
  waterMl: number;
};

type WeatherState = {
  temperature: number | null;
  apparentTemperature: number | null;
  weatherCode: number | null;
  error: string | null;
};

declare global {
  interface Window {
    // Google Charts loader injects an untyped global.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

function lastNDates(count: number) {
  const list: string[] = [];
  const base = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    list.push(d.toISOString().slice(0, 10));
  }

  return list;
}

function weatherLabel(code: number | null) {
  if (code == null) return "Nepoznato";
  if ([0].includes(code)) return "Vedro";
  if ([1, 2, 3].includes(code)) return "Delimicno oblacno";
  if ([45, 48].includes(code)) return "Magla";
  if ([51, 53, 55, 56, 57].includes(code)) return "Romimljanje";
  if ([61, 63, 65, 66, 67].includes(code)) return "Kisa";
  if ([71, 73, 75, 77].includes(code)) return "Sneg";
  if ([80, 81, 82].includes(code)) return "Pljuskovi";
  if ([95, 96, 99].includes(code)) return "Nevreme";
  return `Kod ${code}`;
}

export default function AnalyticsPage() {
  const [rows, setRows] = useState<DayPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartsReady, setChartsReady] = useState(false);
  const [weather, setWeather] = useState<WeatherState>({
    temperature: null,
    apparentTemperature: null,
    weatherCode: null,
    error: null,
  });

  const dates = useMemo(() => lastNDates(7), []);

  useEffect(() => {
    const loadAnalytics = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Morate biti ulogovani.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const headers = { Authorization: `Bearer ${token}` };

        const dayRows = await Promise.all(
          dates.map(async (datum) => {
            const [foodRes, activityRes, waterRes] = await Promise.all([
              fetch(`/api/konzumirana-hrana?datum=${datum}`, { headers }),
              fetch(`/api/odradjene-aktivnosti?datum=${datum}`, { headers }),
              fetch(`/api/water?datum=${datum}`, { headers }),
            ]);

            if (!foodRes.ok || !activityRes.ok || !waterRes.ok) {
              throw new Error("Ne mogu da ucitam analitiku.");
            }

            const [foodData, activityData, waterData] = await Promise.all([
              foodRes.json(),
              activityRes.json(),
              waterRes.json(),
            ]);

            return {
              date: datum,
              caloriesIn:
                Number(foodData?.totals?.kalorije) ||
                Number(foodData?.kalorije) ||
                0,
              caloriesOut:
                Number(activityData?.totals?.potroseneKalorije) ||
                Number(activityData?.burnedKcal) ||
                0,
              waterMl:
                Number(waterData?.kolicinaMl) ||
                Number(waterData?.intake) ||
                0,
            } satisfies DayPoint;
          }),
        );

        setRows(dayRows);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Greska pri ucitavanju.");
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();
  }, [dates]);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=44.8176&longitude=20.4633&current=temperature_2m,apparent_temperature,weather_code",
        );
        if (!res.ok) throw new Error("Open-Meteo nije dostupan.");

        const data = await res.json();
        const current = data?.current ?? {};

        setWeather({
          temperature:
            current.temperature_2m != null ? Number(current.temperature_2m) : null,
          apparentTemperature:
            current.apparent_temperature != null
              ? Number(current.apparent_temperature)
              : null,
          weatherCode:
            current.weather_code != null ? Number(current.weather_code) : null,
          error: null,
        });
      } catch (e) {
        setWeather((prev) => ({
          ...prev,
          error: e instanceof Error ? e.message : "Greska pri ucitavanju vremena.",
        }));
      }
    };

    void loadWeather();
  }, []);

  useEffect(() => {
    if (!chartsReady || !window.google || rows.length === 0) return;

    window.google.charts.load("current", { packages: ["corechart"] });
    window.google.charts.setOnLoadCallback(() => {
      const caloriesData = window.google.visualization.arrayToDataTable([
        ["Datum", "Unete kcal", "Potrosene kcal"],
        ...rows.map((r) => [
          r.date.slice(5),
          Math.round(r.caloriesIn),
          Math.round(r.caloriesOut),
        ]),
      ]);

      const waterData = window.google.visualization.arrayToDataTable([
        ["Datum", "Voda (ml)"],
        ...rows.map((r) => [r.date.slice(5), Math.round(r.waterMl)]),
      ]);

      const caloriesChart = new window.google.visualization.LineChart(
        document.getElementById("calories-chart"),
      );
      caloriesChart.draw(caloriesData, {
        title: "Poslednjih 7 dana - kalorije",
        curveType: "function",
        legend: { position: "bottom" },
        colors: ["#0284c7", "#ef4444"],
        chartArea: { left: 48, top: 48, width: "85%", height: "65%" },
      });

      const waterChart = new window.google.visualization.ColumnChart(
        document.getElementById("water-chart"),
      );
      waterChart.draw(waterData, {
        title: "Poslednjih 7 dana - unos vode",
        legend: { position: "none" },
        colors: ["#2563eb"],
        chartArea: { left: 48, top: 48, width: "85%", height: "65%" },
      });
    });
  }, [chartsReady, rows]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          caloriesIn: acc.caloriesIn + row.caloriesIn,
          caloriesOut: acc.caloriesOut + row.caloriesOut,
          waterMl: acc.waterMl + row.waterMl,
        }),
        { caloriesIn: 0, caloriesOut: 0, waterMl: 0 },
      ),
    [rows],
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-emerald-50 p-6">
      <Script
        src="https://www.gstatic.com/charts/loader.js"
        strategy="afterInteractive"
        onLoad={() => setChartsReady(true)}
      />

      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-white/70 bg-white/90 p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Analitika</h1>
          <p className="mt-1 text-sm text-gray-600">
            Vizualizacija poslednjih 7 dana (Google Charts) i vremenski uslovi
            za Beograd (Open-Meteo API).
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-white/90 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Ukupno uneto</p>
            <p className="text-xl font-semibold text-sky-700">
              {Math.round(totals.caloriesIn)} kcal
            </p>
          </div>
          <div className="rounded-xl border bg-white/90 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Ukupno potroseno</p>
            <p className="text-xl font-semibold text-rose-700">
              {Math.round(totals.caloriesOut)} kcal
            </p>
          </div>
          <div className="rounded-xl border bg-white/90 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Ukupno voda</p>
            <p className="text-xl font-semibold text-blue-700">
              {Math.round(totals.waterMl)} ml
            </p>
          </div>
          <div className="rounded-xl border bg-white/90 p-4 shadow-sm">
            <p className="text-xs text-gray-500">Vreme (Beograd)</p>
            {weather.error ? (
              <p className="text-sm text-red-600">{weather.error}</p>
            ) : (
              <p className="text-sm font-medium text-gray-800">
                {weather.temperature != null ? `${weather.temperature}°C` : "-"}
                {weather.apparentTemperature != null
                  ? ` (osecaj ${weather.apparentTemperature}°C)`
                  : ""}
                {" - "}
                {weatherLabel(weather.weatherCode)}
              </p>
            )}
          </div>
        </section>

        {loading ? (
          <section className="rounded-2xl border bg-white/90 p-6 shadow-sm text-gray-700">
            Ucitavanje analitike...
          </section>
        ) : error ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm text-red-700">
            {error}
          </section>
        ) : (
          <>
            <section className="rounded-2xl border bg-white/90 p-4 shadow-sm">
              <div id="calories-chart" className="h-[360px] w-full" />
            </section>
            <section className="rounded-2xl border bg-white/90 p-4 shadow-sm">
              <div id="water-chart" className="h-[320px] w-full" />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
