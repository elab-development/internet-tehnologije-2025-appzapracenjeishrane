import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const tmpDir = path.join(repoRoot, ".tmp-tests");

if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

execFileSync(
  process.execPath,
  [
    path.join("node_modules", "typescript", "bin", "tsc"),
    path.join("src", "lib", "premiumPlan.ts"),
    "--target",
    "ES2020",
    "--module",
    "ES2020",
    "--outDir",
    ".tmp-tests",
    "--esModuleInterop",
    "--skipLibCheck",
  ],
  { cwd: repoRoot, stdio: "inherit" },
);

const { calculatePremiumPlan } = await import(
  pathToFileURL(path.join(tmpDir, "premiumPlan.js")).href
);

test("calculatePremiumPlan returns maintenance plan", () => {
  const plan = calculatePremiumPlan({
    tezinaKg: 80,
    visinaCm: 180,
    ciljnaTezinaKg: 80,
  });

  assert.equal(plan.smer, "ODRZAVANJE");
  assert.equal(plan.maintenanceKcal, 2400);
  assert.equal(plan.targetKcal, 2400);
  assert.ok(plan.bmi !== null);
  assert.ok(plan.proteinG >= 60);
  assert.ok(plan.mastiG >= 40);
  assert.ok(plan.ugljeniHidratiG >= 50);
});

test("calculatePremiumPlan lowers calories for weight loss", () => {
  const plan = calculatePremiumPlan({
    tezinaKg: 90,
    visinaCm: 185,
    ciljnaTezinaKg: 80,
  });

  assert.equal(plan.smer, "SMANJENJE");
  assert.ok(plan.targetKcal < plan.maintenanceKcal);
  assert.ok(plan.procenaNedeljnogPomerajaKg > 0);
});

test("calculatePremiumPlan raises calories for weight gain", () => {
  const plan = calculatePremiumPlan({
    tezinaKg: 60,
    visinaCm: 170,
    ciljnaTezinaKg: 68,
  });

  assert.equal(plan.smer, "POVECANJE");
  assert.ok(plan.targetKcal > plan.maintenanceKcal);
});
