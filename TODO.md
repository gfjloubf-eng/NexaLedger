- [ ] Rebuild `src/pages/BusinessPulse.tsx` from scratch per spec (no reuse of old derived logic / safeDateFromTx)
- [ ] Ensure uses only `const { transactions, loading } = useTransactions();`
- [ ] Status card states computed from transaction count + income vs expense + recent activity
- [ ] Summary cards computed directly from visible transactions (no today-only calculations)
- [ ] Observations deterministic from last 7 days trend and totals
- [ ] Activity trend: last 7 days minimal representation (no charts)
- [ ] Empty state only when `transactions.length === 0`
- [ ] Run `npm run build` and confirm pass

