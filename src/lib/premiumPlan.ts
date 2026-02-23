export type PremiumPlanInput = {
  tezinaKg: number;
  visinaCm: number;
  ciljnaTezinaKg: number;
};

export type PremiumPlan = {
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

function round(value: number) {
  return Math.round(value);
}

export function calculatePremiumPlan(input: PremiumPlanInput): PremiumPlan {
  const tezinaKg = Number(input.tezinaKg);
  const visinaCm = Number(input.visinaCm);
  const ciljnaTezinaKg = Number(input.ciljnaTezinaKg);

  const maintenanceKcal = Math.max(1200, round(tezinaKg * 30));
  const razlika = ciljnaTezinaKg - tezinaKg;
  const absRazlika = Math.abs(razlika);

  let smer: PremiumPlan["smer"] = "ODRZAVANJE";
  let adjustment = 0;

  if (absRazlika >= 1) {
    if (razlika < 0) {
      smer = "SMANJENJE";
      adjustment = -Math.min(Math.max(absRazlika * 110, 250), 500);
    } else {
      smer = "POVECANJE";
      adjustment = Math.min(Math.max(absRazlika * 90, 200), 400);
    }
  }

  const targetKcal = Math.max(1200, maintenanceKcal + adjustment);

  const proteinBaseKg = smer === "POVECANJE" ? ciljnaTezinaKg : tezinaKg;
  const proteinFactor = smer === "SMANJENJE" ? 2.0 : 1.6;
  const proteinG = round(Math.max(60, proteinBaseKg * proteinFactor));

  const mastiG = round(Math.max(40, tezinaKg * 0.8));
  const kcalAfterProteinAndFat = targetKcal - proteinG * 4 - mastiG * 9;
  const ugljeniHidratiG = round(Math.max(50, kcalAfterProteinAndFat / 4));

  const vodaMl = round(Math.max(1500, tezinaKg * 35));

  const visinaM = visinaCm > 0 ? visinaCm / 100 : 0;
  const bmi =
    visinaM > 0 ? Number((tezinaKg / (visinaM * visinaM)).toFixed(1)) : null;

  const procenaNedeljnogPomerajaKg = Number(
    ((Math.abs(adjustment) * 7) / 7700).toFixed(2),
  );

  return {
    maintenanceKcal,
    targetKcal,
    proteinG,
    mastiG,
    ugljeniHidratiG,
    vodaMl,
    bmi,
    razlikaDoCiljaKg: Number(absRazlika.toFixed(1)),
    smer,
    procenaNedeljnogPomerajaKg,
    napomena:
      "Procena je okvirna i bice preciznija kada dodamo godine, pol, nivo aktivnosti i pracenje merenja.",
  };
}

