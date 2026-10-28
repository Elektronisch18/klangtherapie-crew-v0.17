import { useEffect, useState } from "react";
import { RefreshCw, Plus, Clock, LayoutGrid } from "lucide-react";
import ShiftOpsCard from "../components/ShiftOpsCard.tsx";
import CreateShiftModal from "../components/CreateShiftModal.tsx";
import FestivalItemDetailModal from "../components/FestivalItemDetailModal.tsx";
import ShiftTimeline from "../components/ShiftTimeline.tsx";
import { listShifts, listLocations } from "../services/festival.ts";
import { useAuth } from "../contexts/AuthContext.tsx";

// Helper for generating today's timestamps
const makeDate = (hour: number, minute: number = 0, dayOffset: number = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const demoShifts = [
  // HEUTE – Hauptbühne & Einlass
  {
    id: "1",
    title: "Stage Hand Main Floor",
    starts_at: makeDate(8, 0),
    ends_at: makeDate(14, 0),
    capacity: 4,
    needed: 4,
    description: "Line-Check, Kabelmanagement und Mikrofonierung für die ersten Acts.",
    KT_locations: { id: "l1", name: "Main Floor" },
    KT_shift_assignments: [
      { user_id: "a", status: "confirmed", KT_profiles: { display_name: "Max", username: "max" } },
      { user_id: "b", status: "confirmed", KT_profiles: { display_name: "Lena", username: "lena" } },
      { user_id: "c", status: "confirmed", KT_profiles: { display_name: "Sarah", username: "sarah" } },
      { user_id: "d", status: "confirmed", KT_profiles: { display_name: "Kim", username: "kim" } },
    ],
  },
  {
    id: "2",
    title: "Sound & Light Support",
    starts_at: makeDate(14, 0),
    ends_at: makeDate(20, 0),
    capacity: 3,
    needed: 3,
    description: "Support für FoH-Toningenieur und Lichtsteuerung während der Nachmittagsslots.",
    KT_locations: { id: "l1", name: "Main Floor" },
    KT_shift_assignments: [
      { user_id: "a", status: "confirmed", KT_profiles: { display_name: "Max", username: "max" } },
      { user_id: "demo", status: "confirmed", KT_profiles: { display_name: "Du (Crew)", username: "crew" } },
    ],
  },
  {
    id: "3",
    title: "Headliner Stage Support",
    starts_at: makeDate(20, 0),
    ends_at: makeDate(2, 0, 1),
    capacity: 4,
    needed: 4,
    description: "Primetime-Betreuung und schneller Stage-Umbau zwischen den Live-Acts.",
    KT_locations: { id: "l1", name: "Main Floor" },
    KT_shift_assignments: [
      { user_id: "e", status: "confirmed", KT_profiles: { display_name: "Tim", username: "tim" } },
    ],
  },
  // HEUTE – Einlass & Check-in
  {
    id: "4",
    title: "Einlass Frühschicht & Check-in",
    starts_at: makeDate(8, 0),
    ends_at: makeDate(14, 0),
    capacity: 4,
    needed: 4,
    description: "Ticketscan, Altersbändchen und Ausgabe der Müllpfand-Marken am Haupteingang.",
    KT_locations: { id: "l3", name: "Main Gate" },
    KT_shift_assignments: [
      { user_id: "f", status: "confirmed", KT_profiles: { display_name: "Laura", username: "laura" } },
      { user_id: "g", status: "confirmed", KT_profiles: { display_name: "Jonas", username: "jonas" } },
      { user_id: "h", status: "confirmed", KT_profiles: { display_name: "Felix", username: "felix" } },
      { user_id: "i", status: "confirmed", KT_profiles: { display_name: "Anna", username: "anna" } },
    ],
  },
  {
    id: "5",
    title: "Einlass Spätschicht & Kasse",
    starts_at: makeDate(14, 0),
    ends_at: makeDate(22, 0),
    capacity: 5,
    needed: 5,
    description: "Haupteinlass Betreuung, Abendkasse und Koordination der Nachzügler.",
    KT_locations: { id: "l3", name: "Main Gate" },
    KT_shift_assignments: [
      { user_id: "f", status: "confirmed", KT_profiles: { display_name: "Laura", username: "laura" } },
      { user_id: "g", status: "confirmed", KT_profiles: { display_name: "Jonas", username: "jonas" } },
    ],
  },
  // HEUTE – Awareness Point
  {
    id: "6",
    title: "Awareness Tagschicht",
    starts_at: makeDate(10, 0),
    ends_at: makeDate(18, 0),
    capacity: 3,
    needed: 3,
    description: "Rückzugsort und Ansprechpartner für Gäste, Ausgabe von Gehörschutz und Wasser.",
    KT_locations: { id: "l4", name: "Awareness Point" },
    KT_shift_assignments: [
      { user_id: "j", status: "confirmed", KT_profiles: { display_name: "Sarah", username: "sarah" } },
      { user_id: "demo", status: "confirmed", KT_profiles: { display_name: "Du (Crew)", username: "crew" } },
      { user_id: "k", status: "confirmed", KT_profiles: { display_name: "Lisa", username: "lisa" } },
    ],
  },
  {
    id: "7",
    title: "Awareness Nachtschicht",
    starts_at: makeDate(18, 0),
    ends_at: makeDate(2, 0, 1),
    capacity: 4,
    needed: 4,
    description: "Präsenz auf dem Gelände, Begleitung bei Unwohlsein und Koordination mit Sanitätern.",
    KT_locations: { id: "l4", name: "Awareness Point" },
    KT_shift_assignments: [],
  },
  // HEUTE – Bar & Ausschank
  {
    id: "8",
    title: "Bar 1 Tagschicht & Auffüllen",
    starts_at: makeDate(12, 0),
    ends_at: makeDate(18, 0),
    capacity: 4,
    needed: 4,
    description: "Getränkeausschank, Pfandrückgabe und Kassenführung.",
    KT_locations: { id: "l5", name: "Bar 1" },
    KT_shift_assignments: [
      { user_id: "l", status: "confirmed", KT_profiles: { display_name: "Nico", username: "nico" } },
      { user_id: "m", status: "confirmed", KT_profiles: { display_name: "Marie", username: "marie" } },
    ],
  },
  {
    id: "9",
    title: "Bar 1 Peak Hour Nachtschicht",
    starts_at: makeDate(18, 0),
    ends_at: makeDate(3, 0, 1),
    capacity: 5,
    needed: 5,
    description: "Volle Besetzung für die Festival-Primetime an der Haupttheke.",
    KT_locations: { id: "l5", name: "Bar 1" },
    KT_shift_assignments: [
      { user_id: "l", status: "confirmed", KT_profiles: { display_name: "Nico", username: "nico" } },
    ],
  },
  // HEUTE – Backstage Catering
  {
    id: "10",
    title: "Crew Catering & Hospitality",
    starts_at: makeDate(11, 0),
    ends_at: makeDate(17, 0),
    capacity: 3,
    needed: 3,
    description: "Essensausgabe für Crew & Artists, Kaffeebar und Snack-Refill.",
    KT_locations: { id: "l2", name: "Backstage" },
    KT_shift_assignments: [
      { user_id: "n", status: "confirmed", KT_profiles: { display_name: "Kati", username: "kati" } },
      { user_id: "o", status: "confirmed", KT_profiles: { display_name: "Alex", username: "alex" } },
    ],
  },
  // MORGEN – Gelände & Technik
  {
    id: "11",
    title: "Gelände-Rundgang & Müllpfand",
    starts_at: makeDate(9, 0, 1),
    ends_at: makeDate(15, 0, 1),
    capacity: 4,
    needed: 4,
    description: "Pfandmarken-Auszahlung, Müllsäcke-Verteilung auf dem Campingplatz.",
    KT_locations: { id: "l3", name: "Main Gate" },
    KT_shift_assignments: [
      { user_id: "p", status: "confirmed", KT_profiles: { display_name: "Dennis", username: "dennis" } },
    ],
  },
  {
    id: "12",
    title: "Stage Support Tag 2",
    starts_at: makeDate(12, 0, 1),
    ends_at: makeDate(18, 0, 1),
    capacity: 4,
    needed: 4,
    description: "Umbauhilfe und Künstlerbetreuung.",
    KT_locations: { id: "l1", name: "Main Floor" },
    KT_shift_assignments: [],
  },
];

export default function ShiftPlan() {
  const { demo, canEdit } = useAuth();
  const [items, setItems] = useState<any[]>(demoShifts);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"timeline" | "cards">("timeline");

  // Detail & Edit modal state
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    item: any;
    initialMode: "details" | "edit";
  }>({
    isOpen: false,
    item: null,
    initialMode: "details",
  });

  const load = async () => {
    if (demo) {
      setItems(demoShifts);
      return;
    }
    setLoading(true);
    try {
      const [shiftsRes, locsRes] = await Promise.all([listShifts(), listLocations()]);
      if (shiftsRes.data && shiftsRes.data.length > 0) {
        setItems(shiftsRes.data);
      } else {
        setItems(demoShifts);
      }
      if (locsRes.data) {
        setLocations(locsRes.data);
      }
    } catch {
      setItems(demoShifts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [demo]);

  const handleCreated = (newShift?: any) => {
    if (newShift) {
      setItems((prev) => [newShift, ...prev]);
    }
    load();
  };

  const openDetail = (shift: any, mode: "details" | "edit" = "details") => {
    setDetailModal({
      isOpen: true,
      item: shift,
      initialMode: mode,
    });
  };

  const handleUpdated = (updatedShift: any) => {
    setItems((prev) => prev.map((s) => (s.id === updatedShift.id ? updatedShift : s)));
    load();
  };

  const handleDeleted = (deletedId: string) => {
    setItems((prev) => prev.filter((s) => s.id !== deletedId));
    load();
  };

  return (
    <section className="page shiftPlanPage">
      {/* ================= TITELZEILE MIT VIEW TOGGLE ================= */}
      <div className="pageTitleRow">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="eyebrow">FESTIVAL OPS</span>
            {!canEdit && (
              <span
                style={{
                  background: "rgba(255,255,255,0.08)",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "#94a3b8",
                }}
              >
                Crew · Nur Lesen
              </span>
            )}
          </div>
          <h1>Schichtplan</h1>
          <p>Chronologische SchichtenTimeline, Besetzung und Konflikte auf einen Blick.</p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          {/* VIEW SWITCHER */}
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
              className={viewMode === "timeline" ? "primary" : "secondary"}
              style={{
                padding: "6px 12px",
                fontSize: "13px",
                border: "none",
                borderRadius: "7px",
              }}
              onClick={() => setViewMode("timeline")}
            >
              <Clock size={14} style={{ marginRight: "5px" }} /> Timeline
            </button>
            <button
              type="button"
              className={viewMode === "cards" ? "primary" : "secondary"}
              style={{
                padding: "6px 12px",
                fontSize: "13px",
                border: "none",
                borderRadius: "7px",
              }}
              onClick={() => setViewMode("cards")}
            >
              <LayoutGrid size={14} style={{ marginRight: "5px" }} /> Karten
            </button>
          </div>

          {canEdit && (
            <button className="primary" onClick={() => setCreateOpen(true)}>
              <Plus size={16} /> Schicht hinzufügen
            </button>
          )}

          <button className="secondary" onClick={load} title="Aktualisieren">
            <RefreshCw size={16} className={loading ? "spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= HAUPTINHALT ================= */}
      {viewMode === "timeline" ? (
        <ShiftTimeline
          shifts={items}
          locations={locations}
          onSelectShift={(s) => openDetail(s, "details")}
          onEditShift={canEdit ? (s) => openDetail(s, "edit") : undefined}
          onAddShift={canEdit ? () => setCreateOpen(true) : undefined}
          onRefresh={load}
        />
      ) : (
        <>
          <div className="shiftOpsGrid">
            {items.map((s) => (
              <ShiftOpsCard key={s.id} shift={s} onChanged={load} />
            ))}
          </div>

          {!loading && !items.length && (
            <div className="glass emptyState">Noch keine Schichten angelegt.</div>
          )}
        </>
      )}

      {/* Modal zum Anlegen neuer Schichten */}
      <CreateShiftModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      {/* Modal für Schicht-Details & Bearbeiten */}
      {detailModal.item && (
        <FestivalItemDetailModal
          isOpen={detailModal.isOpen}
          onClose={() => setDetailModal((prev) => ({ ...prev, isOpen: false }))}
          type="shift"
          item={detailModal.item}
          locations={locations}
          initialMode={detailModal.initialMode}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </section>
  );
}
