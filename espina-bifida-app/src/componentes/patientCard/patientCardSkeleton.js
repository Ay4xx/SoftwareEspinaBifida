import "./patientCardSkeleton.css";

function PatientCardSkeleton() {
  return (
    <div className="card patient-card-skeleton">
      <div className="card-header">
        <div className="user-info">
          <div className="skeleton skeleton-avatar"></div>

          <div className="skeleton-user-text">
            <div className="skeleton skeleton-name"></div>
            <div className="skeleton skeleton-subtitle"></div>
          </div>
        </div>

        <div className="skeleton skeleton-status"></div>
      </div>

      <div className="card-body">
        <div className="info">
          <div className="skeleton skeleton-icon-small"></div>
          <div className="skeleton skeleton-info-text"></div>
        </div>

        <div className="info">
          <div className="skeleton skeleton-icon-small"></div>
          <div className="skeleton skeleton-info-text"></div>
        </div>
      </div>

      <div className="card-extra">
        <div className="skeleton skeleton-extra"></div>
      </div>

      <div className="card-footer">
        <div className="skeleton skeleton-button"></div>
        <div className="skeleton skeleton-button"></div>
      </div>
    </div>
  );
}

export default PatientCardSkeleton;