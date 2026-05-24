# AI Execution Behavior (NexaLedger)

**Purpose (CRITICAL):** Provide a permanent execution mentality for AI-driven changes.

**Who uses it:**
- AI (always)
- Human developers as a reference/guardrail

**Change frequency:** Low–Moderate (rare updates when the workflow evolves).

**What to include:**
- Pre-edit analysis
- Refinement-first decision making
- Risk-aware behavior (LOW/MEDIUM/HIGH)
- Patch-vs-rewrite rules
- Shared-token alignment behavior
- RTL safety behavior
- Stability verification
- Post-edit review behavior
- Leave-stable-systems untouched criteria
- SAFE vs DANGEROUS examples

**What NOT to include:**
- Implementation details of specific features
- New abstractions or tooling plans

---

## Execution steps
1) **Inspect**: read target + nearby context + relevant shared primitives.
2) **Classify risk**: LOW/MEDIUM/HIGH.
3) **Choose smallest correct change**: patch/alignment vs standardization.
4) **Validate stability**: type/build sanity.
5) **Verify UX**: calmness, RTL comfort, focus-visible behavior, empty/loading tone.

## Hard stop criteria
- Touching auth/session/routing/schema/global layout without explicit justification.
- Introducing new UI motion/shadow families that break cohesion.

## SAFE vs DANGEROUS
- SAFE: focus-visible parity, token-aligned class changes, small spacing corrections.
- DANGEROUS: loading/empty logic redesigns, RTL coordinate flipping without convention checks, heavy refactors of stable layers.

