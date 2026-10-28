import { useState, useMemo } from "react";
import {
  HelpCircle,
  Search,
  X,
  Clock,
  Tent,
  Radio,
  ShieldAlert,
  Sparkles,
  MessageCircle,
  Phone,
  Compass,
} from "lucide-react";
import Accordion, { AccordionItem } from "../components/Accordion.tsx";

interface FAQProps {
  navigate?: (page: string) => void;
}

const FAQ_DATA: AccordionItem[] = [
  // Schichten & Einsatz
  {
    id: "shift-join",
    title: "Wie übernehme ich eine Schicht?",
    category: "Schichten & Einsatz",
    badge: "Wichtig",
    icon: Clock,
    content: (
      <>
        <p>
          Gehe in der App auf <strong>Festival</strong> &gt;{" "}
          <strong>Schichten</strong> oder öffne den <strong>Schichtplan</strong>
          . Suche dir eine passende freie Schicht aus und klicke auf{" "}
          <strong>„Schicht übernehmen“</strong>.
        </p>
        <p>
          Du wirst sofort eingetragen und die Schicht erscheint automatisch in
          deiner persönlichen Übersicht auf dem Dashboard und im Kalender.
        </p>
      </>
    ),
  },
  {
    id: "shift-sick",
    title: "Was tun, wenn ich kurzfristig krank oder verhindert bin?",
    category: "Schichten & Einsatz",
    badge: "Dringend",
    icon: Clock,
    content: (
      <>
        <p>
          Bitte trage dich im Schichtplan sofort über <strong>„Verlassen“</strong>{" "}
          aus, damit wartende Crew-Mitglieder automatisch nachrücken können.
        </p>
        <p>
          Informiere zusätzlich bitte direkt deine <strong>Teamleitung</strong>{" "}
          oder melde dich im entsprechenden Team-Chat, damit rechtzeitig Ersatz
          organisiert werden kann.
        </p>
      </>
    ),
  },
  {
    id: "shift-checkin",
    title: "Wie funktioniert der Crew Check-in vor Schichtbeginn?",
    category: "Schichten & Einsatz",
    icon: Clock,
    content: (
      <>
        <p>
          Finde dich bitte spätestens <strong>10 Minuten vor Schichtbeginn</strong>{" "}
          an deiner Einsatzstation ein. Öffne in der App den Menüpunkt{" "}
          <strong>„Check-in“</strong> und scanne den dort aushängenden QR-Code.
        </p>
        <p>
          Alternativ kannst du den Schicht-Code auch manuell eingeben. Das
          Control Center sieht sofort, dass du pünktlich im Einsatz bist.
        </p>
      </>
    ),
  },
  {
    id: "shift-swap",
    title: "Kann ich Schichten mit anderen Crew-Mitgliedern tauschen?",
    category: "Schichten & Einsatz",
    icon: Clock,
    content: (
      <p>
        Ja, sprich dich einfach kurz mit der betreffenden Person ab. Die andere
        Person kann die Schicht im Schichtplan übernehmen, sobald du sie
        freigegeben hast. Alternativ kann deine Teamleitung Zuweisungen im
        Admin-Bereich direkt anpassen.
      </p>
    ),
  },
  {
    id: "shift-breaks",
    title: "Welche Pausenzeiten stehen mir während der Schicht zu?",
    category: "Schichten & Einsatz",
    icon: Clock,
    content: (
      <p>
        Bei Schichten ab 4 Stunden hast du Anspruch auf mindestens 30 Minuten
        Pause. Stimme den genauen Zeitpunkt kurz mit deinem Schichtpartner oder
        deiner Teamleitung ab, damit deine Station durchgehend besetzt bleibt.
      </p>
    ),
  },

  // Festival & Gelände
  {
    id: "fest-wristband",
    title: "Wo erhalte ich mein Crew-Bändchen und den Crew-Ausweis?",
    category: "Festival & Gelände",
    badge: "Anreise",
    icon: Compass,
    content: (
      <>
        <p>
          Die Crew-Akkreditierung befindet sich am{" "}
          <strong>Crew Check-in Container (Zufahrt Nord / Backstage)</strong>.
        </p>
        <p>
          Bitte halte bei der Ankunft deinen Personalausweis und deine
          Bestätigungs-E-Mail bereit. Dort erhältst du dein Crew-Bändchen,
          Essensmarken und dein Crew-Shirt.
        </p>
      </>
    ),
  },
  {
    id: "fest-offduty",
    title: "Darf ich mich in meiner Freizeit auf dem Festival bewegen?",
    category: "Festival & Gelände",
    icon: Compass,
    content: (
      <p>
        Ja, unbedingt! Dein Crew-Bändchen berechtigt dich während des gesamten
        Festivals zum freien Eintritt auf allen Floors. Bitte beachte, dass im
        Crew-Shirt während der Freizeit kein Alkohol konsumiert werden sollte.
      </p>
    ),
  },
  {
    id: "fest-timetable",
    title: "Wo finde ich den aktuellen Timetable und Geländeplan?",
    category: "Festival & Gelände",
    icon: Compass,
    content: (
      <p>
        Den aktuellen Timetable findest du in der App im Tab{" "}
        <strong>Festival &gt; Timetable</strong> sowie im Kalender. Digitale
        Geländepläne und Checklisten stehen im Bereich{" "}
        <strong>Dateien & Dokumente</strong> zum Download bereit.
      </p>
    ),
  },

  // Verpflegung & Camping
  {
    id: "camp-catering",
    title: "Wie funktioniert die Crew-Verpflegung und Essenszeiten?",
    category: "Verpflegung & Camping",
    badge: "Essen",
    icon: Tent,
    content: (
      <>
        <p>
          Im Crew-Catering-Zelt (Backstage) gibt es täglich frische, warme
          Mahlzeiten:
        </p>
        <ul>
          <li>
            <strong>Frühstück:</strong> 08:00 – 11:00 Uhr
          </li>
          <li>
            <strong>Mittagessen:</strong> 12:30 – 15:00 Uhr
          </li>
          <li>
            <strong>Abendessen:</strong> 18:00 – 21:30 Uhr
          </li>
          <li>
            <strong>Nacht-Snacks:</strong> 01:00 – 04:00 Uhr (an der Crew-Bar)
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "camp-dietary",
    title: "Gibt es vegane, vegetarische und glutenfreie Optionen?",
    category: "Verpflegung & Camping",
    icon: Tent,
    content: (
      <p>
        Ja, unser Küchenteam bereitet zu jeder Mahlzeit reichhaltige vegane und
        vegetarische Gerichte zu. Bei schweren Nahrungsmittelallergien gib bitte
        vorab beim Catering-Team Bescheid.
      </p>
    ),
  },
  {
    id: "camp-water",
    title: "Wo gibt es kostenloses Trinkwasser für die Crew?",
    category: "Verpflegung & Camping",
    icon: Tent,
    content: (
      <p>
        Trinkwasserstellen befinden sich im Backstage, an der Crew-Küche sowie an
        allen festen Floor-Bars. Deine wiederverwendbare Crew-Flasche kannst du
        dort jederzeit kostenfrei auffüllen.
      </p>
    ),
  },
  {
    id: "camp-site",
    title: "Wo befindet sich das Crew-Camping und gibt es Strom?",
    category: "Verpflegung & Camping",
    icon: Tent,
    content: (
      <p>
        Der Crew-Campingplatz liegt direkt im schattigen Waldstück hinter dem
        Backstage-Bereich. Es gibt separate warme Duschen, Spültoiletten und
        Handy-Ladestationen im Crew-Container.
      </p>
    ),
  },

  // Funk & Kommunikation
  {
    id: "comms-radio",
    title: "Welche Funkkanäle sind für welche Teams belegt?",
    category: "Funk & Kommunikation",
    badge: "Funk",
    icon: Radio,
    content: (
      <>
        <p>
          Auf dem Gelände gelten feste Funkkanäle. Bitte halte die Funkdisziplin
          ein (erst zuhören, Name nennen, kurz fassen):
        </p>
        <ul>
          <li>
            <strong>Kanal 1:</strong> Notfall, Sanität & Sicherheit
          </li>
          <li>
            <strong>Kanal 2:</strong> Festivalleitung & Einsatzleitung (Control
            Center)
          </li>
          <li>
            <strong>Kanal 3:</strong> Stage-Technik, Sound & Licht
          </li>
          <li>
            <strong>Kanal 4:</strong> Aufbau, Logistik & Gelände
          </li>
          <li>
            <strong>Kanal 5:</strong> Awareness & Care
          </li>
          <li>
            <strong>Kanal 6:</strong> Gastro & Bar-Logistik
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "comms-incident",
    title: "Wie melde ich ein akutes Problem oder einen technischen Defekt?",
    category: "Funk & Kommunikation",
    icon: Radio,
    content: (
      <p>
        Größere Störungen, Stromausfälle oder Barrieren kannst du direkt im{" "}
        <strong>Control Center</strong> über den Button{" "}
        <strong>„+ Problem melden“</strong> erfassen. Die Festivalleitung
        erhält den Incident in Echtzeit auf dem Schirm und weist Teams zu.
      </p>
    ),
  },

  // Sicherheit & Notfall
  {
    id: "sec-emergency",
    title: "Was mache ich bei einem medizinischen Notfall?",
    category: "Sicherheit & Notfall",
    badge: "Notfall",
    icon: ShieldAlert,
    content: (
      <>
        <p>
          1. Ruhe bewahren und Eigenschutz beachten.
          <br />
          2. Sofort <strong>Funk Kanal 1</strong> rufen oder Notruf{" "}
          <strong>112</strong> wählen.
          <br />
          3. Die Sanitätsstation liegt zentral links neben dem Main Floor und
          ist rund um die Uhr ärztlich besetzt.
          <br />
          4. Schicke wenn möglich einen Einweiser an die nächste Kreuzung.
        </p>
      </>
    ),
  },
  {
    id: "sec-awareness",
    title: "Wann rufe ich das Awareness-Team hinzu?",
    category: "Sicherheit & Notfall",
    icon: ShieldAlert,
    content: (
      <p>
        Das Awareness-Team ist ansprechbar bei Überforderung, Diskriminierung,
        Belästigung oder wenn jemand einen sicheren Rückzugsort benötigt. Der
        Awareness Point befindet sich am Rande des Forest Floors. Über Funk
        erreichst du sie auf <strong>Kanal 5</strong>.
      </p>
    ),
  },
  {
    id: "sec-evacuation",
    title: "Wo ist der Sammelplatz bei Unwetter oder Evakuierung?",
    category: "Sicherheit & Notfall",
    icon: ShieldAlert,
    content: (
      <p>
        Der primäre Crew-Sammelplatz ist der <strong>Parkplatz P1 (Crew-Zufahrt)</strong>.
        Bei heraufziehendem Unwetter werden Durchsagen über die Bühnen und
        Push-Nachrichten im Messenger geschaltet. Folge den Weisungen der
        Sicherheitsleitung.
      </p>
    ),
  },
];

const CATEGORIES = [
  "Alle",
  "Schichten & Einsatz",
  "Festival & Gelände",
  "Verpflegung & Camping",
  "Funk & Kommunikation",
  "Sicherheit & Notfall",
];

export default function FAQ({ navigate }: FAQProps) {
  const [selectedCat, setSelectedCat] = useState("Alle");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCat =
        selectedCat === "Alle" || item.category === selectedCat;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCat;

      const titleMatch = item.title.toLowerCase().includes(q);
      const catMatch = item.category?.toLowerCase().includes(q);
      const textMatch =
        typeof item.content === "string"
          ? item.content.toLowerCase().includes(q)
          : false;

      return matchesCat && (titleMatch || catMatch || textMatch);
    });
  }, [selectedCat, searchQuery]);

  return (
    <section className="page faqPage">
      <div className="pageTitleRow">
        <div>
          <span className="eyebrow">KLANGTHERAPIE CREW · WISSEN</span>
          <h1>Häufige Fragen (FAQ)</h1>
          <p>
            Antworten zu Festivalbetrieb, Schichten, Notfällen, Bändchen und
            Crew-Alltag.
          </p>
        </div>
      </div>

      {/* Suchleiste */}
      <div className="faqSearchRow glass">
        <div className="faqSearchInputWrap">
          <Search size={18} className="faqSearchIcon" />
          <input
            type="text"
            className="faqSearchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Frage oder Suchbegriff eingeben (z.B. Schicht, Funk, Notfall, Essen)..."
          />
          {searchQuery && (
            <button
              className="faqSearchClear"
              onClick={() => setSearchQuery("")}
              title="Suche zurücksetzen"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Kategorie Filter-Pills */}
      <div className="faqCategoryPills">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`faqPill ${selectedCat === cat ? "active" : ""}`}
            onClick={() => setSelectedCat(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Akkordeon Liste */}
      <div className="faqAccordionContainer">
        {filteredItems.length > 0 ? (
          <Accordion items={filteredItems} allowMultiple={true} />
        ) : (
          <div className="glass emptyState faqEmptyState">
            <HelpCircle size={36} />
            <h3>Keine passenden Fragen gefunden</h3>
            <p>
              Probiere einen anderen Suchbegriff oder wähle eine andere
              Kategorie.
            </p>
            <button
              className="secondary"
              onClick={() => {
                setSearchQuery("");
                setSelectedCat("Alle");
              }}
            >
              Filter zurücksetzen
            </button>
          </div>
        )}
      </div>

      {/* Hilfe-Kontaktkarte am Seitenende */}
      <div className="faqHelpFooter glass">
        <div className="faqHelpLeft">
          <div className="iconBubble">
            <Sparkles size={22} />
          </div>
          <div>
            <h3>Deine Frage ist nicht dabei?</h3>
            <p>
              Tausche dich im Team-Chat aus oder kontaktiere deine Teamleitung
              direkt.
            </p>
          </div>
        </div>
        <div className="faqHelpActions">
          {navigate && (
            <>
              <button className="primary" onClick={() => navigate("chats")}>
                <MessageCircle size={16} />
                <span>Crew-Chat öffnen</span>
              </button>
              <button className="secondary" onClick={() => navigate("festival")}>
                <Phone size={16} />
                <span>Notfall & Kontakte</span>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
