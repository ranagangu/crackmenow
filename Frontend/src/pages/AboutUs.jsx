import React from "react";
import Layout from "../components/Layout";

const AboutUs = () => {
  const pillars = [
    {
      title: "Hands-On Labs",
      description:
        "Scenario-based labs that mirror practical cybersecurity tasks, not just theory questions.",
    },
    {
      title: "Guided Learning Path",
      description:
        "Structured modules from fundamentals to advanced topics so learners can grow with clarity.",
    },
    {
      title: "Challenge-Driven Practice",
      description:
        "Competitive and problem-solving challenges that build speed, confidence, and real skill.",
    },
    {
      title: "Verified Achievement",
      description:
        "Progress milestones and certificates that help learners showcase outcomes and consistency.",
    },
  ];

  const team = [
    {
      role: "Founding Team",
      text: "Defines learning vision, platform direction, and quality standards.",
    },
    {
      role: "Security Mentors",
      text: "Design labs/challenges and review practical relevance for current industry needs.",
    },
    {
      role: "Product & Engineering",
      text: "Build a stable, scalable learning platform with measurable student progress.",
    },
    {
      role: "Learner Success",
      text: "Support users with guidance, feedback loops, and continuous curriculum improvement.",
    },
  ];

  return (
    <Layout>
      <main
        style={{
          minHeight: "100vh",
          padding: "120px 20px 50px",
          background:
            "radial-gradient(circle at 10% 0%, rgba(34,197,94,0.15), transparent 35%), #05080e",
          color: "#e2e8f0",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <section style={{ maxWidth: 950, margin: "0 auto" }}>
          <p
            style={{
              margin: 0,
              color: "#86efac",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            About CrackMeNow
          </p>
          <h1 style={{ margin: "8px 0 14px", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Who We Are, What We Do, and Why CrackMeNow Exists
          </h1>
          <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.8, fontSize: "1rem" }}>
            CrackMeNow is a cybersecurity learning platform built to make practical skill-building
            simple, structured, and outcome-focused. We are a team of educators, security practitioners,
            and builders working together to help learners gain confidence through execution, not just
            reading.
          </p>

          <div
            style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 14,
            }}
          >
            <article
              style={{
                background: "rgba(15, 23, 42, 0.86)",
                border: "1px solid rgba(148,163,184,0.25)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <h3 style={{ marginTop: 0, color: "#86efac" }}>Our Mission</h3>
              <p style={{ marginBottom: 0, lineHeight: 1.7 }}>
                Make cybersecurity education accessible, measurable, and practical for every learner.
              </p>
            </article>

            <article
              style={{
                background: "rgba(15, 23, 42, 0.86)",
                border: "1px solid rgba(148,163,184,0.25)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <h3 style={{ marginTop: 0, color: "#86efac" }}>Our Vision</h3>
              <p style={{ marginBottom: 0, lineHeight: 1.7 }}>
                Build a trusted platform where learners can move from beginner to job-ready security
                practitioner with clear progress and verified outcomes.
              </p>
            </article>

            <article
              style={{
                background: "rgba(15, 23, 42, 0.86)",
                border: "1px solid rgba(148,163,184,0.25)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <h3 style={{ marginTop: 0, color: "#86efac" }}>Who We Serve</h3>
              <p style={{ marginBottom: 0, lineHeight: 1.7 }}>
                Students, aspiring analysts, career switchers, and professionals who want practical
                cybersecurity capability.
              </p>
            </article>
          </div>

          <section style={{ marginTop: 30 }}>
            <h2 style={{ marginBottom: 12, color: "#86efac" }}>What We Do</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              {pillars.map((item) => (
                <article
                  key={item.title}
                  style={{
                    background: "rgba(15, 23, 42, 0.82)",
                    border: "1px solid rgba(148,163,184,0.22)",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <h3 style={{ margin: "0 0 8px", color: "#e2e8f0", fontSize: "1rem" }}>
                    {item.title}
                  </h3>
                  <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.7 }}>{item.description}</p>
                </article>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 30 }}>
            <h2 style={{ marginBottom: 12, color: "#86efac" }}>Our Team</h2>
            <p style={{ marginTop: 0, color: "#cbd5e1", lineHeight: 1.8 }}>
              CrackMeNow is powered by a cross-functional team focused on quality education and real
              learner outcomes.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              {team.map((member) => (
                <article
                  key={member.role}
                  style={{
                    background: "rgba(15, 23, 42, 0.82)",
                    border: "1px solid rgba(148,163,184,0.22)",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <h3 style={{ margin: "0 0 8px", color: "#f8fafc", fontSize: "1rem" }}>
                    {member.role}
                  </h3>
                  <p style={{ margin: 0, color: "#cbd5e1", lineHeight: 1.7 }}>{member.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            style={{
              marginTop: 30,
              background: "rgba(22, 101, 52, 0.16)",
              border: "1px solid rgba(74, 222, 128, 0.25)",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <h2 style={{ margin: "0 0 8px", color: "#bbf7d0" }}>Why CrackMeNow</h2>
            <p style={{ margin: 0, color: "#dcfce7", lineHeight: 1.8 }}>
              We are focused on one core principle: cybersecurity skill must be demonstrated in practice.
              Every lab, challenge, and certificate is designed to help learners build proof of work and
              real confidence for interviews, internships, and professional roles.
            </p>
          </section>
        </section>
      </main>
    </Layout>
  );
};

export default AboutUs;
