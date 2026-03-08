import React, { useMemo, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const apiBase = process.env.REACT_APP_API_URL || "";

  const token = useMemo(() => new URLSearchParams(location.search).get("token") || "", [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Missing reset token");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${apiBase}/api/users/reset-password`, {
        token,
        newPassword,
      });
      toast.success(res.data.message || "Password reset successful");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at 80% 20%, rgba(16,185,129,0.16), transparent 45%), linear-gradient(135deg, #0b1020 0%, #0f172a 60%, #111827 100%)",
        padding: "20px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 460,
          background: "rgba(17,24,39,0.95)",
          border: "1px solid #334155",
          boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
          padding: 28,
          borderRadius: 14,
          color: "#fff",
        }}
      >
        <h2 style={{ margin: 0, marginBottom: 8, color: "#4ade80", fontSize: 28 }}>
          Reset Password
        </h2>
        <p style={{ marginTop: 0, marginBottom: 18, color: "#cbd5e1", lineHeight: 1.5 }}>
          Set a new password for your account.
        </p>
        <label
          htmlFor="newPassword"
          style={{ display: "block", marginBottom: 8, color: "#e2e8f0", fontWeight: 600 }}
        >
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 8,
            marginBottom: 14,
            border: "1px solid #475569",
            background: "#0b1220",
            color: "#f8fafc",
            outline: "none",
          }}
        />
        <label
          htmlFor="confirmPassword"
          style={{ display: "block", marginBottom: 8, color: "#e2e8f0", fontWeight: 600 }}
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 8,
            marginBottom: 16,
            border: "1px solid #475569",
            background: "#0b1220",
            color: "#f8fafc",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: "#22c55e",
            color: "#06120a",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <Link to="/login" style={{ color: "#86efac", textDecoration: "none" }}>
            Back to login
          </Link>
        </div>
      </form>
      <style>{`
        input::placeholder { color: #94a3b8; opacity: 1; }
      `}</style>
    </div>
  );
};

export default ResetPassword;

