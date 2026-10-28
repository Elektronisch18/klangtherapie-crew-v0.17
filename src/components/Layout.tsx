import { useState, useRef, useEffect } from "react";
import {
  Home,
  MessageCircle,
  CheckSquare,
  CalendarDays,
  Activity,
  Users,
  Folder,
  Settings,
  Shield,
  ShieldCheck,
  Sliders,
  Menu,
  Music,
  UserRound,
  LogOut,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

type Props = {
  page: string;
  setPage: (p: string) => void;
  children: React.ReactNode;
};

const mainNavItems: [string, string, any][] = [
  ["dashboard", "Home", Home],
  ["chats", "Chat", MessageCircle],
  ["tasks", "Aufgaben", CheckSquare],
  ["calendar", "Kalender", CalendarDays],
  ["festival", "Festival Hub", Music],
  ["crew", "Crew", Users],
  ["controlcenter", "Control Center", Activity],
  ["faq", "FAQ & Hilfe", HelpCircle],
];

const adminNavItems: [string, string, any][] = [
  ["festival-admin", "Festival Hub", Sliders],
  ["tasks-admin", "Aufgaben", CheckSquare],
  ["admin", "Benutzer & Teams", Users],
  ["roles-admin", "Rollen & Rechte", ShieldCheck],
  ["files", "Dateien", Folder],
];

export default function Layout({ page, setPage, children }: Props) {
  const { user, signOut, role, isAdmin, isCrew, setRole } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split("@")[0] : "Jana");
  const username = user?.user_metadata?.username || (user?.email ? user.email.split("@")[0] : "jana");
  const initial = (displayName[0] || "J").toUpperCase();

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="shell">
      <aside className="sidebar glass">
        <div className="brand" onClick={() => setPage("dashboard")} style={{ cursor: "pointer" }}>
          <div className="mark">K</div>
          <div>
            <b>KLANGTHERAPIE</b>
            <small>CREW PLANER</small>
          </div>
        </div>
        <nav className="sidebarNav">
          <div className="navSection">
            {mainNavItems.map(([id, label, Icon]) => (
              <button key={id} className={page === id ? "active" : ""} onClick={() => setPage(id)}>
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {isAdmin && (
            <div className="navSection adminNavSection">
              <div className="navSectionHeader">
                <span>ADMIN</span>
              </div>
              {adminNavItems.map(([id, label, Icon]) => (
                <button
                  key={id}
                  className={`adminNavItem ${page === id ? "active" : ""}`}
                  onClick={() => setPage(id)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>
        <div className="sidefoot userSection" ref={userMenuRef}>
          {menuOpen && (
            <div className="userMenuPopover glass">
              <div style={{ padding: "8px 10px 10px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "11px", color: "#85938f", marginBottom: "6px" }}>Rolle (Test & Vorschau):</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  <button
                    type="button"
                    style={{
                      padding: "6px 8px",
                      fontSize: "11px",
                      borderRadius: "6px",
                      border: role === "Crew" ? "1px solid #7cd4fd" : "1px solid rgba(255,255,255,0.12)",
                      background: role === "Crew" ? "rgba(100,200,255,0.2)" : "rgba(255,255,255,0.04)",
                      color: role === "Crew" ? "#7cd4fd" : "#cfd9d5",
                      cursor: "pointer",
                      fontWeight: role === "Crew" ? 600 : 400,
                    }}
                    onClick={() => setRole("Crew")}
                    title="Crew: Nur Lesen, keine Admin-Rechte"
                  >
                    Crew (Lesen)
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: "6px 8px",
                      fontSize: "11px",
                      borderRadius: "6px",
                      border: role === "Admin" ? "1px solid #20b878" : "1px solid rgba(255,255,255,0.12)",
                      background: role === "Admin" ? "rgba(32,184,120,0.2)" : "rgba(255,255,255,0.04)",
                      color: role === "Admin" ? "#8ae7bc" : "#cfd9d5",
                      cursor: "pointer",
                      fontWeight: role === "Admin" ? 600 : 400,
                    }}
                    onClick={() => setRole("Admin")}
                    title="Admin: Vollzugriff inklusive ADMIN-Menü"
                  >
                    Admin
                  </button>
                </div>
              </div>
              <button
                className="userMenuItem"
                onClick={() => {
                  setPage("profile");
                  setMenuOpen(false);
                }}
              >
                <UserRound size={16} />
                <span>Profil</span>
              </button>
              <button
                className="userMenuItem"
                onClick={() => {
                  setPage("settings");
                  setMenuOpen(false);
                }}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <button
                className="userMenuItem"
                onClick={() => {
                  setPage("faq");
                  setMenuOpen(false);
                }}
              >
                <HelpCircle size={16} />
                <span>FAQ & Hilfe</span>
              </button>
              <div className="userMenuDivider" />
              <button
                className="userMenuItem logoutBtn"
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
              >
                <LogOut size={16} />
                <span>Abmelden</span>
              </button>
            </div>
          )}
          <button
            className={`userRowBtn ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            title="Benutzermenü"
          >
            <div className="userAvatarMini">
              {initial}
              <i className="onlineDot" />
            </div>
            <div className="userCopy">
              <b>{displayName}</b>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                <small>@{username}</small>
                <span
                  style={{
                    fontSize: "10px",
                    padding: "1px 6px",
                    borderRadius: "4px",
                    fontWeight: 600,
                    background: isCrew ? "rgba(100,200,255,0.14)" : "rgba(32,184,120,0.15)",
                    color: isCrew ? "#7cd4fd" : "#8ae7bc",
                    border: `1px solid ${isCrew ? "rgba(100,200,255,0.28)" : "rgba(32,184,120,0.3)"}`,
                  }}
                >
                  {isCrew ? "Crew (Lesen)" : role}
                </span>
              </div>
            </div>
            <ChevronUp size={16} className={`userChevron ${menuOpen ? "rotated" : ""}`} />
          </button>
        </div>
      </aside>
      <main>
        <header className="top glass">
          <div className="search" style={{ cursor: "pointer" }} onClick={() => setPage("files")}>
            ⌕&nbsp; Suche...
          </div>
          <button
            className="avatar"
            style={{ border: "0", cursor: "pointer" }}
            onClick={() => setPage("profile")}
            title={`${displayName} (@${username})`}
          >
            {initial}
          </button>
        </header>
        {children}
      </main>
      <div className="bottom glass">
        <button className={page === "dashboard" ? "active" : ""} onClick={() => setPage("dashboard")}>
          <Home size={20} />
          <span>Home</span>
        </button>
        <button className={page === "chats" ? "active" : ""} onClick={() => setPage("chats")}>
          <MessageCircle size={20} />
          <span>Chat</span>
        </button>
        <button className={page === "tasks" ? "active" : ""} onClick={() => setPage("tasks")}>
          <CheckSquare size={20} />
          <span>Aufgaben</span>
        </button>
        <button className={page === "festival" ? "active" : ""} onClick={() => setPage("festival")}>
          <Music size={20} />
          <span>Festival Hub</span>
        </button>
        <button className={page === "more" ? "active" : ""} onClick={() => setPage("more")}>
          <Menu size={20} />
          <span>Mehr</span>
        </button>
      </div>
    </div>
  );
}
