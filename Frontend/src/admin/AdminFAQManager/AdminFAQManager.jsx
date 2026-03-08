import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Send } from "lucide-react";
import "../admin-ui.css";
import "./AdminFAQManager.css";

const AdminFAQManager = () => {
  const [questions, setQuestions] = useState([]);
  const [replies, setReplies] = useState({});

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/faq/admin/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setQuestions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("Error loading FAQs");
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleReplyChange = (id, text) => {
    setReplies((prev) => ({ ...prev, [id]: text }));
  };

  const handleReply = async (id) => {
    const reply = replies[id];
    if (!reply?.trim()) {
      alert("Reply cannot be empty");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/faq/admin/reply/${id}`,
        { reply },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setReplies((prev) => ({ ...prev, [id]: "" }));
      fetchQuestions();
    } catch (err) {
      console.error(err);
      alert("Failed to send reply");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      await axios.post(
        `http://localhost:5000/api/faq/admin/delete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchQuestions();
    } catch (err) {
      console.error(err);
      alert("Error deleting question");
    }
  };

  return (
    <div className="admin-ui-page faq-admin-page">
      <div className="admin-ui-container">
        <div className="admin-ui-title-row">
          <div>
            <h1 className="admin-ui-title">FAQ Questions</h1>
            <p className="admin-ui-subtitle">Reply to user questions and moderate resolved items.</p>
          </div>
          <span className="admin-ui-pill">Total: {questions.length}</span>
        </div>

        {questions.length === 0 ? (
          <div className="admin-ui-panel admin-ui-panel-pad">
            <p className="admin-ui-empty">No questions yet.</p>
          </div>
        ) : (
          <div className="admin-ui-card-list">
            {questions.map((q) => {
              const isPending = q.status === "pending";
              return (
                <article key={q.id} className="admin-ui-item-card faq-item-card">
                  <p className="faq-item-line">
                    <strong>Email:</strong> <span>{q.email}</span>
                  </p>
                  <p className="faq-item-line faq-question-text">
                    <strong>Question:</strong> <span>{q.question}</span>
                  </p>

                  <span
                    className={
                      isPending
                        ? "admin-ui-badge admin-ui-badge-warn"
                        : "admin-ui-badge admin-ui-badge-success"
                    }
                  >
                    {String(q.status || "pending").toUpperCase()}
                  </span>

                  {q.reply ? (
                    <p className="faq-reply-text">
                      <strong>Reply:</strong> {q.reply}
                    </p>
                  ) : null}

                  {isPending ? (
                    <div className="faq-reply-box">
                      <textarea
                        placeholder="Type reply..."
                        value={replies[q.id] || ""}
                        onChange={(e) => handleReplyChange(q.id, e.target.value)}
                        className="admin-ui-textarea"
                      />

                      <button
                        onClick={() => handleReply(q.id)}
                        className="admin-ui-btn admin-ui-btn-primary"
                      >
                        <Send size={15} /> Send Reply
                      </button>
                    </div>
                  ) : null}

                  <button
                    onClick={() => handleDelete(q.id)}
                    className="admin-ui-btn admin-ui-btn-danger faq-delete-btn"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFAQManager;
