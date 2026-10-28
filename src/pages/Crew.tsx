import { useEffect, useMemo, useState } from "react";
import { Search, Users, Phone, ShieldCheck, Circle, Plus, X } from "lucide-react";
import { listCrew } from "../services/crew";
import { createInvitation } from "../services/admin";
import { useAuth } from "../contexts/AuthContext";

const demoCrew = [
  {
    id: "1",
    display_name: "Jana",
    username: "jana",
    phone: "+49 176 111111",
    active: true,
    last_seen: new Date().toISOString(),
    KT_user_roles: [{ KT_roles: { name: "Teamleitung" } }],
    KT_team_members: [{ KT_teams: { name: "Technik" }, is_lead: true }],
  },
  {
    id: "2",
    display_name: "Max T.",
    username: "max",
    phone: "+49 176 222222",
    active: true,
    last_seen: new Date().toISOString(),
    KT_user_roles: [{ KT_roles: { name: "Crew" } }],
    KT_team_members: [{ KT_teams: { name: "Aufbau" } }],
  },
  {
    id: "3",
    display_name: "Sarah",
    username: "sarah",
    active: true,
    last_seen: new Date(Date.now() - 3600000).toISOString(),
    KT_user_roles: [{ KT_roles: { name: "Admin" } }],
    KT_team_members: [{ KT_teams: { name: "Booking" } }],
  },
];

export default function Crew() {
  const { demo, canEdit } = useAuth();
  const [items, setItems] = useState<any[]>(demoCrew);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [team, setTeam] = useState("Technik");
  const [role, setRole] = useState("Crew");

  useEffect(() => {
    if (!demo) {
      listCrew().then(({ data }) => setItems(data || []));
    }
  }, [demo]);

  const filtered = useMemo(
    () =>
      items.filter((x) =>
        (x.display_name + " " + x.username + " " + (x.KT_team_members?.[0]?.KT_teams?.name || ""))
          .toLowerCase()
          .includes(q.toLowerCase())
      ),
    [items, q]
  );

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const handle = username.trim() || name.trim().toLowerCase().replace(/\s+/g, "");
    const newMember = {
      id: crypto.randomUUID(),
      display_name: name.trim(),
      username: handle,
      phone: phone.trim() || undefined,
      active: true,
      last_seen: new Date().toISOString(),
      KT_user_roles: [{ KT_roles: { name: role } }],
      KT_team_members: [{ KT_teams: { name: team }, is_lead: role === "Teamleitung" }],
    };

    if (demo) {
      setItems((prev) => [newMember, ...prev]);
    } else {
      if (email.trim()) {
        const { error } = await createInvitation(email.trim());
        if (error) alert("Einladungs-Fehler: " + error.message);
      }
      setItems((prev) => [newMember, ...prev]);
    }

    // Reset form
    setName("");
    setUsername("");
    setPhone("");
    setEmail("");
    setTeam("Technik");
    setRole("Crew");
    setModal(false);
  };

  return (
    <section className="page">
      <div className="pageTitleRow">
        <div>
          <span className="eyebrow">CREW</span>
          <h1>Crew & Teams</h1>
          <p>Mitglieder, Zuständigkeiten und Erreichbarkeit.</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <label className="crewSearch">
            <Search />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Crew durchsuchen…" />
          </label>
          {canEdit && (
            <button className="primary" onClick={() => setModal(true)}>
              <Plus size={18} /> Crew Mitglied
            </button>
          )}
        </div>
      </div>

      <div className="crewGrid">
        {filtered.map((c) => (
          <article className="crewCard glass" key={c.id}>
            <div className="crewAvatar">
              {c.avatar_url ? <img src={c.avatar_url} alt="" /> : (c.display_name || c.username || "C")[0]}
              <i className={c.active ? "online" : ""} />
            </div>
            <h3>{c.display_name || c.username}</h3>
            <span className="crewHandle">@{c.username}</span>
            <div className="crewBadges">
              <b>
                <Users /> {c.KT_team_members?.[0]?.KT_teams?.name || "Crew"}
              </b>
              <b>
                <ShieldCheck /> {c.KT_user_roles?.[0]?.KT_roles?.name || "Crew"}
              </b>
            </div>
            {c.phone && (
              <a className="crewPhone" href={`tel:${c.phone}`}>
                <Phone /> {c.phone}
              </a>
            )}
            <small className="lastSeen">
              <Circle /> {c.active ? "Aktiv" : "Inaktiv"}
            </small>
          </article>
        ))}
      </div>

      {modal && (
        <div className="modalback">
          <div className="modal glass" style={{ maxWidth: "460px" }}>
            <button className="close" onClick={() => setModal(false)}>
              <X />
            </button>
            <h2>Neues Crew-Mitglied</h2>
            <p style={{ color: "#8a96a3", fontSize: "13px", marginTop: "2px", marginBottom: "16px" }}>
              Lege ein neues Crew-Mitglied an oder versende eine Einladung.
            </p>
            <form onSubmit={handleAddMember} style={{ display: "grid", gap: "12px" }}>
              <label>
                Name / Anzeigename *
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="z. B. Kim Schneider"
                />
              </label>
              <label>
                Benutzername
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="z. B. kim (wird sonst generiert)"
                />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <label>
                  Team
                  <select value={team} onChange={(e) => setTeam(e.target.value)}>
                    <option value="Technik">Technik</option>
                    <option value="Aufbau">Aufbau</option>
                    <option value="Booking">Booking</option>
                    <option value="Awareness">Awareness</option>
                    <option value="Orga">Orga</option>
                    <option value="Gastro">Gastro</option>
                  </select>
                </label>
                <label>
                  Rolle
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="Crew">Crew</option>
                    <option value="Teamleitung">Teamleitung</option>
                    <option value="Admin">Admin</option>
                  </select>
                </label>
              </div>
              <label>
                Telefonnummer (für Einsätze)
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+49 176 ..."
                />
              </label>
              <label>
                E-Mail (optional für Einladungs-Link)
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.de"
                />
              </label>
              <button type="submit" className="primary full" style={{ marginTop: "8px" }}>
                Crew-Mitglied hinzufügen
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
