
import express from "express";
import {
  getLabs,
  getLabById,
  submitAnswers,
  getAllSubmissions,
  createLabWithModules,
  getLabByDbId,
  updateLab,
  createModule,
  updateModule,
  createQuestion,
  updateQuestion,
  deleteLab,
  deleteModule,
  deleteQuestion,
  getUserSubmittedQuestions, // NEW IMPORT
  getLabProgress,
  generateCertificate,
  shareCertificate,
  downloadCertificate,
  verifyCertificatePublic,
} from "../controllers/labController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================== LAB ROUTES ==================
router.get("/", getLabs);

// Check which questions user already submitted
router.get("/submitted/:userId/:labId", protect, getUserSubmittedQuestions);
router.get("/progress/:labId", protect, getLabProgress);

router.get("/submissions", protect, admin, getAllSubmissions);
router.get("/admin/:id", protect, admin, getLabByDbId);
router.get("/certificate/verify/:token", verifyCertificatePublic);

router.get("/:id", getLabById);

router.post("/submit", protect, submitAnswers);
router.post("/:labId/certificate/generate", protect, generateCertificate);
router.post("/:labId/certificate/share", protect, shareCertificate);
router.post("/:labId/certificate/download", protect, downloadCertificate);

router.post("/create", protect, admin, createLabWithModules);
router.put("/:id", protect, admin, updateLab);
router.post("/:labId/modules", protect, admin, createModule);
router.put("/modules/:id", protect, admin, updateModule);
router.post("/modules/:moduleId/questions", protect, admin, createQuestion);
router.put("/questions/:id", protect, admin, updateQuestion);

// ================== DELETE ROUTES ==================

// Delete entire lab
router.delete("/:id", protect, admin, deleteLab);

// Delete specific module inside a lab
router.delete("/modules/:id", protect, admin, deleteModule);

// Delete specific question inside a module
router.delete("/questions/:id", protect, admin, deleteQuestion);

export default router;
