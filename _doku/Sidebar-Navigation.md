# Sidebar und Navigation

Stand: 28. Oktober 2026. Quelle: [Layout.tsx](../src/components/Layout.tsx) und [App.tsx](../src/App.tsx).

## Navigation nach Benutzerrollen

### 1. Rolle = Crew (Sichtbar nur für Crew-Mitglieder – Nur Lesen, NICHT bearbeiten oder Löschen)

Crew-Mitglieder sehen **ausschließlich** die 8 Hauptmenüpunkte. Das `ADMIN`-Menü ist vollständig ausgeblendet:

| Sichtbarer Eintrag | Route-ID | Tatsächliche Ansicht | Berechtigung & Verhalten |
| --- | --- | --- | --- |
| Home | `dashboard` | `Dashboard` | Leseansicht: Schichten, Live-Status, Neuigkeiten. |
| Chat | `chats` | `Messenger` | Teilnahme an Crew-Chats und DMs. |
| Aufgaben | `tasks` | `Tasks` | Aufgaben einsehen & Details betrachten (`+ Aufgabe erstellen` ausgeblendet). |
| Kalender | `calendar` | `Calendar` | Festival- und Crew-Termine im Monatsraster einsehen. |
| Festival Hub | `festival` | `Festival` | 6 Tabs (Schichten, Timetable, Artists, Gelände, Kontakte, Notfall) im **Nur-Lesen-Modus**: Popup öffnet rein mit Details (`Eye`-Icon); `Pencil`-Bearbeitungs-Icons, Löschen (`Trash2`), Speichern (`Save`) sowie `+ Schicht hinzufügen` sind ausgeblendet. |
| Crew | `crew` | `Crew` | Crew- und Team-Liste zur Kontaktaufnahme (`+ Crew Mitglied` ausgeblendet). |
| Control Center | `controlcenter` | `ControlCenter` | Live-Lagezentrum (Incident-Status-Dropdowns schreibgeschützt). |
| FAQ & Hilfe | `faq` | `FAQ` | Festival-Wissensdatenbank mit Akkordeon & Suche. |

### 2. Rolle = Admin / Super Admin

Admins sehen die 8 Hauptmenüpunkte **plus** den geschützten `ADMIN`-Abschnitt mit vollen Bearbeitungs- und Löschrechten:

| Sichtbarer Eintrag | Route-ID | Tatsächliche Ansicht | Hinweis |
| --- | --- | --- | --- |
| Festival Hub | `festival-admin` | `FestivalAdmin` | Konfiguration von Bühnen, Slots, Zeitplänen und Festival-Stammdaten. |
| Aufgaben | `tasks-admin` | `TasksAdmin` | Gesamte Aufgaben-Verwaltung mit Zuweisung an Crew-Mitglieder und Teams, Status- und Prioritäts-Management. |
| Benutzer & Teams | `admin` | `Admin` | Benutzer-Verwaltung, Einladungen versenden, Rollen- & Team-Zuweisung. |
| Rollen & Rechte | `roles-admin` | `RolesAdmin` | Matrix zur rollenbasierten Rechteverwaltung (`KT_permissions`). |
| Dateien | `files` | `Documents` | Zentrales Datei- & Dokumentenarchiv für Dokumente, Pläne und Checklisten. |

### 3. Rollenumschaltung für Test & Vorschau

Im Fußbereich der Sidebar (über das Benutzermenü-Popover) sowie in den [UserSettings.tsx](../src/pages/UserSettings.tsx) kann die aktive Rolle für Test- und Abnahmezwecke direkt per Klick zwischen **Crew (Nur Lesen)** und **Admin** umgeschaltet werden.

## Kopf- und Fußbereich & Mobil-Navigation

- **Benutzerprofil & Settings**: Befindet sich im Fuß der Sidebar (`Layout.tsx`) als Badge mit Avatar, Anzeigename und `@username`. Klick öffnet ein Popover-Menü mit `Profil` (`profile`), `Settings` (`settings` &rarr; `UserSettings` mit Hell/Dark Mode & Passwort ändern), `FAQ & Hilfe` (`faq`) und `Abmelden` (`signOut`).
- **Benutzer-Avatar im Header**: Befindet sich oben rechts (`Layout.tsx`) und navigiert direkt zu `Profile` (`profile`).
- **Suche**: Header-Suche navigiert als Einstieg zu `Documents` (`files`).
- **Mobile Leiste**: Home (`dashboard`), Chat (`chats`), Aufgaben (`tasks`), Festival (`festival`) und Mehr (`more`).
- **Mehr-Bereich**: `more` öffnet ein Schnellzugriffs-Raster in `Placeholder.tsx` mit Verlinkungen zu allen Festival- und Crew-Modulen (u.a. `shiftplan`, `checkin`, `controlcenter`, `profile`, `settings`, `calendar`, `crew`, `files`, `faq`, `admin`).

## Direkt aufrufbare Routen in `App.tsx`

- `shiftplan` → `ShiftPlan` (inkl. `CreateShiftModal` für neue Schichten)
- `checkin` → `CheckIn`
- `roles-admin` → `RolesAdmin`
- `festival-admin` → `FestivalAdmin`
- `tasks-admin` → `TasksAdmin` (Gesamte Aufgabenliste mit Crew- & Team-Zuweisung)
- `profile` → `Profile`
- `settings` → `UserSettings` (Hell/Dark Mode, Passwort ändern)
- `faq` → `FAQ` (Akkordeon-Wissensdatenbank)
