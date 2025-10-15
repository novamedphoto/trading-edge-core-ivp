const pct = (value: number, p: number) => (value * p) / 100;
export function computeRisk(capitalUsd: number, riskPct: number) {
  const riskUsd = Math.max(1, pct(capitalUsd, riskPct));
  return { riskUsd };
}
export function positionSize({ entry, stop, capitalUsd, riskPct }:
  { entry: number, stop: number, capitalUsd: number, riskPct: number }) {
  const { riskUsd } = computeRisk(capitalUsd, riskPct);
  const stopDistance = Math.max(0.0001, Math.abs(entry - stop));
  const qty = Math.max(1, Math.floor(riskUsd / stopDistance));
  return { qty, riskUsd, stopDistance };
}
