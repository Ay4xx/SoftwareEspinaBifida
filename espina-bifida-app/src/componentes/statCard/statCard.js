import React from "react";
import "./statCard.css";

function StatCard({ title, value, percentage, icon, color = "blue" }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p className="stat-value">{value}</p>

      {percentage && <p className="stat-percentage">{percentage}</p>}
    </div>
  );
}

export default StatCard;