# TODO - Targeted cleanup refactor (Transactions.tsx)

- [ ] 0) Inventory current remnants in `src/pages/Transactions.tsx` (toast state, delete UX, mobile CTA spacing, surface gradients, skeleton/empty-state tone, insight recompute boundaries).
- [ ] 1) Toast unification: remove any local toast remnants (if any) and ensure all calls use `pushToast({type, message, title?})` only.
- [ ] 2) Calm delete confirmation: add `FinModal` confirmation using emotionally safe wording and calm styling; delete only proceeds on confirm.
- [ ] 3) Mobile surface harmony: adjust floating CTA position/spacing to honor safe-area + keyboard offset and avoid overlaps.
- [ ] 4) Surface consistency cleanup: reduce decorative gradients/border drift; align row/card styling with `FinCard` philosophy while preserving calm spacing.
- [ ] 5) Loading + empty-state discipline: standardize `SkeletonRow` calmness; reduce CTA spam and ensure stable empty-state layout.
- [ ] 6) Final render discipline: ensure insights recompute only on meaningful transaction changes; avoid introducing dependencies on transient UI state.
- [ ] 7) Validation: run `npm run build` and `npm run lint -- --max-warnings=0` and verify stable behavior + no RTL regressions.

