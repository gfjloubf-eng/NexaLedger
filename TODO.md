# TODO — NexaLedger Auth Experience Sprints (Scope-Limited)

## Sprint 06 (Executive Clean Composition)
- [ ] Read current UI composition in `src/pages/Login.tsx` and `src/pages/AuthShell.tsx`.
- [ ] Remove visual duplication and reduce density:
  - [ ] Remove repeated/competing surface blocks and excessive decorative elements in AuthShell.
  - [ ] Consolidate to a single cohesive hierarchy (secure access + inputs + sign-in).
- [ ] Ensure typography hierarchy uses only tone separation:
  - [ ] Eliminate opacity-based hierarchy (`/90`, `/95`, `opacity-*`) in Auth/Login text.
- [ ] Minimize future auth placeholders dominance:
  - [ ] Reduce size, spacing, and border contrast.
- [ ] Purify motion to near-invisible:
  - [ ] Reduce y-translation and spring-like motion.
  - [ ] Keep only subtle opacity and breathing.
- [ ] Verify changes compile.

