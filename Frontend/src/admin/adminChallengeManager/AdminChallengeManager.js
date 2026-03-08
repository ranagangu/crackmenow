import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../components/Layout";
import "../admin-ui.css";
import "./AdminChallengeManager.css";

const API_BASE_URL = `${process.env.REACT_APP_API_URL || ""}/api/challenges`;

const AdminChallengeManager = () => {
  const [challenges, setChallenges] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    level: "easy",
    img: "",
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchChallenges = async () => {
    try {
      const { data } = await axios.get(API_BASE_URL);
      setChallenges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching challenges", error);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editId) {
        await axios.put(`${API_BASE_URL}/${editId}`, formData, axiosConfig);
        alert("Challenge updated!");
      } else {
        await axios.post(API_BASE_URL, formData, axiosConfig);
        alert("Challenge created!");
      }

      setFormData({ title: "", desc: "", level: "easy", img: "" });
      setEditId(null);
      fetchChallenges();
    } catch (error) {
      alert("Failed to save challenge. Check console.");
      console.error(error);
    }

    setLoading(false);
  };

  const handleEdit = (challenge) => {
    setEditId(challenge.id);
    setFormData({
      title: challenge.title,
      desc: challenge.desc,
      level: challenge.level,
      img: challenge.img || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this challenge?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/${id}`, axiosConfig);
      alert("Challenge deleted!");
      fetchChallenges();
    } catch (error) {
      alert("Failed to delete challenge.");
      console.error(error);
    }
  };

  return (
    <Layout>
      <div className="admin-ui-page admin-challenges-page">
        <div className="admin-ui-container">
          <div className="admin-ui-title-row">
            <div>
              <h1 className="admin-ui-title">Manage Challenges</h1>
              <p className="admin-ui-subtitle">Create, edit, and publish upcoming challenge tracks.</p>
            </div>
            <span className="admin-ui-pill">Total: {challenges.length}</span>
          </div>

          <form onSubmit={handleSubmit} className="admin-ui-panel admin-ui-panel-pad admin-challenge-form">
            <div className="admin-ui-grid admin-ui-grid-2">
              <input
                type="text"
                placeholder="Challenge Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="admin-ui-input"
              />

              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="admin-ui-select"
              >
                <option value="easy">Easy</option>
                <option value="intermediate">Intermediate</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <textarea
              placeholder="Description"
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              required
              className="admin-ui-textarea"
            />

            <input
              type="text"
              placeholder="Image URL"
              value={formData.img}
              onChange={(e) => setFormData({ ...formData, img: e.target.value })}
              className="admin-ui-input"
            />

            <div className="admin-ui-stack">
              <button type="submit" disabled={loading} className="admin-ui-btn admin-ui-btn-primary">
                {loading ? "Saving..." : editId ? "Update Challenge" : "Add Challenge"}
              </button>
              {editId ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setFormData({ title: "", desc: "", level: "easy", img: "" });
                  }}
                  className="admin-ui-btn admin-ui-btn-warn"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>

          <div className="admin-ui-title-row admin-challenge-list-head">
            <h2 className="admin-ui-title" style={{ fontSize: "1.2rem" }}>Existing Challenges</h2>
          </div>

          {challenges.length === 0 ? (
            <div className="admin-ui-panel admin-ui-panel-pad">
              <p className="admin-ui-empty">No challenges found.</p>
            </div>
          ) : (
            <div className="admin-ui-card-list">
              {challenges.map((challenge) => (
                <article key={challenge.id} className="admin-ui-item-card admin-challenge-card">
                  <div className="admin-challenge-main">
                    <h3 className="admin-ui-item-title">{challenge.title}</h3>
                    <p className="admin-ui-meta">{challenge.desc}</p>
                    <span className="admin-ui-badge admin-ui-badge-warn">{challenge.level}</span>
                  </div>

                  <div className="admin-ui-stack">
                    <button
                      onClick={() => handleEdit(challenge)}
                      className="admin-ui-btn admin-ui-btn-info"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(challenge.id)}
                      className="admin-ui-btn admin-ui-btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminChallengeManager;

