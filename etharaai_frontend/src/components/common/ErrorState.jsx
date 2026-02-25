import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="error-state">
      <FiAlertTriangle size={48} />
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
