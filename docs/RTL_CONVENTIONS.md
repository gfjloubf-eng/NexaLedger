# RTL Conventions (NexaLedger)

**Purpose:** Prevent accidental RTL regressions.

**Who uses it:** AI + human devs.

**Change frequency:** Low.

## Rules
- Any page with `dir="rtl"` must keep alignment and ordering natural.
- Fixed/floating primary actions must use an RTL-consistent physical side.
- Avoid assuming LTR coordinate logic (e.g., `left-*` for actions) unless the established convention says so.

## Interaction safety
- Hover-revealed actions must also be discoverable via keyboard focus-visible.

## What not to do
- Do not “mirror” positions randomly across pages.

