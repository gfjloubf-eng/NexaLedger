# NexaLedger Refinement Roadmap (Financial UX Governance)

## Status: IMPLEMENTING (Phase 1-5 className-only)


### 1) Transactions page readability + discoverability
- [x] Strengthen secondary metadata tone (Dashboard secondary labels)
- [ ] Add subtle newest-transaction emphasis (micro-label / stronger row divider) without bright badges or animation
- [ ] Ensure delete action has mobile-visible operational confidence (no hover-only critical action)
- [ ] Improve row scan rhythm (consistent padding + subtle separators)

### 2) Dashboard page hierarchy reinforcement
- [ ] Normalize secondary label typography (stop disappearing into surfaces)
- [ ] Slightly strengthen borders/background discipline for calm premium feel

### 3) StatsCard palette unification
- [ ] Convert gray-based tokens to fintech governed slate palette with dark mode compatibility
- [ ] Keep component behavior unchanged

### 4) Conditional chart spot-check
- [ ] If chart legends/secondary labels remain weak, refine chart readability tokens

### 5) QA validation (mandatory)
- [ ] `npm run lint -- --max-warnings=0`
- [ ] `npm run dev`
- [ ] Manual validation checklist: dashboard/side nav clickable, transactions visible after insertion, mobile readability improved, no overlay/fullscreen/z-index/provider/router regressions

