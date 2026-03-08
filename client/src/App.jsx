import { Routes, Route, NavLink, Navigate } from "react-router-dom";
import Reception from "./Reception";
import Doctor from "./Doctor";
import Queue from "./Queue";
import "./index.css";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>Clinic Queue System</h1>
          <p>Real-time patient queue dashboard</p>
        </div>

        <nav className="nav-links">
          <NavLink to="/reception" className={({ isActive }) => isActive ? "active" : ""}>
            Reception
          </NavLink>
          <NavLink to="/doctor" className={({ isActive }) => isActive ? "active" : ""}>
            Doctor
          </NavLink>
          <NavLink to="/queue" className={({ isActive }) => isActive ? "active" : ""}>
            Queue Screen
          </NavLink>
        </nav>
      </header>

      <main className="page-content">
        <Routes>
          <Route path="/" element={<Navigate to="/reception" />} />
          <Route path="/reception" element={<Reception />} />
          <Route path="/doctor" element={<Doctor />} />
          <Route path="/queue" element={<Queue />} />
        </Routes>
      </main>
    </div>
  );
}