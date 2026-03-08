import prisma from "../config/db.js";
import jwt from "jsonwebtoken";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import QRCode from "qrcode";

const CERTIFICATE_PROOF_EXPIRY = "24h";
const REQUIRED_SHARE_PLATFORMS = ["linkedin", "facebook", "x"];
const CERTIFICATE_VERIFY_EXPIRY = "365d";

const getCertificateLogoPath = () => {
  const candidates = [
    path.resolve(process.cwd(), "../Frontend/public/assets/img/logo/New_Logo.png"),
    path.resolve(process.cwd(), "../Frontend/public/assets/img/logo/Logo_New_Final.png"),
    path.resolve(process.cwd(), "public/assets/img/logo/New_Logo.png"),
  ];

  return candidates.find((p) => fs.existsSync(p)) || null;
};

const sanitizeFileName = (value) =>
  String(value || "certificate")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const buildCertificatePdfBuffer = ({
  studentName,
  labTitle,
  certificateId,
  issuedAt,
  qrCodeBuffer,
}) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 50,
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const contentWidth = pageWidth - margin * 2;
    const logoPath = getCertificateLogoPath();

    const drawVerificationStamp = (x, y, radius) => {
      // Outer ring
      doc
        .save()
        .lineWidth(3)
        .strokeColor("#166534")
        .circle(x, y, radius)
        .stroke()
        .lineWidth(1.5)
        .circle(x, y, radius - 8)
        .stroke();

      // Stamp center
      doc
        .fillColor("#166534")
        .font("Helvetica-Bold")
        .fontSize(13)
        .text("VERIFIED", x - 48, y - 8, { width: 96, align: "center" });

      doc
        .fillColor("#14532d")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("CRACKMENOW", x - 52, y - 28, { width: 104, align: "center" })
        .text("CERTIFIED", x - 52, y + 16, { width: 104, align: "center" });

      // Star markers
      doc
        .fillColor("#166534")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text('*', x - radius + 12, y - 5)
        .text('*', x + radius - 14, y - 5);

      doc.restore();
    };

    // Outer and inner frames for a professional certificate look
    doc.rect(22, 22, pageWidth - 44, pageHeight - 44).lineWidth(3).stroke("#166534");
    doc.rect(34, 34, pageWidth - 68, pageHeight - 68).lineWidth(1).stroke("#22c55e");

    // Header strip
    doc.rect(margin, 52, contentWidth, 46).fill("#0f172a");
    doc
      .fillColor("#86efac")
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("CRACKMENOW", margin + 18, 68, { width: contentWidth - 36, align: "left" });

    if (logoPath) {
      doc.image(logoPath, pageWidth - margin - 136, 50, {
        fit: [124, 54],
        align: "right",
      });
    }

    doc
      .fillColor("#0F172A")
      .font("Helvetica-Bold")
      .fontSize(40)
      .text("Certificate of Completion", margin, 126, {
        width: contentWidth,
        align: "center",
      });

    doc
      .fillColor("#334155")
      .font("Helvetica")
      .fontSize(16)
      .text("This certifies that", margin, 184, {
        width: contentWidth,
        align: "center",
      });

    doc
      .fillColor("#0B6B0B")
      .font("Helvetica-Bold")
      .fontSize(32)
      .text(studentName, margin, 214, {
        width: contentWidth,
        align: "center",
      });

    doc
      .fillColor("#334155")
      .font("Helvetica")
      .fontSize(16)
      .text("has successfully completed", margin, 266, {
        width: contentWidth,
        align: "center",
      });

    doc
      .fillColor("#111827")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text(labTitle, margin, 294, {
        width: contentWidth,
        align: "center",
      });

    // Metadata box
    doc.roundedRect(margin + 10, 372, 320, 74, 8).lineWidth(1).stroke("#334155");
    doc
      .fillColor("#475569")
      .font("Helvetica")
      .fontSize(12)
      .text(`Certificate ID: ${certificateId}`, margin + 26, 392)
      .text(`Issued At: ${new Date(issuedAt).toLocaleString()}`, margin + 26, 412);

    // Signature area
    const signatureX = pageWidth - margin - 240;
    const signatureY = 462;
    doc.moveTo(signatureX, signatureY).lineTo(signatureX + 190, signatureY).lineWidth(1).stroke("#334155");
    doc
      .fillColor("#0f172a")
      .font("Helvetica")
      .fontSize(11)
      .text("Authorized by CrackMeNow", signatureX, signatureY + 8, { width: 190, align: "center" });

    // Verification stamp near signature area
    drawVerificationStamp(pageWidth - margin - 110, 414, 54);

    // QR verification block (moved to left blank area)
    if (qrCodeBuffer) {
      const qrX = margin + 10;
      const qrY = 170;
      doc.roundedRect(qrX - 10, qrY - 10, 136, 136, 8).lineWidth(1).stroke("#334155");
      doc.image(qrCodeBuffer, qrX, qrY, { fit: [116, 116] });
      doc
        .fillColor("#334155")
        .font("Helvetica")
        .fontSize(9);
    }

    doc
      .font("Helvetica-Oblique")
      .fillColor("#64748B")
      .fontSize(11)
      .text("Verified by CrackMeNow Learning Platform", margin, 500, {
        width: contentWidth,
        align: "center",
      });

    doc.end();
  });

const getLabWithModulesAndQuestions = async (labDisplayOrder) => {
  return prisma.lab.findFirst({
    where: { displayOrder: labDisplayOrder },
    include: {
      modules: {
        orderBy: { id: "asc" },
        include: {
          questions: {
            orderBy: { id: "asc" },
          },
        },
      },
    },
  });
};

const getModuleProgressForUser = async ({ userId, lab }) => {
  const moduleIds = lab.modules.map((m) => m.id);
  const questionIds = lab.modules.flatMap((m) => m.questions.map((q) => q.id));

  const submissions = await prisma.submission.findMany({
    where: {
      userId,
      questionId: { in: questionIds.length ? questionIds : [-1] },
    },
    select: { questionId: true, status: true, createdAt: true },
  });

  // For each question, keep the latest submission status
  const latestByQuestion = new Map();
  submissions
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((s) => latestByQuestion.set(s.questionId, s));

  const moduleProgress = lab.modules.map((mod, index) => {
    const totalQuestions = mod.questions.length;
    const correctCount = mod.questions.filter(
      (q) => latestByQuestion.get(q.id)?.status === "CORRECT"
    ).length;
    const isCompleted = totalQuestions > 0 ? correctCount === totalQuestions : true;

    return {
      moduleId: mod.id,
      moduleIndex: index + 1,
      title: mod.title,
      totalQuestions,
      submittedCount: correctCount,
      isCompleted,
      isUnlocked: false,
    };
  });

  let firstIncompleteIndex = moduleProgress.findIndex((m) => !m.isCompleted);
  if (firstIncompleteIndex === -1) {
    firstIncompleteIndex = moduleProgress.length - 1;
  }

  moduleProgress.forEach((mod, index) => {
    mod.isUnlocked = firstIncompleteIndex === -1 ? true : index <= firstIncompleteIndex;
  });

  const nextUnlockedModuleId =
    firstIncompleteIndex >= 0 ? moduleProgress[firstIncompleteIndex]?.moduleId || null : null;
  const allModulesCompleted =
    moduleProgress.length > 0 ? moduleProgress.every((m) => m.isCompleted) : false;

  return {
    moduleProgress,
    moduleIds,
    allModulesCompleted,
    nextUnlockedModuleId,
  };
};

const validateCertificatePrerequisites = async ({ userId, labDisplayOrder }) => {
  const lab = await getLabWithModulesAndQuestions(labDisplayOrder);
  if (!lab) {
    return { ok: false, status: 404, message: "Lab not found" };
  }

  const progress = await getModuleProgressForUser({ userId, lab });
  if (!progress.allModulesCompleted) {
    return {
      ok: false,
      status: 403,
      message: "Complete all modules before generating certificate",
    };
  }

  return { ok: true, lab, progress };
};
// 1️ Get all labs (with modules + questions)
export const getLabs = async (req, res) => {
  try {
    const labs = await prisma.lab.findMany({
      orderBy: { displayOrder: "asc" }, // Keep labs in correct order
      include: {       
        modules: {
          orderBy: { id: "asc" },
          include: {
            questions: {
              orderBy: { id: "asc" },
            },
          },
        },
      },
    });

    res.json(labs);
  } catch (error) {
    console.error("Error fetching labs:", error);
    res.status(500).json({ message: "Error fetching labs" });
  }
};

export const getLabById = async (req, res) => {
  try {
    const orderNumber = Number(req.params.id); // frontend /labs/:id → displayOrder

    if (isNaN(orderNumber)) {
      return res.status(400).json({ message: "Invalid lab ID" });
    }

    //  Fetch lab by displayOrder
    const lab = await getLabWithModulesAndQuestions(orderNumber);

    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    //  Count total labs
    const totalLabs = await prisma.lab.count();

    //  Determine if this is the last lab
    const isLastLab = orderNumber === totalLabs;

    //  Send extra property to frontend
    res.json({ ...lab, isLastLab });

  } catch (error) {
    console.error("Error fetching lab by order:", error);
    res.status(500).json({ message: "Error fetching lab" });
  }
};

export const submitAnswers = async (req, res) => {
  try {
    const { userId, answers, labId } = req.body;
    const authenticatedUserId = req.user?.id ? Number(req.user.id) : Number(userId);
    const submittedUserId = Number(userId);

    if (!authenticatedUserId || !answers || answers.length === 0) {
      return res.status(400).json({ message: "Invalid submission data" });
    }

    if (req.user?.id && submittedUserId && authenticatedUserId !== submittedUserId) {
      return res.status(403).json({ message: "You can only submit your own answers" });
    }

    const questionIds = answers
      .map((ans) => Number(ans.questionId))
      .filter((id) => !Number.isNaN(id));

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds.length ? questionIds : [-1] } },
      select: {
        id: true,
        answer: true,
        moduleId: true,
        module: {
          select: {
            lab: {
              select: {
                id: true,
                displayOrder: true,
              },
            },
          },
        },
      },
    });

    if (questions.length !== questionIds.length) {
      return res.status(400).json({ message: "One or more question IDs are invalid" });
    }

    const targetDisplayOrder =
      Number(labId) ||
      Number(questions[0]?.module?.lab?.displayOrder) ||
      Number(req.params.id);

    const lab = await getLabWithModulesAndQuestions(targetDisplayOrder);
    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    const belongsToSameLab = questions.every((q) => q.module.lab.displayOrder === targetDisplayOrder);
    if (!belongsToSameLab) {
      return res
        .status(400)
        .json({ message: "All submitted questions must belong to the same lab" });
    }

    const progress = await getModuleProgressForUser({
      userId: authenticatedUserId,
      lab,
    });
    const unlockedModuleId = progress.nextUnlockedModuleId;

    const attemptedLocked = questions.find((q) => q.moduleId !== unlockedModuleId);
    if (attemptedLocked && !progress.allModulesCompleted) {
      return res.status(403).json({
        message: "Complete previous module first to unlock this module",
        unlockedModuleId,
        attemptedModuleId: attemptedLocked.moduleId,
      });
    }

    const questionById = new Map(questions.map((q) => [q.id, q]));
    const submissions = await Promise.all(
      answers.map(async (ans) => {
        const questionId = Number(ans.questionId);
        const question = questionById.get(questionId);

        // 1️ Check if already submitted
        const existing = await prisma.submission.findFirst({
          where: {
            userId: authenticatedUserId,
            questionId,
          },
        });

        if (existing?.status === "CORRECT") {
          return {
            questionId,
            alreadySubmitted: true,
            status: "CORRECT",
          };
        }

        // 2️ Fetch correct answer
        if (!question) {
          throw new Error(`Question with ID ${questionId} not found`);
        }

        const isCorrect =
          ans.selected?.trim().toLowerCase() ===
          question.answer?.trim().toLowerCase();

        if (existing) {
          // Update latest attempt for this question (correct or wrong).
          return prisma.submission.update({
            where: { id: existing.id },
            data: {
              selected: ans.selected,
              status: isCorrect ? "CORRECT" : "WRONG",
            },
          });
        }

        // 3️ Create first submission
        return prisma.submission.create({
          data: {
            userId: authenticatedUserId,
            questionId,
            selected: ans.selected,
            status: isCorrect ? "CORRECT" : "WRONG",
          },
        });
      })
    );

    const targetModuleId = questions[0]?.moduleId;
    let moduleEvaluation = null;
    let moduleReset = false;

    if (targetModuleId) {
      const moduleQuestionIds = lab.modules
        .find((m) => m.id === targetModuleId)
        ?.questions.map((q) => q.id) || [];

      const moduleSubmissions = await prisma.submission.findMany({
        where: {
          userId: authenticatedUserId,
          questionId: { in: moduleQuestionIds.length ? moduleQuestionIds : [-1] },
        },
        select: { questionId: true, status: true, createdAt: true },
      });

      const latestByQuestion = new Map();
      moduleSubmissions
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .forEach((s) => latestByQuestion.set(s.questionId, s));

      const attemptedCount = latestByQuestion.size;
      const totalQuestions = moduleQuestionIds.length;
      const correctCount = Array.from(latestByQuestion.values()).filter(
        (s) => s.status === "CORRECT"
      ).length;
      const attemptedAll = totalQuestions > 0 && attemptedCount === totalQuestions;
      const passed = attemptedAll && correctCount === totalQuestions;

      moduleEvaluation = {
        moduleId: targetModuleId,
        attemptedAll,
        passed,
        totalQuestions,
        correctCount,
      };

      // Reveal result only after the last question; on fail restart module.
      if (attemptedAll && !passed) {
        await prisma.submission.deleteMany({
          where: {
            userId: authenticatedUserId,
            question: { moduleId: targetModuleId },
          },
        });
        moduleReset = true;
      }
    }

    const refreshedProgress = await getModuleProgressForUser({
      userId: authenticatedUserId,
      lab,
    });

    res.json({
      message: "Submission processed",
      submissions,
      moduleProgress: refreshedProgress.moduleProgress,
      allModulesCompleted: refreshedProgress.allModulesCompleted,
      certificateEligible: refreshedProgress.allModulesCompleted,
      nextUnlockedModuleId: refreshedProgress.nextUnlockedModuleId,
      moduleEvaluation,
      moduleReset,
    });
  } catch (error) {
    console.error("Error saving submissions:", error);
    res.status(500).json({ message: "Error saving submission" });
  }
};


export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      include: {
        user: {
          select: { id: true, username: true, email: true },
        },
        question: {
          include: {
            module: {
              include: {
                lab: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Admin Request User:", req.user); // add this
    console.log("Total Submissions Fetched:", submissions.length); // add this

    res.status(200).json(submissions || []);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({
      message: "Failed to load submissions",
      error: error.message,
    });
  }
};


// 5️ Create Lab with Modules + Questions (auto-order)
export const createLabWithModules = async (req, res) => {
  try {
    const { title, summary, image, modules } = req.body;

    if (!title || !modules?.length) {
      return res.status(400).json({ message: "Title and modules are required" });
    }

    if (modules.length !== 5) {
      return res.status(400).json({
        message: `Each lab must contain exactly 5 modules (received ${modules.length})`,
      });
    }

    // Find highest displayOrder
    const lastLab = await prisma.lab.findFirst({
      orderBy: { displayOrder: "desc" },
    });

    const nextOrder = lastLab ? lastLab.displayOrder + 1 : 1;

    const lab = await prisma.lab.create({
      data: {
        title,
        summary,
        image,
        displayOrder: nextOrder,
        modules: {
          create: modules.map((mod) => ({
            title: mod.title,
            questions: {
              create: mod.questions.map((q) => ({
                text: q.text,
                options: q.options,
                answer: q.answer,
              })),
            },
          })),
        },
      },
      include: { modules: { include: { questions: true } } },
    });

    res.status(201).json({ message: "Lab created successfully", lab });
  } catch (error) {
    console.error("Error creating lab:", error);
    res.status(500).json({ message: "Server error creating lab" });
  }
};

// ======================================================
// 6️ DELETE LAB — reorder remaining labs automatically
// ======================================================
export const deleteLab = async (req, res) => {
  try {
    const labId = parseInt(req.params.id);

    const labToDelete = await prisma.lab.findUnique({
      where: { id: labId },
    });

    if (!labToDelete) {
      return res.status(404).json({ message: "Lab not found" });
    }

    const deletedOrder = labToDelete.displayOrder;

    // Delete submissions linked to this lab
    await prisma.submission.deleteMany({
      where: { question: { module: { labId } } },
    });

    // Delete related questions & modules
    await prisma.question.deleteMany({ where: { module: { labId } } });
    await prisma.module.deleteMany({ where: { labId } });
    await prisma.lab.delete({ where: { id: labId } });

    // Shift order for remaining labs
    await prisma.lab.updateMany({
      where: { displayOrder: { gt: deletedOrder } },
      data: { displayOrder: { decrement: 1 } },
    });

    res.json({ message: "Lab deleted and reordered successfully" });
  } catch (error) {
    console.error("Error deleting lab:", error);
    res.status(500).json({ message: "Failed to delete lab", error: error.message });
  }
};

// ======================================================
// 7️ DELETE MODULE — cascade delete its questions + submissions
// ======================================================
export const deleteModule = async (req, res) => {
  try {
    const moduleId = parseInt(req.params.id);

    await prisma.submission.deleteMany({ where: { question: { moduleId } } });
    await prisma.question.deleteMany({ where: { moduleId } });
    await prisma.module.delete({ where: { id: moduleId } });

    res.json({ message: "Module and its questions deleted successfully" });
  } catch (error) {
    console.error("Error deleting module:", error);
    res.status(500).json({ message: "Failed to delete module", error: error.message });
  }
};

// ======================================================
// 8️ DELETE QUESTION — cascade delete submissions
// ======================================================
export const deleteQuestion = async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);

    await prisma.submission.deleteMany({ where: { questionId } });
    await prisma.question.delete({ where: { id: questionId } });

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Failed to delete question", error: error.message });
  }
};
export const getUserSubmittedQuestions = async (req, res) => {
  try {
    const { userId, labId } = req.params;

    // labId from frontend = displayOrder, not actual labId
    const lab = await prisma.lab.findFirst({
      where: { displayOrder: Number(labId) },
      select: { id: true }
    });

    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    const submissions = await prisma.submission.findMany({
      where: {
        userId: Number(userId),
        question: {
          module: {
            labId: lab.id, // ← REAL LAB ID
          },
        },
      },
      select: {
        questionId: true,
        status: true,
        createdAt: true,
        question: {
          select: { moduleId: true }
        }
      }
    });

    // Keep latest status per question.
    const latestByQuestion = new Map();
    submissions
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .forEach((s) => latestByQuestion.set(s.questionId, s));

    const formatted = Array.from(latestByQuestion.values()).map((s) => ({
      moduleId: s.question.moduleId,
      questionId: s.questionId,
      status: s.status,
    }));

    res.json(formatted);

  } catch (error) {
    console.error("Error fetching submitted questions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLabByDbId = async (req, res) => {
  try {
    const labId = Number(req.params.id);
    if (!labId) {
      return res.status(400).json({ message: "Invalid lab ID" });
    }

    const lab = await prisma.lab.findUnique({
      where: { id: labId },
      include: {
        modules: {
          orderBy: { id: "asc" },
          include: {
            questions: {
              orderBy: { id: "asc" },
            },
          },
        },
      },
    });

    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    return res.json(lab);
  } catch (error) {
    console.error("Error fetching lab by DB id:", error);
    res.status(500).json({ message: "Failed to fetch lab" });
  }
};

export const updateLab = async (req, res) => {
  try {
    const labId = Number(req.params.id);
    const { title, summary, image, modules } = req.body;

    if (!labId) {
      return res.status(400).json({ message: "Invalid lab ID" });
    }
    if (!title || !Array.isArray(modules) || modules.length === 0) {
      return res.status(400).json({ message: "Title and modules are required" });
    }

    const existingLab = await prisma.lab.findUnique({ where: { id: labId } });
    if (!existingLab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    const updatedLab = await prisma.$transaction(async (tx) => {
      await tx.submission.deleteMany({
        where: { question: { module: { labId } } },
      });
      await tx.question.deleteMany({ where: { module: { labId } } });
      await tx.module.deleteMany({ where: { labId } });

      return tx.lab.update({
        where: { id: labId },
        data: {
          title,
          summary: summary || null,
          image: image || null,
          modules: {
            create: modules.map((mod) => ({
              title: mod.title,
              questions: {
                create: (mod.questions || []).map((q) => ({
                  text: q.text,
                  options: q.options ?? [],
                  answer: q.answer,
                })),
              },
            })),
          },
        },
        include: {
          modules: {
            include: {
              questions: true,
            },
          },
        },
      });
    });

    return res.json({ message: "Lab updated successfully", lab: updatedLab });
  } catch (error) {
    console.error("Error updating lab:", error);
    res.status(500).json({ message: "Failed to update lab", error: error.message });
  }
};

export const createModule = async (req, res) => {
  try {
    const labId = Number(req.params.labId);
    const { title, questions } = req.body;

    if (!labId || !title) {
      return res.status(400).json({ message: "labId and module title are required" });
    }

    const lab = await prisma.lab.findUnique({ where: { id: labId } });
    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    const module = await prisma.module.create({
      data: {
        title,
        labId,
        questions: {
          create: (questions || []).map((q) => ({
            text: q.text,
            options: q.options ?? [],
            answer: q.answer,
          })),
        },
      },
      include: { questions: true },
    });

    return res.status(201).json({ message: "Module created successfully", module });
  } catch (error) {
    console.error("Error creating module:", error);
    res.status(500).json({ message: "Failed to create module", error: error.message });
  }
};

export const updateModule = async (req, res) => {
  try {
    const moduleId = Number(req.params.id);
    const { title } = req.body;

    if (!moduleId || !title) {
      return res.status(400).json({ message: "moduleId and title are required" });
    }

    const module = await prisma.module.update({
      where: { id: moduleId },
      data: { title },
      include: { questions: true },
    });

    return res.json({ message: "Module updated successfully", module });
  } catch (error) {
    console.error("Error updating module:", error);
    res.status(500).json({ message: "Failed to update module", error: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const moduleId = Number(req.params.moduleId);
    const { text, options, answer } = req.body;

    if (!moduleId || !text || !answer) {
      return res.status(400).json({ message: "moduleId, text and answer are required" });
    }

    const module = await prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }

    const question = await prisma.question.create({
      data: {
        moduleId,
        text,
        options: options ?? [],
        answer,
      },
    });

    return res.status(201).json({ message: "Question created successfully", question });
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(500).json({ message: "Failed to create question", error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const questionId = Number(req.params.id);
    const { text, options, answer } = req.body;

    if (!questionId || !text || !answer) {
      return res.status(400).json({ message: "questionId, text and answer are required" });
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        options: options ?? [],
        answer,
      },
    });

    return res.json({ message: "Question updated successfully", question });
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Failed to update question", error: error.message });
  }
};

export const getLabProgress = async (req, res) => {
  try {
    const labDisplayOrder = Number(req.params.labId);
    const userId = Number(req.user?.id);

    if (!labDisplayOrder || !userId) {
      return res.status(400).json({ message: "Invalid lab or user" });
    }

    const lab = await getLabWithModulesAndQuestions(labDisplayOrder);
    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    const progress = await getModuleProgressForUser({ userId, lab });
    res.json({
      labId: lab.id,
      labDisplayOrder,
      moduleProgress: progress.moduleProgress,
      allModulesCompleted: progress.allModulesCompleted,
      certificateEligible: progress.allModulesCompleted,
      nextUnlockedModuleId: progress.nextUnlockedModuleId,
    });
  } catch (error) {
    console.error("Error fetching lab progress:", error);
    res.status(500).json({ message: "Failed to fetch lab progress" });
  }
};

export const generateCertificate = async (req, res) => {
  try {
    const labDisplayOrder = Number(req.params.labId);
    const userId = Number(req.user?.id);

    const validation = await validateCertificatePrerequisites({
      userId,
      labDisplayOrder,
    });

    if (!validation.ok) {
      return res.status(validation.status).json({ message: validation.message });
    }

    const certificateId = `LAB-${validation.lab.id}-USER-${userId}-${Date.now()}`;
    const issuedAt = new Date().toISOString();

    res.json({
      message: "Certificate generated successfully",
      certificate: {
        certificateId,
        labId: validation.lab.id,
        labTitle: validation.lab.title,
        userId,
        issuedAt,
      },
      requiredSharePlatforms: REQUIRED_SHARE_PLATFORMS,
      nextStep: "Share certificate via /api/labs/:labId/certificate/share before download",
    });
  } catch (error) {
    console.error("Error generating certificate:", error);
    res.status(500).json({ message: "Failed to generate certificate" });
  }
};

export const shareCertificate = async (req, res) => {
  try {
    const labDisplayOrder = Number(req.params.labId);
    const userId = Number(req.user?.id);
    const { certificateId, platform } = req.body;

    if (!certificateId || !platform) {
      return res.status(400).json({ message: "certificateId and platform are required" });
    }
    if (!REQUIRED_SHARE_PLATFORMS.includes(String(platform).toLowerCase())) {
      return res.status(400).json({
        message: `Invalid platform. Allowed: ${REQUIRED_SHARE_PLATFORMS.join(", ")}`,
      });
    }

    const validation = await validateCertificatePrerequisites({
      userId,
      labDisplayOrder,
    });

    if (!validation.ok) {
      return res.status(validation.status).json({ message: validation.message });
    }

    const shareProofToken = jwt.sign(
      {
        userId,
        labDisplayOrder,
        labId: validation.lab.id,
        certificateId,
        platform: String(platform).toLowerCase(),
        sharedAt: new Date().toISOString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: CERTIFICATE_PROOF_EXPIRY }
    );

    res.json({
      message: "Share verified for selected platform.",
      shareProofToken,
      expiresIn: CERTIFICATE_PROOF_EXPIRY,
      platform: String(platform).toLowerCase(),
      requiredSharePlatforms: REQUIRED_SHARE_PLATFORMS,
    });
  } catch (error) {
    console.error("Error sharing certificate:", error);
    res.status(500).json({ message: "Failed to verify certificate share" });
  }
};

export const downloadCertificate = async (req, res) => {
  try {
    const labDisplayOrder = Number(req.params.labId);
    const userId = Number(req.user?.id);
    const { certificateId, shareProofTokens } = req.body;

    if (!certificateId || !Array.isArray(shareProofTokens) || shareProofTokens.length === 0) {
      return res.status(400).json({
        message: "certificateId and shareProofTokens[] are required",
      });
    }

    const validation = await validateCertificatePrerequisites({
      userId,
      labDisplayOrder,
    });

    if (!validation.ok) {
      return res.status(validation.status).json({ message: validation.message });
    }

    const verifiedPlatforms = new Set();
    for (const token of shareProofTokens) {
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        return res.status(401).json({ message: "Invalid or expired share proof token" });
      }

      const isValidProof =
        decoded?.userId === userId &&
        Number(decoded?.labDisplayOrder) === labDisplayOrder &&
        decoded?.certificateId === certificateId;

      if (!isValidProof) {
        return res.status(403).json({ message: "Share proof does not match this certificate" });
      }

      if (decoded?.platform) {
        verifiedPlatforms.add(String(decoded.platform).toLowerCase());
      }
    }

    const missingPlatforms = REQUIRED_SHARE_PLATFORMS.filter((p) => !verifiedPlatforms.has(p));
    if (missingPlatforms.length > 0) {
      return res.status(403).json({
        message: `Share required on all platforms before download. Missing: ${missingPlatforms.join(
          ", "
        )}`,
        missingPlatforms,
      });
    }

    const issuedAt = new Date().toISOString();
    const studentName = req.user?.username || req.user?.email || `User ${userId}`;
    const verificationToken = jwt.sign(
      {
        type: "certificate-verify",
        certificateId,
        userId,
        labId: validation.lab.id,
        labTitle: validation.lab.title,
        issuedAt,
      },
      process.env.JWT_SECRET,
      { expiresIn: CERTIFICATE_VERIFY_EXPIRY }
    );

    const backendBaseUrl =
      process.env.BACKEND_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
    const verificationUrl = `${backendBaseUrl}/api/labs/certificate/verify/${verificationToken}`;
    const qrCodeBuffer = await QRCode.toBuffer(verificationUrl, {
      width: 512,
      margin: 1,
      errorCorrectionLevel: "M",
    });

    const pdfBuffer = await buildCertificatePdfBuffer({
      studentName,
      labTitle: validation.lab.title,
      certificateId,
      issuedAt,
  qrCodeBuffer,
    });

    const filename = `${sanitizeFileName(validation.lab.title)}-certificate.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Error downloading certificate:", error);
    res.status(500).json({ message: "Failed to download certificate" });
  }
};

export const verifyCertificatePublic = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ valid: false, message: "Verification token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ valid: false, message: "Invalid or expired certificate token" });
    }

    if (decoded?.type !== "certificate-verify") {
      return res.status(400).json({ valid: false, message: "Invalid certificate token type" });
    }

    return res.json({
      valid: true,
      message: "Certificate is valid",
      certificate: {
        certificateId: decoded.certificateId,
        userId: decoded.userId,
        labId: decoded.labId,
        labTitle: decoded.labTitle,
        issuedAt: decoded.issuedAt,
      },
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    res.status(500).json({ valid: false, message: "Failed to verify certificate" });
  }
};
