import React, { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../AuthContext";
import "../admin-ui.css";

const initialForm = {
  title: "",
  excerpt: "",
  content: "",
  image: "",
  isPublished: true,
};

const AdminBlogs = () => {
  const { token } = useContext(AuthContext);
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBlogs = useCallback(async () => {
    try {
      const res = await axios.get("/api/blogs/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchBlogs();
  }, [token, fetchBlogs]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`/api/blogs/admin/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("/api/blogs/admin", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setForm(initialForm);
      setEditingId(null);
      fetchBlogs();
    } catch (error) {
      console.error("Failed to save blog:", error);
      alert(error?.response?.data?.message || "Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (blog) => {
    setEditingId(blog.id);
    setForm({
      title: blog.title || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      image: blog.image || "",
      isPublished: Boolean(blog.isPublished),
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this blog?")) return;
    try {
      await axios.delete(`/api/blogs/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBlogs();
    } catch (error) {
      console.error("Failed to delete blog:", error);
    }
  };

  return (
    <div className="admin-ui-page">
      <div className="admin-ui-container">
        <div className="admin-ui-title-row">
          <div>
            <h2 className="admin-ui-title">Manage Blogs</h2>
            <p className="admin-ui-subtitle">Create and publish blog posts for users.</p>
          </div>
          <span className="admin-ui-pill">Total: {blogs.length}</span>
        </div>

        <form className="admin-ui-panel admin-ui-panel-pad" onSubmit={onSubmit}>
          <div className="admin-ui-grid admin-ui-grid-2">
            <input
              className="admin-ui-input"
              placeholder="Blog title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
            <input
              className="admin-ui-input"
              placeholder="Image URL (optional)"
              value={form.image}
              onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
            />
          </div>

          <input
            className="admin-ui-input"
            placeholder="Short excerpt (optional)"
            value={form.excerpt}
            onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
            style={{ marginTop: 10 }}
          />

          <textarea
            className="admin-ui-textarea"
            placeholder="Blog content"
            value={form.content}
            onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            required
            style={{ marginTop: 10, minHeight: 150 }}
          />

          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
            />
            Published
          </label>

          <div className="admin-ui-stack" style={{ marginTop: 12 }}>
            <button className="admin-ui-btn admin-ui-btn-primary" type="submit" disabled={loading}>
              {loading ? "Saving..." : editingId ? "Update Blog" : "Create Blog"}
            </button>
            {editingId ? (
              <button
                className="admin-ui-btn admin-ui-btn-warn"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>

        <div className="admin-ui-card-list" style={{ marginTop: 14 }}>
          {blogs.map((blog) => (
            <article className="admin-ui-item-card" key={blog.id}>
              <h3 className="admin-ui-item-title" style={{ marginBottom: 6 }}>
                {blog.title}
              </h3>
              <p className="admin-ui-meta" style={{ marginTop: 0 }}>
                Slug: {blog.slug} | {blog.isPublished ? "Published" : "Draft"}
              </p>
              <p style={{ margin: 0, color: "#cbd5e1" }}>{blog.excerpt || "No excerpt"}</p>
              <div className="admin-ui-stack" style={{ marginTop: 10 }}>
                <button className="admin-ui-btn admin-ui-btn-info" onClick={() => onEdit(blog)}>
                  Edit
                </button>
                <button className="admin-ui-btn admin-ui-btn-danger" onClick={() => onDelete(blog.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}

          {blogs.length === 0 ? (
            <div className="admin-ui-panel admin-ui-panel-pad">
              <p className="admin-ui-empty">No blogs yet.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminBlogs;
