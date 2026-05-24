# Architecture Protection Policy (NexaLedger)

**Purpose (CRITICAL):** Define what must not be touched without strong justification.

**Who uses it:** AI and human devs.

**Change frequency:** Low.

## Protected areas (do not change lightly)
- Auth flow and session persistence
- Routing system
- Supabase schema + migrations (data model)
- Electron bridge
- Shared layout foundations (global UI architecture)

## Allowed exceptions
- Only when explicitly required to fix an unsafe bug or production correctness issue.
- Must be risk-classified as HIGH and approved.

## What not to do
- Do not introduce random abstractions in protected areas.
- Do not redesign flows as “cleanup”.

