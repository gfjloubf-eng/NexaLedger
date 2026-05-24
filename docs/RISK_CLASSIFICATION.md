# Risk Classification (NexaLedger)

**Purpose:** Make risk decisions repeatable and stop changes early when needed.

**Who uses it:** AI + human devs.

**Change frequency:** Low.

## Risk levels
### LOW RISK
- ClassName-only refinements that stay within existing visual families
  - radius family (surface vs control)
  - shadow softness family
  - hover lift magnitude family
  - transition timing family
- Adding `focus-visible` parity to a hover-revealed control
- Spacing/typography micro-polish that preserves hierarchy tier

### MEDIUM RISK
- RTL placement changes for fixed/floating actions
- Changing motion feel magnitude (lift/shadow) even if “similar”
- Empty-state copy/structure changes that could affect state perception

### HIGH RISK
- Auth/session persistence, routing, Supabase schema/data model
- Electron bridge changes
- Insight engine behavior changes
- Global/shared layout foundation changes
- Loading/empty-state logic rewrites without confirming provider/state model

## Stop rules
- **HIGH risk:** stop and request approval/justification.
- **MEDIUM risk:** only proceed if change is isolated and preserves conventions.

## “Refinement-first” constraint
If you cannot keep impact minimal, treat as HIGH risk by default.

