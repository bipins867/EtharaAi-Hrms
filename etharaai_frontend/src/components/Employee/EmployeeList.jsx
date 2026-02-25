import React from "react";
import { FiTrash2 } from "react-icons/fi";

export default function EmployeeList({ employees, onDelete }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Employee ID</th>
          <th>Full Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((emp) => (
          <tr key={emp.id}>
            <td>{emp.employee_id}</td>
            <td>{emp.full_name}</td>
            <td>{emp.email}</td>
            <td>{emp.department}</td>
            <td>
              <button
                className="btn btn-icon btn-danger-outline"
                title="Delete"
                onClick={() => onDelete(emp)}
              >
                <FiTrash2 />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
