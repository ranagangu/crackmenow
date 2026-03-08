import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.REACT_APP_API_URL || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${apiBase}/api/users/forgot-password`, { email });
      toast.success(res.data.message || "Reset email sent.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Request failed");
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
          "radial-gradient(circle at 20% 20%, rgba(34,197,94,0.18), transparent 45%), linear-gradient(135deg, #0b1020 0%, #0f172a 60%, #111827 100%)",
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
          Forgot Password
        </h2>
        <p style={{ marginTop: 0, marginBottom: 18, color: "#cbd5e1", lineHeight: 1.5 }}>
          Enter your account email. We will send a secure reset link.
        </p>
        <label
          htmlFor="email"
          style={{ display: "block", marginBottom: 8, color: "#e2e8f0", fontWeight: 600 }}
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;

