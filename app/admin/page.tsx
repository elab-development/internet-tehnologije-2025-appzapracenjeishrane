"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PendingFood = {
  hranaId: string;
  nazivHrane: string | null;
  kalorije: string | null;
  proteini: string | null;
  masti: string | null;
  ugljeniHidrati: string | null;
};

type PendingActivity = {
  aktivnostId: string;
  nazivAktivnosti: string | null;
  prosekKalorija: string | null;
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [foodRows, setFoodRows] = useState<PendingFood[]>([]);
  const [activityRows, setActivityRows] = useState<PendingActivity[]>([]);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const loadPending = async (token: string) => {
    const res = await fetch("/api/admin/moderation", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error ?? "Ne mogu da ucitam podatke");
    }

    setFoodRows(Array.isArray(data?.hrana) ? data.hrana : []);
    setActivityRows(Array.isArray(data?.aktivnosti) ? data.aktivnosti : []);
  };

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.uloga !== "ADMIN") {
          router.push("/home");
          return;
        }

        await loadPending(token);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [router]);

  const handleDecision = async (
    entity: "hrana" | "aktivnost",
    id: string,
    action: "accept" | "reject",
  ) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setBusyKey(`${entity}:${id}:${action}`);

    try {
      const res = await fetch("/api/admin/moderation", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ entity, id, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data?.error ?? "Greska pri azuriranju statusa");
        return;
      }

      if (entity === "hrana") {
        setFoodRows((prev) => prev.filter((r) => String(r.hranaId) !== String(id)));
      } else {
        setActivityRows((prev) =>
          prev.filter((r) => String(r.aktivnostId) !== String(id)),
        );
      }
    } catch (err: any) {
      alert(err?.message ?? "Greska");
    } finally {
      setBusyKey(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <main
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <nav className="w-full h-14 bg-gray-900 text-white flex items-center justify-between px-6">
        <div className="font-bold text-lg">Admin panel</div>
        <div className="flex items-center gap-3">
          <Link
            href="/swagger"
            className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
          >
            Swagger
          </Link>
          <button
            type="button"
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          >
            Izloguj se
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {loading ? (
          <section className="rounded-xl bg-white/90 backdrop-blur-md p-6 shadow text-gray-700">
            Ucitavanje...
          </section>
        ) : (
          <>
            <section className="rounded-xl bg-white/90 backdrop-blur-md p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  Nova hrana
                </h2>
                <span className="text-sm text-gray-500">
                  {foodRows.length} na cekanju
                </span>
              </div>

              {foodRows.length === 0 ? (
                <p className="text-gray-600">Nema novih unosa hrane.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-600">
                        <th className="px-3 py-2">ID</th>
                        <th className="px-3 py-2">Naziv</th>
                        <th className="px-3 py-2">Kalorije</th>
                        <th className="px-3 py-2">Proteini</th>
                        <th className="px-3 py-2">Masti</th>
                        <th className="px-3 py-2">UH</th>
                        <th className="px-3 py-2">Akcije</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodRows.map((row) => (
                        <tr key={row.hranaId} className="border-b last:border-0">
                          <td className="px-3 py-2 text-gray-800">{row.hranaId}</td>
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {row.nazivHrane ?? "-"}
                          </td>
                          <td className="px-3 py-2 text-gray-800">{row.kalorije ?? "-"}</td>
                          <td className="px-3 py-2 text-gray-800">{row.proteini ?? "-"}</td>
                          <td className="px-3 py-2 text-gray-800">{row.masti ?? "-"}</td>
                          <td className="px-3 py-2 text-gray-800">{row.ugljeniHidrati ?? "-"}</td>
                          <td className="px-3 py-2 text-gray-800">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleDecision("hrana", row.hranaId, "accept")
                                }
                                disabled={busyKey !== null}
                                className="rounded-md bg-green-600 px-3 py-1 text-white hover:bg-green-700 disabled:opacity-60"
                              >
                                Prihvati
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDecision("hrana", row.hranaId, "reject")
                                }
                                disabled={busyKey !== null}
                                className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-60"
                              >
                                Odbij
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-xl bg-white/90 backdrop-blur-md p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  Nove aktivnosti
                </h2>
                <span className="text-sm text-gray-500">
                  {activityRows.length} na cekanju
                </span>
              </div>

              {activityRows.length === 0 ? (
                <p className="text-gray-600">Nema novih aktivnosti.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-600">
                        <th className="px-3 py-2">ID</th>
                        <th className="px-3 py-2">Naziv aktivnosti</th>
                        <th className="px-3 py-2">Prosek kalorija (kcal/h)</th>
                        <th className="px-3 py-2">Akcije</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityRows.map((row) => (
                        <tr
                          key={row.aktivnostId}
                          className="border-b last:border-0"
                        >
                          <td className="px-3 py-2 text-gray-800">{row.aktivnostId}</td>
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {row.nazivAktivnosti ?? "-"}
                          </td>
                          <td className="px-3 py-2 text-gray-800">{row.prosekKalorija ?? "-"}</td>
                          <td className="px-3 py-2 text-gray-800">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleDecision(
                                    "aktivnost",
                                    row.aktivnostId,
                                    "accept",
                                  )
                                }
                                disabled={busyKey !== null}
                                className="rounded-md bg-green-600 px-3 py-1 text-white hover:bg-green-700 disabled:opacity-60"
                              >
                                Prihvati
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleDecision(
                                    "aktivnost",
                                    row.aktivnostId,
                                    "reject",
                                  )
                                }
                                disabled={busyKey !== null}
                                className="rounded-md bg-red-600 px-3 py-1 text-white hover:bg-red-700 disabled:opacity-60"
                              >
                                Odbij
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
