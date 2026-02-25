import React from "react";
import { FiUsers, FiUserCheck, FiUserX, FiClock } from "react-icons/fi";

const cardConfig = [
  { key: "total_employees", label: "Total Employees", icon: FiUsers, accent: "#4f46e5" },
  { key: "present_today", label: "Present Today", icon: FiUserCheck, accent: "#059669" },
  { key: "absent_today", label: "Absent Today", icon: FiUserX, accent: "#dc2626" },
  { key: "not_marked_today", label: "Not Marked", icon: FiClock, accent: "#d97706" },
];

export default function DashboardCards({ data }) {
  return (
    <div className="kpi-grid">
      {cardConfig.map((cfg) => {
        const Icon = cfg.icon;
        return (
          <div key={cfg.key} className="kpi-tile" style={{ "--accent": cfg.accent }}>
            <div className="kpi-left">
              <span className="kpi-number">{data[cfg.key]}</span>
              <span className="kpi-label">{cfg.label}</span>
            </div>
            <div className="kpi-icon-ring">
              <Icon />
            </div>
          </div>
        );
      })}
    </div>
  );
}
