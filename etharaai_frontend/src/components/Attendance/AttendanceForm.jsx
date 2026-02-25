import React, { useState, useEffect, useCallback } from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { getAttendanceByEmployee } from "../../api/attendance";

const AVATAR_COLORS = [
  "#4f46e5", "#059669", "#d97706", "#dc2626",
  "#7c3aed", "#0891b2", "#be185d", "#65a30d",
];

function pickColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function AttendanceForm({ employees, onSubmit }) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [dayRecords, setDayRecords] = useState({});
  const [saving, setSaving] = useState({});

  const fetchDayRecords = useCallback(async () => {
    if (!selectedDate || employees.length === 0) return;
    try {
      // Fetch attendance for each employee on the selected date
      const map = {};
      for (const emp of employees) {
        try {
          const res = await getAttendanceByEmployee(emp.employee_id, selectedDate);
          if (res.data.length > 0) {
            map[emp.employee_id] = res.data[0].status;
          }
        } catch {
          // skip
        }
      }
      setDayRecords(map);
    } catch {
      setDayRecords({});
    }
  }, [selectedDate, employees]);

  useEffect(() => { fetchDayRecords(); }, [fetchDayRecords]);

  const handleMark = async (employeeId, status) => {
    setSaving((prev) => ({ ...prev, [employeeId]: true }));
    try {
      await onSubmit({ employee_id: employeeId, date: selectedDate, status });
      setDayRecords((prev) => ({ ...prev, [employeeId]: status }));
    } finally {
      setSaving((prev) => ({ ...prev, [employeeId]: false }));
    }
  };

  const marked = employees.filter((e) => dayRecords[e.employee_id]);
  const unmarked = employees.filter((e) => !dayRecords[e.employee_id]);

  return (
    <div className="card">
      <div className="bulk-header">
        <h3>Mark Attendance</h3>
        <div className="bulk-date-pick">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="bulk-stats-row">
        <span className="bulk-stat">
          <span className="bulk-stat-dot dot-total" />
          {employees.length} Total
        </span>
        <span className="bulk-stat">
          <span className="bulk-stat-dot dot-present" />
          {Object.values(dayRecords).filter((s) => s === "Present").length} Present
        </span>
        <span className="bulk-stat">
          <span className="bulk-stat-dot dot-absent" />
          {Object.values(dayRecords).filter((s) => s === "Absent").length} Absent
        </span>
        <span className="bulk-stat">
          <span className="bulk-stat-dot dot-pending" />
          {unmarked.length} Pending
        </span>
      </div>

      {employees.length === 0 ? (
        <p className="bulk-empty">No employees found. Add employees first.</p>
      ) : (
        <div className="bulk-list">
          {unmarked.length > 0 && (
            <>
              <div className="bulk-section-label">Not yet marked</div>
              {unmarked.map((emp) => (
                <div key={emp.employee_id} className="bulk-row">
                  <div className="bulk-avatar" style={{ background: pickColor(emp.full_name) }}>
                    {getInitials(emp.full_name)}
                  </div>
                  <div className="bulk-emp-info">
                    <span className="bulk-emp-name">{emp.full_name}</span>
                    <span className="bulk-emp-meta">{emp.employee_id} &middot; {emp.department}</span>
                  </div>
                  <div className="bulk-actions">
                    <button
                      className="bulk-btn bulk-btn-present"
                      disabled={saving[emp.employee_id]}
                      onClick={() => handleMark(emp.employee_id, "Present")}
                    >
                      <FiCheckCircle /> Present
                    </button>
                    <button
                      className="bulk-btn bulk-btn-absent"
                      disabled={saving[emp.employee_id]}
                      onClick={() => handleMark(emp.employee_id, "Absent")}
                    >
                      <FiXCircle /> Absent
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {marked.length > 0 && (
            <>
              <div className="bulk-section-label">Already marked</div>
              {marked.map((emp) => {
                const status = dayRecords[emp.employee_id];
                return (
                  <div key={emp.employee_id} className="bulk-row bulk-row-done">
                    <div className="bulk-avatar" style={{ background: pickColor(emp.full_name) }}>
                      {getInitials(emp.full_name)}
                    </div>
                    <div className="bulk-emp-info">
                      <span className="bulk-emp-name">{emp.full_name}</span>
                      <span className="bulk-emp-meta">{emp.employee_id} &middot; {emp.department}</span>
                    </div>
                    <span className={`badge badge-${status === "Present" ? "success" : "danger"}`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
