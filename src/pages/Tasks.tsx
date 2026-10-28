import TaskDetailDrawer from "../components/TaskDetailDrawer";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import { tasks as demoTasks } from "../../_migrations/demo";
import { listTasks, updateTaskStatus, createTask } from "../services/tasks";
import { useAuth } from "../contexts/AuthContext";
import type { TaskPriority } from "../types/database.ts";

const prioLabels: Record<string, string> = {
  low: "Niedrig",
  normal: "Normal",
  medium: "Mittel",
  high: "Hoch",
};

function Card({ t, onSelect }: { t: any; onSelect: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: t.id || t.title,
    data: { task: t },
  });

  const prioKey = (t.priority || "normal").toLowerCase();
  const isHigh = prioKey === "high" || prioKey === "hoch";
  const displayPrio = prioLabels[prioKey] || t.priority || "Normal";

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined,
        cursor: "pointer",
      }}
      className="task"
      onClick={(e) => {
        // Only open drawer if not actively dragging
        if (!transform) {
          onSelect(t.id || t.title);
        }
      }}
    >
      <b>{t.title}</b>
      <div>
        <em className={isHigh ? "danger" : ""}>{displayPrio}</em>
        <em>{t.team || t.KT_teams?.name || "Crew"}</em>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
        <small>◷ {t.date || "offen"}</small>
        <span style={{ fontSize: "11px", color: "#8a97a5" }}>Details ›</span>
      </div>
    </article>
  );
}

function Column({ id, label, tasks, onSelect }: { id: string; label: string; tasks: any[]; onSelect: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={"column glass " + (isOver ? "dropover" : "")}>
      <h3>
        <span>{label}</span>
        <span className="colCount">{tasks.length}</span>
      </h3>
      <div className="columnTasks">
        {tasks.map((t) => (
          <Card key={t.id || t.title} t={t} onSelect={onSelect} />
        ))}
        {tasks.length === 0 && (
          <div className="emptyColumnHint">Keine Aufgaben</div>
        )}
      </div>
    </div>
  );
}

export default function Tasks() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const { demo, user, canEdit } = useAuth();
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [items, setItems] = useState<any[]>(demoTasks.map((x, i) => ({ ...x, id: `demo-${i}` })));

  useEffect(() => {
    if (!demo)
      listTasks().then(({ data }) =>
        setItems(
          (data || []).map((x: any) => ({
            ...x,
            team: x.KT_teams?.name,
            date: x.due_at ? new Date(x.due_at).toLocaleDateString("de-DE") : "offen",
          }))
        )
      );
  }, [demo]);

  async function drag(e: any) {
    const id = e.active.id,
      status = e.over?.id;
    if (!status || !["todo", "doing", "done"].includes(status)) return;
    setItems((x) => x.map((t) => (t.id === id ? { ...t, status } : t)));
    if (!demo) await updateTaskStatus(id, status);
  }

  let cols = [
    ["todo", "To Do"],
    ["doing", "In Arbeit"],
    ["done", "Erledigt"],
  ];

  return (
    <section className="page tasksPage">
      <div className="titleRow">
        <div>
          <h1>AUFGABEN</h1>
          <p>Globales Aufgaben-Board · Drag & Drop · Klick für Details</p>
        </div>
        {canEdit && (
          <button className="primary" onClick={() => setModal(true)}>
            <Plus size={18} /> Aufgabe erstellen
          </button>
        )}
      </div>
      <DndContext onDragEnd={drag}>
        <div className="kanban">
          {cols.map(([id, label]) => (
            <Column
              key={id}
              id={id}
              label={label}
              tasks={items.filter((t) => t.status === id)}
              onSelect={(taskId) => setSelectedTask(taskId)}
            />
          ))}
        </div>
      </DndContext>
      {modal && (
        <div className="modalback">
          <div className="modal glass">
            <button className="close" onClick={() => setModal(false)}>
              <X />
            </button>
            <h2>Neue Aufgabe</h2>
            <label>
              Titel
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Was ist zu tun?" />
            </label>
            <label>
              Priorität
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                <option value="low">Niedrig</option>
                <option value="normal">Normal</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
              </select>
            </label>
            <button
              className="primary full"
              onClick={async () => {
                if (!title.trim()) return;
                let n: any = {
                  id: crypto.randomUUID(),
                  title,
                  priority,
                  status: "todo",
                  team: "Crew",
                  date: "offen",
                };
                if (!demo && user) {
                  const { data } = await createTask({ title, priority, created_by: user.id });
                  if (data) n = { ...data, team: "Crew", date: "offen" };
                }
                setItems((x) => [n, ...x]);
                setTitle("");
                setModal(false);
              }}
            >
              Aufgabe erstellen
            </button>
          </div>
        </div>
      )}
      {selectedTask && <TaskDetailDrawer taskId={selectedTask} onClose={() => setSelectedTask(null)} />}
    </section>
  );
}
