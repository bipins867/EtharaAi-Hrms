import React from "react";
import { FiInbox } from "react-icons/fi";

export default function EmptyState({ message = "No data found." }) {
  return (
    <div className="empty-state">
      <FiInbox size={48} />
      <p>{message}</p>
    </div>
  );
}
