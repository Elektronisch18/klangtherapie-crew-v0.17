import { useEffect, useState } from "react";
import { Plus, Trash2, Music2, Clock3, MapPin, Eye, Pencil } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import FestivalItemDetailModal, { FestivalItemType } from "../components/FestivalItemDetailModal";
import {
  listShifts,
  listArtists,
  listLocations,
  createShift,
  createArtist,
  createLocation,
  deleteShift,
  deleteArtist,
  deleteLocation,
} from "../services/festival";

export default function FestivalAdmin() {
  const { demo, user } = useAuth();
  const [tab, setTab] = useState<"shifts" | "artists" | "locations">("shifts");
  const [items, setItems] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [title, setTitle] = useState("");

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

  async function load() {
    if (demo) {
      setItems(
        tab === "artists"
          ? [
              { id: "1", name: "DJ Beispiel", genre: "Techno", notes: "CDJ 3000 Setup" },
              { id: "2", name: "Kollektiv Nacht", genre: "Hardgroove", notes: "Live Modular" },
            ]
          : tab === "locations"
          ? [
              { id: "1", name: "Main Floor", description: "Hauptbühne" },
              { id: "2", name: "Backstage", description: "Crew & Artists" },
              { id: "3", name: "Main Gate", description: "Einlass" },
            ]
          : [
              { id: "1", title: "Einlass Main Gate", starts_at: new Date().toISOString(), needed: 4 },
              { id: "2", title: "Stage Support", starts_at: new Date().toISOString(), needed: 3 },
            ]
      );
      setLocations([
        { id: "1", name: "Main Floor" },
        { id: "2", name: "Backstage" },
        { id: "3", name: "Main Gate" },
      ]);
      return;
    }
    const r = tab === "artists" ? await listArtists() : tab === "locations" ? await listLocations() : await listShifts();
    setItems(r.data || []);

    const locs = await listLocations();
    setLocations(locs.data || []);
  }

  useEffect(() => {
    load();
  }, [tab, demo]);

  async function add() {
    if (!title.trim()) return;
    if (demo) {
      setItems((x) => [...x, { id: crypto.randomUUID(), [tab === "shifts" ? "title" : "name"]: title }]);
    } else if (tab === "artists") {
      await createArtist({ name: title });
    } else if (tab === "locations") {
      await createLocation({ name: title });
    } else {
      await createShift({
        title,
        starts_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 4 * 3600000).toISOString(),
        needed: 1,
        created_by: user?.id,
      });
    }
    setTitle("");
    load();
  }

  const openDetail = (item: any, mode: "details" | "edit" = "details") => {
    const itemType: FestivalItemType = tab === "shifts" ? "shift" : tab === "artists" ? "artist" : "location";
    setDetailModal({
      isOpen: true,
      type: itemType,
      item,
      initialMode: mode,
    });
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Eintrag wirklich löschen?")) return;
    if (!demo) {
      if (tab === "shifts") await deleteShift(id);
      else if (tab === "artists") await deleteArtist(id);
      else if (tab === "locations") await deleteLocation(id);
    }
    setItems((v) => v.filter((i) => i.id !== id));
  };

  return (
    <section className="page">
      <div className="titleRow">
        <div>
          <span className="eyebrow">ADMIN · FESTIVAL</span>
          <h1>Festival Hub</h1>
          <p>Schichten, Artists und Gelände zentral pflegen.</p>
        </div>
      </div>

      <div className="festivalTabs">
        {[
          ["shifts", "Schichten"],
          ["artists", "Artists"],
          ["locations", "Locations"],
        ].map(([id, l]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id as any)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="glass quickCreate">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={tab === "shifts" ? "Neue Schicht" : tab === "artists" ? "Artist Name" : "Location Name"}
        />
        <button className="primary" onClick={add}>
          <Plus /> Anlegen
        </button>
      </div>

      <div className="adminFestivalList">
        {items.map((x) => (
          <article className="glass adminFestivalRow" key={x.id}>
            <div
              className="iconBubble"
              style={{ cursor: "pointer" }}
              onClick={() => openDetail(x, "details")}
            >
              {tab === "artists" ? <Music2 /> : tab === "locations" ? <MapPin /> : <Clock3 />}
            </div>
            <div
              style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
              onClick={() => openDetail(x, "details")}
            >
              <h3>{x.title || x.name}</h3>
              <small>
                {x.genre ||
                  x.description ||
                  (x.starts_at ? new Date(x.starts_at).toLocaleString("de-DE") : "Noch keine Details")}
              </small>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                className="iconBtn"
                title="Details ansehen"
                onClick={() => openDetail(x, "details")}
              >
                <Eye size={16} />
              </button>
              <button
                type="button"
                className="iconBtn"
                title="Bearbeiten"
                onClick={() => openDetail(x, "edit")}
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                className="iconBtn"
                title="Löschen"
                style={{ color: "#ff8799" }}
                onClick={() => handleDeleteItem(x.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <FestivalItemDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal((prev) => ({ ...prev, isOpen: false }))}
        type={detailModal.type}
        item={detailModal.item}
        locations={locations}
        initialMode={detailModal.initialMode}
        onUpdated={() => load()}
        onDeleted={() => load()}
      />
    </section>
  );
}
