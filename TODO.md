# NexaLedger Cleanup/Work Queue

- [ ] Cleanup + row surface unification for Transactions (src/pages/Transactions.tsx only):
  - [ ] Unify Transactions list container graphite layering (remove conflicting bg-white/5 stacks; border-white/5)
  - [ ] Unify transaction row surface classes (single bg/border/hover strategy; no bg-white/5 stacking)
  - [ ] Apply subtle hover lift + transition (hover:-translate-y-[1px] transition-all duration-300 ease-out)
  - [ ] Unify text hierarchy inside rows (primary text-zinc-100, secondary text-zinc-300, metadata text-zinc-400; labels dark:text-zinc-200/90)
  - [ ] Unify delete button atmosphere to match row surface (same border/soft bg + hover:border-white/10)
  - [ ] Unify skeleton row surface to match graphite system
  - [ ] Ensure no duplicated JSX blocks / typography lines remain in Transactions
  - [ ] Run npm run build
  - [ ] Run lint

