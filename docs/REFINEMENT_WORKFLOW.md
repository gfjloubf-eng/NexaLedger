# Refinement Workflow (NexaLedger)

**Purpose (CRITICAL):** A minimal, operational workflow for safe UI/code evolution.

**Who uses it:** AI and human devs.

**Change frequency:** Low.

## Workflow
1. **Inspect** existing code and shared primitives.
2. **Find issues** and classify by risk.
3. **Choose minimal edits** (patch/align/standardize small scope).
4. **Preserve stable behavior** (auth/routing/session/global layout).
5. **Validate**: type + build sanity.
6. **Verify UX**: calmness, RTL, focus-visible, empty/loading tone.
7. **Record** refinement log entry.

## Risk-based stop conditions
- HIGH risk: stop and seek approval.
- MEDIUM risk: proceed only if isolated and UX conventions remain intact.

