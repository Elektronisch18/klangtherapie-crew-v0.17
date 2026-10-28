import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Messenger from "./pages/Messenger";
import ChatRoom from "./pages/ChatRoom";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Crew from "./pages/Crew";
import Documents from "./pages/Documents";
import ControlCenter from "./pages/ControlCenter";
import ShiftPlan from "./pages/ShiftPlan";
import Festival from "./pages/Festival";
import FestivalAdmin from "./pages/FestivalAdmin";
import CheckIn from "./pages/CheckIn";
import Profile from "./pages/Profile";
import RolesAdmin from "./pages/RolesAdmin";
import TasksAdmin from "./pages/TasksAdmin.tsx";
import Admin from "./pages/Admin";
import UserSettings from "./pages/UserSettings";
import FAQ from "./pages/FAQ.tsx";
import Placeholder from "./pages/Placeholder";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function Inner() {
  const { session, loading, demo } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [room, setRoom] = useState<{ id: string; title: string } | null>(null);

  if (loading) {
    return (
      <div className="splash" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <b style={{ letterSpacing: "4px", fontSize: "20px" }}>KLANGTHERAPIE</b>
        <small style={{ letterSpacing: "3px", fontSize: "11px", opacity: 0.7, marginTop: "6px" }}>CREW PLANER</small>
      </div>
    );
  }
  if (!session && !demo) return <Login />;

  let view;
  if (room) {
    view = <ChatRoom id={room.id} title={room.title} onBack={() => setRoom(null)} />;
  } else {
    switch (page) {
      case "dashboard":
        view = <Dashboard navigate={setPage} />;
        break;
      case "chats":
        view = <Messenger />;
        break;
      case "tasks":
        view = <Tasks />;
        break;
      case "calendar":
        view = <Calendar />;
        break;
      case "crew":
        view = <Crew />;
        break;
      case "files":
        view = <Documents />;
        break;
      case "festival":
        view = <Festival />;
        break;
      case "shiftplan":
        view = <ShiftPlan />;
        break;
      case "checkin":
        view = <CheckIn />;
        break;
      case "controlcenter":
        view = <ControlCenter />;
        break;
      case "profile":
        view = <Profile />;
        break;
      case "settings":
        view = <UserSettings />;
        break;
      case "faq":
        view = <FAQ navigate={setPage} />;
        break;
      case "admin":
        view = <Admin />;
        break;
      case "roles-admin":
        view = <RolesAdmin />;
        break;
      case "festival-admin":
        view = <FestivalAdmin />;
        break;
      case "tasks-admin":
        view = <TasksAdmin />;
        break;
      case "more":
        view = <Placeholder title="Mehr" navigate={setPage} />;
        break;
      default:
        view = <Placeholder title={page} navigate={setPage} />;
    }
  }

  return (
    <Layout
      page={page}
      setPage={(p) => {
        setRoom(null);
        setPage(p);
      }}
    >
      {view}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Inner />
    </AuthProvider>
  );
}
