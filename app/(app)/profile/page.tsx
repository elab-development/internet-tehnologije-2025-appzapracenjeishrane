"use client";

import { useEffect, useState } from "react";

type ProfileUser = {
  id: string;
  ime: string | null;
  email: string | null;
  uloga: string | null;
  tezina: number | null;
  visina: number | null;
  ciljnaTezina: number | null;
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

type ProfileResponse = {
  user: ProfileUser;
  premiumPlan: PremiumPlan | null;
};

function formatRole(uloga: string | null) {
  const value = String(uloga ?? "").toUpperCase();
  if (value === "PREMIUM") return "Premium";
  if (value === "ADMIN") return "Admin";
  return "Obican";
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tezinaInput, setTezinaInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [upgradingPremium, setUpgradingPremium] = useState(false);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [upgradeTezina, setUpgradeTezina] = useState("");
  const [upgradeVisina, setUpgradeVisina] = useState("");
  const [upgradeCiljnaTezina, setUpgradeCiljnaTezina] = useState("");
  const [upgradeMessage, setUpgradeMessage] = useState<string | null>(null);

  const loadProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Niste ulogovani.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body?.error ?? "Greska pri ucitavanju profila");
      }

      const profileData = body as ProfileResponse;
      setData(profileData);
      setTezinaInput(
        profileData.user.tezina != null ? String(profileData.user.tezina) : "",
      );
      setUpgradeTezina(
        profileData.user.tezina != null ? String(profileData.user.tezina) : "",
      );
      setUpgradeVisina(
        profileData.user.visina != null ? String(profileData.user.visina) : "",
      );
      setUpgradeCiljnaTezina(
        profileData.user.ciljnaTezina != null
          ? String(profileData.user.ciljnaTezina)
          : "",
      );
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Greska pri ucitavanju profila";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const user = data?.user ?? null;
  const plan = data?.premiumPlan ?? null;
  const isPremium = String(user?.uloga ?? "").toUpperCase() === "PREMIUM";

  const handleWeightSave = async () => {
    setSaveMessage(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setSaveMessage("Niste ulogovani.");
      return;
    }

    const tezina = Number(tezinaInput);
    if (!Number.isFinite(tezina) || tezina <= 0) {
      setSaveMessage("Unesite ispravnu tezinu.");
      return;
    }

    setSavingWeight(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tezina }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error ?? "Greska pri cuvanju tezine");
      }

      setSaveMessage("Tezina je sacuvana.");
      setLoading(true);
      await loadProfile();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Greska pri cuvanju tezine";
      setSaveMessage(message);
    } finally {
      setSavingWeight(false);
    }
  };

  const handleUpgradeToPremium = async () => {
    setUpgradeMessage(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setUpgradeMessage("Niste ulogovani.");
      return;
    }

    const tezina = Number(upgradeTezina);
    const visina = Number(upgradeVisina);
    const ciljnaTezina = Number(upgradeCiljnaTezina);

    if (!Number.isFinite(tezina) || tezina <= 0) {
      setUpgradeMessage("Unesite trenutnu tezinu.");
      return;
    }
    if (!Number.isFinite(visina) || visina <= 0) {
      setUpgradeMessage("Unesite visinu.");
      return;
    }
    if (!Number.isFinite(ciljnaTezina) || ciljnaTezina <= 0) {
      setUpgradeMessage("Unesite zeljenu tezinu.");
      return;
    }

    setUpgradingPremium(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "upgradePremium",
          tezina,
          visina,
          ciljnaTezina,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error ?? "Greska pri prelasku na premium");
      }

      setUpgradeMessage("Nalog je sada premium.");
      setShowUpgradeForm(false);
      setLoading(true);
      await loadProfile();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Greska pri prelasku na premium";
      setUpgradeMessage(message);
    } finally {
      setUpgradingPremium(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center py-8 px-4"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="max-w-4xl mx-auto grid gap-6">
        <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800">Profil korisnika</h1>

          {loading && <p className="mt-4 text-sm text-gray-500">Ucitavanje...</p>}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {user && !loading && (
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 bg-white">
                <p className="text-xs text-gray-500">Ime</p>
                <p className="font-semibold text-gray-800">{user.ime ?? "-"}</p>
              </div>

              <div className="border rounded-xl p-4 bg-white">
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold text-gray-800">{user.email ?? "-"}</p>
              </div>

              <div className="border rounded-xl p-4 bg-white">
                <p className="text-xs text-gray-500">Paket</p>
                <p className="font-semibold text-gray-800">{formatRole(user.uloga)}</p>
              </div>

              <div className="border rounded-xl p-4 bg-white">
                <p className="text-xs text-gray-500">Podaci za plan</p>
                <p className="font-semibold text-gray-800">
                  {user.tezina ?? "-"} kg / {user.visina ?? "-"} cm / cilj{" "}
                  {user.ciljnaTezina ?? "-"} kg
                </p>
              </div>
            </div>
          )}

          {!loading && isPremium && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800">
                Azuriraj trenutnu tezinu
              </p>

              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  value={tezinaInput}
                  onChange={(e) => setTezinaInput(e.target.value)}
                  placeholder="Nova tezina (kg)"
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                />
                <button
                  type="button"
                  onClick={handleWeightSave}
                  disabled={savingWeight}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
                >
                  {savingWeight ? "Cuvanje..." : "Sacuvaj tezinu"}
                </button>
              </div>

              {saveMessage && (
                <p className="mt-2 text-xs text-gray-700">{saveMessage}</p>
              )}
            </div>
          )}
        </section>

        <section className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-gray-800">Premium plan</h2>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                isPremium
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {isPremium ? "Otkljucano" : "Zakljucano"}
            </span>
          </div>

          {!loading && !isPremium && (
            <div className="mt-4 border border-dashed border-gray-300 rounded-xl p-5 bg-gray-50">
              <p className="font-semibold text-gray-800">
                Premium funkcije su dostupne samo premium korisnicima.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Ovde ce se prikazivati personalizovan kalorijski plan, makroi i
                napredak ka ciljnoj tezini.
              </p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowUpgradeForm((prev) => !prev)}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                >
                  {showUpgradeForm
                    ? "Zatvori formu"
                    : "Unapredi se na premium"}
                </button>
              </div>

              {showUpgradeForm && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-semibold text-green-800">
                    Unesi podatke za premium plan
                  </p>

                  <div className="mt-3 grid sm:grid-cols-3 gap-3">
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={upgradeTezina}
                      onChange={(e) => setUpgradeTezina(e.target.value)}
                      placeholder="Trenutna tezina (kg)"
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                    />
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={upgradeVisina}
                      onChange={(e) => setUpgradeVisina(e.target.value)}
                      placeholder="Visina (cm)"
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                    />
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={upgradeCiljnaTezina}
                      onChange={(e) => setUpgradeCiljnaTezina(e.target.value)}
                      placeholder="Zeljena tezina (kg)"
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
                    />
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleUpgradeToPremium}
                      disabled={upgradingPremium}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
                    >
                      {upgradingPremium ? "Prelazak..." : "Potvrdi premium"}
                    </button>
                  </div>

                  {upgradeMessage && (
                    <p className="mt-2 text-xs text-gray-700">
                      {upgradeMessage}
                    </p>
                  )}
                </div>
              )}
              <div className="mt-4 grid sm:grid-cols-3 gap-3 opacity-60">
                <div className="rounded-lg border bg-white p-3">
                  <p className="text-xs text-gray-500">Dnevni unos</p>
                  <p className="font-semibold text-gray-700">Premium only</p>
                </div>
                <div className="rounded-lg border bg-white p-3">
                  <p className="text-xs text-gray-500">Makroi</p>
                  <p className="font-semibold text-gray-700">Premium only</p>
                </div>
                <div className="rounded-lg border bg-white p-3">
                  <p className="text-xs text-gray-500">Napredak</p>
                  <p className="font-semibold text-gray-700">Premium only</p>
                </div>
              </div>
            </div>
          )}

          {!loading && isPremium && !plan && (
            <p className="mt-4 text-sm text-amber-700">
              Premium korisnik nema kompletne podatke (tezina/visina/cilj) za
              izracunavanje plana.
            </p>
          )}

          {!loading && isPremium && plan && user && (
            <div className="mt-4 grid gap-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-xs text-gray-500">Preporuceni unos</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {plan.targetKcal} kcal
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Odrzavanje: {plan.maintenanceKcal} kcal
                  </p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <p className="text-xs text-gray-500">Makroi</p>
                  <p className="font-semibold text-gray-800">
                    P {plan.proteinG}g - M {plan.mastiG}g - UH{" "}
                    {plan.ugljeniHidratiG}g
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Dnevna raspodela
                  </p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <p className="text-xs text-gray-500">Voda</p>
                  <p className="font-semibold text-gray-800">
                    {plan.vodaMl} ml / dan
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Procena po tezini
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border bg-white p-4">
                  <p className="text-xs text-gray-500">Preostalo do cilja</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {plan.razlikaDoCiljaKg} kg
                  </p>
                </div>

                <div className="rounded-xl border bg-white p-4">
                  <p className="text-xs text-gray-500">Smer / BMI</p>
                  <p className="font-semibold text-gray-800">
                    {plan.smer === "SMANJENJE" && "Smanjenje"}
                    {plan.smer === "POVECANJE" && "Povecanje"}
                    {plan.smer === "ODRZAVANJE" && "Odrzavanje"}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">BMI: {plan.bmi ?? "-"}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
