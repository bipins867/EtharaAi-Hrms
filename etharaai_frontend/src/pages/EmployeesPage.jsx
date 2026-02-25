import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus } from "react-icons/fi";
import { getEmployees, createEmployee, deleteEmployee } from "../api/employees";
import EmployeeList from "../components/Employee/EmployeeList";
import EmployeeForm from "../components/Employee/EmployeeForm";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEmployees();
      setEmployees(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleCreate = async (data) => {
    try {
      await createEmployee(data);
      toast.success("Employee added successfully!");
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add employee.");
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEmployee(deleteTarget.employee_id);
      toast.success("Employee deleted.");
      setDeleteTarget(null);
      fetchEmployees();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete employee.");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>All Employees</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <FiPlus /> Add Employee
        </button>
      </div>

      {loading && <Loader />}
      {error && <ErrorState message={error} onRetry={fetchEmployees} />}
      {!loading && !error && employees.length === 0 && (
        <EmptyState message="No employees yet. Click 'Add Employee' to get started." />
      )}
      {!loading && !error && employees.length > 0 && (
        <div className="card">
          <EmployeeList employees={employees} onDelete={setDeleteTarget} />
        </div>
      )}

      <EmployeeForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Employee"
        message={`Are you sure you want to delete "${deleteTarget?.full_name}"? This will also remove all their attendance records.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
