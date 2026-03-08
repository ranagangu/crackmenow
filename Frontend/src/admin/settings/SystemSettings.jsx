import React from "react";
import "../admin-ui.css";

const SystemSettings = () => {
  return (
    <div className="admin-ui-page">
      <div className="admin-ui-container">
        <div className="admin-ui-title-row">
          <div>
            <h2 className="admin-ui-title">System Settings</h2>
            <p className="admin-ui-subtitle">Central place for configuration, permissions, and admin controls.</p>
          </div>
          <span className="admin-ui-pill">Coming Soon</span>
        </div>

        <div className="admin-ui-panel admin-ui-panel-pad">
          <p className="admin-ui-empty" style={{ textAlign: "left", padding: 0 }}>
            Settings module is ready for integration. Next you can plug role rules, email settings, and feature flags.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
