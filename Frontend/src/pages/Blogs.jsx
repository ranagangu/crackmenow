import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get("/api/blogs");
        setBlogs(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <Layout>
      <main style={{ padding: "120px 20px 50px", minHeight: "100vh", color: "#fff" }}>
        <section style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ marginBottom: 8, color: "#86efac" }}>Blogs</h1>
          <p style={{ marginTop: 0, color: "#94a3b8" }}>
            Read latest updates from CrackMeNow.
          </p>

          {loading ? (
            <p style={{ color: "#cbd5e1" }}>Loading blogs...</p>
          ) : blogs.length === 0 ? (
            <p style={{ color: "#cbd5e1" }}>No blogs published yet.</p>
          ) : (
            <div
              style={{
                marginTop: 20,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  style={{
                    background: "#0f172a",
                    border: "1px solid rgba(148,163,184,0.25)",
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  {blog.image ? (
                    <img
                      src={blog.image}
                      alt={blog.title}
                      style={{
                        width: "100%",
                        height: 170,
                        objectFit: "cover",
                        borderRadius: 10,
                        marginBottom: 12,
                      }}
                    />
                  ) : null}

                  <h3 style={{ margin: "0 0 8px", color: "#f8fafc" }}>{blog.title}</h3>
                  <p style={{ margin: "0 0 10px", color: "#cbd5e1" }}>
                    {blog.excerpt || "Read the full article for details."}
                  </p>
                  <p style={{ margin: "0 0 14px", color: "#94a3b8", fontSize: 13 }}>
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>

                  <Link
                    to={`/blogs/${blog.slug}`}
                    style={{
                      color: "#022c22",
                      background: "#4ade80",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontWeight: 700,
                      padding: "8px 12px",
                      display: "inline-block",
                    }}
                  >
                    Read More
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
};

export default Blogs;
