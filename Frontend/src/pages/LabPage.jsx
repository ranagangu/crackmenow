import React, { useEffect, useState, useContext, useCallback } from "react";
import Layout from "../components/Layout";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, AlertTriangle, Lock, Share2, Download } from "lucide-react";
import "./labs/LabOutline.css";

const LabPage = () => {
  const REQUIRED_SHARE_PLATFORMS = ["linkedin", "facebook", "x"];
  const { id } = useParams(); // lab displayOrder
  const { user, token } = useContext(AuthContext);

  const [lab, setLab] = useState(null);
  const [openModule, setOpenModule] = useState(null);
  const [answers, setAnswers] = useState({});
  const [attemptedAnswers, setAttemptedAnswers] = useState({});
  const [moduleProgress, setModuleProgress] = useState([]);
  const [nextUnlockedModuleId, setNextUnlockedModuleId] = useState(null);
  const [allModulesCompleted, setAllModulesCompleted] = useState(false);
  const [generatedCertificate, setGeneratedCertificate] = useState(null);
  const [sharePlatform, setSharePlatform] = useState("linkedin");
  const [shareProofTokens, setShareProofTokens] = useState({});

  const getAuthHeaders = useCallback(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  // =====================================================
  // 1️⃣ Load Lab + Already Submitted Question IDs
  // =====================================================
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user || !token) return;

      const progressRes = await axios.get(
        `http://localhost:5000/api/labs/progress/${id}`,
        getAuthHeaders()
      );

      setModuleProgress(progressRes.data.moduleProgress || []);
      setNextUnlockedModuleId(progressRes.data.nextUnlockedModuleId || null);
      setAllModulesCompleted(Boolean(progressRes.data.allModulesCompleted));
    };

    const fetchData = async () => {
      try {
        // 👉 Fetch lab details
        const labRes = await axios.get(`http://localhost:5000/api/labs/${id}`);
        setLab(labRes.data);

        // 👉 Fetch which questions user already submitted
        if (user) {
          const subRes = await axios.get(
            `http://localhost:5000/api/labs/submitted/${user.id}/${id}`,
            getAuthHeaders()
          );

          const submitted = subRes.data || [];

          const attempted = {};
          submitted.forEach((item) => {
            const mId = item.moduleId;
            const qId = item.questionId;
            if (!attempted[mId]) attempted[mId] = {};
            attempted[mId][qId] = true;
          });

          setAttemptedAnswers(attempted);
          await fetchProgress();
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, [id, user, token, getAuthHeaders]);

  const isModuleUnlocked = (moduleId, index) => {
    if (!user) return index === 0;
    if (allModulesCompleted) return true;
    return moduleId === nextUnlockedModuleId;
  };

  const isModuleCompleted = (moduleId) => {
    const moduleItem = moduleProgress.find((m) => m.moduleId === moduleId);
    return Boolean(moduleItem?.isCompleted);
  };

  const canAttemptQuestion = (moduleId, questionIndex, modQuestions) => {
    if (!isModuleUnlocked(moduleId, 0)) return false;
    if (questionIndex === 0) return true;
    const previousQuestion = modQuestions[questionIndex - 1];
    return Boolean(attemptedAnswers[moduleId]?.[previousQuestion.id]);
  };

  // =====================================================
  // 2️⃣ Handle input change
  // =====================================================
  const handleInputChange = (moduleId, questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], [questionId]: value },
    }));
  };

  // =====================================================
  // 3️⃣ Submit single question
  // =====================================================
  const handleSubmitQuestion = async (moduleId, questionId) => {
    if (attemptedAnswers[moduleId]?.[questionId]) return; // block repeat after any attempt
    if (user && !isModuleUnlocked(moduleId, 0)) {
      toast.warning("This module is locked. Complete previous module first.");
      return;
    }

    const answer = answers[moduleId]?.[questionId];
    if (!answer) {
      toast.warning("Please select an answer before submitting.", {
        icon: <AlertTriangle size={18} color="#eab308" />,
      });
      return;
    }

    try {
      const submitRes = await axios.post(
        "http://localhost:5000/api/labs/submit",
        {
          userId: Number(user?.id),
          labId: Number(id),
          answers: [{ questionId: Number(questionId), selected: answer }],
        },
        {
          ...getAuthHeaders(),
          headers: {
            ...getAuthHeaders().headers,
            "Content-Type": "application/json",
          },
        }
      );

      const moduleReset = Boolean(submitRes?.data?.moduleReset);
      const moduleEvaluation = submitRes?.data?.moduleEvaluation;

      if (moduleReset) {
        setAttemptedAnswers((prev) => ({
          ...prev,
          [moduleId]: {},
        }));
        setAnswers((prev) => ({
          ...prev,
          [moduleId]: {},
        }));
      } else {
        setAttemptedAnswers((prev) => ({
          ...prev,
          [moduleId]: { ...prev[moduleId], [questionId]: true },
        }));
      }

      const progressRes = await axios.get(
        `http://localhost:5000/api/labs/progress/${id}`,
        getAuthHeaders()
      );
      const latestModuleProgress = progressRes.data.moduleProgress || [];
      setModuleProgress(latestModuleProgress);
      setNextUnlockedModuleId(progressRes.data.nextUnlockedModuleId || null);
      setAllModulesCompleted(Boolean(progressRes.data.allModulesCompleted));

      const currentModuleProgress = latestModuleProgress.find(
        (m) => m.moduleId === moduleId
      );
      const isModuleCompletedNow = Boolean(currentModuleProgress?.isCompleted);

      if (moduleEvaluation?.attemptedAll && isModuleCompletedNow) {
        toast.success("Welcome to the next module.", {
          icon: <CheckCircle size={18} color="#22c55e" />,
        });
      } else if (moduleEvaluation?.attemptedAll && !moduleEvaluation?.passed) {
        toast.warning("Please give correct answer.", {
          icon: <AlertTriangle size={18} color="#eab308" />,
        });
      }
    } catch (error) {
      console.error("Error submitting:", error);
      toast.error("Failed to submit. Try again.", {
        icon: <XCircle size={18} color="#ef4444" />,
      });
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/labs/${id}/certificate/generate`,
        {},
        getAuthHeaders()
      );

      setGeneratedCertificate(res.data.certificate);
      setShareProofTokens({});
      toast.success("Certificate generated. Share to enable download.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Certificate generation failed.");
    }
  };

  const handleShareCertificate = async () => {
    if (!generatedCertificate?.certificateId) {
      toast.warning("Generate certificate first.");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/labs/${id}/certificate/share`,
        {
          certificateId: generatedCertificate.certificateId,
          platform: sharePlatform,
        },
        getAuthHeaders()
      );

      const selectedPlatform = (res.data.platform || sharePlatform || "").toLowerCase();
      setShareProofTokens((prev) => ({
        ...prev,
        [selectedPlatform]: res.data.shareProofToken,
      }));
      const shareText = `I completed ${lab?.title || "a lab"} on CrackMeNow and earned my certificate.`;
      const shareUrl = `${window.location.origin}/labs/${id}`;
      const encodedText = encodeURIComponent(shareText);
      const encodedUrl = encodeURIComponent(shareUrl);
      const certificateTag = encodeURIComponent(
        generatedCertificate?.certificateId
          ? `Certificate ID: ${generatedCertificate.certificateId}`
          : ""
      );

      let platformUrl = "";
      if (sharePlatform === "linkedin") {
        platformUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      } else if (sharePlatform === "facebook") {
        platformUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      } else {
        platformUrl = `https://x.com/intent/tweet?text=${encodedText}%20${certificateTag}&url=${encodedUrl}`;
      }

      window.open(platformUrl, "_blank", "noopener,noreferrer");
      const nextState = {
        ...shareProofTokens,
        [selectedPlatform]: res.data.shareProofToken,
      };
      const missing = REQUIRED_SHARE_PLATFORMS.filter((p) => !nextState[p]);
      if (missing.length === 0) {
        toast.success("All platform shares completed. Download unlocked.");
      } else {
        toast.info(`Shared on ${selectedPlatform}. Remaining: ${missing.join(", ")}`);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Certificate share failed.");
    }
  };

  const handleDownloadCertificate = async () => {
    const missingPlatforms = REQUIRED_SHARE_PLATFORMS.filter((p) => !shareProofTokens[p]);
    if (!generatedCertificate?.certificateId || missingPlatforms.length > 0) {
      toast.warning(
        missingPlatforms.length
          ? `Complete shares on: ${missingPlatforms.join(", ")}`
          : "Please generate and share certificate first."
      );
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/labs/${id}/certificate/download`,
        {
          certificateId: generatedCertificate.certificateId,
          shareProofTokens: REQUIRED_SHARE_PLATFORMS.map((p) => shareProofTokens[p]).filter(Boolean),
        },
        {
          ...getAuthHeaders(),
          responseType: "blob",
        }
      );

      const disposition = res.headers["content-disposition"] || "";
      const filenameMatch = disposition.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `${lab?.title || "lab"}-certificate.pdf`;
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Certificate downloaded.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Certificate download failed.");
    }
  };

  // =====================================================
  // 4️⃣ Loading state
  // =====================================================
  if (!lab) {
    return (
      <Layout>
        <div style={{ color: "#fff", textAlign: "center", marginTop: "200px" }}>
          Loading...
        </div>
      </Layout>
    );
  }

  // =====================================================
  // 5️⃣ Render UI
  // =====================================================
  const missingSharePlatforms = REQUIRED_SHARE_PLATFORMS.filter((p) => !shareProofTokens[p]);
  const allPlatformsShared = missingSharePlatforms.length === 0;

  return (
    <Layout>
      {/* Header */}
      <section
        className="lab-info-section"
        style={{
          background: "#232d3f",
          color: "#fff",
          paddingTop: "150px",
          paddingBottom: "32px",
          textAlign: "center",
        }}
      >
        <div className="container" style={{ textAlign: "left", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <img
              src="/assets/img/home-1/shop/Easy Level 1.png"
              alt="Lab"
              style={{
                width: 110,
                height: 110,
                marginRight: 32,
                borderRadius: 12,
                background: "#34495e",
                padding: 8,
                objectFit: "contain",
              }}
            />
            <div>
              <h1 style={{ fontSize: "2.2rem", color: "#39FF14" }}>
                {lab.title.toUpperCase()}
              </h1>
              <p style={{ fontSize: "1.15rem" }}>{lab.summary}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section style={{ background: "#181c2a", padding: "32px 0" }}>
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          {lab.modules.map((mod, index) => (
            <div key={mod.id} style={{ marginBottom: 18, background: "#232d3f", borderRadius: 8 }}>
              {(() => {
                const unlocked = isModuleUnlocked(mod.id, index);
                const completed = isModuleCompleted(mod.id);
                return (
                  <>
              {/* Module Header */}
              <div
                onClick={() => {
                  if (!unlocked) {
                    toast.info("Complete previous module to unlock this module.");
                    return;
                  }
                  setOpenModule(openModule === mod.id ? null : mod.id);
                }}
                style={{
                  cursor: unlocked ? "pointer" : "not-allowed",
                  padding: "22px 32px",
                  display: "flex",
                  alignItems: "center",
                  color: unlocked ? "#39FF14" : "#7a859c",
                  fontWeight: 700,
                  background: "#232d3f",
                  opacity: unlocked ? 1 : 0.8,
                }}
              >
                <span style={{ marginRight: 12 }}>Module {index + 1}</span>
                <span style={{ color: "#fff" }}>{mod.title}</span>
                {!unlocked && <Lock size={16} style={{ marginLeft: 10, color: "#f59e0b" }} />}
                {completed && <CheckCircle size={16} style={{ marginLeft: 10, color: "#22c55e" }} />}
                <span style={{ marginLeft: "auto", color: "#fff" }}>
                  {openModule === mod.id ? "▲" : "▶"}
                </span>
              </div>

              {/* Module Content */}
              {openModule === mod.id && unlocked && (
                <div style={{ padding: "24px 32px", background: "#232d3f", color: "#fff" }}>
                  {mod.questions.map((q, idx) => {
                    const already = attemptedAnswers[mod.id]?.[q.id] || false;
                    const canAttempt = canAttemptQuestion(mod.id, idx, mod.questions);

                    return (
                      <div
                        key={q.id}
                        style={{
                          marginBottom: 24,
                          background: "#1a1f2e",
                          padding: 16,
                          borderRadius: 8,
                        }}
                      >
                        <label
                          style={{
                            color: "#39FF14",
                            fontWeight: 600,
                            marginBottom: 6,
                            display: "block",
                          }}
                        >
                          Question {idx + 1}. {q.text}
                        </label>

                        {/* MCQ */}
                        {Array.isArray(q.options) ? (
                          q.options.map((opt, i) => (
                            <label key={i} style={{ display: "block", color: "#fff" }}>
                              <input
                                type="radio"
                                name={`q${q.id}`}
                                value={opt}
                                checked={answers[mod.id]?.[q.id] === opt}
                                onChange={() => handleInputChange(mod.id, q.id, opt)}
                                disabled={already || !canAttempt}
                                style={{ marginRight: 8 }}
                              />
                              {opt}
                            </label>
                          ))
                        ) : (
                          <input
                            type="text"
                            value={answers[mod.id]?.[q.id] || ""}
                            onChange={(e) => handleInputChange(mod.id, q.id, e.target.value)}
                            disabled={already || !canAttempt}
                            style={{
                              width: "100%",
                              padding: "10px",
                              background: "#181c2a",
                              border: "1px solid #34495e",
                              color: "#fff",
                              borderRadius: 4,
                            }}
                          />
                        )}

                        {/* Submit Button */}
                        <button
                          onClick={() => handleSubmitQuestion(mod.id, q.id)}
                          disabled={already || !unlocked || !canAttempt}
                          style={{
                            background: already ? "#2ecc71" : "#0FA30F",
                            color: "#fff",
                            border: "none",
                            padding: "10px 24px",
                            borderRadius: 4,
                            marginTop: 10,
                            cursor: already ? "not-allowed" : "pointer",
                            fontWeight: 700,
                          }}
                        >
                          {already ? "Submitted" : "Submit"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
                  </>
                );
              })()}
            </div>
          ))}

          {user && allModulesCompleted && (
            <div
              style={{
                marginTop: 24,
                background: "#232d3f",
                borderRadius: 8,
                padding: 24,
                color: "#fff",
              }}
            >
              <h3 style={{ color: "#39FF14", marginBottom: 14 }}>Certificate</h3>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                <button className="lab-nav-btn" onClick={handleGenerateCertificate}>
                  Generate Certificate
                </button>

                <select
                  value={sharePlatform}
                  onChange={(e) => setSharePlatform(e.target.value)}
                  style={{
                    background: "#181c2a",
                    color: "#fff",
                    border: "1px solid #34495e",
                    borderRadius: 4,
                    padding: "10px 12px",
                  }}
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                  <option value="x">X</option>
                </select>

                <button
                  className="lab-nav-btn"
                  onClick={handleShareCertificate}
                  disabled={!generatedCertificate?.certificateId}
                  style={{ opacity: generatedCertificate?.certificateId ? 1 : 0.6 }}
                >
                  <Share2 size={16} style={{ marginRight: 6 }} />
                  Share Certificate
                </button>

                <button
                  className="lab-nav-btn"
                  onClick={handleDownloadCertificate}
                  disabled={!allPlatformsShared}
                  style={{ opacity: allPlatformsShared ? 1 : 0.6 }}
                >
                  <Download size={16} style={{ marginRight: 6 }} />
                  Download Certificate
                </button>
              </div>
              <p style={{ marginTop: 12, color: "#bfc9da", fontSize: "0.92rem" }}>
                {allPlatformsShared
                  ? "All required platform shares completed."
                  : `Share required on all platforms before download: ${missingSharePlatforms.join(
                      ", "
                    )}`}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 24,
              padding: "0 24px",
            }}
          >
            {parseInt(id) > 1 ? (
              <Link to={`/labs/${parseInt(id) - 1}`} className="lab-nav-btn">
                ← Previous Lab
              </Link>
            ) : (
              <div />
            )}

            {!lab.isLastLab ? (
              <Link to={`/labs/${parseInt(id) + 1}`} className="lab-nav-btn">
                Next Lab →
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LabPage;
