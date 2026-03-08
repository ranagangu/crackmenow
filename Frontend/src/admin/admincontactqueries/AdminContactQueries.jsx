import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { User, Mail, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import "../admin-ui.css";
import "./AdminContactQueries.css";
import { SOCKET_URL } from "../../config/runtime";

const socket = io(SOCKET_URL);

const AdminContactQueries = () => {
  const [queries, setQueries] = useState([]);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/contact");
        const rows = Array.isArray(res.data) ? [...res.data].reverse() : [];
        setQueries(rows);

        toast.success("Queries loaded successfully.", {
          icon: <CheckCircle size={18} color="#22c55e" />,
        });
      } catch (err) {
        toast.error("Failed to load contact queries.", {
          icon: <XCircle size={18} color="#ef4444" />,
        });
        console.error("Error fetching queries:", err);
      }
    };

    fetchQueries();
  }, []);

  useEffect(() => {
    socket.on("newContactMessage", (newMsg) => {
      setQueries((prev) => [newMsg, ...prev]);

      toast.info("New user query received", {
        icon: <AlertTriangle size={18} color="#eab308" />,
      });
    });

    return () => socket.off("newContactMessage");
  }, []);

  return (
    <div className="admin-ui-page">
      <div className="admin-ui-container">
        <div className="admin-ui-title-row">
          <div>
            <h1 className="admin-ui-title">User Contact Queries</h1>
            <p className="admin-ui-subtitle">Incoming messages from Contact Us form (live).</p>
          </div>
          <span className="admin-ui-pill">Total: {queries.length}</span>
        </div>

        {queries.length === 0 ? (
          <div className="admin-ui-panel admin-ui-panel-pad">
            <p className="admin-ui-empty">No user queries yet.</p>
          </div>
        ) : (
          <div className="admin-ui-card-list">
            {queries.map((q) => (
              <article key={q.id} className="admin-ui-item-card admin-contact-card">
                <div className="admin-contact-meta-row">
                  <span className="admin-contact-chip">
                    <User size={15} /> {q.name}
                  </span>
                  <span className="admin-contact-chip admin-contact-chip-muted">
                    <Mail size={15} /> {q.email}
                  </span>
                </div>

                <p className="admin-contact-message">{q.message}</p>
                <p className="admin-ui-meta">{new Date(q.createdAt).toLocaleString()}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminContactQueries;
