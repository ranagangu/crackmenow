import React, { useEffect, useState } from "react";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const footer = {
    background: "#0a0e12",
    padding: "70px 20px 30px",
    color: "#d1d5db",
    fontFamily: "Poppins, sans-serif",
    borderTop: "1px solid #0f231c",
  };

  const container = {
    maxWidth: "1200px",
    margin: "auto",
    display: "flex",
    justifyContent: "space-between",
    gap: "40px",
    flexWrap: "wrap",
    flexDirection: isMobile ? "column-reverse" : "row",
    textAlign: isMobile ? "center" : "left",
  };

  const left = {
    flex: 1,
    minWidth: "260px",
  };

  const title = {
    color: "#00ff7f",
    fontSize: "1.2rem",
    fontWeight: 600,
    marginBottom: "12px",
    letterSpacing: "1px",
    textTransform: "uppercase",
  };

  const text = {
    margin: "6px 0",
    fontSize: "0.95rem",
    color: "#c5cdd1",
    lineHeight: 1.6,
    display: "flex",
    alignItems: "center",
    justifyContent: isMobile ? "center" : "flex-start",
    gap: "10px",
  };

  const logoContainer = {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  };

  const logo = {
    width: isMobile ? "140px" : "180px",
    filter: "drop-shadow(0 0 10px rgba(0, 255, 0, 0.3))",
  };

  const bottom = {
    textAlign: "center",
    marginTop: "40px",
    fontSize: "0.85rem",
    color: "#8b949e",
    paddingTop: "25px",
    borderTop: "1px solid #162225",
  };

  return (
    <>
      <footer style={footer}>
        <div style={container}>
          <div style={left}>
            <h4 style={title}>Contact</h4>

            <p style={text}>
              <Phone size={18} color="#00ff7f" /> +91 8010911256
            </p>

            <p style={text}>
              <Mail size={18} color="#00ff7f" />
              <a
                href="mailto:info@crackmenow.com"
                style={{ color: "#c5cdd1", textDecoration: "none" }}
              >
                info@crackmenow.com
              </a>
            </p>

            <p style={text}>
              <MapPin size={18} color="#00ff7f" />
              1st Floor (Beside Mahanagar Co-op Bank), Nagar Road, Chandan Nagar, Pune - 411014
            </p>

          </div>

          <div style={logoContainer}>
            <img src="/assets/img/logo/Footer_logo.png" alt="CrackMeNow" style={logo} loading="lazy" />
          </div>
        </div>

        <div style={bottom}>© {new Date().getFullYear()} CrackMeNow. All Rights Reserved.</div>
      </footer>
    </>
  );
};

export default Footer;


