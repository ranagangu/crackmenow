// import prisma from "../config/db.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
// };

// // REGISTER
// export const registerUser = async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     const userExists = await prisma.user.findUnique({ where: { email } });
//     if (userExists) return res.status(400).json({ message: "User already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await prisma.user.create({
//       data: { username, email, password: hashedPassword, role: "USER" },
//     });


//     res.status(201).json({
//       id: user.id,
//       username: user.username,
//       email: user.email,
//       token: generateToken(user.id),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // LOGIN
// export const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     res.json({
//       id: user.id,
//       username: user.username,
//       email: user.email,
//       token: generateToken(user.id),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ADMIN REGISTER
// export const registerAdmin = async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     const userExists = await prisma.user.findUnique({ where: { email } });
//     if (userExists) return res.status(400).json({ message: "Admin already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const admin = await prisma.user.create({
//       data: { username, email, password: hashedPassword, role: "ADMIN" },
//     });


//     res.status(201).json({
//       id: admin.id,
//       username: admin.username,
//       email: admin.email,
//       role: admin.role,
//       token: generateToken(admin.id),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ADMIN LOGIN
// export const loginAdmin = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const admin = await prisma.user.findUnique({ where: { email } });
//     if (!admin || admin.role !== "ADMIN")
//       return res.status(400).json({ message: "Invalid admin credentials" });

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch)
//       return res.status(400).json({ message: "Invalid admin credentials" });

//     res.json({
//       id: admin.id,
//       username: admin.username,
//       email: admin.email,
//       role: admin.role,
//       token: generateToken(admin.id),
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// // GET ALL USERS (Admin only)
// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         username: true,
//         email: true,
//         role: true,
//         createdAt: true,
//       },
//     });

//     res.json(users);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOtpEmail, sendEmail } from "../utils/otpService.js";
import dns from "dns";

// TOKEN GENERATION (now includes role + email)
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

const OTP_EXPIRY = "10m";
const PASSWORD_RESET_EXPIRY = "15m";

const dnsResolver = dns.promises;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "mailinator.com",
  "tempmail.com",
  "temp-mail.org",
  "dispostable.com",
  "yopmail.com",
  "getnada.com",
  "maildrop.cc",
  "throwawaymail.com",
  "fakeinbox.com",
  "trashmail.com",
  "mintemail.com",
  "sharklasers.com",
  "grr.la",
  "inboxbear.com",
  "emailondeck.com",
  "mailnesia.com",
  "spambog.com",
  "tmpmail.org",
  "tempinbox.com",
  "moakt.com",
  "33mail.com",
  "mytemp.email",
  "tempmailo.com",
  "fakemail.net",
]);

const DISPOSABLE_DOMAIN_KEYWORDS = [
  "temp-mail",
  "tempmail",
  "10minutemail",
  "mailinator",
  "guerrillamail",
  "yopmail",
  "throwaway",
  "disposable",
];

const BLOCKED_EMAIL_DOMAINS_FROM_ENV = new Set(
  String(process.env.BLOCKED_EMAIL_DOMAINS || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)
);

const getEmailDomain = (email) => String(email || "").toLowerCase().split("@")[1] || "";

const hasValidMxRecords = async (domain) => {
  try {
    const mxRecords = await dnsResolver.resolveMx(domain);
    return Array.isArray(mxRecords) && mxRecords.length > 0;
  } catch {
    return false;
  }
};

const validateAuthenticEmail = async (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { ok: false, message: "Please use a valid email address" };
  }

  const domain = getEmailDomain(normalizedEmail);
  if (!domain) {
    return { ok: false, message: "Please use a valid email address" };
  }

  const isExactBlocked =
    DISPOSABLE_EMAIL_DOMAINS.has(domain) || BLOCKED_EMAIL_DOMAINS_FROM_ENV.has(domain);
  const isSubdomainBlocked =
    Array.from(DISPOSABLE_EMAIL_DOMAINS).some((d) => domain.endsWith(`.${d}`)) ||
    Array.from(BLOCKED_EMAIL_DOMAINS_FROM_ENV).some((d) => domain.endsWith(`.${d}`));
  const isKeywordBlocked = DISPOSABLE_DOMAIN_KEYWORDS.some((k) => domain.includes(k));

  if (isExactBlocked || isSubdomainBlocked || isKeywordBlocked) {
    return { ok: false, message: "Temporary/disposable email addresses are not allowed" };
  }

  const hasMx = await hasValidMxRecords(domain);
  if (!hasMx) {
    return { ok: false, message: "Please use a real email provider address" };
  }

  return { ok: true, normalizedEmail };
};



const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const signOtpToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: OTP_EXPIRY,
  });

const signPasswordResetToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: PASSWORD_RESET_EXPIRY,
  });

// REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, country } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email and password are required" });
    }

    const emailValidation = await validateAuthenticEmail(email);
    if (!emailValidation.ok) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const normalizedEmail = emailValidation.normalizedEmail;
    const userExists = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpToken = signOtpToken({
      flow: "signup",
      username,
      email: normalizedEmail,
      password: hashedPassword,
      country: country || null,
      otp,
    });

    await sendOtpEmail({ to: normalizedEmail, otp, flow: "signup" });

    return res.status(200).json({
      message: "OTP sent to your email for signup verification",
      otpToken,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyRegisterOtp = async (req, res) => {
  try {
    const { otpToken, otp } = req.body;
    if (!otpToken || !otp) {
      return res.status(400).json({ message: "otpToken and otp are required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired OTP session" });
    }

    if (decoded.flow !== "signup") {
      return res.status(400).json({ message: "Invalid OTP flow" });
    }

    if (String(decoded.otp) !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const userExists = await prisma.user.findUnique({ where: { email: decoded.email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await prisma.user.create({
      data: {
        username: decoded.username,
        email: decoded.email,
        password: decoded.password,
        country: decoded.country || null,
      },
    });

    return res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      country: user.country,
      role: user.role,
      token: generateToken(user),
      message: "Signup verified successfully",
    });
  } catch (error) {
    console.error("Verify Signup OTP Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// LOGIN USER
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const emailValidation = await validateAuthenticEmail(email);
    if (!emailValidation.ok) {
      return res.status(400).json({ message: emailValidation.message });
    }

    const normalizedEmail = emailValidation.normalizedEmail;
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (user.role === "ADMIN") {
      return res.status(400).json({ message: "Use admin login endpoint" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const otp = generateOtp();
    const otpToken = signOtpToken({
      flow: "login",
      userId: user.id,
      email: user.email,
      role: user.role,
      otp,
    });

    await sendOtpEmail({ to: user.email, otp, flow: "login" });

    return res.json({
      message: "OTP sent to your email for login verification",
      otpToken,
    });
  } catch (error) {
    console.error("Login User Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { otpToken, otp } = req.body;
    if (!otpToken || !otp) {
      return res.status(400).json({ message: "otpToken and otp are required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(otpToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired OTP session" });
    }

    if (decoded.flow !== "login") {
      return res.status(400).json({ message: "Invalid OTP flow" });
    }

    if (String(decoded.otp) !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.role === "ADMIN") {
      return res.status(400).json({ message: "Invalid user for OTP login" });
    }

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user),
    });
  } catch (error) {
    console.error("Verify Login OTP Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// REQUEST PASSWORD RESET (sends email link)
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Avoid email enumeration: always return success response.
    if (!user) {
      return res.json({
        message: "If an account exists, a password reset link has been sent to the email.",
      });
    }

    const resetToken = signPasswordResetToken({
      flow: "password-reset",
      userId: user.id,
      email: user.email,
    });

    const frontendBase = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
    const resetUrl = `${frontendBase}/reset-password?token=${encodeURIComponent(resetToken)}`;

    await sendEmail({
      mailType: "auth",
      to: user.email,
      subject: "CrackMeNow Password Reset",
      text: `Use this link to reset your password: ${resetUrl}\nThis link expires in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5">
          <h2>Password Reset Request</h2>
          <p>Click below to reset your password:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>This link expires in 15 minutes.</p>
        </div>
      `,
    });

    return res.json({
      message: "If an account exists, a password reset link has been sent to the email.",
    });
  } catch (error) {
    console.error("Request Password Reset Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD USING TOKEN
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "token and newPassword are required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired reset token" });
    }

    if (decoded.flow !== "password-reset") {
      return res.status(400).json({ message: "Invalid reset token flow" });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.email !== decoded.email) {
      return res.status(400).json({ message: "Invalid reset token user" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// REGISTER ADMIN
export const registerAdmin = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists)
      return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: "ADMIN", // admin role
      },
    });

    res.status(201).json({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin),
    });
  } catch (error) {
    console.error("Register Admin Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN ADMIN
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.user.findUnique({ where: { email } });
    if (!admin || admin.role !== "ADMIN")
      return res.status(400).json({ message: "Invalid admin credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid admin credentials" });

    res.json({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin),
    });
  } catch (error) {
    console.error("Login Admin Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET ALL USERS (Admin Only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from token middleware
    const { username, email, country } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        email,
        country, // Now we save the country too
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Profile update failed:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET LEADERBOARD (Dynamic Lab Completion Count)
export const getLeaderboard = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        submissions: {
          where: { status: "CORRECT" }, // count only correct lab attempts
        },
      },
    });

    const leaderboard = users.map((user) => ({
      id: user.id,
      username: user.username,
      country: user.country,
      image: user.image,
      completedLabsCount: user.submissions.length, //dynamic count
    }));

    // Sort in descending order
    leaderboard.sort((a, b) => b.completedLabsCount - a.completedLabsCount);

    res.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


