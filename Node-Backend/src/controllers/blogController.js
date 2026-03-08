import prisma from "../config/db.js";

const slugify = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const ensureUniqueSlug = async (title, currentId = null) => {
  const base = slugify(title) || `blog-${Date.now()}`;
  let candidate = base;
  let count = 1;

  while (true) {
    const exists = await prisma.blog.findFirst({
      where: {
        slug: candidate,
        ...(currentId ? { NOT: { id: currentId } } : {}),
      },
      select: { id: true },
    });

    if (!exists) return candidate;
    candidate = `${base}-${count++}`;
  }
};

export const getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(blogs);
  } catch (error) {
    console.error("Error fetching published blogs:", error);
    return res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await prisma.blog.findFirst({
      where: { slug: req.params.slug, isPublished: true },
    });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    return res.json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).json({ message: "Failed to fetch blog" });
  }
};

export const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs for admin:", error);
    return res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, image, isPublished = true } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const slug = await ensureUniqueSlug(title);

    const created = await prisma.blog.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        image: image?.trim() || null,
        isPublished: Boolean(isPublished),
      },
    });

    return res.status(201).json(created);
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({ message: "Failed to create blog" });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    const { title, excerpt, content, image, isPublished } = req.body;
    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const data = {};

    if (typeof title === "string" && title.trim()) {
      data.title = title.trim();
      data.slug = await ensureUniqueSlug(title, id);
    }
    if (typeof excerpt === "string") data.excerpt = excerpt.trim() || null;
    if (typeof content === "string" && content.trim()) data.content = content.trim();
    if (typeof image === "string") data.image = image.trim() || null;
    if (typeof isPublished === "boolean") data.isPublished = isPublished;

    const updated = await prisma.blog.update({
      where: { id },
      data,
    });

    return res.json(updated);
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({ message: "Failed to update blog" });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ message: "Invalid blog id" });
    }

    await prisma.blog.delete({ where: { id } });
    return res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({ message: "Failed to delete blog" });
  }
};
