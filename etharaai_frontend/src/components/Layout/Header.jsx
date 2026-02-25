import React from "react";
import { useLocation } from "react-router-dom";

const titles = {
  "/": "Dashboard",
  "/employees": "Employees",
  "/attendance": "Attendance",
};

export default function Header() {
  const { pathname } = useLocation();
  const title = titles[pathname] || "HRMS Lite";

  return (
    <header className="header">
      <h1>{title}</h1>
      <div className="header-user">
        <span className="avatar">A</span>
        <span>Admin</span>
      </div>
    </header>
  );
}
