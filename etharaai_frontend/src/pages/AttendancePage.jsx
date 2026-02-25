import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { getAttendance, markAttendance, getAttendanceSummary } from "../api/attendance";
import { getEmployees } from "../api/employees";
import AttendanceForm from "../components/Attendance/AttendanceForm";
import AttendanceTable from "../components/Attendance/AttendanceTable";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [summary, setSummary] = useState(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterEmployee) params.employee_id = filterEmployee;
      if (filterDateFrom) params.date_from = filterDateFrom;
      if (filterDateTo) params.date_to = filterDateTo;
      const res = await getAttendance(params);
      setRecords(res.data);

      if (filterEmployee) {
        try {
          const sumRes = await getAttendanceSummary(filterEmployee);
          setSummary(sumRes.data);
        } catch {
          setSummary(null);
        }
      } else {
        setSummary(null);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  }, [filterEmployee, filterDateFrom, filterDateTo]);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch {
      /* supplementary */
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleMark = async (data) => {
    try {
      await markAttendance(data);
      toast.success("Attendance marked!");
      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to mark attendance.");
      throw err;
    }
  };

  return (
    <div className="page">
      <AttendanceForm employees={employees} onSubmit={handleMark} />

      <div className="card">
        <h3>Attendance History</h3>

        <div className="filter-bar">
          <div className="form-group">
            <label htmlFor="filter-emp">Employee</label>
            <select
              id="filter-emp"
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="filter-from">From</label>
            <input
              id="filter-from"
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="filter-to">To</label>
            <input
              id="filter-to"
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>
        </div>

        {summary && (
          <div className="summary-bar">
            <strong>{summary.employee_name}</strong> &mdash;{" "}
            Present: <span className="badge badge-success">{summary.total_present}</span>{" "}
            Absent: <span className="badge badge-danger">{summary.total_absent}</span>
          </div>
        )}

        {loading && <Loader />}
        {error && <ErrorState message={error} onRetry={fetchRecords} />}
        {!loading && !error && records.length === 0 && (
          <EmptyState message="No attendance records found." />
        )}
        {!loading && !error && records.length > 0 && (
          <AttendanceTable records={records} />
        )}
      </div>
    </div>
  );
}
