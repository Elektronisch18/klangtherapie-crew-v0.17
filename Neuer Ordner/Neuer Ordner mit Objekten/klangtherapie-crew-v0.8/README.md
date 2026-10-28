# Klangtherapie Crew App V0.8

## Neu
- Festival-Admin für Schichten, Artists und Locations
- visueller Stage-Timetable
- persönlicher Verfügbarkeitskalender
- Crew-/Schicht-Check-in
- QR-Check-in-Oberfläche
- Check-in Datenbank + RLS
- Realtime Notification Service als Grundlage für Schicht-Erinnerungen

## SQL
Migrationen `001` bis `007` in Reihenfolge ausführen.
Neu: `007_kt_v08_ops.sql`

## Hinweis QR
V0.8 enthält die Check-in-Logik und QR-Oberfläche. Ein Kamera-Scanner ist bewusst noch nicht als zusätzliche Browser-Abhängigkeit eingebaut. Ein Token im Format `KT-SHIFT:<uuid>` kann bereits verarbeitet werden.

## V0.9
- Kamera QR Scanner
- echte Push Notifications / Web Push
- Admin Timetable Drag & Drop
- Schichtkonflikt-Prüfung
- Kapazitäten / Warteliste
- Crew Dashboard mit „Meine nächste Schicht“
