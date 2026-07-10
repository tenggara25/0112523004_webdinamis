import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const isMockMail =
    !process.env.MAIL_USER ||
    process.env.MAIL_USER === "Ifalamsyah25@gmail.com" ||
    !process.env.MAIL_PASS;

export const mailer = isMockMail
  ? nodemailer.createTransport({
      streamTransport: true,
      newline: "windows",
      buffer: true,
    } as any)
  : nodemailer.createTransport({
      host: process.env.MAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.MAIL_PORT) || 465,
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

if (isMockMail) {
    console.log("⚠️ MAIL_USER atau MAIL_PASS belum dikonfigurasi secara valid.");
    console.log("⚠️ Sistem otomatis menggunakan Mock StreamTransport (email akan tercetak langsung di terminal backend).");
}


