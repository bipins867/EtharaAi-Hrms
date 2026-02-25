import React, { useState } from "react";

const initialState = { employee_id: "", full_name: "", email: "", department: "" };

export default function EmployeeForm({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(form);
      setForm(initialState);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-form" onClick={(e) => e.stopPropagation()}>
        <h3>Add New Employee</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="employee_id">Employee ID</label>
            <input
              id="employee_id"
              name="employee_id"
              value={form.employee_id}
              onChange={handleChange}
              required
              placeholder="e.g. EMP-001"
            />
          </div>
          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              id="department"
              name="department"
              value={form.department}
              onChange={handleChange}
              required
              placeholder="Engineering"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Adding..." : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
