import { Resend } from "resend";
import dotenv from "dotenv";
import {
  otpEmailTemplate,
  welcomeEmailTemplate,
  welcomeWithGoogleEmailTemplate,
} from "../templates/emails/authTemplate.js";

dotenv.config();

// Khởi tạo Resend với API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// "onboarding@resend.dev"
const FROM_EMAIL = "Hyra AI <onboarding@resend.dev>";

export const sendOTP = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Xác thực tài khoản Hyra AI của bạn",
      html: otpEmailTemplate(otp),
    });

    if (error) {
      console.error("Resend Error:", error);
      throw new Error("Gửi email thất bại");
    }

    console.log(`OTP sent to ${email}`, data.id);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Gửi email thất bại");
  }
};

export const sendWelcomeEmail = async (email, username, defaultPassword) => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Chào mừng ${username} đến với Hyra AI!`,
      html: defaultPassword
        ? welcomeWithGoogleEmailTemplate(email, username, defaultPassword)
        : welcomeEmailTemplate(email, username),
    });

    if (error) {
      console.error("Resend Error:", error);
      throw new Error("Gửi email thất bại");
    }

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Gửi email thất bại");
  }
};
