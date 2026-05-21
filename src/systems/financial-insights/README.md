# Financial Insights (engine foundation)

This folder is intentionally **engine-only** at the current phase.

## Files
- `transactionCompat.ts` — small transaction shape to keep the engine isolated from Supabase/UI.
- `insightTypes.ts` — input/output types for the engine.
- `generateInsights.ts` — lightweight, calm insight generation.
- `insightEngine.ts` — stable entry point: `financialInsightEngine.generate(...)`.

## Output contract
The UI layer can call the engine and display only 1–3 calm insights.

