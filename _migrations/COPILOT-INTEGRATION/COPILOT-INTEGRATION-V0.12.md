# Copilot Integration V0.12
## Module
- `src/pages/Crew.tsx`
- `src/pages/Profile.tsx`
- `src/pages/RolesAdmin.tsx`
- `src/services/crew.ts`
- Migration `011_kt_v012_crew_profiles_permissions.sql`

## TODO
- [ ] Migrationen 001–011 testen
- [ ] Crew-Navigation in Host-App prüfen
- [ ] Profil-SELECT-RLS für Notfallkontakt vor Produktion festlegen
- [ ] Rollenmatrix mit Admin und Super Admin testen
- [ ] Crew-Suche mobil testen
- [ ] Avatar-Upload später an `kt-crew-files` anbinden

## Agent
Bewahre `KT_` Präfixe, bestehende Rollen und Host-App-Design. Keine Secrets im Client. Änderungen an Rollen oder Berechtigungen müssen serverseitig durch RLS abgesichert sein.
