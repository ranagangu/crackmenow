import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { PlusCircle, Trash2, Save, XCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import "../admin-ui.css";
import "./AdminLabForm.css";

const EditLab = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLab = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/labs/admin/${id}`, {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        });
        setLab(res.data);
      } catch (error) {
        console.error("Error fetching lab:", error);
        toast.error("Failed to load lab details", {
          icon: <XCircle size={18} color="#ef4444" />,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLab();
  }, [id, token]);

  const handleChange = (field, value) => setLab({ ...lab, [field]: value });

  const addModule = () => {
    setLab({
      ...lab,
      modules: [
        ...lab.modules,
        { title: "", questions: [{ text: "", type: "mcq", options: ["", ""], answer: "" }] },
      ],
    });
  };

  const removeModule = (mIndex) => {
    if (lab.modules.length === 1) {
      toast.warning("At least one module is required", {
        icon: <AlertTriangle size={18} color="#eab308" />,
      });
      return;
    }
    const updated = { ...lab };
    updated.modules.splice(mIndex, 1);
    setLab(updated);
  };

  const addQuestion = (mIndex) => {
    const updated = { ...lab };
    updated.modules[mIndex].questions.push({ text: "", type: "mcq", options: ["", ""], answer: "" });
    setLab(updated);
  };

  const removeQuestion = (mIndex, qIndex) => {
    const updated = { ...lab };
    updated.modules[mIndex].questions.splice(qIndex, 1);
    setLab(updated);
  };

  const addOption = (mIndex, qIndex) => {
    const updated = { ...lab };
    updated.modules[mIndex].questions[qIndex].options.push("");
    setLab(updated);
  };

  const removeOption = (mIndex, qIndex, optIndex) => {
    const updated = { ...lab };
    updated.modules[mIndex].questions[qIndex].options.splice(optIndex, 1);
    setLab(updated);
  };

  const validateLab = () => {
    if (!lab.title.trim()) return "Lab title is required.";
    if (lab.modules.length === 0) return "At least one module is required.";

    for (const [mIndex, mod] of lab.modules.entries()) {
      if (!mod.title.trim()) return `Module ${mIndex + 1} needs a title.`;
      for (const [qIndex, q] of mod.questions.entries()) {
        if (!q.text.trim()) return `Question ${qIndex + 1} in Module ${mIndex + 1} has no text.`;
        if (q.type === "mcq" && q.options.some((opt) => !opt.trim())) {
          return `All options must be filled for Question ${qIndex + 1} (Module ${mIndex + 1}).`;
        }
        if (!q.answer.trim()) return `Question ${qIndex + 1} in Module ${mIndex + 1} needs an answer.`;
      }
    }
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const validationError = validateLab();
    if (validationError) {
      toast.warning(validationError, {
        icon: <AlertTriangle size={18} color="#eab308" />,
      });
      return;
    }

    setSaving(true);

    const cleanLab = {
      title: lab.title,
      summary: lab.summary,
      image: lab.image,
      modules: lab.modules.map((m) => ({
        title: m.title,
        questions: m.questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.type === "mcq" ? q.options : [],
          answer: q.answer,
        })),
      })),
    };

    try {
      const res = await axios.put(`http://localhost:5000/api/labs/${id}`, cleanLab, {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200) {
        toast.success("Lab updated successfully", {
          icon: <CheckCircle size={18} color="#22c55e" />,
        });
        setTimeout(() => navigate("/admin/labs"), 1500);
      } else {
        toast.error("Unexpected response while updating lab.", {
          icon: <XCircle size={18} color="#ef4444" />,
        });
      }
    } catch (error) {
      console.error("Error updating lab:", error.response || error.message);
      toast.error(error.response?.data?.message || "Failed to update lab.", {
        icon: <XCircle size={18} color="#ef4444" />,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <h2 className="admin-loading">Loading lab...</h2>;
  }

  if (!lab) {
    return <p className="admin-ui-empty">Lab not found.</p>;
  }

  return (
    <div className="admin-ui-page">
      <div className="admin-ui-container admin-lab-form-wrap">
        <div className="admin-ui-title-row">
          <div>
            <h2 className="admin-ui-title">Edit Lab: {lab.title}</h2>
            <p className="admin-ui-subtitle">Update module and question content safely.</p>
          </div>
          <span className="admin-ui-pill">Modules: {lab.modules?.length || 0}</span>
        </div>

        <form onSubmit={handleSave} className="admin-ui-panel admin-ui-panel-pad admin-lab-main-form">
          <label className="admin-lab-label">Lab Title</label>
          <input value={lab.title} onChange={(e) => handleChange("title", e.target.value)} className="admin-ui-input" required />

          <label className="admin-lab-label">Summary</label>
          <textarea value={lab.summary || ""} onChange={(e) => handleChange("summary", e.target.value)} className="admin-ui-textarea" />

          <label className="admin-lab-label">Image URL</label>
          <input value={lab.image || ""} onChange={(e) => handleChange("image", e.target.value)} className="admin-ui-input" />

          {lab.modules?.map((mod, mIndex) => (
            <section key={`m-${mIndex}`} className="admin-lab-module-block">
              <div className="admin-lab-module-head">
                <h3 className="admin-lab-module-title">Module {mIndex + 1}</h3>
                <button type="button" onClick={() => removeModule(mIndex)} className="admin-ui-btn admin-ui-btn-danger">
                  <XCircle size={16} />
                </button>
              </div>

              <input
                placeholder="Module Title"
                value={mod.title}
                onChange={(e) => {
                  const updated = { ...lab };
                  updated.modules[mIndex].title = e.target.value;
                  setLab(updated);
                }}
                className="admin-ui-input"
                required
              />

              {mod.questions.map((q, qIndex) => (
                <article key={`m-${mIndex}-q-${qIndex}`} className="admin-lab-question-block">
                  <div className="admin-lab-question-head">
                    <h4>Question {qIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeQuestion(mIndex, qIndex)}
                      className="admin-ui-btn admin-ui-btn-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <input
                    placeholder="Question Text"
                    value={q.text}
                    onChange={(e) => {
                      const updated = { ...lab };
                      updated.modules[mIndex].questions[qIndex].text = e.target.value;
                      setLab(updated);
                    }}
                    className="admin-ui-input"
                    required
                  />

                  <label className="admin-lab-label">Question Type</label>
                  <select
                    value={q.type}
                    onChange={(e) => {
                      const updated = { ...lab };
                      updated.modules[mIndex].questions[qIndex].type = e.target.value;
                      setLab(updated);
                    }}
                    className="admin-ui-select"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="text">Descriptive</option>
                  </select>

                  {q.type === "mcq" &&
                    q.options.map((opt, optIndex) => (
                      <div key={`m-${mIndex}-q-${qIndex}-opt-${optIndex}`} className="admin-lab-option-row">
                        <input
                          placeholder={`Option ${optIndex + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const updated = { ...lab };
                            updated.modules[mIndex].questions[qIndex].options[optIndex] = e.target.value;
                            setLab(updated);
                          }}
                          className="admin-ui-input"
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(mIndex, qIndex, optIndex)}
                          className="admin-ui-btn admin-ui-btn-danger"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    ))}

                  {q.type === "mcq" ? (
                    <button
                      type="button"
                      onClick={() => addOption(mIndex, qIndex)}
                      className="admin-ui-btn admin-ui-btn-primary"
                    >
                      <PlusCircle size={15} /> Add Option
                    </button>
                  ) : null}

                  <input
                    placeholder="Correct Answer"
                    value={q.answer}
                    onChange={(e) => {
                      const updated = { ...lab };
                      updated.modules[mIndex].questions[qIndex].answer = e.target.value;
                      setLab(updated);
                    }}
                    className="admin-ui-input"
                    required
                  />
                </article>
              ))}

              <button type="button" onClick={() => addQuestion(mIndex)} className="admin-ui-btn admin-ui-btn-primary">
                <PlusCircle size={15} /> Add Question
              </button>
            </section>
          ))}

          <div className="admin-ui-stack">
            <button type="button" onClick={addModule} className="admin-ui-btn admin-ui-btn-primary">
              <PlusCircle size={16} /> Add Module
            </button>
            <button type="submit" className="admin-ui-btn admin-ui-btn-info" disabled={saving}>
              {saving ? "Saving..." : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLab;
