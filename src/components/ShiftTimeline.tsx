import { useState, useEffect, useMemo, useRef } from "react";
import {
  Clock,
  Calendar,
  MapPin,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Pencil,
  X,
  UserCheck,
  UserPlus,
  UserMinus,
  Sparkles,
  Info,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.tsx";
import { joinShift, leaveShiftSafe } from "../services/festival.ts";

export type ShiftTimelineProps = {
  shifts: any[];
  locations?: any[];
  onSelectShift?: (shift: any) => void;
  onEditShift?: (shift: any) => void;
  onAddShift?: () => void;
  onRefresh?: () => void;
};

export default function ShiftTimeline({
  shifts = [],
  locations = [],
  onSelectShift,
  onEditShift,
  onAddShift,
  onRefresh,
}: ShiftTimelineProps) {
  const { user, demo } = useAuth();
  const uid = user?.id || (demo ? "demo-user" : "");

  // Current time for the "JETZT" line (updates every 60s)
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Format today as YYYY-MM-DD
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  // Extract all unique dates from shifts
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    shifts.forEach((s) => {
      if (s.starts_at) {
        try {
          const d = new Date(s.starts_at);
          if (!isNaN(d.getTime())) {
            const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            set.add(str);
          }
        } catch {
          // ignore invalid
        }
      }
    });

    // If today is not in set, add today if shifts are empty or let user pick today
    const list = Array.from(set).sort();
    if (list.length === 0) {
      list.push(todayStr);
    }
    return list;
  }, [shifts, todayStr]);

  // Selected date: default to today if present, otherwise first available date
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (availableDates.includes(todayStr)) return todayStr;
    return availableDates[0] || todayStr;
  });

  // Keep selectedDate valid if availableDates change
  useEffect(() => {
    if (selectedDate !== "all" && !availableDates.includes(selectedDate) && availableDates.length > 0) {
      setSelectedDate(availableDates.includes(todayStr) ? todayStr : availableDates[0]);
    }
  }, [availableDates, selectedDate, todayStr]);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyMine, setOnlyMine] = useState(false);

  // Inspector modal state
  const [inspectShift, setInspectShift] = useState<any | null>(null);
  const [actionMsg, setActionMsg] = useState("");
  const [actionBusy, setActionBusy] = useState(false);

  // Scroll container ref
  const timelineCanvasRef = useRef<HTMLDivElement>(null);

  // Helper: format date nicely for pills
  const formatDatePill = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      const isToday = dateStr === todayStr;
      const dayName = dt.toLocaleDateString("de-DE", { weekday: "short" });
      const dayNum = dt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
      return `${dayName}, ${dayNum}${isToday ? " (Heute)" : ""}`;
    } catch {
      return dateStr;
    }
  };

  // Filter shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter((s) => {
      // Date filter
      if (selectedDate !== "all" && s.starts_at) {
        try {
          const d = new Date(s.starts_at);
          const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          // Also check if ends_at falls on this date
          let endStr = str;
          if (s.ends_at) {
            const ed = new Date(s.ends_at);
            endStr = `${ed.getFullYear()}-${String(ed.getMonth() + 1).padStart(2, "0")}-${String(ed.getDate()).padStart(2, "0")}`;
          }
          if (str !== selectedDate && endStr !== selectedDate) {
            return false;
          }
        } catch {
          return false;
        }
      }

      // Location filter
      const locName = s.KT_locations?.name || s.location || "Allgemein";
      if (selectedLocation !== "all" && locName !== selectedLocation) {
        return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = (s.title || "").toLowerCase().includes(q);
        const locMatch = locName.toLowerCase().includes(q);
        const descMatch = (s.description || "").toLowerCase().includes(q);
        if (!titleMatch && !locMatch && !descMatch) return false;
      }

      // Assignments count
      const assignments = s.KT_shift_assignments || [];
      const confirmed = assignments.filter((a: any) => a.status === "confirmed" || !a.status).length;
      const needed = s.needed || s.capacity || 1;

      // Only open filter
      if (onlyOpen && confirmed >= needed) {
        return false;
      }

      // Only mine filter
      if (onlyMine) {
        const isMine = assignments.some((a: any) => a.user_id === uid);
        if (!isMine) return false;
      }

      return true;
    });
  }, [shifts, selectedDate, selectedLocation, search, onlyOpen, onlyMine, uid]);

  // Extract all unique location names present in the filtered shifts
  const uniqueLocations = useMemo(() => {
    const map = new Map<string, number>();
    shifts.forEach((s) => {
      const loc = s.KT_locations?.name || s.location || "Allgemein";
      map.set(loc, (map.get(loc) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [shifts]);

  // Group filtered shifts by location
  const groupedByLocation = useMemo(() => {
    const groups: { location: string; shifts: any[]; lanes: any[][] }[] = [];
    const map = new Map<string, any[]>();

    filteredShifts.forEach((s) => {
      const loc = s.KT_locations?.name || s.location || "Allgemein";
      if (!map.has(loc)) map.set(loc, []);
      map.get(loc)!.push(s);
    });

    // If a specific location is selected or all, sort locations
    const locNames = Array.from(map.keys()).sort();

    locNames.forEach((loc) => {
      const locShifts = map.get(loc)!;
      // Sort shifts chronologically
      locShifts.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

      // Pack into lanes to avoid overlapping collisions
      const lanes: any[][] = [];
      locShifts.forEach((shift) => {
        const start = new Date(shift.starts_at).getTime();
        let placed = false;
        for (let i = 0; i < lanes.length; i++) {
          const lastInLane = lanes[i][lanes[i].length - 1];
          const lastEnd = new Date(lastInLane.ends_at).getTime();
          // If this shift starts after the last one ends (plus 5 min grace)
          if (start >= lastEnd - 300000) {
            lanes[i].push(shift);
            shift._laneIndex = i;
            placed = true;
            break;
          }
        }
        if (!placed) {
          shift._laneIndex = lanes.length;
          lanes.push([shift]);
        }
      });

      groups.push({
        location: loc,
        shifts: locShifts,
        lanes,
      });
    });

    return groups;
  }, [filteredShifts]);

  // Overall statistics
  const stats = useMemo(() => {
    let totalShifts = filteredShifts.length;
    let totalNeeded = 0;
    let totalConfirmed = 0;
    let myCount = 0;
    let openCount = 0;

    filteredShifts.forEach((s) => {
      const needed = s.needed || s.capacity || 1;
      const assignments = s.KT_shift_assignments || [];
      const confirmed = assignments.filter((a: any) => a.status === "confirmed" || !a.status).length;
      totalNeeded += needed;
      totalConfirmed += confirmed;
      if (confirmed < needed) openCount++;
      if (assignments.some((a: any) => a.user_id === uid)) myCount++;
    });

    const percent = totalNeeded > 0 ? Math.round((totalConfirmed / totalNeeded) * 100) : 100;
    return { totalShifts, totalNeeded, totalConfirmed, percent, myCount, openCount };
  }, [filteredShifts, uid]);

  // Timeline hours scale: 24 hours (00:00 to 24:00) with 2-hour increments
  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => i);
  }, []);

  // Compute position (left% and width%) for a shift on the 24h timeline
  const calculateShiftStyle = (shift: any) => {
    try {
      const start = new Date(shift.starts_at);
      const end = new Date(shift.ends_at);

      let startMinutes = start.getHours() * 60 + start.getMinutes();
      let endMinutes = end.getHours() * 60 + end.getMinutes();

      // If ends next day or spans past 24h
      if (end.getDate() !== start.getDate() || endMinutes < startMinutes) {
        endMinutes += 24 * 60;
      }

      // If filtering by a specific date, adjust boundaries if shift started previous day
      if (selectedDate !== "all") {
        const [y, m, d] = selectedDate.split("-").map(Number);
        const selDay = new Date(y, m - 1, d);
        if (start.getDate() < selDay.getDate()) {
          startMinutes = 0;
        }
      }

      const durationMinutes = Math.max(30, endMinutes - startMinutes);
      // Timeline total is 24 * 60 = 1440 minutes
      const leftPct = (Math.max(0, startMinutes) / 1440) * 100;
      const widthPct = Math.min(100 - leftPct, (durationMinutes / 1440) * 100);

      const topPx = (shift._laneIndex || 0) * 58 + 6;

      return {
        left: `${leftPct}%`,
        width: `${Math.max(widthPct, 4.5)}%`,
        top: `${topPx}px`,
      };
    } catch {
      return { left: "0%", width: "10%", top: "6px" };
    }
  };

  // Calculate position of the "JETZT" marker
  const nowMarkerLeft = useMemo(() => {
    const isToday = selectedDate === todayStr || selectedDate === "all";
    if (!isToday) return null;
    const minutes = now.getHours() * 60 + now.getMinutes();
    return (minutes / 1440) * 100;
  }, [now, selectedDate, todayStr]);

  // Determine shift status styling
  const getShiftBadge = (shift: any) => {
    const assignments = shift.KT_shift_assignments || [];
    const confirmed = assignments.filter((a: any) => a.status === "confirmed" || !a.status).length;
    const needed = shift.needed || shift.capacity || 1;
    const isMine = assignments.some((a: any) => a.user_id === uid);

    if (isMine) {
      return {
        className: "shiftBlock mine",
        statusText: "Mein Einsatz",
        colorBadge: "badgeMine",
        icon: Sparkles,
        confirmed,
        needed,
      };
    }
    if (confirmed >= needed) {
      return {
        className: "shiftBlock full",
        statusText: "Voll besetzt",
        colorBadge: "badgeFull",
        icon: CheckCircle2,
        confirmed,
        needed,
      };
    }
    if (confirmed > 0) {
      return {
        className: "shiftBlock partial",
        statusText: "Teilweise",
        colorBadge: "badgePartial",
        icon: Users,
        confirmed,
        needed,
      };
    }
    return {
      className: "shiftBlock open",
      statusText: "Dringend",
      colorBadge: "badgeOpen",
      icon: AlertTriangle,
      confirmed,
      needed,
    };
  };

  // Handle Join Shift
  const handleJoin = async (shift: any) => {
    setActionBusy(true);
    setActionMsg("");
    try {
      if (demo) {
        setActionMsg("Demo: Schicht erfolgreich übernommen!");
        // Local state update
        if (!shift.KT_shift_assignments) shift.KT_shift_assignments = [];
        shift.KT_shift_assignments.push({ user_id: uid, status: "confirmed" });
        setTimeout(() => setActionMsg(""), 2500);
        setActionBusy(false);
        onRefresh?.();
        return;
      }
      const res = await joinShift(shift.id);
      if (res.error) {
        setActionMsg(`Fehler: ${res.error.message}`);
      } else {
        setActionMsg(res.data === "waitlist" ? "Auf die Warteliste gesetzt." : "Schicht erfolgreich übernommen!");
        onRefresh?.();
      }
    } catch (e: any) {
      setActionMsg(e.message || "Fehler beim Übernehmen.");
    } finally {
      setActionBusy(false);
    }
  };

  // Handle Leave Shift
  const handleLeave = async (shift: any) => {
    setActionBusy(true);
    setActionMsg("");
    try {
      if (demo) {
        setActionMsg("Demo: Schicht verlassen.");
        if (shift.KT_shift_assignments) {
          shift.KT_shift_assignments = shift.KT_shift_assignments.filter((a: any) => a.user_id !== uid);
        }
        setTimeout(() => setActionMsg(""), 2500);
        setActionBusy(false);
        onRefresh?.();
        return;
      }
      const res = await leaveShiftSafe(shift.id);
      if (res.error) {
        setActionMsg(`Fehler: ${res.error.message}`);
      } else {
        setActionMsg("Schicht verlassen.");
        onRefresh?.();
      }
    } catch (e: any) {
      setActionMsg(e.message || "Fehler beim Verlassen.");
    } finally {
      setActionBusy(false);
    }
  };

  // Day navigation helpers
  const handlePrevDay = () => {
    const idx = availableDates.indexOf(selectedDate);
    if (idx > 0) setSelectedDate(availableDates[idx - 1]);
  };
  const handleNextDay = () => {
    const idx = availableDates.indexOf(selectedDate);
    if (idx < availableDates.length - 1) setSelectedDate(availableDates[idx + 1]);
  };

  // Scroll to current time or standard start on mount
  useEffect(() => {
    if (timelineCanvasRef.current && nowMarkerLeft !== null) {
      const scrollWidth = timelineCanvasRef.current.scrollWidth;
      const clientWidth = timelineCanvasRef.current.clientWidth;
      const targetScroll = (scrollWidth * nowMarkerLeft) / 100 - clientWidth / 3;
      timelineCanvasRef.current.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: "smooth",
      });
    }
  }, [selectedDate]);

  return (
    <div className="shiftTimelineContainer glass">
      {/* ================= 1. TOOLBAR & HEADER ================= */}
      <div className="timelineToolbar">
        <div className="timelineToolbarHeader">
          <div className="timelineTitleBlock">
            <div className="timelineIconTitle">
              <Clock className="timelinePrimaryIcon" size={20} />
              <h2>Schichten Timeline</h2>
            </div>
            <p>Chronologische Schichtübersicht, Besetzung und Live-Status aller Locations.</p>
          </div>

          {onAddShift && (
            <button className="primary timelineAddBtn" onClick={onAddShift}>
              <Plus size={16} /> Schicht anlegen
            </button>
          )}
        </div>

        {/* ================= 2. STATS ROW ================= */}
        <div className="timelineStats">
          <div className="statPill">
            <Clock size={15} />
            <span>
              <strong>{stats.totalShifts}</strong> Schichten
            </span>
          </div>

          <div className="statPill">
            <Users size={15} />
            <span>
              <strong>{stats.totalConfirmed}</strong> / {stats.totalNeeded} Crew ({stats.percent}%)
            </span>
          </div>

          {stats.openCount > 0 && (
            <div className="statPill warning">
              <AlertTriangle size={15} />
              <span>
                <strong>{stats.openCount}</strong> offen
              </span>
            </div>
          )}

          {stats.myCount > 0 && (
            <div className="statPill mine">
              <Sparkles size={15} />
              <span>
                <strong>{stats.myCount}</strong> meine
              </span>
            </div>
          )}
        </div>

        {/* ================= 3. DAY SELECTOR PILLS ================= */}
        <div className="timelineDayBar">
          <div className="dayNavButtons">
            <button
              className="iconNavBtn"
              title="Vorheriger Tag"
              disabled={selectedDate === "all" || availableDates.indexOf(selectedDate) <= 0}
              onClick={handlePrevDay}
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          <div className="timelineDayPills">
            {availableDates.map((dateStr) => {
              const isActive = selectedDate === dateStr;
              return (
                <button
                  key={dateStr}
                  type="button"
                  className={`timelineDayPill ${isActive ? "active" : ""}`}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <Calendar size={13} />
                  <span>{formatDatePill(dateStr)}</span>
                </button>
              );
            })}

            <button
              type="button"
              className={`timelineDayPill ${selectedDate === "all" ? "active" : ""}`}
              onClick={() => setSelectedDate("all")}
            >
              <span>Alle Tage</span>
            </button>
          </div>

          <div className="dayNavButtons">
            <button
              className="iconNavBtn"
              title="Nächster Tag"
              disabled={selectedDate === "all" || availableDates.indexOf(selectedDate) >= availableDates.length - 1}
              onClick={handleNextDay}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ================= 4. FILTER CONTROLS ================= */}
        <div className="timelineFilterRow">
          <div className="searchBox">
            <Search size={15} />
            <input
              type="text"
              placeholder="Schicht, Location oder Info suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clearBtn" onClick={() => setSearch("")}>
                <X size={13} />
              </button>
            )}
          </div>

          <div className="locationFilterSelect">
            <MapPin size={14} />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="all">Alle Locations ({uniqueLocations.length})</option>
              {uniqueLocations.map(([loc, count]) => (
                <option key={loc} value={loc}>
                  {loc} ({count})
                </option>
              ))}
            </select>
          </div>

          <div className="filterToggles">
            <button
              type="button"
              className={`togglePill ${onlyOpen ? "active" : ""}`}
              onClick={() => setOnlyOpen(!onlyOpen)}
            >
              <AlertTriangle size={13} />
              Nur offene
            </button>

            <button
              type="button"
              className={`togglePill ${onlyMine ? "active" : ""}`}
              onClick={() => setOnlyMine(!onlyMine)}
            >
              <Sparkles size={13} />
              Meine Schichten
            </button>
          </div>
        </div>
      </div>

      {/* ================= 5. TIMELINE GANTT CANVAS ================= */}
      <div className="timelineScrollArea" ref={timelineCanvasRef}>
        <div className="timelineGridContainer">
          {/* Header row with hours */}
          <div className="timelineHeaderRow">
            <div className="timelineLocationHeaderCol">
              <MapPin size={14} />
              <span>Location / Bereich</span>
            </div>

            <div className="timelineHoursCanvas">
              {hours.map((h) => (
                <div key={h} className="timelineHourSlot">
                  <span className="hourLabel">{String(h).padStart(2, "0")}:00</span>
                  <div className="hourMarkLine" />
                </div>
              ))}

              {/* JETZT Live Indicator */}
              {nowMarkerLeft !== null && (
                <div
                  className="timelineNowIndicator"
                  style={{ left: `${nowMarkerLeft}%` }}
                >
                  <div className="nowFlag">
                    JETZT {now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="nowLine" />
                </div>
              )}
            </div>
          </div>

          {/* Timeline Location Tracks */}
          {groupedByLocation.length > 0 ? (
            groupedByLocation.map((group) => {
              const laneCount = Math.max(1, group.lanes.length);
              const trackHeight = laneCount * 58 + 12;

              return (
                <div
                  key={group.location}
                  className="timelineTrackRow"
                  style={{ minHeight: `${trackHeight}px` }}
                >
                  {/* Sticky Location Title on left */}
                  <div className="timelineLocationCol">
                    <div className="locationBadge">
                      <MapPin size={14} />
                      <strong title={group.location}>{group.location}</strong>
                    </div>
                    <small>{group.shifts.length} {group.shifts.length === 1 ? "Schicht" : "Schichten"}</small>
                  </div>

                  {/* Horizontal Track Canvas */}
                  <div
                    className="timelineTrackCanvas"
                    style={{ height: `${trackHeight}px` }}
                  >
                    {/* Hour grid lines in background */}
                    {hours.map((h) => (
                      <div
                        key={h}
                        className="trackGridHourLine"
                        style={{ left: `${(h / 24) * 100}%` }}
                      />
                    ))}

                    {/* JETZT Live Vertical Line across track */}
                    {nowMarkerLeft !== null && (
                      <div
                        className="trackNowLine"
                        style={{ left: `${nowMarkerLeft}%` }}
                      />
                    )}

                    {/* Shift blocks on track */}
                    {group.shifts.map((shift) => {
                      const badge = getShiftBadge(shift);
                      const style = calculateShiftStyle(shift);
                      const BadgeIcon = badge.icon;
                      const isMine = (shift.KT_shift_assignments || []).some(
                        (a: any) => a.user_id === uid
                      );

                      return (
                        <div
                          key={shift.id}
                          className={`timelineShiftBlock ${badge.className}`}
                          style={style}
                          onClick={() => {
                            if (onSelectShift) {
                              onSelectShift(shift);
                            } else {
                              setInspectShift(shift);
                            }
                          }}
                          title={`${shift.title} (${new Date(shift.starts_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })} - ${new Date(shift.ends_at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })})`}
                        >
                          <div className="blockTopRow">
                            <span className="blockTime">
                              {new Date(shift.starts_at).toLocaleTimeString("de-DE", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              –{" "}
                              {new Date(shift.ends_at).toLocaleTimeString("de-DE", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            <span className={`blockOccupancy ${badge.colorBadge}`}>
                              <BadgeIcon size={11} />
                              {badge.confirmed}/{badge.needed}
                            </span>
                          </div>

                          <div className="blockTitleRow">
                            <strong className="blockTitle">{shift.title}</strong>
                            {isMine && <span className="mineStar" title="Deine Schicht">★</span>}
                          </div>

                          {/* Quick action buttons on block hover */}
                          <div
                            className="blockHoverActions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="miniActionBtn"
                              title="Details anzeigen"
                              onClick={() => {
                                if (onSelectShift) {
                                  onSelectShift(shift);
                                } else {
                                  setInspectShift(shift);
                                }
                              }}
                            >
                              <Eye size={12} />
                            </button>
                            {onEditShift && (
                              <button
                                type="button"
                                className="miniActionBtn"
                                title="Bearbeiten"
                                onClick={() => onEditShift(shift)}
                              >
                                <Pencil size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="emptyTimelineState">
              <Info size={28} />
              <p>Keine Schichten für die gewählten Filter oder den Tag gefunden.</p>
              {(search || selectedLocation !== "all" || onlyOpen || onlyMine) && (
                <button
                  className="secondary"
                  onClick={() => {
                    setSearch("");
                    setSelectedLocation("all");
                    setOnlyOpen(false);
                    setOnlyMine(false);
                  }}
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= 6. LEGEND & FOOTER ================= */}
      <div className="timelineFooter">
        <div className="timelineLegend">
          <div className="legendItem">
            <span className="legendDot full" />
            <span>Voll besetzt</span>
          </div>
          <div className="legendItem">
            <span className="legendDot partial" />
            <span>Teilweise besetzt</span>
          </div>
          <div className="legendItem">
            <span className="legendDot open" />
            <span>Dringend / Offen</span>
          </div>
          <div className="legendItem">
            <span className="legendDot mine" />
            <span>Meine Schicht</span>
          </div>
        </div>

        <div className="timelineScrollHint">
          <Clock size={13} />
          <span>Tipp: Zeitstrahl horizontal scrollen für 24h Übersicht. Klick auf eine Schicht öffnet Details.</span>
        </div>
      </div>

      {/* ================= 7. QUICK SHIFT INSPECTOR MODAL ================= */}
      {inspectShift && (
        <div className="modalOverlay" onClick={() => setInspectShift(null)}>
          <div
            className="shiftInspectorModal glass"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="inspectorHead">
              <div>
                <span className="eyebrow">
                  {inspectShift.KT_locations?.name || inspectShift.location || "Location"}
                </span>
                <h3>{inspectShift.title}</h3>
              </div>
              <button
                type="button"
                className="closeBtn"
                onClick={() => setInspectShift(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="inspectorBody">
              <div className="inspectorMetaRow">
                <div className="metaItem">
                  <Clock size={16} />
                  <div>
                    <label>Zeitraum</label>
                    <span>
                      {new Date(inspectShift.starts_at).toLocaleString("de-DE", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      –{" "}
                      {new Date(inspectShift.ends_at).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="metaItem">
                  <MapPin size={16} />
                  <div>
                    <label>Location</label>
                    <span>
                      {inspectShift.KT_locations?.name || inspectShift.location || "Nicht angegeben"}
                    </span>
                  </div>
                </div>

                <div className="metaItem">
                  <Users size={16} />
                  <div>
                    <label>Besetzung</label>
                    <span>
                      {(inspectShift.KT_shift_assignments || []).length} /{" "}
                      {inspectShift.needed || inspectShift.capacity || 1} Crewmitglieder
                    </span>
                  </div>
                </div>
              </div>

              {inspectShift.description && (
                <div className="inspectorDesc">
                  <label>Aufgabenbeschreibung</label>
                  <p>{inspectShift.description}</p>
                </div>
              )}

              {/* Roster of assigned crew */}
              <div className="inspectorRoster">
                <label>Eingeteilte Crew</label>
                {(inspectShift.KT_shift_assignments || []).length > 0 ? (
                  <div className="rosterList">
                    {inspectShift.KT_shift_assignments.map((a: any, idx: number) => {
                      const name =
                        a.KT_profiles?.display_name ||
                        a.KT_profiles?.username ||
                        (a.user_id === uid ? "Du" : `Crew #${idx + 1}`);
                      return (
                        <div key={idx} className="rosterChip">
                          <UserCheck size={14} />
                          <span>{name}</span>
                          {a.user_id === uid && <small className="mineTag">Du</small>}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="noCrewText">Noch keine Crewmitglieder eingetragen. Hilf mit!</p>
                )}
              </div>

              {actionMsg && <div className="inspectorActionMsg">{actionMsg}</div>}
            </div>

            <div className="inspectorActions">
              {(inspectShift.KT_shift_assignments || []).some((a: any) => a.user_id === uid) ? (
                <button
                  type="button"
                  className="dangerActionBtn"
                  disabled={actionBusy}
                  onClick={() => handleLeave(inspectShift)}
                >
                  <UserMinus size={16} /> Schicht verlassen
                </button>
              ) : (
                <button
                  type="button"
                  className="primary"
                  disabled={actionBusy}
                  onClick={() => handleJoin(inspectShift)}
                >
                  <UserPlus size={16} /> Schicht übernehmen
                </button>
              )}

              {onEditShift && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    const s = inspectShift;
                    setInspectShift(null);
                    onEditShift(s);
                  }}
                >
                  <Pencil size={15} /> Bearbeiten
                </button>
              )}

              <button
                type="button"
                className="secondary"
                onClick={() => setInspectShift(null)}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
