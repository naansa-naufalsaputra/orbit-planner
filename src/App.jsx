import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Notes from "./pages/Notes";
import Schedule from "./pages/Schedule";
import Tasks from "./pages/Tasks";
import CalendarPage from "./pages/Calendar";
import Grades from "./pages/Grades";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import { AuthProvider } from "./context/AuthContext";
import { GamificationProvider } from "./context/GamificationContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LevelUpModal from "./components/LevelUpModal";

function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <LevelUpModal />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="notes" element={<Notes />} />
              <Route path="schedule" element={<Schedule />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="grades" element={<Grades />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </GamificationProvider>
    </AuthProvider>
  );
}

export default App;
