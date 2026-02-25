import React from "react";
import { NavLink } from "react-router-dom";
import { FiGrid, FiUsers, FiCalendar } from "react-icons/fi";

const links = [
  { to: "/", label: "Dashboard", icon: <FiGrid /> },
  { to: "/employees", label: "Employees", icon: <FiUsers /> },
  { to: "/attendance", label: "Attendance", icon: <FiCalendar /> },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>HRMS Lite</h2>
      </div>
      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
