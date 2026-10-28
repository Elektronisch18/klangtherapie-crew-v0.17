# Klangtherapie Crew V0.9 – Copilot Integration

## Ziel
Dashboard V0.9 ist die zentrale Crew-Startseite. Host-App-Design hat Priorität.

## Module
- `src/pages/Dashboard.tsx`
- `src/components/NextShiftCard.tsx`
- `src/services/dashboard.ts`
- `src/services/festival.ts`
- `src/services/notifications.ts`

## TODO
- [ ] Migrationen 001–008 in Reihenfolge prüfen
- [ ] Self-hosted Supabase `.env.local` konfigurieren
- [ ] Edge Function `kt-invite-user` deployen
- [ ] RLS mit Crew, Teamleitung, Admin und Super Admin testen
- [ ] Realtime für Nachrichten/Notifications prüfen
- [ ] Responsive Dashboard auf 390px, 768px, 1440px testen
- [ ] Kamera-QR-Scanner erst nach Berechtigungs-/Browser-Test aktivieren
- [ ] Web Push als separates Modul implementieren

## Agent-Prompt
Du arbeitest am Modul „Klangtherapie Crew“. Bewahre die vorhandenen `KT_` Tabellenpräfixe, das dunkle Festival-Glass-Design und die Rollen Super Admin, Admin, Teamleitung, Crew. Keine Service-Role-Secrets im React-Frontend. Änderungen an RLS immer gegen den tatsächlichen Benutzerkontext prüfen. Host-App-Design-Tokens haben Vorrang vor Modul-Fallbacks.

## Prüfungen
1. `npm install`
2. `npm run build`
3. Login/Demo Mode testen
4. Dashboard öffnen
5. Aufgaben, Chats, Festival, Check-in testen
6. Nächste Schicht mit 0/1/2 kommenden Schichten testen
7. Mobile Navigation testen


## V0.10 Festival Ops
- QR-Kamera nutzt Browser BarcodeDetector als Progressive Enhancement.
- Server-RPC entscheidet über Konflikte, Kapazität und Warteliste.
- Check-in ist nur für bestätigte Zuweisungen und im Zeitfenster -60 Min. bis Schichtende möglich.
- Migration 009 anwenden und RLS/RPCs mit allen Rollen testen.
