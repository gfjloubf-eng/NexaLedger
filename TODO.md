# TODO

## Task: NEXALEDGER — FORECAST V2.6 EXTREME CONTRAST PASS

- [ ] Implement extreme-contrast styling changes ONLY in `src/pages/CashFlowForecast.tsx`:
  - Replace primary/secondary text classes to match:
    - primary: `text-slate-50`, `font-semibold`
    - secondary: `text-slate-300` (no faded gray)
  - Upgrade executive numbers to:
    - `text-slate-50`, `font-extrabold`, `tracking-tight`
  - Increase card separation/visibility:
    - add `border-white/15`, stronger shadows/depth/layering
  - Upgrade insight cards dominance:
    - labels `text-xs` + `text-slate-300`
    - values `text-3xl` + `font-extrabold` + `text-slate-50`
  - Upgrade notification center:
    - brighter titles/messages, stronger pills, stronger left border & glow
  - Aggressively upgrade chart visibility:
    - brighter labels/legend, tooltip contrast, stronger grid visibility
  - Ensure all changes preserve existing logic/components.

- [ ] Show actual JSX snippets changed.
- [ ] Run `npm run build`.
- [ ] Return final build output.
