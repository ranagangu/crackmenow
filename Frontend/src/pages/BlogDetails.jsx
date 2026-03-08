import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/Layout";

const BlogDetails = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`/api/blogs/${slug}`);
        setBlog(res.data || null);
      } catch (error) {
        console.error("Error fetching blog details:", error);
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  return (
    <Layout>
      <main style={{ padding: "120px 20px 50px", minHeight: "100vh", color: "#fff" }}>
        <section style={{ maxWidth: 920, margin: "0 auto" }}>
          <Link to="/blogs" style={{ color: "#86efac", textDecoration: "none", fontWeight: 700 }}>
            Back to Blogs
          </Link>

          {loading ? (
            <p style={{ color: "#cbd5e1" }}>Loading blog...</p>
          ) : !blog ? (
            <p style={{ color: "#fda4af" }}>Blog not found.</p>
          ) : (
            <article style={{ marginTop: 14 }}>
              <h1 style={{ marginBottom: 8 }}>{blog.title}</h1>
              <p style={{ marginTop: 0, color: "#94a3b8" }}>
                Published on {new Date(blog.createdAt).toLocaleString()}
              </p>

              {blog.image ? (
                <img
                  src={blog.image}
                  alt={blog.title}
                  style={{
                    width: "100%",
                    maxHeight: 380,
                    objectFit: "cover",
                    borderRadius: 12,
                    marginBottom: 16,
                    border: "1px solid rgba(148,163,184,0.25)",
                  }}
                />
              ) : null}

              <div
                style={{
                  background: "#0f172a",
                  border: "1px solid rgba(148,163,184,0.25)",
                  borderRadius: 12,
                  padding: 18,
                  color: "#e2e8f0",
                  lineHeight: 1.75,
                  whiteSpace: "pre-wrap",
                }}
              >
                {blog.content}
              </div>
            </article>
          )}
        </section>
      </main>
    </Layout>
  );
};

export default BlogDetails;
