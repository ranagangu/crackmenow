import React from "react";
import "../admin-ui.css";

const HistoricalChallenges = () => {
  return (
    <div className="admin-ui-page">
      <div className="admin-ui-container">
        <div className="admin-ui-title-row">
          <div>
            <h2 className="admin-ui-title">Historical Challenges</h2>
            <p className="admin-ui-subtitle">Archive view for completed or retired challenge campaigns.</p>
          </div>
          <span className="admin-ui-pill">Archive</span>
        </div>

        <div className="admin-ui-panel admin-ui-panel-pad">
          <p className="admin-ui-empty">No historical challenges available yet.</p>
        </div>
      </div>
    </div>
  );
};

export default HistoricalChallenges;
