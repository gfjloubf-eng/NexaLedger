# Performance Monitoring Philosophy

**Purpose:** Ensure operational responsiveness without premature optimization.

**Who uses it:** AI + human devs.

**Change frequency:** Optional / low.

## Principles
- Don’t optimize until there is a known bottleneck.
- Preserve responsiveness for lists and expensive computations.

## What belongs here
- Guidance on expensive render path behavior
- When to use memoization (and when not)

## What not to include
- Full benchmarking methodology
- Dependency/tooling changes

