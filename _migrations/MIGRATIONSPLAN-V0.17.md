# Migrationsplan Klangtherapie Crew V0.17

Stand: 28. Oktober 2026. Grundlage: aktueller Quellcode, `SUPABASE/v17.sql`, die Migrationen `001` bis `016` und die Integrationsnotizen V0.9 bis V0.17. Dies ist ein Plan; es wurde keine Datenbank verändert.

## Verbindungsprüfung vom 28. Oktober 2026

Die in `.login.env` angegebene Self-hosted-Adresse antwortet mit dem selbstsignierten Zertifikat `TRAEFIK DEFAULT CERT`. Eine unauthentifizierte Anfrage an `/rest/v1/` liefert darüber hinaus HTTP 404. Es wurden keine Zugangsdaten an diesen Endpunkt gesendet. Bis eine gültige HTTPS-Adresse oder korrekte Proxy-Konfiguration vorliegt, kann der Istzustand der Datenbank nicht verifiziert und keine Migration sicher ausgeführt werden.

## Ziel und Ausgangslage

- **Neue Installation:** Ein bereinigtes V0.17-Basisschema einmalig auf einer leeren Supabase-Instanz installieren. `SUPABASE/v17.sql` ist derzeit nur eine Zusammenfassung der historischen Migrationen und noch kein freigegebener Installationsstand.
- **Bestehende Installation:** Tatsächlichen Schemazustand und Migrationshistorie zuerst feststellen; nur fehlende Änderungen als neue, vorwärtsgerichtete Migration anwenden. `SUPABASE/v17.sql` nicht auf eine bestehende Datenbank ausführen.
- Es gibt im Repository derzeit weder `supabase/config.toml`, Lockfile, installierte Abhängigkeiten noch eine konfigurierte Datenbankverbindung. Der reale Zielzustand ist deshalb noch unbekannt.

## Vor der Ausführung zu beheben

### P0: Datenbankfunktionen und Zugriffsregeln

1. **Benachrichtigungen:** `KT_notifications.type` ist `NOT NULL`, aber die Trigger für Schichtzuweisung, Schichtänderung, Erwähnung und kritische Incidents schreiben keinen `type`. In allen Triggern einen festen Typ setzen und Insert/Update mit echten Benutzern testen. Quellen: `SUPABASE/v17.sql`, Abschnitte `001`, `010`, `015`, `016`.
2. **Chat-RLS:** Die SELECT-Policy auf `KT_conversation_members` fragt dieselbe Tabelle unter RLS erneut ab. Die Rekursion durch eine geprüfte Mitgliedschaftsfunktion oder eine andere nicht rekursive Policy ersetzen; Zugriff als Mitglied und Nichtmitglied testen. Auch die Konversations-, Nachrichten-, Reaktions- und Attachment-Policies zusammen prüfen.
3. **Schicht-RPCs:** `KT_join_shift` aktualisiert beim erneuten Beitritt eine Zuweisung, aber es fehlt eine passende UPDATE-Policy. `KT_leave_shift` versucht als `SECURITY INVOKER`, eine fremde Wartelistenzeile zu bestätigen; auch dafür fehlt die Berechtigung. Kapazitätsprüfung und Beitritt müssen außerdem bei parallelen Anfragen atomar sein. Die Funktionen mit enger, serverseitiger Autorisierung und Sperre der Schichtzeile überarbeiten; Direktzugriff auf Zuweisungen darf die Regeln nicht umgehen.
4. **Rollen-Eskalation:** Die aktuelle Admin-Policy auf `KT_user_roles` erlaubt einem Admin, sich selbst die Rolle `Super Admin` zuzuweisen. Serverregel für erlaubte Zielrollen definieren und testen; Teamleitung und Crew dürfen keine Rollen ändern.
5. **Storage und Profildaten:** Die Storage-SELECT-Policy erlaubt jedem angemeldeten Benutzer den Zugriff auf jedes Objekt des privaten Buckets. Zugriffe auf Dokumente und Chat-Anhänge an deren Mitgliedschaft/Team-RLS binden. `emergency_contact` wird über die allgemeine Profil-SELECT-Policy und `listCrew()` an die Crew geliefert; Sichtbarkeit vor Datenübernahme festlegen und auf Datenbankebene absichern.

### P1: Schema und App-Verträge

1. **Messenger:** `listMessengerConversations()` erwartet `KT_conversations.name` und `updated_at`; vorhanden sind `title` und `created_at`. `listMessengerMessages()` erwartet `KT_message_reactions.id`, obwohl die Tabelle einen zusammengesetzten Primärschlüssel hat. Abfragen an das Schema anpassen und Nachrichten, Reaktionen und Lesestatus testen.
2. **Check-ins und Embeds:** Die Tabelle hat `checked_in_at`, `controlCenter.ts` fragt `created_at` ab. Mehrere PostgREST-Embeds von `KT_profiles` haben keine direkte Fremdschlüsselbeziehung, weil die betreffende ID auf `auth.users` zeigt: Check-ins, Schichtzuweisungen, Incidents, Dokumente und Task-Aktivität. Je Pfad expliziten Profil-FK nach Datenprüfung oder zwei Abfragen vorsehen.
3. **Aufgaben-Kommentare:** `taskDetail.ts` schreibt `user_id`, die Tabelle verlangt `author_id`; die bestehende Abfrage aus `tasks.ts` verwendet bereits `author_id`. Service vereinheitlichen und Kommentar-RLS prüfen.
4. **Navigation und Fehlerbehandlung:** `App.tsx` importiert Kalender, Control Center, Dokumente und Crew, rendert für mehrere Seiten aber nur `Placeholder`. `Layout.tsx` bietet keine rollenabhängige Navigation. Die App darf Datenbankfehler nicht als leere Listen oder erfolgreiche Aktionen darstellen. Routen und Zugriff vor Freigabe verdrahten.
5. **Einladungen:** Die Spalten in Migration `004` wurden bereits für die Edge Function ergänzt. Die Function muss den Datenbank-Insert-Fehler auswerten; Rollen- und Teamzuweisung nach Annahme der Einladung ist noch nicht implementiert. Server-Secrets ausschließlich in der Function konfigurieren.

## Reihenfolge der Umsetzung

1. **Bestandsaufnahme:** Zielprojekt, Postgres-Version, angewendete Migrationen, Tabellen/Policies/Funktionen, Bucket, Publication, Auth-Benutzer und Datenmengen dokumentieren. Abgleich mit `SUPABASE/v17.sql`; Backup und Wiederherstellung praktisch testen.
2. **Vertrag festlegen:** Für jedes Modul die tatsächlichen Spalten, Fremdschlüssel, RLS-Rollen und RPCs in einer Matrix festhalten. Die P0-Entscheidungen zu Teamdaten, Notfallkontakt, Dokumenten und Rollen abschließen.
3. **SQL bereinigen:** Für Neuinstallationen das Basisschema aus den korrigierten Quellen neu erzeugen. Für bestehende Installationen eine neue Migration mit `ALTER`, Policy- und Funktionsänderungen erstellen. Bereits angewendete Migrationsdateien nicht als alleinige Upgrade-Methode voraussetzen.
4. **App und Function anpassen:** Services an das geprüfte Schema anpassen; Schichtaktionen ausschließlich über geprüfte RPCs führen; eingebettete Abfragen und Fehlerbehandlung korrigieren; Edge Function deployen.
5. **Staging testen:** Frische Datenbank aus Basisschema aufbauen. Eine Kopie der bestehenden Datenbank separat mit der Upgrade-Migration testen. Beides muss denselben erwarteten Schema-Endzustand ergeben.
6. **Rollen- und Workflow-Tests:** Mit getrennten Sessions für Crew, Teamleitung, Admin und Super Admin Login, Einladungen, Profile, Aufgaben, Kalender, Messenger, Dokumente, Schichten, Check-in, Incidents und Notifications ausführen. Negative RLS-Tests ausdrücklich einschließen.
7. **Realtime und Betrieb:** Realtime mit zwei Clients für Nachrichten, Notifications, Kalender und Incidents prüfen; Publication-Einträge und Replikationsberechtigungen kontrollieren. UI-Build und responsive Ansichten nach den Integrationsnotizen prüfen.
8. **Produktivsetzung:** Schreibzugriffe kurz anhalten, Backup erstellen, geprüfte Upgrade-Migration anwenden, Function und Frontend ausrollen, Smoke-Tests ausführen und Fehler beobachten. Bei Fehlern App auf vorherige Version zurückstellen und Datenbank anhand des getesteten Wiederherstellungsverfahrens behandeln.

## Freigabekriterien

- Frische Installation und Upgrade-Pfad laufen ohne SQL-Fehler; Schema-Endzustand ist verglichen.
- Alle P0-Punkte sind mit realen Benutzer-JWTs geprüft; unerlaubte Lese- und Schreibzugriffe werden abgewiesen.
- Kernabläufe liefern in der App echte Daten und sichtbare Fehlermeldungen; kein Demoerfolg verdeckt Backend-Fehler.
- Zwei Clients erhalten die vorgesehenen Realtime-Ereignisse; Schichtkapazität hält auch bei parallelem Beitritt.
- Ein Backup kann wiederhergestellt werden; Edge-Function-Secrets sind nicht im Frontend enthalten.

## Noch zu klären

- Ist das Ziel eine **leere** Supabase-Instanz oder eine **bereits genutzte** Datenbank, und welche Migrationen sind dort wirklich angewendet?
- Welche Crew-Rollen dürfen Notfallkontakte, teamgebundene Dokumente und vollständige Schicht-Roster sehen?
