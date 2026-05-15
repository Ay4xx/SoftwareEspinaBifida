import React from "react";
import "./statCardSkeleton.css";

function StatCardSkeleton() {
  return (
    <div className="stat-card-skeleton">
      <div className="skeleton skeleton-icon"></div>
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-value"></div>
      <div className="skeleton skeleton-percentage"></div>
    </div>
  );
}

export default StatCardSkeleton;