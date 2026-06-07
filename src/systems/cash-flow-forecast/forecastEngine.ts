import type {
  CashFlowForecast,
  CashHealth,
  CashHealthInsight,
  CashFlowForecastHorizon,
  CollectionConfidence,
  ForecastHorizonDays,
} from './forecastTypes';
import type { CashFlowForecastInput } from './types';



const clamp = (n: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, n));
};

const sum = (values: number[]) => {
  let t = 0;
  for (const v of values) t += v;
  return t;
};

const daysForConfidence = (ratio: number): CollectionConfidence => {
  // ratio in [0..1]
  if (ratio >= 0.7) return 'high';
  if (ratio >= 0.4) return 'medium';
  return 'low';
};

const cashHealthFromShortage = (potentialCashShortage: number): CashHealth => {
  if (potentialCashShortage <= 0) return 'healthy';
  if (potentialCashShortage <= 0.15) return 'warning';
  return 'critical';
};

const computeHorizon = (input: CashFlowForecastInput, horizonDays: ForecastHorizonDays): CashFlowForecastHorizon => {

  // Heuristic: proportionally allocate invoice amounts into horizons based on dueAt date.
  // No unknown casts; rely on optional guards.

  const nowMs = input.nowMs;
  const horizons: { days: number; weight: number }[] = [
    { days: 7, weight: horizonDays === 7 ? 1 : horizonDays === 30 ? 0.55 : 0.35 },
    { days: 30, weight: horizonDays === 7 ? 0.45 : horizonDays === 30 ? 1 : 0.65 },
    { days: 90, weight: horizonDays === 7 ? 0.25 : horizonDays === 30 ? 0.4 : 1 },
  ];
  void horizons; // silence unused if heuristic changed.

  let expectedCollections = 0;
  let collectibleInvoicesCount = 0;


  for (const inv of input.invoices) {
    const amount = inv.amountDue;
    if (amount <= 0) continue;

    const dueInDays = (inv.dueAtMs - nowMs) / (1000 * 60 * 60 * 24);

    // outstanding now counts all unpaid invoices (already provided by input)
    void amount;


    // For expected collections, count invoices with due date within horizon and not paid.
    if (!inv.isPaid && dueInDays <= horizonDays) {
      const overdueFactor = dueInDays < 0 ? 0.75 : 1;
      const confidenceFactor = inv.daysPastDueFactor;
      const weight = overdueFactor * confidenceFactor;
      expectedCollections += amount * clamp(weight, 0.1, 1);
      collectibleInvoicesCount += 1;
    }
  }

  const totalOutstanding = input.outstandingNow;
  const confidenceRatio = totalOutstanding > 0 ? expectedCollections / totalOutstanding : 0;
  const collectionConfidence = daysForConfidence(clamp(confidenceRatio, 0, 1));

  return {
    horizonDays,
    expectedCollections,
    expectedOutstandingBalance: Math.max(0, input.outstandingNow - expectedCollections),
    collectionConfidence,
    collectibleInvoicesCount,
  };
};

const computeInsights = (horizons: CashFlowForecastHorizon[], outstandingNow: number): CashHealthInsight => {
  if (horizons.length === 0) {
    return {
      bestCollectionPeriodDays: 0,
      highestRiskPeriodDays: 0,
      expectedCashInflow: 0,
      potentialCashShortage: 0,
    };
  }

  let best = horizons[0];
  let worst = horizons[0];

  for (const h of horizons) {
    if (h.expectedCollections > best.expectedCollections) best = h;
    // risk: higher expected outstanding in that period => higher risk
    if (h.expectedOutstandingBalance > worst.expectedOutstandingBalance) worst = h;
  }

  // Potential shortage heuristic: if projected outstanding exceeds 15% of current outstanding.
  const projected = horizons[horizons.length - 1]?.expectedOutstandingBalance ?? 0;
  const potentialCashShortageRatio = outstandingNow > 0 ? (projected - outstandingNow) / outstandingNow : 0;
  const potentialCashShortage = Math.abs(Math.min(0, potentialCashShortageRatio));

  const expectedCashInflow = sum(horizons.map((h) => h.expectedCollections));

  return {
    bestCollectionPeriodDays: best.horizonDays,
    highestRiskPeriodDays: worst.horizonDays,
    expectedCashInflow,
    potentialCashShortage,
  };
};

export function buildCashFlowForecast(input: CashFlowForecastInput): CashFlowForecast {
  const outstandingNow = input.outstandingNow;

  const horizons: ForecastHorizonDays[] = [7, 30, 90];
  const horizonModels: CashFlowForecastHorizon[] = horizons.map((d) => computeHorizon(input, d));

  const insights = computeInsights(horizonModels, outstandingNow);

  // Convert potentialCashShortage into a ratio for cash health.
  const cashHealth = cashHealthFromShortage(insights.potentialCashShortage);

  const outstandingProjected = horizonModels[horizonModels.length - 1]?.expectedOutstandingBalance ?? 0;

  return {
    horizons: horizonModels,
    outstandingNow,
    outstandingProjected,
    cashHealth,
    insights,
  };
}

