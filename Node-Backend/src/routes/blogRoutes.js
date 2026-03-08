import express from "express";
import {
  getPublishedBlogs,
  getBlogBySlug,
  getAllBlogsAdmin,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin
router.get("/admin/all", protect, admin, getAllBlogsAdmin);
router.post("/admin", protect, admin, createBlog);
router.put("/admin/:id", protect, admin, updateBlog);
router.delete("/admin/:id", protect, admin, deleteBlog);

// Public
router.get("/", getPublishedBlogs);
router.get("/:slug", getBlogBySlug);

export default router;
