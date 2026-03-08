import React from "react";
import "../admin-ui.css";

const UpcomingChallenges = () => {
  return (
    <div className="admin-ui-page">
      <div className="admin-ui-container">
        <div className="admin-ui-title-row">
          <div>
            <h2 className="admin-ui-title">Upcoming Challenges</h2>
            <p className="admin-ui-subtitle">Plan and monitor upcoming challenge releases.</p>
          </div>
          <span className="admin-ui-pill">Roadmap</span>
        </div>

        <div className="admin-ui-panel admin-ui-panel-pad">
          <p className="admin-ui-empty">No upcoming challenges scheduled yet.</p>
        </div>
      </div>
    </div>
  );
};

export default UpcomingChallenges;
