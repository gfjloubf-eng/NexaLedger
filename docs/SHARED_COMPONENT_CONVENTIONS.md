# Shared Component Conventions

**Purpose:** Define how to use shared components so pages don’t drift.

**Who uses it:** AI + human devs.

**Change frequency:** Moderate (as conventions evolve), but keep stable.

## Rules of thumb
- Use `FinButton` for buttons whenever possible.
- Use `FinCard` for card/surface blocks.
- Use `motionTokens` families for hover lift/shadow behavior.

## Do not
- Recreate button behavior with one-off markup unless necessary.
- Introduce new hover/shadow/motion families.

## Focus-visible
- Always ensure focus-visible behavior exists for every interactive control.

