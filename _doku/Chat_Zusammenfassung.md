# Komprimierte Chat-Zusammenfassung

Diese Datei hält Entscheidungen und Arbeitsstand fest, keine wörtlichen Chatprotokolle. Keine Zugangsdaten oder privaten Inhalte eintragen. Neue projektbezogene Gespräche unten kurz ergänzen und ältere Einträge bei Bedarf thematisch verdichten.

## 28. Oktober 2026 – Migration und Projektprüfung

- Nutzerwunsch: Migrationen `001` bis `016` für V0.17 prüfen und bündeln. Ergebnis: [v17.sql](../_migrations/SUPABASE/v17.sql) erstellt; fehlende Einladungsspalten und doppelte Aufgaben-Policy in den historischen Dateien korrigiert. Nur statisch geprüft.
- Nutzerwunsch: ganzes Projekt lesen und Migration planen. Ergebnis: [Migrationsplan](../_migrations/MIGRATIONSPLAN-V0.17.md) mit P0-/P1-Problemen und getrennten Wegen für Neuinstallation und bestehende DB.
- Nutzer stellte eine lokale Login-Umgebung bereit. Feststellung: HTTPS antwortete mit Traefik-Standardzertifikat und `/rest/v1/` mit 404; PostgreSQL-Port 5432 war offen, bot aber kein TLS. Keine Zugangsdaten gesendet, keine DB geändert. Gültige verschlüsselte Verbindung bleibt offen.
- Nutzerwunsch: Demo-Daten übertragen, danach ausdrücklich SQL-Migration schreiben. Ergebnis: [017_kt_v017_demo_data.sql](../_migrations/SUPABASE/017_kt_v017_demo_data.sql) für sieben Aufgaben und fünf Chat-Vorschauen vorbereitet. Voraussetzungen: vorhandener Demo-Akteur, Profile `max`, `lena`, `sarah`, `lisa`, `kim`, Jahresannahme 2026. Nicht ausgeführt.
- Nutzerregel: [_migrations/](../_migrations/) ist Hauptordner; `COPILOT-INTEGRATION` und `SUPABASE` sind Unterordner. Dateien und Verweise wurden entsprechend geordnet.

## 28. Oktober 2026 – Dokumentationsregel

- Nutzer verlangt eine dauerhaft nutzbare Übergabe unter [_doku/](./): Projektstand, Aufgaben, Sidebar, Technik und komprimierte Chats. [AGENTS.md](../AGENTS.md) wurde um die Aktualisierungspflicht und den Schutz von Zugangsdaten ergänzt; die fünf Dokumente wurden angelegt. Ein doppelter `useState`-Import in [Tasks.tsx](../src/pages/Tasks.tsx) wurde als ungeprüfter Build-Blocker notiert.
- Nächster Schritt: gültigen verschlüsselten DB-Zugang erhalten, Istzustand prüfen und danach SQL-/App-Blocker aus [ToDos.md](./ToDos.md) bearbeiten.

## 28. Oktober 2026 – npm-Installation

- Nutzerwunsch: „install mpm“, als npm-Installation für das Projekt verstanden. Node.js 24.22.1 und npm 11.19.1 waren bereits vorhanden. `npm install --no-audit --no-fund` installierte 82 Pakete und erzeugte [package-lock.json](../package-lock.json); `npm ls --depth=0` war erfolgreich.
- Prüf-Build `npm run build` stoppt mit TS1005 in [Chats.tsx](../src/pages/Chats.tsx) Zeile 2 und [Tasks.tsx](../src/pages/Tasks.tsx) Zeile 5. npm meldete zudem ein noch nicht freigegebenes `esbuild`-Postinstall-Skript. Nächster Schritt: Syntaxfehler korrigieren und Build erneut prüfen.

## 28. Oktober 2026 – Dev-Server und Build-Reparatur

- Nutzerwunsch: „npm rrun dev“, als `npm run dev` verstanden.
- Problem: Syntaxfehler in [Tasks.tsx](../src/pages/Tasks.tsx) (doppelter Import und fehlende schließende Klammer) und [Chats.tsx](../src/pages/Chats.tsx) verhinderten den Start bzw. Dependency-Scan. TypeScript meldete zudem fehlende Vite-Client-Typen für `import.meta.env` und einen Typ-Mismatch in [Calendar.tsx](../src/pages/Calendar.tsx).
- Durchgeführte Maßnahmen: Syntaxfehler in `Tasks.tsx` und `Chats.tsx` behoben, [vite-env.d.ts](../src/vite-env.d.ts) angelegt, Array-Typisierung in `Calendar.tsx` korrigiert. `npm run build` erfolgreich (Exit-Code 0).
- Dev-Server läuft im Hintergrund auf `http://localhost:5173/`.

## 28. Oktober 2026 – Prüfung und Wiederherstellung aller Seiten

- Nutzerwunsch: „@[src/pages] /plan Prüfe alle seiten und stell sie wieder her“.
- Analyse: 18 Seitenkomponenten existieren in `src/pages/`. `Calendar`, `Crew` und `Documents` wurden in `App.tsx` fälschlicherweise durch Platzhalter blockiert; `ControlCenter`, `Profile` und `RolesAdmin` waren nicht geroutet. In `Tasks.tsx` fehlte der Trigger zum Öffnen des `TaskDetailDrawer`, und `Layout.tsx` besaß keine Verlinkung für Einstellungen/Avatar.
- Durchgeführte Maßnahmen:
  - [App.tsx](../src/App.tsx) aktualisiert: routet jetzt vollständig alle 18 Ansichten (`calendar` → `Calendar`, `crew` → `Crew`, `files` → `Documents`, `controlcenter` → `ControlCenter`, `profile` → `Profile`, `roles-admin` → `RolesAdmin`, `festival-admin` → `FestivalAdmin`, `shiftplan` → `ShiftPlan`, `festival` → `Festival`, `checkin` → `CheckIn`).
  - [Tasks.tsx](../src/pages/Tasks.tsx): Klick- und Detail-Trigger auf Aufgabenkarten aktiviert, um den [TaskDetailDrawer](../src/components/TaskDetailDrawer.tsx) mit Checklist, Kommentaren und Anhängen zu öffnen.
  - [Admin.tsx](../src/pages/Admin.tsx): Sub-Tabs für Benutzer & Teams, Rollen & Rechte (`RolesAdmin`) sowie Festival-Verwaltung (`FestivalAdmin`) integriert.
  - [Layout.tsx](../src/components/Layout.tsx): Sidebar um `festival` und `controlcenter` ergänzt; Einstellungen und Avatar mit `profile` verdrahtet; Mobile Bar um Festival und den Mehr-Hub erweitert.
  - [Placeholder.tsx](../src/pages/Placeholder.tsx): Zu einem Modul-Hub mit Schnellzugriffs-Kacheln für alle Festival- und Crew-Seiten ausgebaut.
- Verifikation: `npx tsc -b` und `npm run build` schließen mit Exit-Code 0 ab. Dev-Server läuft fehlerfrei.

## 28. Oktober 2026 – Crew Mitglied Button, Sidebar-Profil & Messenger-Erweiterungen

- Nutzerwunsch:
  1. Crew & Teams: Button „(+) Crew Mitglied“ zum Anlegen / Einladen.
  2. Sidebar: Einstellungen ersetzen durch Avatar + UserName mit Menü (Profil, Settings, Abmelden).
  3. Messenger: Datei senden, Foto senden, Chat-Einstellungen.
- Durchgeführte Maßnahmen:
  - [Crew.tsx](../src/pages/Crew.tsx): Button `(+) Crew Mitglied` und vollständiges Modal (Name, Username, Telefon, Team, Rolle, E-Mail) integriert. Funktioniert im Demo-Modus mit sofortigem State-Update und im Supabase-Modus mit Einladungsversand.
  - [Layout.tsx](../src/components/Layout.tsx): Sidebar-Footer durch interaktive User-Komponente (`Avatar + Name + @username`) ersetzt. Öffnet bei Klick ein Popover-Menü mit `Profil`, `Settings` und `Abmelden`.
  - [Messenger.tsx](../src/pages/Messenger.tsx) & [messenger.ts](../src/services/messenger.ts):
    - Foto senden (Kamera-/Bild-Picker, Inline-Bildvorschau im Chat-Stream).
    - Datei senden (File-Picker, Dokumenten-Chip mit Dateigröße und Download).
    - Chat-Einstellungen (Einstellungs-Button im Header mit Modal für Gruppen-Details, Teilnehmer-Liste mit Rollen, Mute-Toggle und geteilte Dateien).
  - [styles.css](../src/styles.css): Styles für User-Section, Menü-Popover, Chat-Bilder und Einstellungs-Buttons ergänzt.
- Verifikation: `npx tsc -b` und `npm run build` schließen fehlerfrei (Exit-Code 0) ab. Vite HMR aktualisierte alle betroffenen Komponenten.

## 28. Oktober 2026 – DB-Verknüpfung und Feld-Harmonisierung

- Nutzerwunsch: `/plan die verknüpfung zur DB und den feldern`.
- Analyse: Umfangreicher Schema-Abgleich deckte Feldnamen-Diskrepanzen auf (`title` vs. `name`, `created_at` vs. `updated_at`, `checked_in_at` vs. `created_at`, `author_id` vs. `user_id`, `needed` vs. `capacity`), ungültige Prioritäts-Werte in Aufgaben (`Normal`/`Mittel`/`Hoch` statt `'low'|'normal'|'medium'|'high'`), fehlende TypeScript-Datenbankdefinitionen und verhinderte PostgREST-Joins aufgrund von Fremdschlüsseln auf `auth.users` anstelle von `public.KT_profiles`.
- Durchgeführte Maßnahmen:
  - Plan-Artefakt [db_schema_and_fields_plan.md](../../../../../../../Users/tobiasbauer/.gemini/antigravity/brain/a9c51bc8-fa3c-4516-af97-924ef358c9e8/db_schema_and_fields_plan.md) erstellt und vom Nutzer freigegeben.
  - [database.ts](../src/types/database.ts) und [index.ts](../src/types/index.ts) mit Typdefinitionen aller 21 `KT_*`-Tabellen, Enums und RPCs angelegt.
  - [supabase.ts](../src/lib/supabase.ts) auf `createClient<Database>` typisiert; `tsconfig.app.json` um `allowImportingTsExtensions` ergänzt.
  - [018_kt_v017_schema_alignment.sql](../_migrations/SUPABASE/018_kt_v017_schema_alignment.sql) erstellt für PostgREST Foreign Keys auf `public.KT_profiles` und `KT_conversations.updated_at`.
  - Alle Services in `src/services/` (`messenger.ts`, `controlCenter.ts`, `taskDetail.ts`, `tasks.ts`, `documents.ts`, `festival.ts`, `calendar.ts`, `crew.ts`, `admin.ts`, `dashboard.ts`, `notifications.ts`, `chat.ts`, `storage.ts`) auf saubere Feldnamen, Typen und Fehlerbehandlung (`throw error`) harmonisiert.
  - UI-Komponenten ([Messenger.tsx](../src/pages/Messenger.tsx), [ControlCenter.tsx](../src/pages/ControlCenter.tsx), [Tasks.tsx](../src/pages/Tasks.tsx), [Profile.tsx](../src/pages/Profile.tsx), [AvailabilityCalendar.tsx](../src/components/AvailabilityCalendar.tsx), [ShiftOpsCard.tsx](../src/components/ShiftOpsCard.tsx)) an Feldnamen und standardisierte Enums angepasst.
- Verifikation: `npx tsc -b` und `npm run build` schließen fehlerfrei (Exit-Code 0) ab. Dokumentation in [_doku/](./) aktualisiert.

## 28. Oktober 2026 – Messenger Chatnachricht-Eingabefeld Anpassung

- Nutzerwunsch: „Chatnachricht feld: Anpassen“ mit Screenshot des verzerrten Chat-Eingabebereichs.
- Analyse: In [src/styles.css](../src/styles.css) war `.messageComposer` auf `grid-template-columns: auto 1fr auto auto` (4 Spalten) ausgelegt. Durch das Hinzufügen von Foto- und Datei-Button waren 5 Kindelemente vorhanden, wodurch der Datei-Button fälschlicherweise `1fr` beanspruchte, das Textfeld rechts auf Minimalbreite schrumpfte und der lila Senden-Button in eine neue Zeile nach ganz unten links umbrach. Zudem fehlte dem Emoji-Button eine Funktion.
- Durchgeführte Maßnahmen:
  - [src/styles.css](../src/styles.css): `.messageComposer` auf ein robustes Flexbox-Layout (`display: flex; align-items: flex-end; gap: 8px;`) umgestellt. Textarea expandiert nun über `flex: 1` vollflächig und passt sich dynamisch an. Styling für Fokus, Hover-Zustände, Disabled-State und Popover-Grid für Emojis ergänzt; responsive Darstellung unter 720px angepasst.
  - [src/pages/Messenger.tsx](../src/pages/Messenger.tsx): Dynamisches Auto-Resize für mehrzeilige Eingaben per `textareaRef` (`scrollHeight` begrenzt auf 120px) integriert. Funktionierendes Emoji-Picker-Popover mit Schnellzugriff auf Standard-Emojis und Click-Outside-Schließen hinzugefügt. Senden-Button deaktiviert bei leerer Texteingabe.
- Verifikation: `npm run build` (`tsc -b && vite build`) erfolgreich ohne Fehler durchgelaufen.

## 28. Oktober 2026 – Chatnachrichten Bereinigung & Admin Sidebar-Menü

- Nutzerwunsch:
  1. `Löschen -->. lucide lucide-image / Chatnachrichten` (Foto-Button aus dem Chat-Composer entfernen).
  2. `Rolle Teamleitung --> class="secondary" / Chatnachrichten einstellungen` (Teamleitungs-Badge im Chat-Modal mit `class="secondary"` formatieren).
  3. `Sidebar Navi: menü in die Sidebaraufnehmen: "ADMIN - Festival verwalten, - Benutzer & Teams, - Rollen & Rechte, - Dateien (Rolle = Admin)"`.
- Durchgeführte Maßnahmen:
  - [src/pages/Messenger.tsx](../src/pages/Messenger.tsx): Foto-Button (`<ImageIcon />`) aus dem Chat-Composer entfernt (Dateianhang über Büroklammer bleibt aktiv und unterstützt alle Dateitypen). Im Einstellungs-Modal erhält die Rolle „Teamleitung“ nun `className="secondary"`.
  - [src/styles.css](../src/styles.css): `.secondary` und `span.secondary` deklariert; Sidebar-Navigation mit `.sidebarNav` für vertikales Scrollen und `.adminNavSection` / `.navSectionHeader` ausgestattet.
  - [src/components/Layout.tsx](../src/components/Layout.tsx): Hauptnavigation und ADMIN-Navigation getrennt. Prüft die Rolle des angemeldeten Benutzers (`Admin` / `Super Admin` bzw. `demo`). Ist der Benutzer Admin, wird die neue Sektion `ADMIN` mit den 4 Einträgen *Festival verwalten* (`festival-admin`), *Benutzer & Teams* (`admin`), *Rollen & Rechte* (`roles-admin`) und *Dateien* (`files`) angezeigt.
- Verifikation: `npm run build` (`tsc -b && vite build`) fehlerfrei abgeschlossen (Exit-Code 0). Dokumentation in [_doku/](./) aktualisiert.

## 28. Oktober 2026 – Control Center, UserSettings & Schichten hinzufügen

- Nutzerwunsch:
  1. `Sidebar Navi: Leitstand in "Control Center" ändern`.
  2. `UserSettings eine neue seite erstellen (Hell/Dark Mode, Passwort ändern)`.
  3. `Schichten: Schichten + Hinzufügen`.
- Durchgeführte Maßnahmen:
  - [src/components/Layout.tsx](../src/components/Layout.tsx): Label für `controlcenter` von „Leitstand“ in „Control Center“ geändert. Menü-Eintrag „Settings“ im User-Popover ruft nun `setPage("settings")` auf.
  - [src/pages/UserSettings.tsx](../src/pages/UserSettings.tsx) & [src/styles.css](../src/styles.css): Neue Einstellungsseite mit Theme-Umschaltung zwischen Dunkel- und Hellmodus (mit sofortiger DOM-Aktivierung `body.light-theme` und `localStorage`-Persistierung) sowie Formular zum Passwort-Ändern (Validierung min. 6 Zeichen, Bestätigung, `supabase.auth.updateUser` bzw. Demo-Mock).
  - [src/App.tsx](../src/App.tsx): Route `settings` &rarr; `<UserSettings />` hinzugefügt.
  - [src/main.tsx](../src/main.tsx): Initialisiert das gespeicherte Theme direkt beim Laden.
  - [src/components/CreateShiftModal.tsx](../src/components/CreateShiftModal.tsx): Modales Dialogformular zur Erstellung neuer Schichten (Titel, Location-Dropdown aus `listLocations()`, Start-/End-Datetime, Crew-Bedarf, Beschreibung).
  - [src/pages/ShiftPlan.tsx](../src/pages/ShiftPlan.tsx) & [src/pages/Festival.tsx](../src/pages/Festival.tsx): Button `(+) Schicht hinzufügen` integriert, der das Modal öffnet und die Liste nach dem Anlegen sofort aktualisiert.
- Verifikation: `npm run build` (`tsc -b && vite build`) erfolgreich ohne Fehler durchgelaufen. Dokumentation in [_doku/](./) aktualisiert.

## 28. Oktober 2026 – Neue Seite FAQ mit Akkordeon

- Nutzerwunsch: „Neue Seite mit FAQ und akordion“.
- Durchgeführte Maßnahmen:
  - [src/components/Accordion.tsx](../src/components/Accordion.tsx): Wiederverwendbare, barrierefreie Akkordeon-Komponente mit sanfter CSS-Animation, Chevron-Drehung, Kategoriemarkierungen, optionalem Multi-Open-Modus sowie Schnellaktionen („Alle aufklappen“ / „Alle zuklappen“) erstellt.
  - [src/pages/FAQ.tsx](../src/pages/FAQ.tsx): Umfangreiche FAQ-Seite mit 17 praxisnahen Festival- und Crew-Fragen in 5 Kategorien angelegt:
    - *Schichten & Einsatz* (Schichtübernahme, Krankheit/Verhinderung, Check-in, Schichttausch, Pausen).
    - *Festival & Gelände* (Crew-Bändchen & Ausweis, Freizeit auf dem Gelände, Timetable & Geländepläne).
    - *Verpflegung & Camping* (Catering-Zeiten, vegan/allergiefrei, Trinkwasser, Crew-Camping).
    - *Funk & Kommunikation* (Funkkanäle 1–6, Vorfälle/Probleme melden).
    - *Sicherheit & Notfall* (Sanitätsdienst & Notruf 112, Awareness-Team, Evakuierung/Sammelplatz).
    - Enthält Live-Suchleiste (Echtzeitfilterung), Kategorie-Pills und Hilfe-Footer mit Quick-Links zum Crew-Chat und Notfallkontakten.
  - [src/App.tsx](../src/App.tsx): Route `faq` &rarr; `<FAQ navigate={setPage} />` registriert.
  - [src/components/Layout.tsx](../src/components/Layout.tsx): „FAQ & Hilfe“ mit `HelpCircle`-Icon in die Hauptnavigation der Sidebar sowie in das Popover-Benutzermenü aufgenommen.
  - [src/pages/Placeholder.tsx](../src/pages/Placeholder.tsx): „FAQ & Hilfe“ in die Modul-Kacheln der Mehr-Ansicht integriert.
  - [src/styles.css](../src/styles.css): Styles für Suchleiste, Kategorie-Pills, Akkordeon-Header, Icon-Bubbles, animierte Chevrons, Fließtext, Badges und Light-Theme-Unterstützung implementiert.
- Verifikation: `npx tsc -b` und `npm run build` fehlerfrei abgeschlossen (Exit-Code 0). Dokumentation in [_doku/](./) aktualisiert.

## 28. Oktober 2026 – Festival Hub Umbenennung & Detail/Bearbeiten-Popups mit Icons

- Nutzerwunsch:
  1. `Festival in "Festival Hub" ändern`.
  2. `Schichten, Artists, Location: erstelle einen Popup mit "Details, Bearbeiten - ICONs" seite --> Mobil Optimiert`.
- Durchgeführte Maßnahmen:
  - [src/components/Layout.tsx](../src/components/Layout.tsx): Sidebar- und Bottom-Bar-Eintrag von „Festival“ in „Festival Hub“ umbenannt.
  - [src/components/FestivalItemDetailModal.tsx](../src/components/FestivalItemDetailModal.tsx): Modale Popup-Komponente für Schichten, Artists und Locations implementiert:
    - Oben: Icon-Tabs zum Umschalten zwischen **Details** (`<Eye />`) und **Bearbeiten** (`<Pencil />`) sowie Schließen (`<X />`).
    - Modus Details: Strukturierte Anzeige aller relevanten Attribute (Location, Zeiten, Besetzung, Genre, Rider, Beschreibung) mit dedizierten Icons.
    - Modus Bearbeiten: Vollständiges Formular zum Ändern der Daten mit Speichern (`<Save />`) und optionalem Löschen (`<Trash2 />`).
    - Mobil Optimiert: Responsive Glass-Container mit voller Breite, Touch-Zielen ≥ 40px, automatischem Scrollen und Bottom-Sheet-Verhalten auf kleinen Bildschirmen.
  - [src/pages/Festival.tsx](../src/pages/Festival.tsx): Karten für Schichten, Artists und Locations mit Icon-Aktionsleiste (`Eye`- und `Pencil`-Buttons) ausgestattet und mit dem Modal verdrahtet.
  - [src/pages/FestivalAdmin.tsx](../src/pages/FestivalAdmin.tsx): Ebenfalls mit `FestivalItemDetailModal` und Icon-Aktionen ausgestattet.
  - [src/services/festival.ts](../src/services/festival.ts): Um `updateArtist`, `deleteArtist`, `updateLocation`, `deleteLocation` erweitert.
  - [src/styles.css](../src/styles.css): Styles für `.cardActionGroup`, `.iconActionBtn`, `.festivalDetailModal` und responsive Breakpoints für Mobilgeräte ergänzt.
- Verifikation: `npm run build` (`tsc -b && vite build`) erfolgreich ohne Fehler durchgelaufen. Dokumentation in [_doku/](./) aktualisiert.

## 28. Oktober 2026 – Kalenderhöhe bis unten ausnutzen

- Nutzerwunsch: „Kalender höhe bis unten ausnutzen“.
- Analyse: Der Kalender ([Calendar.tsx](../src/pages/Calendar.tsx)) besaß zuvor statische Minimalhöhen (`min-height: 115px`) pro Tageszelle. Auf größeren Bildschirmen und Desktops entstand darunter ein großer ungenutzter Freiraum bis zum unteren Fensterrand.
- Durchgeführte Maßnahmen:
  - [src/styles.css](../src/styles.css):
    - `.shell > main`: Auf `display: flex; flex-direction: column; min-height: calc(100vh - 32px); min-width: 0;` erweitert.
    - `.calendarPage`: Auf `display: flex; flex-direction: column; flex: 1; min-height: calc(100vh - 120px);` umgestellt.
    - `.monthGrid`: Nutzt nun `flex: 1; height: 100%; min-height: 540px;` und streckt sich dynamisch über die gesamte verbleibende Bildschirmhöhe.
    - `.calendarDay`: Auf `height: 100%; display: flex; flex-direction: column; min-height: 0;` umgestellt mit internem Scrollbereich (`.calEventsWrap`) für Termine, sodass auch Tage mit vielen Terminen sauber bleiben ohne das Raster zu verzerren.
    - Heutiger Tag (`.calendarDay.today`): Optisch hervorgehoben mit Akzentbalken und leuchtendem Badge um die Tageszahl.
  - [src/pages/Calendar.tsx](../src/pages/Calendar.tsx):
    - Wochenanzahl wird dynamisch berechnet (`weeksCount = Math.max(5, Math.ceil(days.length / 7))`) und als CSS-Grid-Zeilendefinition übergeben (`gridTemplateRows: auto repeat(weeksCount, minmax(0, 1fr))`).
    - Tagesarray füllt nun den Monat bis zum vollen 7-Tage-Raster auf, wodurch keine unvollständigen Zeilen mehr entstehen.
    - Tages-Header mit Badge und Zähler für Termine integriert.
- Verifikation: `npx tsc -b` und `npm run build` fehlerfrei abgeschlossen (Exit-Code 0). Dokumentation in [_doku/](./) aktualisiert.

## 28. Oktober 2026 – Aufgaben Kanban Header & Höhe ausnutzen

- Nutzerwunsch:
  1. `Crew Kanban ändern in --> AUFGABEN`.
  2. `(Aufgabe)"eyebrow" löschen`.
  3. `Hohe ausnutzen`.
- Analyse: In [src/pages/Tasks.tsx](../src/pages/Tasks.tsx) stand über der Überschrift `<span className="eyebrow">Aufgaben</span>` und als Titel `<h1>Crew Kanban</h1>`. Die Spalten (`.column`) hatten keine flexible Höhenstreckung und der Kanban-Container nutzte den vertikalen Bildschirmraum nicht vollständig aus.
- Durchgeführte Maßnahmen:
  - [src/pages/Tasks.tsx](../src/pages/Tasks.tsx):
    - Eyebrow-Badge `<span className="eyebrow">AUFGABEN</span>` entfernt.
    - Überschrift auf `<h1>AUFGABEN</h1>` gesetzt.
    - Seiten-Container mit CSS-Klasse `.tasksPage` versehen.
    - Spalten-Komponente `Column` mit internem Scrollcontainer `<div className="columnTasks">` ausgestattet, Zähler-Badge `<span className="colCount">` hinzugefügt und leere Spalten mit `<div className="emptyColumnHint">Keine Aufgaben</div>` versehen.
  - [src/styles.css](../src/styles.css):
    - `.tasksPage`: Auf `display: flex; flex-direction: column; flex: 1; min-height: calc(100vh - 120px);` konfiguriert.
    - `.kanban`: Auf `flex: 1; height: 100%; min-height: 520px;` gestreckt.
    - `.column`: Auf `height: 100%; min-height: 0; display: flex; flex-direction: column; overflow: hidden;` mit dezentem Glass-Border umgestellt.
    - `.columnTasks`: Scrollbarer Bereich für Karten mit dezentem Custom-Scrollbar, damit die Spaltenheader immer fix oben stehen und viele Kärtchen sauber gescrollt werden können.
    - Responsive Behandlung (`@media(max-width:900px)`) und Light-Theme-Farben (`body.light-theme .column`, etc.) integriert.
- Verifikation: `npx tsc -b` und `npm run build` (`tsc -b && vite build`) erfolgreich ohne Fehler durchgelaufen. Dev-Server läuft auf `http://localhost:5173/`.

## 28. Oktober 2026 – Festival verwalten zu „Festival Hub“ & Detail/Bearbeiten-Popups für alle 6 Tabs

- Nutzerwunsch:
  1. `Festival verwalten in "Festival Hub" ändern`.
  2. `Schichten, Timetable, Artists, Gelände, Kontakte, Notfall: erstelle einen Popup mit "Details, Bearbeiten - ICONs" seite --> Mobil Optimiert`.
- Durchgeführte Maßnahmen:
  - [src/components/Layout.tsx](../src/components/Layout.tsx) & [src/pages/FestivalAdmin.tsx](../src/pages/FestivalAdmin.tsx): Admin-Menüeintrag und Seitenheader von „Festival verwalten“ in „Festival Hub“ umbenannt.
  - [src/services/festival.ts](../src/services/festival.ts): Neue CRUD-Funktionen ergänzt: `updateTimetableEntry`, `deleteTimetableEntry`, `updateCrewContact`, `deleteCrewContact`, `updateEmergencyInfo`, `deleteEmergencyInfo`.
  - [src/components/FestivalItemDetailModal.tsx](../src/components/FestivalItemDetailModal.tsx): Unterstützt alle 6 Item-Typen (`shift`, `timetable`, `artist`, `location`, `contact`, `emergency`). Verfügt über Icon-Umschalter für `Details` (`Eye`) und `Bearbeiten` (`Pencil`), sowie Aktions-Buttons für `Löschen` (`Trash2`), `Speichern` (`Save`) und Schließen (`X`). Komplett mobil optimiert mit Touch-Zielen ≥ 42px, Select-Feldern für Artists/Locations und Zeiteingaben.
  - [src/pages/Festival.tsx](../src/pages/Festival.tsx): Icon-Aktionen (`Eye` für Details, `Pencil` für Bearbeiten) über alle 6 Tabs (Schichten, Timetable, Artists, Gelände, Kontakte, Notfall) hinweg integriert und mit `FestivalItemDetailModal` verdrahtet.
- Verifikation: `npx tsc -b` und `npm run build` fehlerfrei abgeschlossen (Exit-Code 0, Build-Zeit 1.09s). Dokumentation in [_doku/](./) aktualisiert.

## 28. Oktober 2026 – Rolle = Crew Sidebar-Restriktion & Schreibschutz (Nur Lesen)

- Nutzerwunsch:
  - `## SideBar`: „Rolle = Crew / Sichtbar nur für Crew Mitglieder (Nur Lesen, NICHT bearbeiten oder Löschen)“:
    - Home
    - Chat
    - Aufgaben
    - Kalender
    - Festival Hub
    - Crew
    - Control Center
    - FAQ & Hilfe
- Analyse: Crew-Mitglieder sollen in der Sidebar exakt die 8 definierten Menüpunkte sehen (der `ADMIN`-Bereich muss vollständig verborgen bleiben). Zudem gilt systemweit für die Rolle Crew ein striktes Nur-Lesen-Recht ohne Bearbeitungs- oder Löschaktionen.
- Durchgeführte Maßnahmen:
  - [src/contexts/AuthContext.tsx](../src/contexts/AuthContext.tsx): Erweitert um striktes Rollenmanagement (`UserRole = 'Super Admin' | 'Admin' | 'Teamleitung' | 'Crew'`), `role`, `isAdmin`, `isCrew`, `canEdit = !isCrew` und `setRole`.
  - [src/components/Layout.tsx](../src/components/Layout.tsx):
    - Sichtbare Navigation für Crew auf die exakten 8 Punkte beschränkt (Home, Chat, Aufgaben, Kalender, Festival Hub, Crew, Control Center, FAQ & Hilfe).
    - `ADMIN`-Menüabschnitt für Crew ausgeblendet (`!isAdmin`).
    - Rollen-Badge im Sidebar-Fuß (`Crew (Lesen)`) und interaktiver Rollen-Umschalter im Popover-Menü zur einfachen Vorschau/Testung integriert.
  - [src/pages/Festival.tsx](../src/pages/Festival.tsx):
    - `+ Schicht hinzufügen` für Crew ausgeblendet.
    - Auf allen 6 Tabs (Schichten, Timetable, Artists, Gelände, Kontakte, Notfall) die `Pencil`-Bearbeiten-Buttons für Crew ausgeblendet; Klick öffnet rein im `details`-Modus.
    - Info-Badge `Crew · Nur Lesen` im Seitenkopf integriert.
  - [src/components/FestivalItemDetailModal.tsx](../src/components/FestivalItemDetailModal.tsx):
    - Für Crew-Mitglieder (`!canEdit`) wird der Bearbeiten-Tab ausgeblendet und stattdessen ein `Nur Lesen`-Badge angezeigt.
    - Bearbeiten- und Lösch-Buttons (`Trash2`, `Pencil`, `Save`) werden für Crew-Mitglieder nicht gerendert und Backend-Aufrufe serverseitig/clientseitig geschützt.
  - [src/pages/ShiftPlan.tsx](../src/pages/ShiftPlan.tsx), [src/pages/Crew.tsx](../src/pages/Crew.tsx), [src/pages/Tasks.tsx](../src/pages/Tasks.tsx) & [src/pages/ControlCenter.tsx](../src/pages/ControlCenter.tsx):
    - Erstellungs-Buttons (`+ Schicht hinzufügen`, `+ Crew Mitglied`, `+ Aufgabe erstellen`) für Crew ausgeblendet.
    - Status-Dropdown in Control Center für Crew schreibgeschützt (`disabled`).
  - [src/pages/UserSettings.tsx](../src/pages/UserSettings.tsx): Neue Karte „Rolle & Berechtigungen“ zur Rollenanzeige und Umschaltung (Crew vs. Admin) hinzugefügt.
  - [Sidebar-Navigation.md](./Sidebar-Navigation.md) & [ToDos.md](./ToDos.md): Dokumentation aktualisiert.
- Verifikation: `npx tsc -b` und `npm run build` fehlerfrei abgeschlossen (Exit-Code 0, Build-Zeit 1.26s).


## 28. Oktober 2026 – SchichtenTimeline hinzugefügt

- Nutzerwunsch:
  - `Schichten: füge eine SchichtenTimline hinzu`
- Analyse: Schichten wurden bisher primär als unstrukturierte Karten-Raster (`ShiftOpsCard` bzw. `festivalCard`) dargestellt. Für den Festivalbetrieb fehlte eine visuelle, chronologische Zeitstrahl- bzw. Gantt-Darstellung, die Schichten über verschiedene Bühnen/Bereiche hinweg anordnet, Überschneidungen und Besetzungen transparent macht und eine Live-Orientierung bietet.
- Durchgeführte Maßnahmen:
  - [src/components/ShiftTimeline.tsx](../src/components/ShiftTimeline.tsx):
    - Komplett neue, wiederverwendbare SchichtenTimeline-Komponente entwickelt.
    - **Tagesauswahl**: Automatische Erkennung aller Termintage aus den Schichten (`starts_at`), Navigationspfeile (Vorheriger/Nächster Tag) und „Alle Tage“-Übersicht.
    - **Statistik-Leiste**: Sofortige Übersicht über Gesamt-Schichten, Besetzungsquote (mit Prozentwert), offene Schichten und eigene Einsätze.
    - **Filter & Suche**: Volltextsuche nach Schichttitel/Info, Location-Dropdown-Filter, Toggles für „Nur offene Schichten“ und „Meine Schichten“.
    - **24-Stunden-Zeitstrahl**: Horizontales 24h-Raster (00:00–24:00) mit zweistündigen Ticks, Stundenlinien und dynamischer, animierter **„JETZT“-Live-Linie** bei Anzeige des heutigen Tages.
    - **Location-Spuren (Gantt-Tracks)**: Links fixierte/sticky Location-Spalte (Bühne/Bereich mit Icon und Schichtzähler); rechts horizontaler Track mit automatischer Multi-Lane-Berechnung bei zeitlichen Überschneidungen, um Überlagerungen zu verhindern.
    - **Schicht-Blöcke & Farbcodierung**: Exakte Positionierung nach Start- und Endzeit (`left%`, `width%`); Farbstatus: 🟢 Voll besetzt (`confirmed >= needed`), 🟡 Teilweise besetzt, 🔴 Dringend / Offen (`confirmed === 0`), 🟣 Eigene Schicht mit Badge & Stern.
    - **Interaktion & Aktionen**: Hover-Mini-Aktionen (`Eye` für Details, `Pencil` für Bearbeiten) sowie Klick-Inspektor-Modal mit Crew-Aufstellung, Schicht-Übernehmen (`joinShift`) und Schicht-Verlassen (`leaveShiftSafe`).
    - **Mobil- & Touch-Optimierung**: Sanftes horizontales Wischen (`overflow-x: auto`), kompakte Darstellung auf Mobilgeräten und vollständige Unterstützung von Dark- & Light-Themes (`body.light-theme`).
  - [src/pages/ShiftPlan.tsx](../src/pages/ShiftPlan.tsx):
    - View-Umschalter `[ Timeline | Karten ]` in der Headerzeile integriert.
    - Authentische Demodaten für verschiedene Locations (Main Floor, Main Gate, Awareness Point, Bar 1, Backstage Catering) für heute und Folgetage angelegt.
    - Mit `ShiftTimeline`, `FestivalItemDetailModal` und `CreateShiftModal` verdrahtet.
  - [src/pages/Festival.tsx](../src/pages/Festival.tsx):
    - Im Tab `Schichten` ebenfalls den View-Umschalter `[ Timeline | Schicht-Karten ]` eingebaut und mit `ShiftTimeline` sowie `openDetail` verdrahtet.
  - [src/styles.css](../src/styles.css):
    - Umfangreiche CSS-Klassen für `.shiftTimelineContainer`, `.timelineToolbar`, `.timelineStats`, `.timelineDayPill`, `.timelineHeaderRow`, `.timelineNowIndicator`, `.timelineTrackRow`, `.timelineShiftBlock`, `.shiftInspectorModal`, `.timelineLegend` und Light-Theme-Variablen ergänzt.
- Verifikation: `npx tsc -b` und `npm run build` (`tsc -b && vite build`) fehlerfrei abgeschlossen (Exit-Code 0, Build-Zeit 1.38s). Dokumentation in [_doku/](./) aktualisiert.


## 28. Oktober 2026 – ADMIN: Neuer Menüpunkt „Aufgaben“ & Aufgaben-Verwaltung mit Crew- und Team-Zuweisung

- Nutzerwunsch:
  - `ADMIN (Sidebar): Neuer Punkt "Aufgaben", erstelle neue seite mit der gesamten aufgaben Liste, Aufgaben an Crew, Team zuweißbar`
- Analyse: In der ADMIN-Sektion der Sidebar fehlte eine zentrale Aufgaben-Verwaltungsseite. Während das bisherige Kanban-Board (`Tasks.tsx`) auf die operative Spalten-Ansicht ausgelegt ist, benötigt die Administration eine strukturierte tabellarische Gesamtübersicht aller Aufgaben, um diese direkt an beliebige Crew-Mitglieder und Teams zuzuweisen, Prioritäten/Status zu steuern und neue Aufgaben mit sofortiger Team-/Crew-Verknüpfung anzulegen.
- Durchgeführte Maßnahmen:
  - [src/components/Layout.tsx](../src/components/Layout.tsx):
    - `adminNavItems` um `["tasks-admin", "Aufgaben", CheckSquare]` erweitert (sichtbar für Admins).
  - [src/App.tsx](../src/App.tsx):
    - Route `tasks-admin` registriert und mit [TasksAdmin.tsx](../src/pages/TasksAdmin.tsx) verdrahtet.
  - [src/services/tasks.ts](../src/services/tasks.ts):
    - `listTasks()` erweitert für Joins auf Profile und Teams.
    - Neue Funktionen `assignTaskToCrewAndTeam(task_id, user_id, team_id)` und `unassignTask(task_id, user_id)` implementiert.
  - [src/pages/TasksAdmin.tsx](../src/pages/TasksAdmin.tsx):
    - Neue Seite für die gesamte Aufgaben-Verwaltung erstellt.
    - **Statistik-Kacheln**: Aufgaben gesamt, Offen, In Bearbeitung, Erledigt, Crew zugewiesen (inkl. Kennzeichnung unzugewiesener Aufgaben).
    - **Filterleiste**: Volltextsuche, Filter nach Status, Priorität, Team und Zuweisungsstatus (Alle / Nicht zugewiesen / bestimmtes Crew-Mitglied).
    - **Gesamte Aufgaben-Tabelle**:
      - Direkte Inline-Dropdowns zur **Crew-Zuweisung** (`KT_profiles`) und **Team-Zuweisung** (`KT_teams`) direkt in der Zeile mit sofortigem Feedback.
      - Interaktive Status- und Prioritätsauswahl.
      - Fälligkeitsdatum mit Kalender-Icon.
      - Aktionen zum Bearbeiten (`Pencil`) und Löschen (`Trash2`).
    - **Modale Dialoge**:
      - `+ Neue Aufgabe`: Formular zum Erstellen mit direkter Team- und Crew-Auswahl.
      - `Aufgabe bearbeiten & zuweisen`: Vollständiges Formular für Änderungen an allen Feldern.
    - **Demo- & Supabase-Kompatibilität**: 10 realistische Festival-Aufgaben für die Vorschau/Demo integriert; Live-Anbindung an `KT_tasks`, `KT_task_assignees`, `KT_profiles` und `KT_teams`.
  - [src/styles.css](../src/styles.css):
    - Styles für `.tasksAdminStatsGrid`, `.tasksAdminTable`, `.statusSelect`, `.adminPrioBadge`, `.adminCellSelect`, `.adminModalCard` und Dark-/Light-Theme hinzugefügt.
  - [Sidebar-Navigation.md](./Sidebar-Navigation.md) & [ToDos.md](./ToDos.md): Dokumentation aktualisiert.
- Verifikation: `npx tsc -b` und `npm run build` (`tsc -b && vite build`) erfolgreich ohne Fehler durchgelaufen (Exit-Code 0, Build-Zeit 1.18s).


## 28. Oktober 2026 – Branding: KLANGTHERAPIE CREW PLANER

- Nutzerwunsch:
  - `## brand: KLANGTHERAPIE CREW PLANER`
- Analyse: In der Sidebar ([Layout.tsx](../src/components/Layout.tsx)) stand unter dem Hauptschriftzug `KLANGTHERAPIE` bisher `<small>CREW APP</small>`. Der Markenauftritt soll einheitlich auf `KLANGTHERAPIE CREW PLANER` geschärft werden.
- Durchgeführte Maßnahmen:
  - [src/components/Layout.tsx](../src/components/Layout.tsx): Sidebar-Brand-Untertitel von `CREW APP` in `CREW PLANER` geändert.
  - [src/styles.css](../src/styles.css): `.brand small` typografisch verfeinert (`letter-spacing: 2px; font-size: 8.5px; font-weight: 600; color: #9eb3ab;`), sodass `CREW PLANER` optisch perfekt zentriert und lesbar unter `KLANGTHERAPIE` sitzt.
  - [index.html](../index.html): HTML-Titel auf `<title>Klangtherapie · Crew Planer</title>` gesetzt.
  - [src/pages/Login.tsx](../src/pages/Login.tsx): Eyebrow von `KLANGTHERAPIE CREW` auf `KLANGTHERAPIE · CREW PLANER` vereinheitlicht.
  - [src/pages/Dashboard.tsx](../src/pages/Dashboard.tsx): Header-Eyebrow auf `KLANGTHERAPIE · CREW PLANER` aktualisiert.
  - [src/App.tsx](../src/App.tsx): Lade-Splash-Screen mit `KLANGTHERAPIE` und dezentem Untertitel `CREW PLANER` versehen.
- Verifikation: `npx tsc -b` und `npm run build` (`tsc -b && vite build`) erfolgreich ohne Fehler durchgelaufen (Exit-Code 0, Build-Zeit 1.14s).
