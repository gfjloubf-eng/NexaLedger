# TODO - RBAC LOGIN FREEZE FIX

- [x] Inspect ProtectedRoute.tsx and related RBAC helpers for hanging async logic.
- [x] Patch ProtectedRoute.tsx to wrap role verification in try/catch.
- [x] Ensure ProtectedRoute never stays with allowed=null: always resolves to allowed=true/false.
- [x] Validate redirect behavior for invalid role data (redirect to /access-denied).
- [x] Run `npm run build` to confirm compilation.




