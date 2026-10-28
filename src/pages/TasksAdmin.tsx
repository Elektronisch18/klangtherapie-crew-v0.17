import { useState, useEffect, useMemo } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  UserCheck,
  Users,
  Clock,
  AlertTriangle,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Save,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpDown,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.tsx";
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  assignTaskToCrewAndTeam,
} from "../services/tasks.ts";
import { listProfiles, listTeams } from "../services/admin.ts";
import type { TaskPriority, TaskStatus } from "../types/database.ts";

// Standard Teams für Demo-Modus
const initialDemoTeams = [
  { id: "t1", name: "Technik" },
  { id: "t2", name: "Aufbau" },
  { id: "t3", name: "Booking" },
  { id: "t4", name: "Awareness" },
  { id: "t5", name: "Bar & Gastro" },
  { id: "t6", name: "Einlass" },
  { id: "t7", name: "Catering" },
  { id: "t8", name: "Sicherheit" },
];

// Standard Crew-Mitglieder für Demo-Modus
const initialDemoUsers = [
  { id: "u1", display_name: "Max", username: "max", avatar_url: null },
  { id: "u2", display_name: "Lena", username: "lena", avatar_url: null },
  { id: "u3", display_name: "Sarah", username: "sarah", avatar_url: null },
  { id: "u4", display_name: "Kim", username: "kim", avatar_url: null },
  { id: "u5", display_name: "Laura", username: "laura", avatar_url: null },
  { id: "u6", display_name: "Nico", username: "nico", avatar_url: null },
  { id: "u7", display_name: "Alex", username: "alex", avatar_url: null },
  { id: "u8", display_name: "Felix", username: "felix", avatar_url: null },
];

// 10 authentische Festival-Aufgaben
const initialDemoTasks = [
  {
    id: "task-1",
    title: "Mainstage Licht-Traverse ausrichten & DMX adressieren",
    description: "Scheinwerfer ausrichten und DMX-Adressierung mit FoH-Pult abgleichen.",
    status: "in_progress" as TaskStatus,
    priority: "high" as TaskPriority,
    due_at: "2026-10-28",
    team_id: "t1",
    KT_teams: { id: "t1", name: "Technik" },
    user_id: "u1",
    KT_task_assignees: [{ user_id: "u1", KT_profiles: { id: "u1", display_name: "Max", username: "max" } }],
  },
  {
    id: "task-2",
    title: "Sanitärcontainer Wasseranschluss & Druckprüfung",
    description: "Hauptzuleitung prüfen, Spülkästen entlüften und Warmwasser testen.",
    status: "todo" as TaskStatus,
    priority: "high" as TaskPriority,
    due_at: "2026-10-28",
    team_id: "t2",
    KT_teams: { id: "t2", name: "Aufbau" },
    user_id: "u2",
    KT_task_assignees: [{ user_id: "u2", KT_profiles: { id: "u2", display_name: "Lena", username: "lena" } }],
  },
  {
    id: "task-3",
    title: "Awareness Zelt einrichten & Notfallkoffer bestücken",
    description: "Ruheliegen aufstellen, Sichtschutz anbringen und Decken/Wasser lagern.",
    status: "in_progress" as TaskStatus,
    priority: "medium" as TaskPriority,
    due_at: "2026-10-28",
    team_id: "t4",
    KT_teams: { id: "t4", name: "Awareness" },
    user_id: "u4",
    KT_task_assignees: [{ user_id: "u4", KT_profiles: { id: "u4", display_name: "Kim", username: "kim" } }],
  },
  {
    id: "task-4",
    title: "Artist Shuttle Fahrplan & Airport-Pickups abstimmen",
    description: "Ankunftszeiten am Bahnhof/Flughafen koordinieren und Fahrer zuteilen.",
    status: "todo" as TaskStatus,
    priority: "normal" as TaskPriority,
    due_at: "2026-10-29",
    team_id: "t3",
    KT_teams: { id: "t3", name: "Booking" },
    user_id: "u3",
    KT_task_assignees: [{ user_id: "u3", KT_profiles: { id: "u3", display_name: "Sarah", username: "sarah" } }],
  },
  {
    id: "task-5",
    title: "Einlass Scanner & Offline-Cache testen",
    description: "Alle 8 Handscanner aufladen, WLAN-Verbindung und lokale Ticket-DB prüfen.",
    status: "done" as TaskStatus,
    priority: "high" as TaskPriority,
    due_at: "2026-10-27",
    team_id: "t6",
    KT_teams: { id: "t6", name: "Einlass" },
    user_id: "u5",
    KT_task_assignees: [{ user_id: "u5", KT_profiles: { id: "u5", display_name: "Laura", username: "laura" } }],
  },
  {
    id: "task-6",
    title: "Bar 1 Wechselgeldkassetten & Pfandchips ausgeben",
    description: "Startkassen an Kassenleitung übergeben und Tresorcode hinterlegen.",
    status: "todo" as TaskStatus,
    priority: "medium" as TaskPriority,
    due_at: "2026-10-28",
    team_id: "t5",
    KT_teams: { id: "t5", name: "Bar & Gastro" },
    user_id: "u6",
    KT_task_assignees: [{ user_id: "u6", KT_profiles: { id: "u6", display_name: "Nico", username: "nico" } }],
  },
  {
    id: "task-7",
    title: "Funkgeräte Kanal-Check 1 bis 6 durchführen",
    description: "Akku-Ladestationen Backstage prüfen und Funkprotokoll verteilen.",
    status: "done" as TaskStatus,
    priority: "normal" as TaskPriority,
    due_at: "2026-10-27",
    team_id: "t1",
    KT_teams: { id: "t1", name: "Technik" },
    user_id: "u1",
    KT_task_assignees: [{ user_id: "u1", KT_profiles: { id: "u1", display_name: "Max", username: "max" } }],
  },
  {
    id: "task-8",
    title: "Müllpfand-Marken & Säcke an Hauptkasse liefern",
    description: "Dringend 500 Pfandmarken zur Kasse bringen – noch niemand zugewiesen!",
    status: "todo" as TaskStatus,
    priority: "high" as TaskPriority,
    due_at: "2026-10-28",
    team_id: "t6",
    KT_teams: { id: "t6", name: "Einlass" },
    user_id: null,
    KT_task_assignees: [],
  },
  {
    id: "task-9",
    title: "Catering Snack-Station & Obstkörbe Backstage auffüllen",
    description: "Frisches Obst, vegane Riegel und Kaffeebohnen nachbestücken.",
    status: "in_progress" as TaskStatus,
    priority: "low" as TaskPriority,
    due_at: "2026-10-28",
    team_id: "t7",
    KT_teams: { id: "t7", name: "Catering" },
    user_id: "u7",
    KT_task_assignees: [{ user_id: "u7", KT_profiles: { id: "u7", display_name: "Alex", username: "alex" } }],
  },
  {
    id: "task-10",
    title: "Security Notausgangsbeschilderung & Zaun-Check",
    description: "Bauzaun-Klammern nachziehen und Notausgangsleuchten testen.",
    status: "todo" as TaskStatus,
    priority: "high" as TaskPriority,
    due_at: "2026-10-28",
    team_id: "t8",
    KT_teams: { id: "t8", name: "Sicherheit" },
    user_id: null,
    KT_task_assignees: [],
  },
];

const priorityLabels: Record<string, { label: string; className: string }> = {
  high: { label: "Hoch", className: "prioHigh" },
  medium: { label: "Mittel", className: "prioMedium" },
  normal: { label: "Normal", className: "prioNormal" },
  low: { label: "Niedrig", className: "prioLow" },
};

const statusLabels: Record<string, { label: string; className: string }> = {
  todo: { label: "Offen", className: "statusTodo" },
  in_progress: { label: "In Bearbeitung", className: "statusProgress" },
  doing: { label: "In Bearbeitung", className: "statusProgress" },
  done: { label: "Erledigt", className: "statusDone" },
};

export default function TasksAdmin() {
  const { demo, user } = useAuth();
  const [tasks, setTasks] = useState<any[]>(initialDemoTasks);
  const [users, setUsers] = useState<any[]>(initialDemoUsers);
  const [teams, setTeams] = useState<any[]>(initialDemoTeams);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  // Modal State: Create
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("normal");
  const [newStatus, setNewStatus] = useState<TaskStatus>("todo");
  const [newTeamId, setNewTeamId] = useState<string>("");
  const [newUserId, setNewUserId] = useState<string>("");
  const [newDueDate, setNewDueDate] = useState<string>("");

  // Modal State: Edit
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);

  // Load live data from Supabase
  const loadData = async () => {
    if (demo) {
      setTasks(initialDemoTasks);
      setUsers(initialDemoUsers);
      setTeams(initialDemoTeams);
      return;
    }
    setLoading(true);
    try {
      const [tasksRes, profilesRes, teamsRes] = await Promise.all([
        listTasks(),
        listProfiles(),
        listTeams(),
      ]);

      if (tasksRes.data && tasksRes.data.length > 0) {
        setTasks(tasksRes.data);
      }
      if (profilesRes.data && profilesRes.data.length > 0) {
        setUsers(profilesRes.data);
      }
      if (teamsRes.data && teamsRes.data.length > 0) {
        setTeams(teamsRes.data);
      }
    } catch {
      // fallback to demo data if offline or error
      setTasks(initialDemoTasks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [demo]);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Helper: Get assigned user ID from task
  const getAssignedUserId = (t: any): string => {
    if (t.user_id) return t.user_id;
    if (t.KT_task_assignees && t.KT_task_assignees.length > 0) {
      return t.KT_task_assignees[0].user_id || "";
    }
    return "";
  };

  // Helper: Get assigned user profile
  const getAssignedUserProfile = (t: any) => {
    const uid = getAssignedUserId(t);
    if (!uid) return null;
    return users.find((u) => u.id === uid) || null;
  };

  // Handle Team change directly from table row
  const handleTeamChange = async (taskId: string, newTeamIdValue: string) => {
    const teamObj = teams.find((tm) => tm.id === newTeamIdValue) || null;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              team_id: newTeamIdValue || null,
              KT_teams: teamObj ? { id: teamObj.id, name: teamObj.name } : null,
            }
          : t
      )
    );

    if (!demo) {
      try {
        await updateTask(taskId, { team_id: newTeamIdValue || null });
        showToast("Team erfolgreich zugewiesen.");
      } catch (e: any) {
        showToast(`Fehler: ${e.message}`);
        loadData();
      }
    } else {
      showToast(`Team '${teamObj ? teamObj.name : "Kein"}' zugewiesen.`);
    }
  };

  // Handle Crew Member change directly from table row
  const handleAssigneeChange = async (taskId: string, newUserIdValue: string) => {
    const userObj = users.find((u) => u.id === newUserIdValue) || null;
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          user_id: newUserIdValue || null,
          KT_task_assignees: newUserIdValue
            ? [{ user_id: newUserIdValue, KT_profiles: userObj }]
            : [],
        };
      })
    );

    if (!demo) {
      try {
        const currentTask = tasks.find((t) => t.id === taskId);
        await assignTaskToCrewAndTeam(taskId, newUserIdValue || null, currentTask?.team_id || null);
        showToast("Crew-Mitglied erfolgreich zugewiesen.");
      } catch (e: any) {
        showToast(`Fehler: ${e.message}`);
        loadData();
      }
    } else {
      showToast(
        userObj
          ? `Aufgabe an ${userObj.display_name || userObj.username} zugewiesen.`
          : "Zuweisung aufgehoben."
      );
    }
  };

  // Handle Status change directly
  const handleStatusChange = async (taskId: string, newStatusValue: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatusValue } : t))
    );

    if (!demo) {
      try {
        await updateTask(taskId, { status: newStatusValue });
        showToast("Status aktualisiert.");
      } catch (e: any) {
        showToast(`Fehler: ${e.message}`);
        loadData();
      }
    } else {
      showToast("Status aktualisiert.");
    }
  };

  // Handle Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Möchtest du diese Aufgabe wirklich löschen?")) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    if (!demo) {
      try {
        await deleteTask(taskId);
        showToast("Aufgabe gelöscht.");
      } catch (e: any) {
        showToast(`Fehler: ${e.message}`);
        loadData();
      }
    } else {
      showToast("Aufgabe gelöscht.");
    }
  };

  // Open Edit Modal
  const openEditModal = (task: any) => {
    setEditingTask({
      id: task.id,
      title: task.title || "",
      description: task.description || "",
      status: task.status || "todo",
      priority: task.priority || "normal",
      due_at: task.due_at || "",
      team_id: task.team_id || (task.KT_teams?.id || ""),
      user_id: getAssignedUserId(task),
    });
    setEditModalOpen(true);
  };

  // Save Edit Modal
  const handleSaveEdit = async () => {
    if (!editingTask || !editingTask.title.trim()) return;

    const teamObj = teams.find((t) => t.id === editingTask.team_id) || null;
    const userObj = users.find((u) => u.id === editingTask.user_id) || null;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== editingTask.id) return t;
        return {
          ...t,
          title: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
          priority: editingTask.priority,
          due_at: editingTask.due_at || null,
          team_id: editingTask.team_id || null,
          KT_teams: teamObj ? { id: teamObj.id, name: teamObj.name } : null,
          user_id: editingTask.user_id || null,
          KT_task_assignees: editingTask.user_id
            ? [{ user_id: editingTask.user_id, KT_profiles: userObj }]
            : [],
        };
      })
    );

    if (!demo) {
      try {
        await updateTask(editingTask.id, {
          title: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
          priority: editingTask.priority,
          due_at: editingTask.due_at || null,
          team_id: editingTask.team_id || null,
        });
        await assignTaskToCrewAndTeam(
          editingTask.id,
          editingTask.user_id || null,
          editingTask.team_id || null
        );
        showToast("Aufgabe erfolgreich gespeichert.");
      } catch (e: any) {
        showToast(`Fehler: ${e.message}`);
        loadData();
      }
    } else {
      showToast("Aufgabe gespeichert.");
    }

    setEditModalOpen(false);
    setEditingTask(null);
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const teamObj = teams.find((t) => t.id === newTeamId) || null;
    const userObj = users.find((u) => u.id === newUserId) || null;
    const tempId = `task-${Date.now()}`;

    const newTaskObj = {
      id: tempId,
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      priority: newPriority,
      status: newStatus,
      due_at: newDueDate || null,
      team_id: newTeamId || null,
      KT_teams: teamObj ? { id: teamObj.id, name: teamObj.name } : null,
      user_id: newUserId || null,
      KT_task_assignees: newUserId ? [{ user_id: newUserId, KT_profiles: userObj }] : [],
    };

    setTasks((prev) => [newTaskObj, ...prev]);

    if (!demo) {
      try {
        const res = await createTask({
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          priority: newPriority,
          team_id: newTeamId || null,
          created_by: user?.id || "admin",
          due_at: newDueDate || null,
        });

        if (res.data && res.data.id && newUserId) {
          await assignTaskToCrewAndTeam(res.data.id, newUserId, newTeamId || null);
        }
        showToast("Neue Aufgabe angelegt.");
        loadData();
      } catch (e: any) {
        showToast(`Fehler: ${e.message}`);
        loadData();
      }
    } else {
      showToast("Neue Aufgabe angelegt.");
    }

    // Reset Form
    setNewTitle("");
    setNewDescription("");
    setNewPriority("normal");
    setNewStatus("todo");
    setNewTeamId("");
    setNewUserId("");
    setNewDueDate("");
    setCreateModalOpen(false);
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Text Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const titleMatch = (t.title || "").toLowerCase().includes(q);
        const descMatch = (t.description || "").toLowerCase().includes(q);
        const teamMatch = (t.KT_teams?.name || "").toLowerCase().includes(q);
        const userObj = getAssignedUserProfile(t);
        const userMatch =
          userObj &&
          ((userObj.display_name || "").toLowerCase().includes(q) ||
            (userObj.username || "").toLowerCase().includes(q));

        if (!titleMatch && !descMatch && !teamMatch && !userMatch) return false;
      }

      // Status
      if (statusFilter !== "all") {
        if (statusFilter === "in_progress" && (t.status === "in_progress" || t.status === "doing")) {
          // match
        } else if (t.status !== statusFilter) {
          return false;
        }
      }

      // Priority
      if (priorityFilter !== "all" && (t.priority || "normal") !== priorityFilter) {
        return false;
      }

      // Team
      if (teamFilter !== "all") {
        const tid = t.team_id || t.KT_teams?.id;
        if (tid !== teamFilter) return false;
      }

      // Assignee
      if (assigneeFilter !== "all") {
        const uid = getAssignedUserId(t);
        if (assigneeFilter === "unassigned") {
          if (uid) return false;
        } else if (uid !== assigneeFilter) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, search, statusFilter, priorityFilter, teamFilter, assigneeFilter, users]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const todoCount = tasks.filter((t) => t.status === "todo").length;
    const progressCount = tasks.filter(
      (t) => t.status === "in_progress" || t.status === "doing"
    ).length;
    const doneCount = tasks.filter((t) => t.status === "done").length;
    const assignedCount = tasks.filter((t) => !!getAssignedUserId(t)).length;
    const unassignedCount = total - assignedCount;

    return { total, todoCount, progressCount, doneCount, assignedCount, unassignedCount };
  }, [tasks]);

  return (
    <section className="page tasksAdminPage">
      {/* ================= 1. HEADER ================= */}
      <div className="titleRow">
        <div>
          <span className="eyebrow">ADMINISTRATION · AUFGABEN</span>
          <h1>Aufgaben-Verwaltung</h1>
          <p>Gesamte Aufgabenliste mit Zuweisung an Crew-Mitglieder und Teams.</p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <button className="primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} /> Neue Aufgabe
          </button>
          <button className="secondary" onClick={loadData} title="Aktualisieren">
            <RefreshCw size={16} className={loading ? "spin" : ""} />
          </button>
        </div>
      </div>

      {/* ================= TOAST FEEDBACK ================= */}
      {feedback && <div className="adminToastFeedback">{feedback}</div>}

      {/* ================= 2. STATS TILES ================= */}
      <div className="tasksAdminStatsGrid">
        <div className="adminStatCard glass">
          <div className="statIconWrapper blue">
            <CheckSquare size={20} />
          </div>
          <div>
            <div className="statNum">{stats.total}</div>
            <div className="statLabel">Aufgaben gesamt</div>
          </div>
        </div>

        <div className="adminStatCard glass">
          <div className="statIconWrapper orange">
            <Clock size={20} />
          </div>
          <div>
            <div className="statNum">{stats.todoCount}</div>
            <div className="statLabel">Offen</div>
          </div>
        </div>

        <div className="adminStatCard glass">
          <div className="statIconWrapper purple">
            <ArrowUpDown size={20} />
          </div>
          <div>
            <div className="statNum">{stats.progressCount}</div>
            <div className="statLabel">In Bearbeitung</div>
          </div>
        </div>

        <div className="adminStatCard glass">
          <div className="statIconWrapper green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="statNum">{stats.doneCount}</div>
            <div className="statLabel">Erledigt</div>
          </div>
        </div>

        <div className="adminStatCard glass">
          <div className={`statIconWrapper ${stats.unassignedCount > 0 ? "rose" : "cyan"}`}>
            <UserCheck size={20} />
          </div>
          <div>
            <div className="statNum">{stats.assignedCount}</div>
            <div className="statLabel">
              Crew zugewiesen {stats.unassignedCount > 0 && `(${stats.unassignedCount} frei)`}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. FILTER BAR ================= */}
      <div className="tasksAdminFilterCard glass">
        <div className="filterTopRow">
          {/* SEARCH */}
          <div className="searchBox">
            <Search size={16} />
            <input
              type="text"
              placeholder="Aufgabe, Team oder Crew-Mitglied suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clearBtn" onClick={() => setSearch("")}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* STATUS FILTER */}
          <div className="adminSelectGroup">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Alle Status</option>
              <option value="todo">Offen (todo)</option>
              <option value="in_progress">In Bearbeitung</option>
              <option value="done">Erledigt (done)</option>
            </select>
          </div>

          {/* PRIORITY FILTER */}
          <div className="adminSelectGroup">
            <label>Priorität:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">Alle Prioritäten</option>
              <option value="high">Hoch</option>
              <option value="medium">Mittel</option>
              <option value="normal">Normal</option>
              <option value="low">Niedrig</option>
            </select>
          </div>

          {/* TEAM FILTER */}
          <div className="adminSelectGroup">
            <label>Team:</label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
            >
              <option value="all">Alle Teams ({teams.length})</option>
              {teams.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name}
                </option>
              ))}
            </select>
          </div>

          {/* CREW ASSIGNEE FILTER */}
          <div className="adminSelectGroup">
            <label>Crew:</label>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="all">Alle Crew-Mitglieder</option>
              <option value="unassigned">⚠️ Nicht zugewiesen</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.display_name || u.username}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ================= 4. TASKS TABLE ================= */}
      <div className="tasksAdminTableContainer glass">
        <table className="tasksAdminTable">
          <thead>
            <tr>
              <th style={{ width: "130px" }}>Status</th>
              <th style={{ minWidth: "260px" }}>Aufgabe & Beschreibung</th>
              <th style={{ width: "110px" }}>Priorität</th>
              <th style={{ width: "190px" }}>Team zuweisen</th>
              <th style={{ width: "210px" }}>Crew zuweisen</th>
              <th style={{ width: "115px" }}>Fällig</th>
              <th style={{ width: "85px", textAlign: "right" }}>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const assignedUid = getAssignedUserId(task);
                const assignedProfile = getAssignedUserProfile(task);
                const prio = priorityLabels[task.priority] || priorityLabels.normal;
                const stat = statusLabels[task.status] || statusLabels.todo;

                return (
                  <tr key={task.id} className="tasksAdminRow">
                    {/* STATUS SELECT */}
                    <td>
                      <select
                        className={`statusSelect ${stat.className}`}
                        value={task.status === "doing" ? "in_progress" : task.status || "todo"}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      >
                        <option value="todo">Offen</option>
                        <option value="in_progress">In Bearbeitung</option>
                        <option value="done">Erledigt</option>
                      </select>
                    </td>

                    {/* TASK TITLE & DESC */}
                    <td className="taskTitleCol">
                      <div className="taskTitleText" onClick={() => openEditModal(task)}>
                        <strong>{task.title}</strong>
                        {task.description && <p>{task.description}</p>}
                      </div>
                    </td>

                    {/* PRIORITY BADGE */}
                    <td>
                      <span className={`adminPrioBadge ${prio.className}`}>
                        {prio.label}
                      </span>
                    </td>

                    {/* TEAM ASSIGNMENT SELECT */}
                    <td>
                      <div className="cellSelectWrapper">
                        <Layers size={13} className="selectFieldIcon" />
                        <select
                          className="adminCellSelect"
                          value={task.team_id || (task.KT_teams?.id || "")}
                          onChange={(e) => handleTeamChange(task.id, e.target.value)}
                        >
                          <option value="">– Kein Team –</option>
                          {teams.map((tm) => (
                            <option key={tm.id} value={tm.id}>
                              {tm.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* CREW ASSIGNMENT SELECT */}
                    <td>
                      <div className="cellSelectWrapper">
                        <Users size={13} className="selectFieldIcon" />
                        <select
                          className={`adminCellSelect ${!assignedUid ? "unassignedSelect" : ""}`}
                          value={assignedUid}
                          onChange={(e) => handleAssigneeChange(task.id, e.target.value)}
                        >
                          <option value="">– Nicht zugewiesen –</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.display_name || u.username}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* DUE DATE */}
                    <td>
                      <div className="dateCol">
                        <Calendar size={13} />
                        <span>{task.due_at || "–"}</span>
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ textAlign: "right" }}>
                      <div className="tableActionBtns">
                        <button
                          type="button"
                          className="tableIconBtn"
                          title="Bearbeiten & Zuweisen"
                          onClick={() => openEditModal(task)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="tableIconBtn danger"
                          title="Löschen"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="emptyTableCol">
                  <div className="emptyState">
                    <p>Keine Aufgaben für die aktuellen Filterkriterien gefunden.</p>
                    <button
                      className="secondary"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                        setPriorityFilter("all");
                        setTeamFilter("all");
                        setAssigneeFilter("all");
                      }}
                    >
                      Filter zurücksetzen
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= 5. MODAL: NEUE AUFGABE ANLEGEN ================= */}
      {createModalOpen && (
        <div className="modalOverlay" onClick={() => setCreateModalOpen(false)}>
          <div className="adminModalCard glass" onClick={(e) => e.stopPropagation()}>
            <div className="adminModalHeader">
              <div>
                <span className="eyebrow">AUFGABE ERSTELLEN</span>
                <h2>Neue Aufgabe</h2>
              </div>
              <button
                type="button"
                className="closeBtn"
                onClick={() => setCreateModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="adminModalForm">
              <div className="formGroup">
                <label>Titel der Aufgabe *</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Stromaggregat Bühne 2 prüfen"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="formGroup">
                <label>Beschreibung (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Details, Anforderungen oder Kontaktpersonen..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div className="formRowGrid">
                <div className="formGroup">
                  <label>Priorität</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  >
                    <option value="high">Hoch</option>
                    <option value="medium">Mittel</option>
                    <option value="normal">Normal</option>
                    <option value="low">Niedrig</option>
                  </select>
                </div>

                <div className="formGroup">
                  <label>Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                  >
                    <option value="todo">Offen</option>
                    <option value="in_progress">In Bearbeitung</option>
                    <option value="done">Erledigt</option>
                  </select>
                </div>

                <div className="formGroup">
                  <label>Fällig am</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="assignmentHighlightBox">
                <h4>Direkte Zuweisung</h4>
                <div className="formRowGrid">
                  <div className="formGroup">
                    <label>Team zuweisen</label>
                    <select
                      value={newTeamId}
                      onChange={(e) => setNewTeamId(e.target.value)}
                    >
                      <option value="">– Kein Team –</option>
                      {teams.map((tm) => (
                        <option key={tm.id} value={tm.id}>
                          {tm.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="formGroup">
                    <label>Crew-Mitglied zuweisen</label>
                    <select
                      value={newUserId}
                      onChange={(e) => setNewUserId(e.target.value)}
                    >
                      <option value="">– Nicht zugewiesen –</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.display_name || u.username}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="adminModalActions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Abbrechen
                </button>
                <button type="submit" className="primary">
                  <Plus size={16} /> Aufgabe anlegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 6. MODAL: AUFGABE BEARBEITEN & ZUWEISEN ================= */}
      {editModalOpen && editingTask && (
        <div className="modalOverlay" onClick={() => setEditModalOpen(false)}>
          <div className="adminModalCard glass" onClick={(e) => e.stopPropagation()}>
            <div className="adminModalHeader">
              <div>
                <span className="eyebrow">AUFGABE BEARBEITEN & ZUWEISEN</span>
                <h2>Aufgabe bearbeiten</h2>
              </div>
              <button
                type="button"
                className="closeBtn"
                onClick={() => setEditModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="adminModalForm">
              <div className="formGroup">
                <label>Titel</label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                />
              </div>

              <div className="formGroup">
                <label>Beschreibung</label>
                <textarea
                  rows={3}
                  value={editingTask.description || ""}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, description: e.target.value })
                  }
                />
              </div>

              <div className="formRowGrid">
                <div className="formGroup">
                  <label>Priorität</label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        priority: e.target.value as TaskPriority,
                      })
                    }
                  >
                    <option value="high">Hoch</option>
                    <option value="medium">Mittel</option>
                    <option value="normal">Normal</option>
                    <option value="low">Niedrig</option>
                  </select>
                </div>

                <div className="formGroup">
                  <label>Status</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        status: e.target.value as TaskStatus,
                      })
                    }
                  >
                    <option value="todo">Offen</option>
                    <option value="in_progress">In Bearbeitung</option>
                    <option value="done">Erledigt</option>
                  </select>
                </div>

                <div className="formGroup">
                  <label>Fällig am</label>
                  <input
                    type="date"
                    value={editingTask.due_at || ""}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, due_at: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* ZUWEISUNGEN */}
              <div className="assignmentHighlightBox">
                <h4>Team- & Crew-Zuweisung</h4>
                <div className="formRowGrid">
                  <div className="formGroup">
                    <label>Team zuweisen</label>
                    <select
                      value={editingTask.team_id || ""}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, team_id: e.target.value })
                      }
                    >
                      <option value="">– Kein Team –</option>
                      {teams.map((tm) => (
                        <option key={tm.id} value={tm.id}>
                          {tm.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="formGroup">
                    <label>Crew-Mitglied zuweisen</label>
                    <select
                      value={editingTask.user_id || ""}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, user_id: e.target.value })
                      }
                    >
                      <option value="">– Nicht zugewiesen –</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.display_name || u.username}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="adminModalActions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setEditModalOpen(false)}
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={handleSaveEdit}
                >
                  <Save size={16} /> Änderungen speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
