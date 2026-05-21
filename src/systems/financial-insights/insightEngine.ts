import type { FinancialInsight, InsightsInput } from './insightTypes';
import { generateInsights } from './generateInsights';

export type InsightEngine = {
  generate: (input: InsightsInput) => FinancialInsight[];
};

// Isolated engine entry point.
// Removable + maintainable: the UI layer can call this without knowing internals.
export const financialInsightEngine: InsightEngine = {
  generate: ({ transactions, now }: InsightsInput) => {
    return generateInsights({ transactions, now });
  },
};

