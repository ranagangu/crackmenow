import express from "express";
import prisma from "../config/db.js";
import { sendEmail, isMailConfigured } from "../utils/otpService.js";

const router = express.Router();

// POST new contact message
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "name, email and message are required" });
    }

    const newMessage = await prisma.contact.create({
      data: { name, email, message },
    });

    // Send contact message copy to owner/admin email
    const ownerEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.SMTP_USER;
    let emailDelivered = false;
    if (ownerEmail) {
      const emailRes = await sendEmail({
        mailType: "contact",
        to: ownerEmail,
        subject: `New Contact Message from ${name}`,
        text: `New Contact Submission\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5">
            <h2>New Contact Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <p>${String(message).replace(/\n/g, "<br/>")}</p>
          </div>
        `,
      });
      emailDelivered = Boolean(emailRes?.delivered);
    } else {
      console.warn("CONTACT_RECEIVER_EMAIL or SMTP_USER is not set; cannot send contact mail");
    }

    // Emit via Socket.IO to admins
    const io = req.app.get("io");
    io.emit("newContactMessage", newMessage);

    res.status(201).json({
      ...newMessage,
      emailDelivered,
      mailConfigured: isMailConfigured("contact"),
    });
  } catch (err) {
    console.error("Error creating contact message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// GET all contact messages
router.get("/", async (req, res) => {
  try {
    const messages = await prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(messages);
  } catch (err) {
    console.error("Error fetching contact messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
