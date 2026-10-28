import { CalendarDays, Clock, QrCode, Radio, Users, Folder, Shield, UserRound, ArrowRight, HelpCircle } from "lucide-react";

type Props = {
  title?: string;
  navigate?: (page: string) => void;
};

const moreLinks = [
  { id: "festival", title: "Festival Hub", desc: "Schichten, Timetable, Gelände & Kontakte", icon: CalendarDays },
  { id: "shiftplan", title: "Schichtplan", desc: "Besetzung, Wartelisten & Konflikte", icon: Clock },
  { id: "checkin", title: "Crew Check-in", desc: "QR-Scanner & manuelle Schichteinbuchung", icon: QrCode },
  { id: "controlcenter", title: "Control Center", desc: "Live-Leitstand, Vorfälle & Lagebericht", icon: Radio },
  { id: "calendar", title: "Kalender", desc: "Termine, Schichten & Timetable", icon: CalendarDays },
  { id: "crew", title: "Crew & Teams", desc: "Mitgliederliste, Teams & Erreichbarkeit", icon: Users },
  { id: "files", title: "Dateien & Dokumente", desc: "Pläne, Checklisten & Unterlagen", icon: Folder },
  { id: "faq", title: "FAQ & Hilfe", desc: "Häufige Fragen, Notfallinfos & Crew-Guide", icon: HelpCircle },
  { id: "profile", title: "Mein Profil", desc: "Kontaktdaten, Skills & Notfallkontakt", icon: UserRound },
  { id: "admin", title: "Administration", desc: "Benutzer, Rollen & Festivalverwaltung", icon: Shield },
];

export default function Placeholder({ title, navigate }: Props) {
  if (navigate && (!title || title === "Mehr")) {
    return (
      <section className="page">
        <div className="titleRow">
          <div>
            <span className="eyebrow">NAVIGATION</span>
            <h1>Alle Bereiche</h1>
            <p>Schnellzugriff auf alle Festival- und Crew-Module.</p>
          </div>
        </div>
        <div className="festivalGrid">
          {moreLinks.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className="festivalCard glass"
                style={{ textAlign: "left", cursor: "pointer", background: "rgba(255, 255, 255, 0.04)" }}
                onClick={() => navigate(item.id)}
              >
                <div className="iconBubble">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{item.title}</h3>
                  <p style={{ margin: "4px 0 0", color: "#8a96a3", fontSize: "13px" }}>{item.desc}</p>
                </div>
                <ArrowRight size={18} style={{ color: "#7f8d9b" }} />
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="hero glass">
        <p className="eyebrow">KLANGTHERAPIE CREW</p>
        <h1>{title || "Bereich"}</h1>
        <p>Dieser Bereich ist für eine kommende Ausbaustufe vorbereitet.</p>
      </div>
    </section>
  );
}
