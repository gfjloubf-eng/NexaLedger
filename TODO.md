# TODO — Mobile Native Stabilization Phase (Phase 1)

## Step 1 — Repo audit recap (done)
- Identified candidate hotspots:
  - `src/pages/Transactions.tsx` (keyboard + fixed CTA)
  - `src/layout/MainLayout.tsx` (mobile fixed elements + padding)
  - `src/components/ui/FinSearchOverlay.tsx` (overlay input + scroll height)
  - `src/index.css` / `src/App.css` (global overflow-x containment)

## Step 2 — Verify sidebar/mobile trigger code (pending)
- Search for mobile sidebar/drawer/open/close patterns.

## Step 3 — Add global overflow-x containment (pending)
- Ensure no horizontal overflow/drift on real mobile widths.

## Step 4 — Apply safe-area harmony for fixed elements (pending)
- Update `MainLayout.tsx` and `Transactions.tsx` floating/fixed UI to respect `env(safe-area-inset-*)`.

## Step 5 — Stabilize keyboard/input on Transactions (pending)
- Ensure fixed CTA does not overlap typing.
- Improve viewport behavior only if the code already supports it.

## Step 6 — Stabilize overlay scrolling/height (pending)
- Update `FinSearchOverlay.tsx` to use more stable viewport height and safe-area padding.

## Step 7 — Run validation
- `npm run build`
- lint verification
- manual mobile checks: 320/375/390/414, zero horizontal overflow, sidebar layering stability, keyboard stability.

## Step 8 — Commit stable refinements only
- Commit only after passing all validations.

