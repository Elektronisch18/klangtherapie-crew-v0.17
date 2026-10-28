import { useState, useEffect } from "react";
import { Moon, Sun, Lock, ShieldCheck, Key, Check, AlertCircle, Palette, User, Bell } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

export default function UserSettings() {
  const { user, demo, role, setRole, isCrew } = useAuth();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [notifyState, setNotifyState] = useState(true);

  useEffect(() => {
    const saved = (localStorage.getItem("kt_theme") as "dark" | "light") || "dark";
    setTheme(saved);
    if (saved === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  }, []);

  const changeTheme = (mode: "dark" | "light") => {
    setTheme(mode);
    localStorage.setItem("kt_theme", mode);
    if (mode === "light") {
      document.body.classList.add("light-theme");
    } else {
      document.body.classList.remove("light-theme");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!newPassword) {
      setMessage({ type: "error", text: "Bitte gib ein neues Passwort ein." });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Das Passwort muss mindestens 6 Zeichen lang sein." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Die eingegebenen Passwörter stimmen nicht überein." });
      return;
    }

    setLoading(true);
    try {
      if (demo) {
        setTimeout(() => {
          setLoading(false);
          setMessage({ type: "success", text: "Demo: Passwort wurde erfolgreich geändert." });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        }, 400);
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setMessage({ type: "success", text: "Passwort wurde erfolgreich aktualisiert." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Passwort-Aktualisierung fehlgeschlagen." });
    } finally {
      setLoading(false);
    }
  };

  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : "Jana");
  const email = user?.email || "crew@klangtherapie.de";

  return (
    <section className="page userSettingsPage">
      <div className="titleRow">
        <div>
          <span className="eyebrow">KONTO & SYSTEM</span>
          <h1>Einstellungen</h1>
          <p>Erscheinungsbild, Themes und Kontosicherheit verwalten.</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: "20px", maxWidth: "800px" }}>
        {/* Erscheinungsbild / Hell/Dunkel Modus */}
        <article className="glass" style={{ padding: "24px", borderRadius: "18px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "rgba(125,91,255,0.14)",
                color: "#bbaeff",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Palette size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px" }}>Erscheinungsbild (Theme)</h2>
              <small style={{ color: "#8a96a3" }}>Wähle zwischen Hell- und Dunkelmodus.</small>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
            <button
              type="button"
              className={`themeSelectCard glass ${theme === "dark" ? "activeTheme" : ""}`}
              onClick={() => changeTheme("dark")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                padding: "18px",
                borderRadius: "14px",
                cursor: "pointer",
                border: theme === "dark" ? "2px solid #825fff" : "1px solid rgba(255,255,255,0.08)",
                background: theme === "dark" ? "rgba(130,95,255,0.12)" : "rgba(255,255,255,0.03)",
                color: theme === "dark" ? "#ffffff" : "#8a96a3",
              }}
            >
              <Moon size={28} color={theme === "dark" ? "#aa91ff" : "#8a96a3"} />
              <div style={{ textAlign: "center" }}>
                <b style={{ display: "block" }}>Dark Mode</b>
                <small style={{ opacity: 0.8 }}>Dunkles Klangtherapie Design</small>
              </div>
              {theme === "dark" && (
                <span style={{ fontSize: "11px", color: "#6fe3a8", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Check size={14} /> Aktiv
                </span>
              )}
            </button>

            <button
              type="button"
              className={`themeSelectCard glass ${theme === "light" ? "activeTheme" : ""}`}
              onClick={() => changeTheme("light")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
                padding: "18px",
                borderRadius: "14px",
                cursor: "pointer",
                border: theme === "light" ? "2px solid #25bb7e" : "1px solid rgba(255,255,255,0.08)",
                background: theme === "light" ? "rgba(37,187,126,0.14)" : "rgba(255,255,255,0.03)",
                color: theme === "light" ? "#ffffff" : "#8a96a3",
              }}
            >
              <Sun size={28} color={theme === "light" ? "#f5ba3b" : "#8a96a3"} />
              <div style={{ textAlign: "center" }}>
                <b style={{ display: "block" }}>Hell Mode</b>
                <small style={{ opacity: 0.8 }}>Heller Modus für Tageslicht</small>
              </div>
              {theme === "light" && (
                <span style={{ fontSize: "11px", color: "#6fe3a8", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Check size={14} /> Aktiv
                </span>
              )}
            </button>
          </div>
        </article>

        {/* Rolle & Berechtigungen */}
        <article className="glass" style={{ padding: "24px", borderRadius: "18px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: isCrew ? "rgba(100,200,255,0.14)" : "rgba(32,184,120,0.15)",
                color: isCrew ? "#7cd4fd" : "#8ae7bc",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ margin: 0, fontSize: "18px" }}>Rolle & Berechtigungen</h2>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "999px",
                    fontWeight: 600,
                    background: isCrew ? "rgba(100,200,255,0.14)" : "rgba(32,184,120,0.15)",
                    color: isCrew ? "#7cd4fd" : "#8ae7bc",
                    border: `1px solid ${isCrew ? "rgba(100,200,255,0.28)" : "rgba(32,184,120,0.3)"}`,
                  }}
                >
                  Aktuell: {role}
                </span>
              </div>
              <small style={{ color: "#8a96a3" }}>
                {isCrew
                  ? "Rolle = Crew: Sichtbar sind Home, Chat, Aufgaben, Kalender, Festival Hub, Crew, Control Center, FAQ & Hilfe (Nur Lesen, NICHT bearbeiten oder Löschen)."
                  : "Rolle = Admin: Vollzugriff inklusive ADMIN-Menübereich in der Sidebar."}
              </small>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
            <button
              type="button"
              className={`glass ${role === "Crew" ? "activeTheme" : ""}`}
              onClick={() => setRole("Crew")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
                padding: "16px",
                borderRadius: "14px",
                cursor: "pointer",
                border: role === "Crew" ? "2px solid #7cd4fd" : "1px solid rgba(255,255,255,0.08)",
                background: role === "Crew" ? "rgba(100,200,255,0.12)" : "rgba(255,255,255,0.03)",
                color: role === "Crew" ? "#ffffff" : "#8a96a3",
                textAlign: "left",
              }}
            >
              <b style={{ color: role === "Crew" ? "#7cd4fd" : "#ffffff" }}>Rolle: Crew</b>
              <small style={{ fontSize: "12px", opacity: 0.85 }}>
                • Sichtbar: 8 Hauptpunkte<br />
                • ADMIN-Menü ausgeblendet<br />
                • Nur Lesen (kein Edit / Delete)
              </small>
              {role === "Crew" && (
                <span style={{ fontSize: "11px", color: "#7cd4fd", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                  <Check size={14} /> Aktiv
                </span>
              )}
            </button>

            <button
              type="button"
              className={`glass ${role === "Admin" ? "activeTheme" : ""}`}
              onClick={() => setRole("Admin")}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
                padding: "16px",
                borderRadius: "14px",
                cursor: "pointer",
                border: role === "Admin" ? "2px solid #25bb7e" : "1px solid rgba(255,255,255,0.08)",
                background: role === "Admin" ? "rgba(37,187,126,0.12)" : "rgba(255,255,255,0.03)",
                color: role === "Admin" ? "#ffffff" : "#8a96a3",
                textAlign: "left",
              }}
            >
              <b style={{ color: role === "Admin" ? "#8ae7bc" : "#ffffff" }}>Rolle: Admin</b>
              <small style={{ fontSize: "12px", opacity: 0.85 }}>
                • Sichtbar: Hauptpunkte + ADMIN<br />
                • Festival Hub, Benutzer, Rollen, Dateien<br />
                • Volle Bearbeitungs- & Löschrechte
              </small>
              {role === "Admin" && (
                <span style={{ fontSize: "11px", color: "#6fe3a8", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                  <Check size={14} /> Aktiv
                </span>
              )}
            </button>
          </div>
        </article>

        {/* Passwort ändern */}
        <article className="glass" style={{ padding: "24px", borderRadius: "18px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "rgba(91,220,166,0.12)",
                color: "#7ce4b2",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Key size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "18px" }}>Passwort ändern</h2>
              <small style={{ color: "#8a96a3" }}>Sichere dein Crew-Konto mit einem neuen Passwort.</small>
            </div>
          </div>

          {message && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: "12px",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                background: message.type === "success" ? "rgba(91,220,166,0.15)" : "rgba(255,90,115,0.15)",
                color: message.type === "success" ? "#8affcc" : "#ff9baa",
                border:
                  message.type === "success" ? "1px solid rgba(91,220,166,0.3)" : "1px solid rgba(255,90,115,0.3)",
              }}
            >
              {message.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} style={{ display: "grid", gap: "14px" }}>
            <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
              Aktuelles Passwort (optional)
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "10px",
                  padding: "11px 14px",
                  color: "#ffffff",
                }}
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                Neues Passwort
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mindestens 6 Zeichen"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "10px",
                    padding: "11px 14px",
                    color: "#ffffff",
                  }}
                />
              </label>

              <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                Neues Passwort bestätigen
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Passwort wiederholen"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "10px",
                    padding: "11px 14px",
                    color: "#ffffff",
                  }}
                />
              </label>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
              <button
                type="submit"
                className="primary"
                disabled={loading || !newPassword}
                style={{ opacity: loading || !newPassword ? 0.6 : 1 }}
              >
                <Lock size={16} />
                {loading ? "Wird gespeichert…" : "Passwort speichern"}
              </button>
            </div>
          </form>
        </article>

        {/* Konto-Status */}
        <article className="glass" style={{ padding: "20px 24px", borderRadius: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #6840a2, #3ec48c)",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                }}
              >
                {(displayName[0] || "J").toUpperCase()}
              </div>
              <div>
                <b style={{ display: "block" }}>{displayName}</b>
                <small style={{ color: "#7a8a84" }}>{email}</small>
              </div>
            </div>
            <span
              style={{
                fontSize: "11px",
                padding: "4px 9px",
                borderRadius: "999px",
                background: "rgba(91,220,166,0.14)",
                color: "#7ae0b2",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <ShieldCheck size={13} /> {demo ? "Demo-Konto" : "Aktiv"}
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}
