import React from "react";
import StatCardSkeleton from "./statCardSkeleton";
import "./statSection.css";

function StatsSectionSkeleton({ title, description }) {
  return (
    <section className="stats-section">
      <div className="section-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="stats-section-grid">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </section>
  );
}

export default StatsSectionSkeleton;