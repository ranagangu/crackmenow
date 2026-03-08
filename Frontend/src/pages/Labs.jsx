import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/labs");
        setLabs(res.data || []);
      } catch (error) {
        console.error("Error loading labs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabs();
  }, []);

  return (
    <Layout>
      <section
        style={{
          paddingTop: "150px",
          paddingBottom: "40px",
          background: "#181c2a",
          minHeight: "100vh",
        }}
      >
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ color: "#39FF14", marginBottom: 20 }}>All Labs</h1>

          {loading ? (
            <p style={{ color: "#fff" }}>Loading labs...</p>
          ) : labs.length === 0 ? (
            <p style={{ color: "#fff" }}>No labs available.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 18,
              }}
            >
              {labs.map((lab) => (
                <Link
                  key={lab.id}
                  to={`/labs/${lab.displayOrder}`}
                  style={{
                    textDecoration: "none",
                    background: "#232d3f",
                    borderRadius: 10,
                    padding: 16,
                    color: "#fff",
                    border: "1px solid #2f3a52",
                  }}
                >
                  <div style={{ marginBottom: 10, color: "#39FF14", fontWeight: 700 }}>
                    Lab {lab.displayOrder}
                  </div>
                  <h3 style={{ marginBottom: 8, color: "#fff" }}>{lab.title}</h3>
                  <p style={{ margin: 0, color: "#bfc9da", fontSize: "0.95rem" }}>
                    {lab.summary || "No summary provided."}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Labs;
