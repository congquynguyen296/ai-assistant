import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  otpEmailTemplate,
  welcomeEmailTemplate,
  welcomeWithGoogleEmailTemplate,
} from "../templates/emails/authTemplate.js";

dotenv.config();

// Remove spaces from GMAIL_PASS if present
const gmailPass = process.env.GMAIL_PASS
  ? process.env.GMAIL_PASS.replace(/\s+/g, "")
  : "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: gmailPass,
  },
});

const FROM_EMAIL = `"Hyra AI" <${process.env.GMAIL_USER}>`;

export const sendOTP = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: "Xác thực tài khoản Hyra AI của bạn",
      html: otpEmailTemplate(otp),
    });

    console.log(`OTP sent to ${email}`, info.messageId);
    return true;
  } catch (error) {
    console.error("Nodemailer Error (sendOTP):", error);
    throw new Error("Gửi email thất bại");
  }
};

export const sendWelcomeEmail = async (email, username, defaultPassword) => {
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: `Chào mừng ${username} đến với Hyra AI!`,
      html: defaultPassword
        ? welcomeWithGoogleEmailTemplate(email, username, defaultPassword)
        : welcomeEmailTemplate(email, username),
    });

    console.log(`Welcome email sent to ${email}`, info.messageId);
    return true;
  } catch (error) {
    console.error("Nodemailer Error (sendWelcomeEmail):", error);
    throw new Error("Gửi email thất bại");
  }
};
