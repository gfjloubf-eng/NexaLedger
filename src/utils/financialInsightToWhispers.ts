import type { FinancialInsight } from '../systems/financial-insights/insightTypes';

export function financialInsightToWhispers(
  insights: FinancialInsight[]
): Array<{ id: string; message: string }> {
  return (insights ?? [])
    .slice(0, 3)
    .map((i) => ({
      id: i.id,
      message: i.message,
    }));
}

