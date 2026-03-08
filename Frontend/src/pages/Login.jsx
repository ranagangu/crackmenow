import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isAdminLogin) {
        const response = await fetch("http://localhost:5000/api/users/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) {
          toast.error(data.message || "Invalid admin credentials");
          return;
        }

        localStorage.clear();
        const role = data.role?.toUpperCase() || "ADMIN";
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", role);
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", data.email);

        login(data.token, data);
        toast.success("Welcome Admin! Redirecting to dashboard...");
        setTimeout(() => navigate("/admin-dashboard"), 1000);
        return;
      }

      if (!otpStep) {
        const response = await fetch("http://localhost:5000/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message || "Invalid credentials");
          return;
        }

        setOtpToken(data.otpToken);
        setOtpStep(true);
        toast.success("OTP sent to your email.");
        return;
      }

      const verifyResponse = await fetch("http://localhost:5000/api/users/login/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpToken, otp }),
      });
      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        toast.error(verifyData.message || "Invalid OTP");
        return;
      }

      localStorage.clear();
      const role = verifyData.role?.toUpperCase() || "USER";
      localStorage.setItem("token", verifyData.token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", verifyData.username);
      localStorage.setItem("email", verifyData.email);

      login(verifyData.token, verifyData);
      toast.success("Login successful");
      setTimeout(() => navigate("/"), 1000);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    box: {
      position: "relative",
      width: "400px",
      height: "200px",
      background: `repeating-conic-gradient(
        from var(--a),
        #22c55e 0%,
        #22c55e 5%,
        transparent 5%,
        transparent 40%,
        #22c55e 50%
      )`,
      filter: "drop-shadow(0 15px 50px #000)",
      borderRadius: "20px",
      animation: "rotating 4s linear infinite",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      transition: "0.5s",
      "--a": "0deg",
    },
    login: {
      position: "absolute",
      inset: "60px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      borderRadius: "10px",
      background: "#00000033",
      color: "#fff",
      zIndex: 1000,
      boxShadow: "inset 0 10px 20px #00000080",
      borderBottom: "2px solid #ffffff80",
      transition: "0.5s",
      overflow: "hidden",
    },
    loginBx: {
      position: "relative",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap: "20px",
      width: "70%",
      transform: "translateY(126px)",
      transition: "0.5s",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      width: "100%",
    },
    h2: {
      textTransform: "uppercase",
      fontWeight: 600,
      letterSpacing: "0.3em",
      margin: 0,
      marginTop: "30px",
      fontFamily: '"Poppins", sans-serif',
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      fontSize: "2em",
    },
    icon: {
      color: "#22c55e",
      textShadow: "0 0 5px #22c55e, 0 0 20px #22c55e",
    },
    input: {
      width: "100%",
      padding: "10px 20px",
      outline: "none",
      fontSize: "1em",
      color: "#fff",
      background: "#0000001a",
      border: "2px solid #fff",
      borderRadius: "30px",
      boxSizing: "border-box",
      fontFamily: '"Poppins", sans-serif',
    },
    submitButton: {
      width: "100%",
      padding: "10px 20px",
      outline: "none",
      border: "none",
      fontSize: "1em",
      background: "#22c55e",
      fontWeight: 500,
      color: "#111",
      cursor: "pointer",
      transition: "0.5s",
      borderRadius: "30px",
      boxSizing: "border-box",
      fontFamily: '"Poppins", sans-serif',
    },
    group: {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
    },
    toggle: {
      marginTop: "10px",
      fontSize: "0.9em",
      color: "#22c55e",
      cursor: "pointer",
      textAlign: "center",
    },
  };

  const cssStyles = `
    @property --a {
      syntax: "<angle>";
      inherits: false;
      initial-value: 0deg;
    }
    @keyframes rotating {
      0% { --a: 0deg; }
      100% { --a: 360deg; }
    }
    .animated-box::before {
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      background: repeating-conic-gradient(
        from var(--a),
        #22c55e 0%,
        #22c55e 5%,
        transparent 5%,
        transparent 40%,
        #22c55e 50%
      );
      filter: drop-shadow(0 15px 50px #000);
      border-radius: 20px;
      animation: rotating 4s linear infinite;
      animation-delay: -1s;
    }
    .animated-box::after {
      content: "";
      position: absolute;
      inset: 4px;
      background: #2d2d39;
      border-radius: 15px;
      border: 8px solid #25252b;
    }
    .animated-box:hover {
      width: 450px !important;
      height: 500px !important;
    }
    .animated-box:hover .login-container {
      inset: 40px !important;
    }
    .animated-box:hover .login-box {
      transform: translateY(0px) !important;
    }
    .submit-btn:hover {
      box-shadow: 0 0 10px #22c55e, 0 0 60px #22c55e !important;
    }
    .input-field::placeholder {
      color: #999;
    }
    .login-box .input-field,
    .login-box .submit-btn,
    .login-box .group {
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.5s ease;
    }
    .animated-box:hover .login-box .input-field,
    .animated-box:hover .login-box .submit-btn,
    .animated-box:hover .login-box .group {
      opacity: 1;
      pointer-events: auto;
    }
  `;

  return (
    <>
      <style>{cssStyles}</style>

      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          minWidth: "100vw",
          minHeight: "100vh",
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <source src="/assets/videos/Login BG.mp4" type="video/mp4" />
      </video>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100vw",
          background: "rgba(24,24,30,0.85)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="animated-box" style={styles.box}>
          <div className="login-container" style={styles.login}>
            <div className="login-box" style={styles.loginBx}>
              <h2 style={styles.h2}>
                <i className="fa-solid fa-right-to-bracket" style={styles.icon}></i>{" "}
                {isAdminLogin ? "Admin Login" : "Login"}
              </h2>

              <form onSubmit={handleSubmit} style={styles.form} autoComplete="on">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={styles.input}
                  className="input-field"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                  className="input-field"
                  required
                />
                {!isAdminLogin && otpStep && (
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    style={styles.input}
                    className="input-field"
                    required
                  />
                )}

                <input
                  type="submit"
                  value={
                    loading
                      ? "Processing..."
                      : isAdminLogin
                      ? "Sign in"
                      : otpStep
                      ? "Verify OTP"
                      : "Send OTP"
                  }
                  disabled={loading}
                  style={{
                    ...styles.submitButton,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                  className="submit-btn"
                />
              </form>

              <div
                style={styles.toggle}
                onClick={() => {
                  setIsAdminLogin((prev) => !prev);
                  setOtpStep(false);
                  setOtp("");
                  setOtpToken("");
                }}
              >
                {isAdminLogin ? "Login as User" : "Login as Admin"}
              </div>

              {!isAdminLogin && (
                <div style={styles.group} className="group">
                  <Link to="/forgot-password" style={{ color: "#fff" }}>
                    Forgot Password
                  </Link>
                  <Link to="/signup" style={{ color: "#22c55e", fontWeight: 600 }}>
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
