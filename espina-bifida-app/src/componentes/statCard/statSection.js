import React from "react";
import StatCard from "./statCard";
import "./statSection.css";

function StatsSection({ title, description, cards }) {
  return (
    <section className="stats-section-container">
      <div className="stats-section-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="stats-section-grid">
        {cards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            percentage={card.percentage}
            color={card.color}
            icon={card.icon}
          />
        ))}
      </div>
    </section>
  );
}

export default StatsSection;