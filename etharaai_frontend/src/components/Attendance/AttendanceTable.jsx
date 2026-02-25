import React from "react";

export default function AttendanceTable({ records }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Employee ID</th>
          <th>Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {records.map((rec) => (
          <tr key={rec.id}>
            <td>{rec.employee_id}</td>
            <td>{rec.date}</td>
            <td>
              <span className={`badge badge-${rec.status === "Present" ? "success" : "danger"}`}>
                {rec.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
