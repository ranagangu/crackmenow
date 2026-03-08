import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Trash2,
  XCircle,
  Save,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import "../admin-ui.css";
import "./AdminLabForm.css";

const defaultQuestion = { text: "", type: "mcq", options: ["", ""], answer: "" };
const defaultModule = { title: "", questions: [{ ...defaultQuestion }] };

const CreateLab = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [image, setImage] = useState("");
  const [modules, setModules] = useState([{ ...defaultModule }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role || role.toUpperCase() !== "ADMIN") {
      toast.error("Access Denied - Admins only", {
        icon: <XCircle size={18} color="#ef4444" />,
      });
      setTimeout(() => navigate("/"), 1500);
    }
  }, [navigate]);

  const addModule = () =>
    setModules((prev) => {
      if (prev.length >= 5) {
        toast.warning("A lab must have exactly 5 modules.", {
          icon: <AlertTriangle size={18} color="#eab308" />,
        });
        return prev;
      }
      return [...prev, { ...defaultModule, questions: [{ ...defaultQuestion }] }];
    });

  const addQuestion = (mIndex) => {
    const updated = [...modules];
    updated[mIndex].questions.push({ ...defaultQuestion, options: ["", ""] });
    setModules(updated);
  };

  const addOption = (mIndex, qIndex) => {
    const updated = [...modules];
    updated[mIndex].questions[qIndex].options.push("");
    setModules(updated);
  };

  const removeModule = (mIndex) => {
    if (modules.length === 1) {
      toast.warning("At least one module is required.", {
        icon: <AlertTriangle size={18} color="#eab308" />,
      });
      return;
    }
    setModules(modules.filter((_, i) => i !== mIndex));
  };

  const removeQuestion = (mIndex, qIndex) => {
    const updated = [...modules];
    updated[mIndex].questions.splice(qIndex, 1);
    setModules(updated);
  };

  const removeOption = (mIndex, qIndex, optIndex) => {
    const updated = [...modules];
    updated[mIndex].questions[qIndex].options.splice(optIndex, 1);
    setModules(updated);
  };

  const validateLab = () => {
    if (!title.trim()) return "Lab title is required.";
    if (modules.length !== 5) return "A lab must contain exactly 5 modules.";

    for (const [mIndex, mod] of modules.entries()) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateLab();
    if (error) {
      toast.warning(error, {
        icon: <AlertTriangle size={18} color="#eab308" />,
      });
      return;
    }

    const payload = {
      title,
      summary,
      image,
      modules: modules.map((m) => ({
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
      setLoading(true);
      const tokenFromStorage = token || localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/labs/create", payload, {
        headers: { Authorization: `Bearer ${tokenFromStorage}` },
      });

      if (res.status === 201 || res.status === 200) {
        toast.success("Lab created successfully", {
          icon: <CheckCircle size={18} color="#22c55e" />,
        });

        setTitle("");
        setSummary("");
        setImage("");
        setModules([{ ...defaultModule, questions: [{ ...defaultQuestion }] }]);
      }
    } catch (error) {
      console.error("Error creating lab:", error.response || error.message);
      toast.error(error.response?.data?.message || "Failed to create lab. Please try again.", {
        icon: <XCircle size={18} color="#ef4444" />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-ui-page">
      <div className="admin-ui-container admin-lab-form-wrap">
        <div className="admin-ui-title-row">
          <div>
            <h2 className="admin-ui-title">Create New Lab</h2>
            <p className="admin-ui-subtitle">Add exactly 5 modules with questions and answers.</p>
          </div>
          <span className="admin-ui-pill">Modules: {modules.length}/5</span>
        </div>

        <form onSubmit={handleSubmit} className="admin-ui-panel admin-ui-panel-pad admin-lab-main-form">
          <label className="admin-lab-label">Lab Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="admin-ui-input" required />

          <label className="admin-lab-label">Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief summary of the lab"
            className="admin-ui-textarea"
          />

          <label className="admin-lab-label">Image URL (optional)</label>
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/image.png"
            className="admin-ui-input"
          />

          {modules.map((mod, mIndex) => (
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
                  const updated = [...modules];
                  updated[mIndex].title = e.target.value;
                  setModules(updated);
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
                      const updated = [...modules];
                      updated[mIndex].questions[qIndex].text = e.target.value;
                      setModules(updated);
                    }}
                    className="admin-ui-input"
                    required
                  />

                  <label className="admin-lab-label">Question Type</label>
                  <select
                    value={q.type}
                    onChange={(e) => {
                      const updated = [...modules];
                      updated[mIndex].questions[qIndex].type = e.target.value;
                      setModules(updated);
                    }}
                    className="admin-ui-select"
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="text">Descriptive</option>
                  </select>

                  {q.type === "mcq" &&
                    q.options.map((opt, optIndex) => (
                      <div key={`m-${mIndex}-q-${qIndex}-opt-${optIndex}`} className="admin-lab-option-row">
                        <input
                          placeholder={`Option ${optIndex + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const updated = [...modules];
                            updated[mIndex].questions[qIndex].options[optIndex] = e.target.value;
                            setModules(updated);
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
                      const updated = [...modules];
                      updated[mIndex].questions[qIndex].answer = e.target.value;
                      setModules(updated);
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
            <button type="submit" className="admin-ui-btn admin-ui-btn-info" disabled={loading}>
              {loading ? "Saving..." : <><Save size={16} /> Save Lab</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLab;
