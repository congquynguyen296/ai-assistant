import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  otpEmailTemplate,
  welcomeEmailTemplate,
  welcomeWithGoogleEmailTemplate,
} from "../templates/emails/authTemplate.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"Hyra AI" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Xác thực tài khoản Hyra AI của bạn",
    html: otpEmailTemplate(otp),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Gửi email thất bại");
  }
};

export const sendWelcomeEmail = async (email, username, defaultPassword) => {
  const mailOptions = {
    from: `"Hyra AI" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `Chào mừng ${username} đến với Hyra AI!`,
    html: defaultPassword
      ? welcomeWithGoogleEmailTemplate(email, username, defaultPassword)
      : welcomeEmailTemplate(email, username),
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Gửi email thất bại");
  }
};
