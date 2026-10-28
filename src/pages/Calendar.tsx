import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  X,
} from "lucide-react";
import {
  createCalendarEvent,
  getCalendarFeed,
} from "../services/calendar.ts";
import { useAuth } from "../contexts/AuthContext.tsx";

type Item = {
  id: string;
  title: string;
  start: string;
  end?: string;
  type: string;
  location?: string;
};

const colors: Record<string, string> = {
  event: "Termin",
  shift: "Schicht",
  timetable: "Timetable",
  task: "Aufgabe",
};

export default function Calendar() {
  const { user, demo } = useAuth();
  const [cursor, setCursor] = useState(new Date());
  const [items, setItems] = useState<Item[]>([]);
  const [create, setCreate] = useState(false);

  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const end = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  const now = new Date();

  const load = async () => {
    if (demo) {
      const d = (day: number, h: number) =>
        new Date(cursor.getFullYear(), cursor.getMonth(), day, h).toISOString();
      setItems([
        {
          id: "e1",
          title: "Crew Meeting",
          start: d(4, 18),
          type: "event",
          location: "Backstage",
        },
        {
          id: "s1",
          title: "Stage Support",
          start: d(7, 20),
          end: d(8, 2),
          type: "shift",
          location: "Main Floor",
        },
        {
          id: "t1",
          title: "Klangkuenstler",
          start: d(7, 23),
          type: "timetable",
          location: "Main Floor",
        },
        {
          id: "a1",
          title: "Lichtcheck abschließen",
          start: d(6, 17),
          type: "task",
        },
        {
          id: "s2",
          title: "Awareness Schicht",
          start: d(12, 14),
          end: d(12, 20),
          type: "shift",
          location: "Awareness Point",
        },
        {
          id: "e2",
          title: "Abbau-Besprechung",
          start: d(15, 10),
          type: "event",
          location: "Backstage",
        },
      ]);
      return;
    }
    if (!user) return;
    try {
      const r = await getCalendarFeed(
        start.toISOString(),
        end.toISOString(),
        user.id
      );
      const all: Item[] = [
        ...r.events.map((x: any) => ({
          id: x.id,
          title: x.title,
          start: x.starts_at,
          end: x.ends_at,
          type: "event",
          location: x.KT_locations?.name || x.location_text,
        })),
        ...r.shifts
          .filter((x: any) => x.KT_shifts)
          .map((x: any) => ({
            id: x.KT_shifts.id,
            title: x.KT_shifts.title,
            start: x.KT_shifts.starts_at,
            end: x.KT_shifts.ends_at,
            type: "shift",
            location: x.KT_shifts.KT_locations?.name,
          })),
        ...r.timetable.map((x: any) => ({
          id: x.id,
          title: x.KT_artists?.name || "Timetable",
          start: x.starts_at,
          end: x.ends_at,
          type: "timetable",
          location: x.KT_locations?.name,
        })),
        ...r.tasks.map((x: any) => ({
          id: x.id,
          title: x.title,
          start: x.due_at,
          type: "task",
        })),
      ];
      setItems(all);
    } catch (e) {
      console.error("Fehler beim Laden des Kalender-Feeds:", e);
    }
  };

  useEffect(() => {
    load();
  }, [cursor, user?.id, demo]);

  const days = useMemo(() => {
    const first = (start.getDay() + 6) % 7;
    const count = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0
    ).getDate();
    const raw = ([...Array(first)].fill(null) as (number | null)[]).concat(
      Array.from({ length: count }, (_, i) => i + 1)
    );
    const totalSlots = Math.ceil(raw.length / 7) * 7;
    while (raw.length < totalSlots) {
      raw.push(null);
    }
    return raw;
  }, [cursor]);

  const weeksCount = Math.max(5, Math.ceil(days.length / 7));

  const byDay = (n: number) =>
    items.filter(
      (x) =>
        new Date(x.start).getDate() === n &&
        new Date(x.start).getMonth() === cursor.getMonth() &&
        new Date(x.start).getFullYear() === cursor.getFullYear()
    );

  const isToday = (dayNum: number) =>
    dayNum === now.getDate() &&
    cursor.getMonth() === now.getMonth() &&
    cursor.getFullYear() === now.getFullYear();

  return (
    <section className="page calendarPage">
      <div className="pageTitleRow">
        <div>
          <span className="eyebrow">ORGANISATION</span>
          <h1>Kalender</h1>
          <p>Termine, Schichten, Timetable und Aufgaben in einer Ansicht.</p>
        </div>
        <button className="primary" onClick={() => setCreate(true)}>
          <Plus size={18} /> Termin erstellen
        </button>
      </div>

      <div className="calendarToolbar glass">
        <button
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
          }
          title="Vorheriger Monat"
        >
          <ChevronLeft />
        </button>
        <h2>
          {cursor.toLocaleDateString("de-DE", {
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button
          onClick={() =>
            setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
          }
          title="Nächster Monat"
        >
          <ChevronRight />
        </button>
        <button className="todayBtn" onClick={() => setCursor(new Date())}>
          Heute
        </button>
      </div>

      <div className="calendarLegend">
        {Object.entries(colors).map(([k, v]) => (
          <span className={`calType ${k}`} key={k}>
            <i />
            {v}
          </span>
        ))}
      </div>

      <div
        className="monthGrid glass"
        style={{
          gridTemplateRows: `auto repeat(${weeksCount}, minmax(0, 1fr))`,
        }}
      >
        {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((x) => (
          <b className="weekday" key={x}>
            {x}
          </b>
        ))}
        {days.map((n, i) => (
          <div
            className={`calendarDay ${!n ? "blank" : ""} ${
              n && isToday(n) ? "today" : ""
            }`}
            key={i}
          >
            {n && (
              <>
                <div className="calDayHead">
                  <strong className={isToday(n) ? "todayBadge" : ""}>{n}</strong>
                  {byDay(n).length > 0 && (
                    <span className="eventCount">{byDay(n).length}</span>
                  )}
                </div>
                <div className="calEventsWrap">
                  {byDay(n).map((x) => (
                    <article
                      className={`calEvent ${x.type}`}
                      key={`${x.type}-${x.id}`}
                      title={`${x.title}${x.location ? ` · ${x.location}` : ""}`}
                    >
                      <time>
                        {new Date(x.start).toLocaleTimeString("de-DE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                      <span>{x.title}</span>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="mobileAgenda">
        {items
          .sort((a, b) => +new Date(a.start) - +new Date(b.start))
          .map((x) => (
            <article
              className={`agendaItem glass ${x.type}`}
              key={`${x.type}-${x.id}`}
            >
              <div className="agendaDate">
                <b>{new Date(x.start).getDate()}</b>
                <span>
                  {new Date(x.start).toLocaleDateString("de-DE", {
                    month: "short",
                  })}
                </span>
              </div>
              <div>
                <span className="eyebrow">{colors[x.type]}</span>
                <h3>{x.title}</h3>
                <p>
                  <Clock size={14} />{" "}
                  {new Date(x.start).toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {x.location && (
                    <>
                      {" "}
                      · <MapPin size={14} /> {x.location}
                    </>
                  )}
                </p>
              </div>
            </article>
          ))}
      </div>

      {create && (
        <EventDialog
          onClose={() => setCreate(false)}
          onSaved={() => {
            setCreate(false);
            load();
          }}
          userId={user?.id}
          demo={demo}
        />
      )}
    </section>
  );
}

function EventDialog({
  onClose,
  onSaved,
  userId,
  demo,
}: {
  onClose: () => void;
  onSaved: () => void;
  userId?: string;
  demo: boolean;
}) {
  const [t, setT] = useState("");
  const [s, setS] = useState("");
  const [e, setE] = useState("");
  const [loc, setLoc] = useState("");

  const save = async () => {
    if (!t || !s || !e) return;
    if (!demo && userId) {
      await createCalendarEvent({
        title: t,
        starts_at: new Date(s).toISOString(),
        ends_at: new Date(e).toISOString(),
        location_text: loc || null,
        visibility: "crew",
        created_by: userId,
      });
    }
    onSaved();
  };

  return (
    <div className="modalBackdrop" onClick={onClose}>
      <div className="eventDialog glass" onClick={(x) => x.stopPropagation()}>
        <header>
          <h2>Termin erstellen</h2>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <label>
          Titel
          <input
            value={t}
            onChange={(x) => setT(x.target.value)}
            placeholder="z.B. Crew Meeting, Soundcheck..."
          />
        </label>
        <label>
          Beginn
          <input
            type="datetime-local"
            value={s}
            onChange={(x) => setS(x.target.value)}
          />
        </label>
        <label>
          Ende
          <input
            type="datetime-local"
            value={e}
            onChange={(x) => setE(x.target.value)}
          />
        </label>
        <label>
          Ort
          <input
            value={loc}
            onChange={(x) => setLoc(x.target.value)}
            placeholder="z.B. Backstage, Main Stage..."
          />
        </label>
        <button className="primary" onClick={save}>
          Termin speichern
        </button>
      </div>
    </div>
  );
}
