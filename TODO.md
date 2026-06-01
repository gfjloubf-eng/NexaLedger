# TODO - Mobile Nav Drawer rebuild

- [ ] Read current MobileNavDrawer and MainLayout (done)
- [ ] Replace src/layout/MobileNavDrawer.tsx with fresh, React-controlled Framer Motion drawer UI (no DOM events, no extra listeners beyond ESC/outside click, RTL-first, route-change close via useLocation)
- [x] Update MainLayout to own drawer state and pass props to MobileNavDrawer (remove document event dispatch)

- [x] Ensure MobileNavTree is rendered inside drawer only

- [ ] Run `npm run build` and fix any TS/ESLint issues
- [ ] Confirm requirements: mobile-only, open via ☰, close on outside/ESC/route change, RTL opens from right
- [ ] Final report + confirmation string

