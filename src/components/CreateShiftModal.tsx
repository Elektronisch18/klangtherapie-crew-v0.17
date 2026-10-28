import { useState, useEffect } from "react";
import { X, Clock, MapPin, Users, Plus, AlignLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createShift, listLocations } from "../services/festival";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newShift?: any) => void;
};

const defaultLocations = [
  { id: "1", name: "Main Floor" },
  { id: "2", name: "Forest Stage" },
  { id: "3", name: "Backstage / Artist Care" },
  { id: "4", name: "Awareness Point" },
  { id: "5", name: "Main Gate / Einlass" },
  { id: "6", name: "Camping Check-in" },
];

export default function CreateShiftModal({ isOpen, onClose, onCreated }: Props) {
  const { user, demo } = useAuth();
  const [locations, setLocations] = useState<any[]>(defaultLocations);
  const [title, setTitle] = useState("");
  const [locationId, setLocationId] = useState(defaultLocations[0].id);
  const [needed, setNeeded] = useState(3);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Default start to next full hour, end to 4 hours later
  const now = new Date();
  now.setMinutes(0, 0, 0);
  now.setHours(now.getHours() + 1);
  const defaultStart = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const later = new Date(now.getTime() + 4 * 3600000);
  const defaultEnd = new Date(later.getTime() - later.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [startsAt, setStartsAt] = useState(defaultStart);
  const [endsAt, setEndsAt] = useState(defaultEnd);

  useEffect(() => {
    if (!isOpen) return;
    if (!demo) {
      listLocations()
        .then(({ data }) => {
          if (data && data.length > 0) {
            setLocations(data);
            setLocationId(data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, demo]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const selectedLoc = locations.find((l) => l.id === locationId);

    try {
      const shiftData = {
        title: title.trim(),
        location_id: locationId || null,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        needed: Number(needed) || 1,
        capacity: Number(needed) || 1,
        description: description.trim() || null,
        created_by: user?.id || null,
      };

      if (demo) {
        const mockShift = {
          id: crypto.randomUUID(),
          ...shiftData,
          KT_locations: { name: selectedLoc?.name || "Gelände" },
          KT_shift_assignments: [],
        };
        onCreated(mockShift);
        onClose();
        return;
      }

      const { data, error } = await createShift(shiftData);
      if (error) throw error;

      onCreated(data);
      onClose();
    } catch (err: any) {
      alert("Fehler beim Erstellen der Schicht: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modalback">
      <div className="modal glass" style={{ maxWidth: "520px", width: "95%" }}>
        <button className="close" onClick={onClose} type="button">
          <X size={18} />
        </button>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "18px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "rgba(157,241,202,0.15)",
              color: "#9df1ca",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Clock size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px" }}>Neue Schicht anlegen</h2>
            <small style={{ color: "#8a96a3" }}>Erstelle eine Schicht für Crew-Mitglieder.</small>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
          <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
            Schichttitel *
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Einlass Main Gate, Stage Support, Bar"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#ffffff",
              }}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={14} /> Location / Bereich
              </span>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                style={{
                  background: "#121b19",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  color: "#ffffff",
                }}
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Users size={14} /> Benötigte Crew
              </span>
              <input
                type="number"
                min="1"
                max="50"
                value={needed}
                onChange={(e) => setNeeded(Number(e.target.value))}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  color: "#ffffff",
                }}
              />
            </label>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={14} /> Schichtbeginn *
              </span>
              <input
                type="datetime-local"
                required
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  color: "#ffffff",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={14} /> Schichtende *
              </span>
              <input
                type="datetime-local"
                required
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  color: "#ffffff",
                }}
              />
            </label>
          </div>

          <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <AlignLeft size={14} /> Beschreibung & Hinweise (optional)
            </span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Besondere Anforderungen, Schutzkleidung, Funkkanal..."
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#ffffff",
                resize: "vertical",
              }}
            />
          </label>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
            <button type="button" className="secondary" onClick={onClose}>
              Abbrechen
            </button>
            <button type="submit" className="primary" disabled={loading || !title.trim()}>
              <Plus size={16} /> {loading ? "Wird angelegt…" : "Schicht anlegen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
