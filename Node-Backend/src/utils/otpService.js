import nodemailer from "nodemailer";

const createMailProfile = (prefix) => {
  const host = process.env[`${prefix}_SMTP_HOST`] || process.env.SMTP_HOST;
  const port = Number(process.env[`${prefix}_SMTP_PORT`] || process.env.SMTP_PORT || 0);
  const secure = String(
    process.env[`${prefix}_SMTP_SECURE`] ?? process.env.SMTP_SECURE ?? "false"
  ).toLowerCase() === "true";
  const rejectUnauthorized = String(
    process.env[`${prefix}_SMTP_TLS_REJECT_UNAUTHORIZED`] ??
      process.env.SMTP_TLS_REJECT_UNAUTHORIZED ??
      "true"
  ).toLowerCase() !== "false";
  const user = process.env[`${prefix}_SMTP_USER`] || process.env.SMTP_USER;
  const pass = process.env[`${prefix}_SMTP_PASS`] || process.env.SMTP_PASS;
  const from = process.env[`${prefix}_FROM_EMAIL`] || process.env.SMTP_FROM_EMAIL;

  const hasConfig = Boolean(host) && Boolean(port) && Boolean(user) && Boolean(pass) && Boolean(from);

  const transporter = hasConfig
    ? nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: {
          rejectUnauthorized,
        },
      })
    : null;

  return { hasConfig, transporter, from };
};

const mailProfiles = {
  auth: createMailProfile("AUTH"),
  contact: createMailProfile("CONTACT"),
};

Object.entries(mailProfiles).forEach(([name, profile]) => {
  if (profile.hasConfig) {
    const user =
      process.env[`${name.toUpperCase()}_SMTP_USER`] || process.env.SMTP_USER || "";
    const host =
      process.env[`${name.toUpperCase()}_SMTP_HOST`] || process.env.SMTP_HOST || "";
    console.info(`[mail:${name}] configured host=${host} user=${user} from=${profile.from}`);
  } else {
    console.warn(`[mail:${name}] not configured`);
  }
});

const getProfile = (mailType = "auth") => mailProfiles[mailType] || mailProfiles.auth;

export const isMailConfigured = (mailType = "auth") => Boolean(getProfile(mailType).transporter);

export const sendEmail = async ({ to, subject, text, html, mailType = "auth", from }) => {
  const profile = getProfile(mailType);

  if (!profile.transporter) {
    console.warn(`SMTP (${mailType}) not configured. Could not send email to ${to}`);
    return { delivered: false };
  }

  await profile.transporter.sendMail({
    from: from || profile.from,
    to,
    subject,
    text,
    html,
  });

  return { delivered: true };
};

export const sendOtpEmail = async ({ to, otp, flow }) => {
  if (!isMailConfigured("auth")) {
    console.warn(`SMTP (auth) not configured. OTP for ${to} (${flow}): ${otp}`);
    return { delivered: false };
  }

  await sendEmail({
    mailType: "auth",
    to,
    subject: "Your CrackMeNow OTP Code",
    text: `Your OTP for ${flow} is ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5">
        <h2>CrackMeNow OTP Verification</h2>
        <p>Your OTP for <strong>${flow}</strong> is:</p>
        <p style="font-size: 24px; letter-spacing: 4px; font-weight: bold">${otp}</p>
        <p>This code is valid for 10 minutes.</p>
      </div>
    `,
  });

  return { delivered: true };
};
