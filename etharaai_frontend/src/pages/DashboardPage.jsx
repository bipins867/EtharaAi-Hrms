import React, { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboard";
import DashboardCards from "../components/Dashboard/DashboardCards";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "#4f46e5", "#059669", "#d97706", "#dc2626",
  "#7c3aed", "#0891b2", "#be185d", "#65a30d",
];

function pickColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboard();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return <EmptyState message="No dashboard data available." />;

  const maxDeptCount = Math.max(...data.departments.map((d) => d.count), 1);

  return (
    <div className="dash">
      <div className="dash-welcome">
        <h2>{getGreeting()}, Admin</h2>
        <p className="dash-date">{formatDate()}</p>
      </div>

      <DashboardCards data={data} />

      <div className="dash-panels">
        {/* --- Department Breakdown --- */}
        <div className="card dash-panel">
          <h3>Departments</h3>
          {data.departments.length === 0 ? (
            <EmptyState message="No departments yet." />
          ) : (
            <div className="dept-bars">
              {data.departments.map((d) => (
                <div key={d.department} className="dept-row">
                  <div className="dept-meta">
                    <span className="dept-name">{d.department}</span>
                    <span className="dept-count">{d.count}</span>
                  </div>
                  <div className="dept-track">
                    <div
                      className="dept-fill"
                      style={{ width: `${(d.count / maxDeptCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Employee Attendance Overview --- */}
        <div className="card dash-panel">
          <h3>Attendance Overview</h3>
          {data.employee_attendance.length === 0 ? (
            <EmptyState message="No employees yet." />
          ) : (
            <div className="att-list">
              {data.employee_attendance.map((emp) => {
                const pct = emp.total_records > 0
                  ? Math.round((emp.total_present / emp.total_records) * 100)
                  : 0;
                const absent = emp.total_records - emp.total_present;
                const bgColor = pickColor(emp.full_name);

                return (
                  <div key={emp.id} className="att-row">
                    <div className="att-avatar" style={{ background: bgColor }}>
                      {getInitials(emp.full_name)}
                    </div>
                    <div className="att-info">
                      <span className="att-name">{emp.full_name}</span>
                      <span className="att-dept">{emp.department}</span>
                    </div>
                    <div className="att-stats">
                      <span className="badge badge-success">{emp.total_present}P</span>
                      <span className="badge badge-danger">{absent}A</span>
                    </div>
                    <div className="att-pct">
                      <svg viewBox="0 0 36 36" className="ring-svg">
                        <circle cx="18" cy="18" r="15.9" className="ring-bg" />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          className="ring-fg"
                          style={{
                            strokeDasharray: `${pct} ${100 - pct}`,
                            stroke: pct >= 75 ? "#059669" : pct >= 50 ? "#d97706" : "#dc2626",
                          }}
                        />
                      </svg>
                      <span className="ring-label">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
