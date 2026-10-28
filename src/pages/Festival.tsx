import { useEffect, useState } from "react";
import {
  Clock,
  MapPin,
  Music2,
  Phone,
  ShieldAlert,
  Users,
  Plus,
  Eye,
  Pencil,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import StageTimeline from "../components/StageTimeline";
import ShiftTimeline from "../components/ShiftTimeline.tsx";
import AvailabilityCalendar from "../components/AvailabilityCalendar";
import CreateShiftModal from "../components/CreateShiftModal";
import FestivalItemDetailModal, { FestivalItemType } from "../components/FestivalItemDetailModal";
import {
  listShifts,
  listArtists,
  listTimetable,
  listLocations,
  listCrewContacts,
  listEmergencyInfo,
  takeShift,
  leaveShift,
} from "../services/festival";

const demoNow = new Date();
const formatDemoDate = (h: number, dayDelta = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayDelta);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

const demo = {
  shifts: [
    {
      id: "s-today-1",
      title: "Stage Hand & Line Check",
      starts_at: formatDemoDate(10),
      ends_at: formatDemoDate(16),
      needed: 4,
      description: "Support für Künstler-Soundcheck und Line-Check auf der Hauptbühne.",
      KT_locations: { id: "l1", name: "Main Floor" },
      KT_shift_assignments: [{ user_id: "demo", status: "confirmed" }, { user_id: "u1", status: "confirmed" }],
    },
    {
      id: "s-today-2",
      title: "Bar 1 Tagschicht",
      starts_at: formatDemoDate(14),
      ends_at: formatDemoDate(20),
      needed: 4,
      description: "Getränkeausschank und Pfandrückgabe.",
      KT_locations: { id: "l5", name: "Bar 1" },
      KT_shift_assignments: [{ user_id: "u2", status: "confirmed" }, { user_id: "u3", status: "confirmed" }],
    },
    {
      id: "s-today-3",
      title: "Awareness Spätschicht",
      starts_at: formatDemoDate(18),
      ends_at: formatDemoDate(2, 1),
      needed: 3,
      description: "Präsenz auf dem Gelände, Ansprechpartner für Gäste und Crew.",
      KT_locations: { id: "l4", name: "Awareness Point" },
      KT_shift_assignments: [{ user_id: "u4", status: "confirmed" }],
    },
    {
      id: "s1",
      title: "Einlass Main Gate",
      starts_at: "2026-09-25T16:00:00",
      ends_at: "2026-09-25T20:00:00",
      needed: 4,
      description: "Ticketkontrolle, Bändchenausgabe und Gästebetreuung.",
      KT_locations: { id: "l3", name: "Main Gate" },
      KT_shift_assignments: [{ user_id: "demo", status: "confirmed" }],
    },
    {
      id: "s2",
      title: "Stage Support",
      starts_at: "2026-09-25T20:00:00",
      ends_at: "2026-09-26T00:00:00",
      needed: 3,
      description: "Umbauhilfe auf der Hauptbühne, Betreuung der Künstler beim Line-up.",
      KT_locations: { id: "l1", name: "Main Floor" },
      KT_shift_assignments: [],
    },
    {
      id: "s3",
      title: "Awareness Nachtschicht",
      starts_at: "2026-09-26T00:00:00",
      ends_at: "2026-09-26T04:00:00",
      needed: 2,
      description: "Präsenz auf dem Gelände, Anlaufstelle am Zelt und Unterstützung bei Vorfällen.",
      KT_locations: { id: "l4", name: "Awareness Point" },
      KT_shift_assignments: [],
    },
    {
      id: "s4",
      title: "Backstage Hospitality",
      starts_at: "2026-09-26T12:00:00",
      ends_at: "2026-09-26T18:00:00",
      needed: 3,
      description: "Künstlerbetreuung und Verpflegungsausgabe im Backstage-Bereich.",
      KT_locations: { id: "l2", name: "Backstage" },
      KT_shift_assignments: [{ user_id: "u5", status: "confirmed" }, { user_id: "u6", status: "confirmed" }],
    },
  ],
  artists: [
    { id: "a1", name: "DJ Beispiel", genre: "Techno / Hypnotic", notes: "Benötigt 3x CDJ 3000 und Allen&Heath Xone 96" },
    { id: "a2", name: "Kollektiv Nacht", genre: "Hardgroove / Trance", notes: "Live Modular Setup + 2x Monitoring" },
  ],
  timetable: [
    {
      id: "t1",
      starts_at: "2026-09-25T22:00:00",
      ends_at: "2026-09-26T00:00:00",
      KT_artists: { id: "a1", name: "DJ Beispiel" },
      KT_locations: { id: "l1", name: "Main Floor" },
      notes: "Main Stage Primetime Slot",
    },
    {
      id: "t2",
      starts_at: "2026-09-26T00:00:00",
      ends_at: "2026-09-26T02:00:00",
      KT_artists: { id: "a2", name: "Kollektiv Nacht" },
      KT_locations: { id: "l1", name: "Main Floor" },
      notes: "Live Modular Performance",
    },
  ],
  locations: [
    { id: "l1", name: "Main Floor", description: "Hauptbühne mit überdachter Tanzfläche und Visuals." },
    { id: "l2", name: "Backstage", description: "Ruhebereich nur für akkreditierte Crew & Artists." },
    { id: "l3", name: "Main Gate", description: "Zentraler Check-in und Kassenbereich am Haupteingang." },
    { id: "l4", name: "Awareness Point", description: "Rückzugsort und Anlaufstelle für Gäste und Crew." },
  ],
  contacts: [
    { id: "c1", name: "Festivalleitung", role: "Leitung", phone: "+49 176 12345678", email: "leitung@klangtherapie.de" },
    { id: "c2", name: "Awareness Team", role: "Awareness", phone: "+49 176 87654321", email: "awareness@klangtherapie.de" },
  ],
  emergency: [
    { id: "e1", title: "Notruf Rettungsdienst / Feuerwehr", body: "112 (Standort: Festivalgelände Klangtherapie)" },
    { id: "e2", title: "Treffpunkt Crew & Sammelplatz", body: "Backstage / Container 3 neben der Sanitätsstation" },
  ],
};

export default function Festival() {
  const { demo: demoMode, user, canEdit, isCrew } = useAuth();
  const [tab, setTab] = useState("shifts");
  const [shiftView, setShiftView] = useState<"timeline" | "cards">("timeline");
  const [shifts, setShifts] = useState<any[]>(demo.shifts);
  const [artists, setArtists] = useState<any[]>(demo.artists);
  const [tt, setTt] = useState<any[]>(demo.timetable);
  const [locations, setLocations] = useState<any[]>(demo.locations);
  const [contacts, setContacts] = useState<any[]>(demo.contacts);
  const [emergency, setEmergency] = useState<any[]>(demo.emergency);
  const [createOpen, setCreateOpen] = useState(false);

  // Popup state for Details & Edit
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    type: FestivalItemType;
    item: any;
    initialMode: "details" | "edit";
  }>({
    isOpen: false,
    type: "shift",
    item: null,
    initialMode: "details",
  });

  const loadAll = async () => {
    if (demoMode) return;
    const [s, a, t, l, c, e] = await Promise.all([
      listShifts(),
      listArtists(),
      listTimetable(),
      listLocations(),
      listCrewContacts(),
      listEmergencyInfo(),
    ]);
    if (s.data) setShifts(s.data);
    if (a.data) setArtists(a.data);
    if (t.data) setTt(t.data);
    if (l.data) setLocations(l.data);
    if (c.data) setContacts(c.data);
    if (e.data) setEmergency(e.data);
  };

  useEffect(() => {
    loadAll();
  }, [demoMode]);

  const uid = user?.id || "demo";

  async function toggleShift(s: any) {
    const mine = s.KT_shift_assignments?.some((x: any) => x.user_id === uid);
    if (!demoMode) {
      mine ? await leaveShift(s.id, uid) : await takeShift(s.id, uid);
    }
    setShifts((x) =>
      x.map((y) =>
        y.id === s.id
          ? {
              ...y,
              KT_shift_assignments: mine
                ? (y.KT_shift_assignments || []).filter((a: any) => a.user_id !== uid)
                : [...(y.KT_shift_assignments || []), { user_id: uid, status: "confirmed" }],
            }
          : y
      )
    );
  }

  const openDetail = (type: FestivalItemType, item: any, mode: "details" | "edit" = "details") => {
    setDetailModal({
      isOpen: true,
      type,
      item,
      initialMode: canEdit ? mode : "details",
    });
  };

  const handleItemUpdated = (updated: any) => {
    if (!updated?.id) return;
    const { type } = detailModal;
    if (type === "shift") {
      setShifts((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)));
    } else if (type === "timetable") {
      setTt((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    } else if (type === "artist") {
      setArtists((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
    } else if (type === "location") {
      setLocations((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
    } else if (type === "contact") {
      setContacts((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    } else if (type === "emergency") {
      setEmergency((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)));
    }
    loadAll();
  };

  const handleItemDeleted = (deletedId: string) => {
    const { type } = detailModal;
    if (type === "shift") {
      setShifts((prev) => prev.filter((s) => s.id !== deletedId));
    } else if (type === "timetable") {
      setTt((prev) => prev.filter((t) => t.id !== deletedId));
    } else if (type === "artist") {
      setArtists((prev) => prev.filter((a) => a.id !== deletedId));
    } else if (type === "location") {
      setLocations((prev) => prev.filter((l) => l.id !== deletedId));
    } else if (type === "contact") {
      setContacts((prev) => prev.filter((c) => c.id !== deletedId));
    } else if (type === "emergency") {
      setEmergency((prev) => prev.filter((e) => e.id !== deletedId));
    }
    loadAll();
  };

  const tabs = [
    ["shifts", "Schichten"],
    ["timetable", "Timetable"],
    ["artists", "Artists"],
    ["locations", "Gelände"],
    ["contacts", "Kontakte"],
    ["emergency", "Notfall"],
  ];

  return (
    <section className="page festivalPage">
      <div className="titleRow">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span className="eyebrow">KLANGTHERAPIE · FESTIVAL</span>
            {isCrew && (
              <span
                style={{
                  fontSize: "11px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  background: "rgba(100,200,255,0.12)",
                  color: "#7cd4fd",
                  border: "1px solid rgba(100,200,255,0.25)",
                  fontWeight: 600,
                }}
              >
                Crew · Nur Lesen
              </span>
            )}
          </div>
          <h1>Festival Hub</h1>
          <p>Alles Wichtige für Crew und Festivalbetrieb an einem Ort.</p>
        </div>
        {tab === "shifts" && canEdit && (
          <button className="primary" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Schicht hinzufügen
          </button>
        )}
      </div>

      <div className="festivalTabs">
        {tabs.map(([id, label]) => (
          <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>

      {/* ================= 1. REITER: SCHICHTEN ================= */}
      {tab === "shifts" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "10px",
                padding: "3px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <button
                type="button"
                className={shiftView === "timeline" ? "primary" : "secondary"}
                style={{
                  padding: "6px 12px",
                  fontSize: "13px",
                  border: "none",
                  borderRadius: "7px",
                }}
                onClick={() => setShiftView("timeline")}
              >
                <Clock size={14} style={{ marginRight: "5px" }} /> Timeline
              </button>
              <button
                type="button"
                className={shiftView === "cards" ? "primary" : "secondary"}
                style={{
                  padding: "6px 12px",
                  fontSize: "13px",
                  border: "none",
                  borderRadius: "7px",
                }}
                onClick={() => setShiftView("cards")}
              >
                <Users size={14} style={{ marginRight: "5px" }} /> Schicht-Karten
              </button>
            </div>
          </div>

          {shiftView === "timeline" ? (
            <ShiftTimeline
              shifts={shifts}
              locations={locations}
              onSelectShift={(s) => openDetail("shift", s, "details")}
              onEditShift={canEdit ? (s) => openDetail("shift", s, "edit") : undefined}
              onAddShift={canEdit ? () => setCreateOpen(true) : undefined}
              onRefresh={loadAll}
            />
          ) : (
            <>
              <AvailabilityCalendar />
              <div className="festivalGrid">
            {shifts.map((s) => {
              const mine = s.KT_shift_assignments?.some((x: any) => x.user_id === uid);
              return (
                <article className="festivalCard glass" key={s.id}>
                  <div
                    className="iconBubble"
                    style={{ cursor: "pointer" }}
                    onClick={() => openDetail("shift", s, "details")}
                    title="Details ansehen"
                  >
                    <Users />
                  </div>
                  <div
                    style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                    onClick={() => openDetail("shift", s, "details")}
                  >
                    <span className="eyebrow">{s.KT_locations?.name || "Location"}</span>
                    <h3>{s.title}</h3>
                    <p>
                      <Clock size={14} />
                      {new Date(s.starts_at).toLocaleString("de-DE", {
                        weekday: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      –{" "}
                      {new Date(s.ends_at).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <small>
                      {s.KT_shift_assignments?.length || 0} / {s.needed || "?"} besetzt
                    </small>
                  </div>
                  <div className="cardActionGroup">
                    <button
                      type="button"
                      className="iconActionBtn"
                      title="Details ansehen"
                      onClick={() => openDetail("shift", s, "details")}
                    >
                      <Eye size={15} />
                    </button>
                    {canEdit && (
                      <button
                        type="button"
                        className="iconActionBtn"
                        title="Bearbeiten"
                        onClick={() => openDetail("shift", s, "edit")}
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      className={mine ? "secondary" : "primary"}
                      onClick={() => toggleShift(s)}
                    >
                      {mine ? "Austragen" : "Übernehmen"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  )}

      {/* ================= 2. REITER: TIMETABLE ================= */}
      {tab === "timetable" && (
        <>
          <StageTimeline entries={tt} />
          <div className="timeline">
            {tt.map((x) => (
              <article className="timelineRow glass" key={x.id}>
                <b>
                  {new Date(x.starts_at).toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </b>
                <div
                  style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                  onClick={() => openDetail("timetable", x, "details")}
                >
                  <span className="eyebrow">{x.KT_locations?.name || "Stage"}</span>
                  <h3 style={{ margin: "2px 0" }}>{x.KT_artists?.name || x.title || "Artist"}</h3>
                  <small style={{ color: "#8a9792" }}>
                    bis{" "}
                    {new Date(x.ends_at).toLocaleTimeString("de-DE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
                <div className="cardActionGroup">
                  <button
                    type="button"
                    className="iconActionBtn"
                    title="Details ansehen"
                    onClick={() => openDetail("timetable", x, "details")}
                  >
                    <Eye size={15} />
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      className="iconActionBtn"
                      title="Bearbeiten"
                      onClick={() => openDetail("timetable", x, "edit")}
                    >
                      <Pencil size={15} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* ================= 3. REITER: ARTISTS ================= */}
      {tab === "artists" && (
        <div className="festivalGrid">
          {artists.map((a) => (
            <article className="festivalCard glass" key={a.id}>
              <div
                className="iconBubble"
                style={{ cursor: "pointer" }}
                onClick={() => openDetail("artist", a, "details")}
                title="Details ansehen"
              >
                <Music2 />
              </div>
              <div
                style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                onClick={() => openDetail("artist", a, "details")}
              >
                <h3>{a.name}</h3>
                <p>{a.genre || "Artist"}</p>
              </div>
              <div className="cardActionGroup">
                <button
                  type="button"
                  className="iconActionBtn"
                  title="Details ansehen"
                  onClick={() => openDetail("artist", a, "details")}
                >
                  <Eye size={15} />
                </button>
                {canEdit && (
                  <button
                    type="button"
                    className="iconActionBtn"
                    title="Bearbeiten"
                    onClick={() => openDetail("artist", a, "edit")}
                  >
                    <Pencil size={15} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ================= 4. REITER: GELÄNDE (LOCATIONS) ================= */}
      {tab === "locations" && (
        <div className="festivalGrid">
          {locations.map((l) => (
            <article className="festivalCard glass" key={l.id}>
              <div
                className="iconBubble"
                style={{ cursor: "pointer" }}
                onClick={() => openDetail("location", l, "details")}
                title="Details ansehen"
              >
                <MapPin />
              </div>
              <div
                style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                onClick={() => openDetail("location", l, "details")}
              >
                <h3>{l.name}</h3>
                <p>{l.description || "Festival-Bereich"}</p>
              </div>
              <div className="cardActionGroup">
                <button
                  type="button"
                  className="iconActionBtn"
                  title="Details ansehen"
                  onClick={() => openDetail("location", l, "details")}
                >
                  <Eye size={15} />
                </button>
                {canEdit && (
                  <button
                    type="button"
                    className="iconActionBtn"
                    title="Bearbeiten"
                    onClick={() => openDetail("location", l, "edit")}
                  >
                    <Pencil size={15} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ================= 5. REITER: KONTAKTE ================= */}
      {tab === "contacts" && (
        <div className="festivalGrid">
          {contacts.map((c) => (
            <article className="festivalCard glass" key={c.id}>
              <div
                className="iconBubble"
                style={{ cursor: "pointer" }}
                onClick={() => openDetail("contact", c, "details")}
                title="Details ansehen"
              >
                <Phone />
              </div>
              <div
                style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                onClick={() => openDetail("contact", c, "details")}
              >
                <span className="eyebrow">{c.role || "Kontakt"}</span>
                <h3>{c.name}</h3>
                <p>{c.phone || "Keine Telefonnummer"}</p>
              </div>
              <div className="cardActionGroup">
                <button
                  type="button"
                  className="iconActionBtn"
                  title="Details ansehen"
                  onClick={() => openDetail("contact", c, "details")}
                >
                  <Eye size={15} />
                </button>
                {canEdit && (
                  <button
                    type="button"
                    className="iconActionBtn"
                    title="Bearbeiten"
                    onClick={() => openDetail("contact", c, "edit")}
                  >
                    <Pencil size={15} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ================= 6. REITER: NOTFALL ================= */}
      {tab === "emergency" && (
        <div className="festivalGrid">
          {emergency.map((e) => (
            <article className="festivalCard emergency glass" key={e.id}>
              <div
                className="iconBubble"
                style={{ cursor: "pointer" }}
                onClick={() => openDetail("emergency", e, "details")}
                title="Details ansehen"
              >
                <ShieldAlert />
              </div>
              <div
                style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                onClick={() => openDetail("emergency", e, "details")}
              >
                <h3>{e.title}</h3>
                <p>{e.body}</p>
              </div>
              <div className="cardActionGroup">
                <button
                  type="button"
                  className="iconActionBtn"
                  title="Details ansehen"
                  onClick={() => openDetail("emergency", e, "details")}
                >
                  <Eye size={15} />
                </button>
                {canEdit && (
                  <button
                    type="button"
                    className="iconActionBtn"
                    title="Bearbeiten"
                    onClick={() => openDetail("emergency", e, "edit")}
                  >
                    <Pencil size={15} />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal: Neue Schicht anlegen */}
      <CreateShiftModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(newS) => {
          if (newS) setShifts((prev) => [newS, ...prev]);
          loadAll();
        }}
      />

      {/* Modal: Details & Bearbeiten mit ICONs für alle 6 Kategorien (mobil optimiert) */}
      <FestivalItemDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal((prev) => ({ ...prev, isOpen: false }))}
        type={detailModal.type}
        item={detailModal.item}
        locations={locations}
        artists={artists}
        initialMode={detailModal.initialMode}
        onUpdated={handleItemUpdated}
        onDeleted={handleItemDeleted}
      />
    </section>
  );
}
