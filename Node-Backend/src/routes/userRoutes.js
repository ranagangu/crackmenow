// // import express from "express";
// // import prisma from "../config/db.js";
// // import { registerUser, loginUser, registerAdmin, loginAdmin, getAllUsers } from "../controllers/userController.js";
// // import { protect, admin } from "../middleware/authMiddleware.js";

// // const router = express.Router();

// // router.post("/register", registerUser);
// // router.post("/login", loginUser);
// // router.post("/admin/register", registerAdmin);
// // router.post("/admin/login", loginAdmin);

// // router.get("/admin/users", getAllUsers);

// // // ✅ Get logged-in user's profile
// // router.get("/profile", protect, async (req, res) => {
// //   try {
// //     const user = await prisma.user.findUnique({
// //       where: { id: req.user.id },
// //       select: { id: true, username: true, email: true, role: true, createdAt: true },
// //     });

// //     if (!user) return res.status(404).json({ message: "User not found" });

// //     res.json(user);
// //   } catch (error) {
// //     console.error("Error fetching profile:", error);
// //     res.status(500).json({ message: "Failed to fetch profile" });
// //   }
// // });

// // // ✅ Update user profile
// // router.put("/update-profile", protect, async (req, res) => {
// //   try {
// //     const { username, email } = req.body;

// //     const updatedUser = await prisma.user.update({
// //       where: { id: req.user.id },
// //       data: { username, email },
// //     });

// //     res.json(updatedUser);
// //   } catch (error) {
// //     console.error("Error updating profile:", error);
// //     res.status(500).json({ message: "Failed to update profile" });
// //   }
// // });

// // export default router;

// import express from "express";
// import prisma from "../config/db.js";
// import { registerUser, loginUser, registerAdmin, loginAdmin, getAllUsers } from "../controllers/userController.js";
// import { protect, admin } from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.post("/admin/register", registerAdmin);
// router.post("/admin/login", loginAdmin);

// router.get("/admin/users", getAllUsers);

// // ✅ Get logged-in user's profile
// router.get("/profile", protect, async (req, res) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: req.user.id },
//       select: { id: true, username: true, email: true, role: true, createdAt: true },
//     });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json(user);
//   } catch (error) {
//     console.error("Error fetching profile:", error);
//     res.status(500).json({ message: "Failed to fetch profile" });
//   }
// });

// // ✅ Update user profile
// router.put("/update-profile", protect, async (req, res) => {
//   try {
//     const { username, email } = req.body;

//     const updatedUser = await prisma.user.update({
//       where: { id: req.user.id },
//       data: { username, email },
//     });

//     res.json(updatedUser);
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     res.status(500).json({ message: "Failed to update profile" });
//   }
// });

// export default router;





// import express from "express";
// import prisma from "../config/db.js";
// import {
//   registerUser,
//   loginUser,
//   registerAdmin,
//   loginAdmin,
//   getAllUsers,
// } from "../controllers/userController.js";
// import { protect, admin } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // ✅ Authentication routes
// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.post("/admin/register", registerAdmin);
// router.post("/admin/login", loginAdmin);

// // ✅ Admin route to get all users
// router.get("/admin/users", getAllUsers);

// // ✅ Get logged-in user's profile
// router.get("/profile", protect, async (req, res) => {
//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: req.user.id },
//       select: {
//         id: true,
//         username: true,
//         email: true,
//         role: true,
//         image: true,
//         country: true, // ✅ Include country
//         createdAt: true,
//       },
//     });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json(user);
//   } catch (error) {
//     console.error("Error fetching profile:", error);
//     res.status(500).json({ message: "Failed to fetch profile" });
//   }
// });

// // ✅ Update user profile
// router.put("/update-profile", protect, async (req, res) => {
//   try {
//     const { username, email, country } = req.body; // ✅ include country from frontend

//     const updatedUser = await prisma.user.update({
//       where: { id: req.user.id },
//       data: { username, email, country }, // ✅ Save all three fields
//     });

//     res.json(updatedUser);
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     res.status(500).json({ message: "Failed to update profile" });
//   }
// });

// export default router;




import express from "express";
import prisma from "../config/db.js";
import {
  registerUser,
  verifyRegisterOtp,
  loginUser,
  verifyLoginOtp,
  requestPasswordReset,
  resetPassword,
  registerAdmin,
  loginAdmin,
  getAllUsers,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { getLeaderboard } from "../controllers/userController.js";


const router = express.Router();

// ✅ Authentication routes
router.post("/register", registerUser); // request signup OTP
router.post("/register/verify-otp", verifyRegisterOtp); // finalize signup
router.post("/login", loginUser); // request login OTP
router.post("/login/verify-otp", verifyLoginOtp); // finalize user login
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);
router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);

// ✅ Admin route to get all users
router.get("/admin/users", getAllUsers);

router.get("/leaderboard", getLeaderboard);


// ✅ Get logged-in user's profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        image: true,
        country: true, // ✅ Include country
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const [labs, correctSubmissions] = await Promise.all([
      prisma.lab.findMany({
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          title: true,
          displayOrder: true,
          modules: {
            select: {
              questions: {
                select: { id: true },
              },
            },
          },
        },
      }),
      prisma.submission.findMany({
        where: {
          userId: req.user.id,
          status: "CORRECT",
        },
        select: {
          questionId: true,
          createdAt: true,
          question: {
            select: {
              module: {
                select: { labId: true },
              },
            },
          },
        },
      }),
    ]);

    const correctQuestionIds = new Set(correctSubmissions.map((s) => s.questionId));
    const completionTimeByQuestion = new Map(
      correctSubmissions.map((s) => [s.questionId, s.createdAt])
    );

    const achievements = labs
      .map((lab) => {
        const allQuestionIds = lab.modules.flatMap((m) => m.questions.map((q) => q.id));
        if (allQuestionIds.length === 0) return null;

        const isCompleted = allQuestionIds.every((qId) => correctQuestionIds.has(qId));
        if (!isCompleted) return null;

        const completedAt = allQuestionIds
          .map((qId) => completionTimeByQuestion.get(qId))
          .filter(Boolean)
          .sort((a, b) => new Date(b) - new Date(a))[0];

        return {
          type: "LAB_COMPLETION",
          labId: lab.id,
          labTitle: lab.title,
          labOrder: lab.displayOrder,
          totalQuestions: allQuestionIds.length,
          completedAt,
        };
      })
      .filter(Boolean);

    res.json({
      ...user,
      achievements,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// ✅ Update user profile (username, email, country)
router.put("/update-profile", protect, async (req, res) => {
  try {
    const { username, email, country } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { username, email, country },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// ✅ Leaderboard Route — Rank users by completed submissions
router.get("/leaderboard", async (req, res) => {
  try {
    // Fetch all users + their submissions
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        image: true,
        country: true,
        role: true,
        submissions: {
          select: { status: true },
        },
      },
    });

    // Compute completed lab count for each user
    const leaderboard = users
      .map((user) => ({
        id: user.id,
        username: user.username,
        image: user.image,
        country: user.country,
        role: user.role,
        completedLabsCount: user.submissions.filter(
          (s) => s.status === "COMPLETED"
        ).length,
      }))
      .sort((a, b) => b.completedLabsCount - a.completedLabsCount);

    res.json(leaderboard);
  } catch (error) {
    console.error("Error generating leaderboard:", error);
    res
      .status(500)
      .json({ message: "Server error generating leaderboard" });
  }
});

export default router;
