import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../AuthContext";
import "../admin-ui.css";

const AdminSubmissions = () => {
  const { token } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!token) {
        console.error("No token found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/labs/submissions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setSubmissions(data);
      } catch (err) {
        console.error("Error fetching submissions:", err.response?.data || err.message);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [token]);

  if (loading) {
    return <div className="admin-loading">Loading submissions...</div>;
  }

  return (
    <div className="admin-ui-page">
      <div className="admin-ui-container">
        <div className="admin-ui-title-row">
          <div>
            <h1 className="admin-ui-title">User Lab Submissions</h1>
            <p className="admin-ui-subtitle">Review student answers and final status by module.</p>
          </div>
          <span className="admin-ui-pill">Total: {submissions.length}</span>
        </div>

        <div className="admin-ui-panel admin-ui-panel-pad admin-ui-table-wrap">
          <table className="admin-ui-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Lab</th>
                <th className="admin-ui-hide-sm">Submitted On</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length > 0 ? (
                submissions.map((sub) => {
                  const status = sub.status || "PENDING";
                  const statusClass =
                    status === "CORRECT"
                      ? "admin-ui-badge admin-ui-badge-success"
                      : status === "WRONG"
                      ? "admin-ui-badge admin-ui-badge-danger"
                      : "admin-ui-badge admin-ui-badge-warn";

                  return (
                    <tr key={sub.id}>
                      <td>{sub.id}</td>
                      <td>{sub.user?.username || "N/A"}</td>
                      <td>{sub.question?.module?.lab?.title || "N/A"}</td>
                      <td className="admin-ui-hide-sm">{new Date(sub.createdAt).toLocaleString()}</td>
                      <td>
                        <span className={statusClass}>{status}</span>
                      </td>
                      <td>
                        <button
                          className="admin-ui-btn admin-ui-btn-primary"
                          onClick={() => setSelectedAnswer(sub)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="admin-ui-empty">
                    No submissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedAnswer && (
          <div className="admin-ui-modal" onClick={() => setSelectedAnswer(null)}>
            <div className="admin-ui-modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="admin-ui-close" onClick={() => setSelectedAnswer(null)}>
                X
              </button>

              <h2 className="admin-ui-item-title" style={{ color: "#86efac", marginBottom: 12 }}>
                {selectedAnswer.question?.module?.lab?.title || "Lab"}
              </h2>

              <p>
                <strong>User:</strong> {selectedAnswer.user?.username || "N/A"}
              </p>
              <p>
                <strong>Submitted On:</strong> {new Date(selectedAnswer.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong> {selectedAnswer.status || "PENDING"}
              </p>

              <div className="admin-ui-divider" />
              <p className="admin-ui-meta" style={{ marginBottom: 6 }}>
                Submitted answer
              </p>
              <pre
                style={{
                  margin: 0,
                  background: "#020617",
                  borderRadius: 10,
                  border: "1px solid rgba(148, 163, 184, 0.25)",
                  padding: 12,
                  color: "#cbd5e1",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {selectedAnswer.selected || "No answer provided"}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubmissions;
