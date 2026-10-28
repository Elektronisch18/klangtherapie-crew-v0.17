import { useState, useEffect } from "react";
import {
  X,
  Eye,
  Pencil,
  Clock,
  MapPin,
  Users,
  Music2,
  Trash2,
  Save,
  AlignLeft,
  Tag,
  Phone,
  Mail,
  ShieldAlert,
  CalendarDays,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  updateShift,
  deleteShift,
  updateTimetableEntry,
  deleteTimetableEntry,
  updateArtist,
  deleteArtist,
  updateLocation,
  deleteLocation,
  updateCrewContact,
  deleteCrewContact,
  updateEmergencyInfo,
  deleteEmergencyInfo,
} from "../services/festival";

export type FestivalItemType = "shift" | "timetable" | "artist" | "location" | "contact" | "emergency";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  type: FestivalItemType;
  item: any;
  locations?: any[];
  artists?: any[];
  onUpdated: (updatedItem: any) => void;
  onDeleted?: (itemId: string) => void;
  initialMode?: "details" | "edit";
};

export default function FestivalItemDetailModal({
  isOpen,
  onClose,
  type,
  item,
  locations = [],
  artists = [],
  onUpdated,
  onDeleted,
  initialMode = "details",
}: Props) {
  const { demo, canEdit } = useAuth();
  const [mode, setMode] = useState<"details" | "edit">(canEdit ? initialMode : "details");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // States for Shift
  const [title, setTitle] = useState("");
  const [locationId, setLocationId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [needed, setNeeded] = useState(3);
  const [description, setDescription] = useState("");

  // States for Timetable
  const [timetableArtistId, setTimetableArtistId] = useState("");
  const [timetableLocId, setTimetableLocId] = useState("");
  const [timetableNotes, setTimetableNotes] = useState("");

  // States for Artist
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const [artistNotes, setArtistNotes] = useState("");

  // States for Location
  const [locationName, setLocationName] = useState("");
  const [locationDesc, setLocationDesc] = useState("");

  // States for Contact
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // States for Emergency
  const [emergencyTitle, setEmergencyTitle] = useState("");
  const [emergencyBody, setEmergencyBody] = useState("");

  useEffect(() => {
    if (!item) return;
    setMode(initialMode);
    setErrorMsg("");

    if (type === "shift") {
      setTitle(item.title || "");
      setLocationId(item.location_id || item.KT_locations?.id || "");
      if (item.starts_at) {
        const s = new Date(item.starts_at);
        setStartsAt(new Date(s.getTime() - s.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      }
      if (item.ends_at) {
        const e = new Date(item.ends_at);
        setEndsAt(new Date(e.getTime() - e.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      }
      setNeeded(item.needed || item.capacity || 3);
      setDescription(item.description || "");
    } else if (type === "timetable") {
      setTimetableArtistId(item.artist_id || item.KT_artists?.id || "");
      setTimetableLocId(item.location_id || item.KT_locations?.id || "");
      if (item.starts_at) {
        const s = new Date(item.starts_at);
        setStartsAt(new Date(s.getTime() - s.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      }
      if (item.ends_at) {
        const e = new Date(item.ends_at);
        setEndsAt(new Date(e.getTime() - e.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      }
      setTimetableNotes(item.notes || "");
    } else if (type === "artist") {
      setArtistName(item.name || "");
      setGenre(item.genre || "");
      setArtistNotes(item.notes || "");
    } else if (type === "location") {
      setLocationName(item.name || "");
      setLocationDesc(item.description || "");
    } else if (type === "contact") {
      setContactName(item.name || "");
      setContactRole(item.role || "");
      setContactPhone(item.phone || "");
      setContactEmail(item.email || "");
    } else if (type === "emergency") {
      setEmergencyTitle(item.title || "");
      setEmergencyBody(item.body || "");
    }
  }, [item, type, initialMode, isOpen, canEdit]);

  if (!isOpen || !item) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    setLoading(true);
    setErrorMsg("");

    try {
      if (type === "shift") {
        const selectedLoc = locations.find((l) => l.id === locationId);
        const updateData: any = {
          title: title.trim(),
          location_id: locationId || null,
          starts_at: new Date(startsAt).toISOString(),
          ends_at: new Date(endsAt).toISOString(),
          needed: Number(needed) || 1,
          capacity: Number(needed) || 1,
          description: description.trim() || null,
        };

        if (demo) {
          const updated = {
            ...item,
            ...updateData,
            KT_locations: selectedLoc ? { name: selectedLoc.name } : item.KT_locations,
          };
          onUpdated(updated);
          setMode("details");
          return;
        }

        const { data } = await updateShift(item.id, updateData);
        onUpdated(data || { ...item, ...updateData });
        setMode("details");
      } else if (type === "timetable") {
        const selectedArt = artists.find((a) => a.id === timetableArtistId);
        const selectedLoc = locations.find((l) => l.id === timetableLocId);
        const updateData: any = {
          artist_id: timetableArtistId || null,
          location_id: timetableLocId || null,
          starts_at: new Date(startsAt).toISOString(),
          ends_at: new Date(endsAt).toISOString(),
          notes: timetableNotes.trim() || null,
        };

        if (demo) {
          const updated = {
            ...item,
            ...updateData,
            KT_artists: selectedArt ? { name: selectedArt.name } : item.KT_artists,
            KT_locations: selectedLoc ? { name: selectedLoc.name } : item.KT_locations,
          };
          onUpdated(updated);
          setMode("details");
          return;
        }

        const { data } = await updateTimetableEntry(item.id, updateData);
        onUpdated(data || { ...item, ...updateData });
        setMode("details");
      } else if (type === "artist") {
        const updateData = {
          name: artistName.trim(),
          genre: genre.trim() || undefined,
          notes: artistNotes.trim() || undefined,
        };

        if (demo) {
          const updated = { ...item, ...updateData };
          onUpdated(updated);
          setMode("details");
          return;
        }

        const { data } = await updateArtist(item.id, updateData);
        onUpdated(data || { ...item, ...updateData });
        setMode("details");
      } else if (type === "location") {
        const updateData = {
          name: locationName.trim(),
          description: locationDesc.trim() || undefined,
        };

        if (demo) {
          const updated = { ...item, ...updateData };
          onUpdated(updated);
          setMode("details");
          return;
        }

        const { data } = await updateLocation(item.id, updateData);
        onUpdated(data || { ...item, ...updateData });
        setMode("details");
      } else if (type === "contact") {
        const updateData = {
          name: contactName.trim(),
          role: contactRole.trim() || null,
          phone: contactPhone.trim() || null,
          email: contactEmail.trim() || null,
        };

        if (demo) {
          const updated = { ...item, ...updateData };
          onUpdated(updated);
          setMode("details");
          return;
        }

        const { data } = await updateCrewContact(item.id, updateData);
        onUpdated(data || { ...item, ...updateData });
        setMode("details");
      } else if (type === "emergency") {
        const updateData = {
          title: emergencyTitle.trim(),
          body: emergencyBody.trim(),
        };

        if (demo) {
          const updated = { ...item, ...updateData };
          onUpdated(updated);
          setMode("details");
          return;
        }

        const { data } = await updateEmergencyInfo(item.id, updateData);
        onUpdated(data || { ...item, ...updateData });
        setMode("details");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Speichern fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canEdit) return;
    const labels: Record<FestivalItemType, string> = {
      shift: "Schicht",
      timetable: "Timetable-Eintrag",
      artist: "Artist",
      location: "Location",
      contact: "Kontakt",
      emergency: "Notfalleintrag",
    };
    const label = labels[type] || "Eintrag";
    if (!confirm(`Möchtest du diesen Eintrag (${label}) wirklich löschen?`)) return;

    setLoading(true);
    try {
      if (!demo) {
        if (type === "shift") await deleteShift(item.id);
        else if (type === "timetable") await deleteTimetableEntry(item.id);
        else if (type === "artist") await deleteArtist(item.id);
        else if (type === "location") await deleteLocation(item.id);
        else if (type === "contact") await deleteCrewContact(item.id);
        else if (type === "emergency") await deleteEmergencyInfo(item.id);
      }
      onDeleted?.(item.id);
      onClose();
    } catch (err: any) {
      alert("Löschen fehlgeschlagen: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const typeLabels: Record<FestivalItemType, string> = {
    shift: "SCHICHT",
    timetable: "TIMETABLE",
    artist: "ARTIST",
    location: "GELÄNDE / LOCATION",
    contact: "KONTAKT",
    emergency: "NOTFALL-INFO",
  };
  const typeLabel = typeLabels[type];
  const typeTitle =
    item.title || item.name || item.KT_artists?.name || (type === "timetable" ? "Stage Slot" : "Eintrag");

  return (
    <div className="modalback">
      <div
        className="modal glass festivalDetailModal"
        style={{
          width: "min(560px, 94vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "24px",
          borderRadius: "20px",
          position: "relative",
        }}
      >
        <button className="close" onClick={onClose} type="button" title="Schließen">
          <X size={18} />
        </button>

        {/* Modal Header mit Typ & Toggle Tabs (Details / Bearbeiten) */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            paddingBottom: "14px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background:
                  type === "shift"
                    ? "rgba(157,241,202,0.16)"
                    : type === "timetable" || type === "artist"
                    ? "rgba(125,91,255,0.16)"
                    : type === "location"
                    ? "rgba(245,186,59,0.16)"
                    : type === "contact"
                    ? "rgba(91,180,255,0.16)"
                    : "rgba(255,90,115,0.16)",
                color:
                  type === "shift"
                    ? "#9df1ca"
                    : type === "timetable" || type === "artist"
                    ? "#bbaeff"
                    : type === "location"
                    ? "#f5ba3b"
                    : type === "contact"
                    ? "#8acdff"
                    : "#ff8da0",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
              }}
            >
              {type === "shift" && <Clock size={20} />}
              {type === "timetable" && <CalendarDays size={20} />}
              {type === "artist" && <Music2 size={20} />}
              {type === "location" && <MapPin size={20} />}
              {type === "contact" && <Phone size={20} />}
              {type === "emergency" && <ShieldAlert size={20} />}
            </div>
            <div>
              <span className="eyebrow" style={{ fontSize: "10px" }}>{typeLabel}</span>
              <h2 style={{ margin: 0, fontSize: "18px", wordBreak: "break-word" }}>{typeTitle}</h2>
            </div>
          </div>

          {/* Icon Tabs: Details & Bearbeiten */}
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "rgba(255,255,255,0.06)",
              padding: "3px",
              borderRadius: "10px",
            }}
          >
            <button
              type="button"
              className={`detailTabBtn ${mode === "details" ? "active" : ""}`}
              onClick={() => setMode("details")}
              style={{
                border: 0,
                background: mode === "details" ? "rgba(255,255,255,0.15)" : "transparent",
                color: mode === "details" ? "#ffffff" : "#8a96a3",
                padding: "7px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                fontWeight: mode === "details" ? 600 : 400,
              }}
            >
              <Eye size={15} /> Details
            </button>
            {canEdit ? (
              <button
                type="button"
                className={`detailTabBtn ${mode === "edit" ? "active" : ""}`}
                onClick={() => setMode("edit")}
                style={{
                  border: 0,
                  background: mode === "edit" ? "rgba(125,91,255,0.25)" : "transparent",
                  color: mode === "edit" ? "#bbaeff" : "#8a96a3",
                  padding: "7px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontWeight: mode === "edit" ? 600 : 400,
                }}
              >
                <Pencil size={15} /> Bearbeiten
              </button>
            ) : (
              <span
                style={{
                  fontSize: "11px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "rgba(100,200,255,0.12)",
                  color: "#7cd4fd",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Nur Lesen
              </span>
            )}
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "10px",
              marginBottom: "14px",
              background: "rgba(255,90,115,0.15)",
              color: "#ff9baa",
              display: "flex",
              gap: "7px",
              alignItems: "center",
              fontSize: "12px",
            }}
          >
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ================= MODUS: DETAILS ================= */}
        {mode === "details" && (
          <div style={{ display: "grid", gap: "16px" }}>
            {type === "shift" && (
              <>
                <div className="glass" style={{ padding: "14px", borderRadius: "14px", display: "grid", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a5b5ae", fontSize: "13px" }}>
                    <MapPin size={16} color="#8ae7bc" />
                    <b>Location:</b>
                    <span>{item.KT_locations?.name || "Keine Location hinterlegt"}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a5b5ae", fontSize: "13px" }}>
                    <Clock size={16} color="#9aa7ff" />
                    <b>Zeitraum:</b>
                    <span>
                      {item.starts_at
                        ? `${new Date(item.starts_at).toLocaleString("de-DE", {
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })} – ${new Date(item.ends_at).toLocaleTimeString("de-DE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "Keine Zeiten definiert"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a5b5ae", fontSize: "13px" }}>
                    <Users size={16} color="#f5ba3b" />
                    <b>Besetzung:</b>
                    <span>
                      {item.KT_shift_assignments?.length || 0} von {item.needed || item.capacity || "?"} Plätzen belegt
                    </span>
                  </div>
                </div>

                {item.description && (
                  <div className="glass" style={{ padding: "14px", borderRadius: "14px" }}>
                    <b style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#8a96a3", marginBottom: "6px" }}>
                      <AlignLeft size={14} /> Beschreibung & Hinweise
                    </b>
                    <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.5", color: "#e1e7e4", whiteSpace: "pre-wrap" }}>
                      {item.description}
                    </p>
                  </div>
                )}
              </>
            )}

            {type === "timetable" && (
              <>
                <div className="glass" style={{ padding: "14px", borderRadius: "14px", display: "grid", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a5b5ae", fontSize: "13px" }}>
                    <Music2 size={16} color="#bbaeff" />
                    <b>Act / Artist:</b>
                    <span>{item.KT_artists?.name || item.title || "Artist"}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a5b5ae", fontSize: "13px" }}>
                    <MapPin size={16} color="#f5ba3b" />
                    <b>Bühne / Stage:</b>
                    <span>{item.KT_locations?.name || "Bühne nicht angegeben"}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a5b5ae", fontSize: "13px" }}>
                    <Clock size={16} color="#8ae7bc" />
                    <b>Slot:</b>
                    <span>
                      {item.starts_at
                        ? `${new Date(item.starts_at).toLocaleTimeString("de-DE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })} – ${new Date(item.ends_at).toLocaleTimeString("de-DE", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "Keine Slotzeiten"}
                    </span>
                  </div>
                </div>

                {item.notes && (
                  <div className="glass" style={{ padding: "14px", borderRadius: "14px" }}>
                    <b style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#8a96a3", marginBottom: "6px" }}>
                      <AlignLeft size={14} /> Notizen & Ablauf
                    </b>
                    <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.5", color: "#e1e7e4", whiteSpace: "pre-wrap" }}>
                      {item.notes}
                    </p>
                  </div>
                )}
              </>
            )}

            {type === "artist" && (
              <>
                <div className="glass" style={{ padding: "14px", borderRadius: "14px", display: "grid", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a5b5ae", fontSize: "13px" }}>
                    <Tag size={16} color="#bbaeff" />
                    <b>Genre / Stil:</b>
                    <span>{item.genre || "Kein Genre angegeben"}</span>
                  </div>
                </div>

                {item.notes && (
                  <div className="glass" style={{ padding: "14px", borderRadius: "14px" }}>
                    <b style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#8a96a3", marginBottom: "6px" }}>
                      <AlignLeft size={14} /> Rider & Notizen
                    </b>
                    <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.5", color: "#e1e7e4", whiteSpace: "pre-wrap" }}>
                      {item.notes}
                    </p>
                  </div>
                )}
              </>
            )}

            {type === "location" && (
              <>
                <div className="glass" style={{ padding: "14px", borderRadius: "14px", display: "grid", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a5b5ae", fontSize: "13px" }}>
                    <MapPin size={16} color="#f5ba3b" />
                    <b>Bereich:</b>
                    <span>{item.name}</span>
                  </div>
                </div>

                <div className="glass" style={{ padding: "14px", borderRadius: "14px" }}>
                  <b style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#8a96a3", marginBottom: "6px" }}>
                    <AlignLeft size={14} /> Beschreibung
                  </b>
                  <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.5", color: "#e1e7e4", whiteSpace: "pre-wrap" }}>
                    {item.description || "Keine nähere Beschreibung hinterlegt."}
                  </p>
                </div>
              </>
            )}

            {type === "contact" && (
              <div className="glass" style={{ padding: "14px", borderRadius: "14px", display: "grid", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a5b5ae", fontSize: "13px" }}>
                  <UserCheck size={16} color="#bbaeff" />
                  <b>Rolle / Funktion:</b>
                  <span>{item.role || "Crew Kontakt"}</span>
                </div>

                {item.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a5b5ae", fontSize: "13px" }}>
                    <Phone size={16} color="#8ae7bc" />
                    <b>Telefon:</b>
                    <a href={`tel:${item.phone}`} style={{ color: "#9df1ca", textDecoration: "none" }}>
                      {item.phone}
                    </a>
                  </div>
                )}

                {item.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a5b5ae", fontSize: "13px" }}>
                    <Mail size={16} color="#8acdff" />
                    <b>E-Mail:</b>
                    <a href={`mailto:${item.email}`} style={{ color: "#8acdff", textDecoration: "none" }}>
                      {item.email}
                    </a>
                  </div>
                )}
              </div>
            )}

            {type === "emergency" && (
              <div className="glass" style={{ padding: "14px", borderRadius: "14px", display: "grid", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff8da0", fontSize: "14px", fontWeight: 700 }}>
                  <ShieldAlert size={18} />
                  <span>{item.title}</span>
                </div>
                <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#ffffff", lineHeight: "1.5" }}>
                  {item.body}
                </p>
              </div>
            )}

            {/* Mobile-Friendly Action Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "8px",
                marginTop: "10px",
                paddingTop: "12px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {onDeleted && canEdit && (
                <button
                  type="button"
                  className="secondary"
                  onClick={handleDelete}
                  disabled={loading}
                  style={{ color: "#ff8799", borderColor: "rgba(255,90,115,0.25)" }}
                >
                  <Trash2 size={15} /> Löschen
                </button>
              )}
              {canEdit && (
                <button
                  type="button"
                  className="primary"
                  onClick={() => setMode("edit")}
                  style={{ marginLeft: "auto" }}
                >
                  <Pencil size={15} /> Bearbeiten
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= MODUS: BEARBEITEN ================= */}
        {mode === "edit" && (
          <form onSubmit={handleSave} style={{ display: "grid", gap: "14px" }}>
            {type === "shift" && (
              <>
                <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                  Schichttitel *
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={14} /> Location
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
                      <option value="">Keine Auswahl</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Users size={14} /> Benötigt
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

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={14} /> Beginn
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
                      <Clock size={14} /> Ende
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
                    <AlignLeft size={14} /> Beschreibung & Aufgaben
                  </span>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>
              </>
            )}

            {type === "timetable" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Music2 size={14} /> Act / Artist
                    </span>
                    <select
                      value={timetableArtistId}
                      onChange={(e) => setTimetableArtistId(e.target.value)}
                      style={{
                        background: "#121b19",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        color: "#ffffff",
                      }}
                    >
                      <option value="">Keine Auswahl</option>
                      {artists.map((art) => (
                        <option key={art.id} value={art.id}>
                          {art.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <MapPin size={14} /> Bühne / Stage
                    </span>
                    <select
                      value={timetableLocId}
                      onChange={(e) => setTimetableLocId(e.target.value)}
                      style={{
                        background: "#121b19",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        color: "#ffffff",
                      }}
                    >
                      <option value="">Keine Auswahl</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={14} /> Beginn
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
                      <Clock size={14} /> Ende
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
                    <AlignLeft size={14} /> Notizen & Ablauf
                  </span>
                  <textarea
                    rows={3}
                    value={timetableNotes}
                    onChange={(e) => setTimetableNotes(e.target.value)}
                    placeholder="Besonderheiten, Line-check, Rider..."
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>
              </>
            )}

            {type === "artist" && (
              <>
                <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                  Künstlername *
                  <input
                    required
                    type="text"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                  Genre / Stil
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="z.B. Techno, Hardgroove, Ambient"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                  Rider & Notizen
                  <textarea
                    rows={3}
                    value={artistNotes}
                    onChange={(e) => setArtistNotes(e.target.value)}
                    placeholder="Technische Anforderungen, Hospitality, Ansprechpartner..."
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>
              </>
            )}

            {type === "location" && (
              <>
                <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                  Location-Name *
                  <input
                    required
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                  Beschreibung
                  <textarea
                    rows={3}
                    value={locationDesc}
                    onChange={(e) => setLocationDesc(e.target.value)}
                    placeholder="Lage, Zweck, Besonderheiten..."
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>
              </>
            )}

            {type === "contact" && (
              <>
                <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                  Name *
                  <input
                    required
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                  Rolle / Team / Zuständigkeit
                  <input
                    type="text"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    placeholder="z.B. Leitung, Technik, Awareness"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                  Telefonnummer
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+49 176 ..."
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                  E-Mail
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="kontakt@klangtherapie.de"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>
              </>
            )}

            {type === "emergency" && (
              <>
                <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                  Notfall-Titel *
                  <input
                    required
                    type="text"
                    value={emergencyTitle}
                    onChange={(e) => setEmergencyTitle(e.target.value)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>

                <label style={{ display: "grid", gap: "6px", fontSize: "13px", color: "#9ca8a4" }}>
                  Notfall-Nummer / Anweisungen / Info *
                  <textarea
                    required
                    rows={3}
                    value={emergencyBody}
                    onChange={(e) => setEmergencyBody(e.target.value)}
                    placeholder="z.B. 112 oder Sammelplatz Backstage Container"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                      padding: "10px 14px",
                      color: "#ffffff",
                    }}
                  />
                </label>
              </>
            )}

            {/* Mobile-Friendly Edit Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "10px",
                paddingTop: "12px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <button
                type="button"
                className="secondary"
                onClick={() => setMode("details")}
                disabled={loading}
              >
                Abbrechen
              </button>
              <button type="submit" className="primary" disabled={loading}>
                <Save size={16} /> {loading ? "Wird gespeichert…" : "Speichern"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
