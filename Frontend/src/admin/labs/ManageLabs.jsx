import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "../admin-ui.css";
import "./ManageLabs.css";

const MySwal = withReactContent(Swal);

const ManageLabs = () => {
  const { token } = useContext(AuthContext);
  const [labs, setLabs] = useState([]);
  const [expandedLab, setExpandedLab] = useState(null);
  const [expandedModule, setExpandedModule] = useState(null);
  const navigate = useNavigate();

  const fetchLabs = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/labs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLabs(res.data);
    } catch (error) {
      toast.error("Failed to load labs", { className: "center-toast" });
    }
  }, [token]);

  useEffect(() => {
    fetchLabs();
  }, [fetchLabs]);

  const addModuleToLab = async (labId) => {
    const { value: title } = await MySwal.fire({
      title: "New Module",
      input: "text",
      inputLabel: "Module title",
      inputPlaceholder: "Enter module title",
      showCancelButton: true,
      background: "#0f172a",
      color: "#e2e8f0",
    });
    if (!title) return;

    try {
      await axios.post(
        `http://localhost:5000/api/labs/${labId}/modules`,
        { title, questions: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Module created", { className: "center-toast" });
      fetchLabs();
    } catch {
      toast.error("Failed to create module", { className: "center-toast" });
    }
  };

  const updateModuleTitle = async (moduleId, currentTitle) => {
    const { value: title } = await MySwal.fire({
      title: "Edit Module",
      input: "text",
      inputValue: currentTitle || "",
      inputLabel: "Module title",
      showCancelButton: true,
      background: "#0f172a",
      color: "#e2e8f0",
    });
    if (!title) return;

    try {
      await axios.put(
        `http://localhost:5000/api/labs/modules/${moduleId}`,
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Module updated", { className: "center-toast" });
      fetchLabs();
    } catch {
      toast.error("Failed to update module", { className: "center-toast" });
    }
  };

  const addQuestionToModule = async (moduleId) => {
    const { value: text } = await MySwal.fire({
      title: "New Question",
      input: "text",
      inputLabel: "Question text",
      inputPlaceholder: "Enter question",
      showCancelButton: true,
      background: "#0f172a",
      color: "#e2e8f0",
    });
    if (!text) return;

    const { value: answer } = await MySwal.fire({
      title: "Correct Answer",
      input: "text",
      inputLabel: "Answer",
      showCancelButton: true,
      background: "#0f172a",
      color: "#e2e8f0",
    });
    if (!answer) return;

    try {
      await axios.post(
        `http://localhost:5000/api/labs/modules/${moduleId}/questions`,
        { text, answer, options: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Question created", { className: "center-toast" });
      fetchLabs();
    } catch {
      toast.error("Failed to create question", { className: "center-toast" });
    }
  };

  const updateQuestionItem = async (question) => {
    const { value: text } = await MySwal.fire({
      title: "Edit Question",
      input: "text",
      inputValue: question.text || "",
      inputLabel: "Question text",
      showCancelButton: true,
      background: "#0f172a",
      color: "#e2e8f0",
    });
    if (!text) return;

    const { value: answer } = await MySwal.fire({
      title: "Edit Answer",
      input: "text",
      inputValue: question.answer || "",
      inputLabel: "Correct answer",
      showCancelButton: true,
      background: "#0f172a",
      color: "#e2e8f0",
    });
    if (!answer) return;

    try {
      await axios.put(
        `http://localhost:5000/api/labs/questions/${question.id}`,
        {
          text,
          answer,
          options: Array.isArray(question.options) ? question.options : [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Question updated", { className: "center-toast" });
      fetchLabs();
    } catch {
      toast.error("Failed to update question", { className: "center-toast" });
    }
  };

  const confirmDelete = async (type, id) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: `You are about to delete this ${type}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it",
      background: "#0f172a",
      color: "#e2e8f0",
    });

    if (result.isConfirmed) {
      try {
        let url = "";
        if (type === "lab") url = `/api/labs/${id}`;
        if (type === "module") url = `/api/labs/modules/${id}`;
        if (type === "question") url = `/api/labs/questions/${id}`;

        await axios.delete(`http://localhost:5000${url}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success(`${type} deleted successfully`, {
          className: "center-toast",
        });
        fetchLabs();
      } catch {
        toast.error("Failed to delete. Check admin authorization.", {
          className: "center-toast",
        });
      }
    }
  };

  return (
    <div className="admin-ui-page">
      <div className="admin-ui-container">
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar
          theme="dark"
          transition={Slide}
          className="Toastify__toast-container--center"
          toastClassName="Toastify__toast--animated"
        />

        <div className="admin-ui-title-row">
          <div>
            <h2 className="admin-ui-title">Manage Labs</h2>
            <p className="admin-ui-subtitle">Create and manage labs, modules, and questions.</p>
          </div>
          <button
            onClick={() => navigate("/admin/labs/create")}
            className="admin-ui-btn admin-ui-btn-primary"
          >
            Create New Lab
          </button>
        </div>

        {labs.length === 0 ? (
          <div className="admin-ui-panel admin-ui-panel-pad">
            <p className="admin-ui-empty">No labs found.</p>
          </div>
        ) : (
          <div className="admin-labs-stack">
            {labs.map((lab) => (
              <article key={lab.id} className="admin-lab-card admin-ui-panel">
                <header
                  className="admin-lab-header"
                  onClick={() => setExpandedLab(expandedLab === lab.id ? null : lab.id)}
                >
                  <div>
                    <h3 className="admin-ui-item-title">{lab.title}</h3>
                    {lab.summary ? <p className="admin-ui-meta">{lab.summary}</p> : null}
                  </div>

                  <div className="admin-ui-stack" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/admin/labs/edit/${lab.id}`)}
                      className="admin-ui-btn admin-ui-btn-info"
                    >
                      Edit Lab
                    </button>
                    <button
                      onClick={() => addModuleToLab(lab.id)}
                      className="admin-ui-btn admin-ui-btn-primary"
                    >
                      Add Module
                    </button>
                    <button
                      onClick={() => confirmDelete("lab", lab.id)}
                      className="admin-ui-btn admin-ui-btn-danger"
                    >
                      Delete Lab
                    </button>
                  </div>
                </header>

                {expandedLab === lab.id && (
                  <div className="admin-lab-body">
                    {(lab.modules || []).length === 0 ? (
                      <p className="admin-ui-meta">No modules added yet.</p>
                    ) : (
                      lab.modules.map((mod) => (
                        <section key={mod.id} className="admin-module-card">
                          <header
                            className="admin-module-header"
                            onClick={() =>
                              setExpandedModule(expandedModule === mod.id ? null : mod.id)
                            }
                          >
                            <h4 className="admin-module-title">Module: {mod.title}</h4>

                            <div className="admin-ui-stack" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => updateModuleTitle(mod.id, mod.title)}
                                className="admin-ui-btn admin-ui-btn-info"
                              >
                                Edit Module
                              </button>
                              <button
                                onClick={() => addQuestionToModule(mod.id)}
                                className="admin-ui-btn admin-ui-btn-primary"
                              >
                                Add Question
                              </button>
                              <button
                                onClick={() => confirmDelete("module", mod.id)}
                                className="admin-ui-btn admin-ui-btn-danger"
                              >
                                Delete Module
                              </button>
                            </div>
                          </header>

                          {expandedModule === mod.id && (
                            <div className="admin-question-list">
                              {(mod.questions || []).length === 0 ? (
                                <p className="admin-ui-meta">No questions in this module.</p>
                              ) : (
                                mod.questions.map((q) => (
                                  <article key={q.id} className="admin-question-item">
                                    <p className="admin-question-text">
                                      <strong>Q:</strong> {q.text}
                                    </p>

                                    {Array.isArray(q.options) && q.options.length > 0 ? (
                                      <ul className="admin-question-options">
                                        {q.options.map((opt, i) => (
                                          <li key={`${q.id}-opt-${i}`}>{opt}</li>
                                        ))}
                                      </ul>
                                    ) : null}

                                    <p className="admin-question-answer">Correct answer: {q.answer}</p>

                                    <div className="admin-ui-stack">
                                      <button
                                        onClick={() => updateQuestionItem(q)}
                                        className="admin-ui-btn admin-ui-btn-warn"
                                      >
                                        Edit Question
                                      </button>
                                      <button
                                        onClick={() => confirmDelete("question", q.id)}
                                        className="admin-ui-btn admin-ui-btn-danger"
                                      >
                                        Delete Question
                                      </button>
                                    </div>
                                  </article>
                                ))
                              )}
                            </div>
                          )}
                        </section>
                      ))
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageLabs;
