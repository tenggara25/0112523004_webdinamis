import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../config/database";
import crypto from "crypto";
import { mailer } from "../config/mail";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Nama, email, dan password wajib diisi",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password minimal 6 karakter",
      });
    }

    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Email sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role && ["admin", "operator", "viewer"].includes(role) ? role : "viewer";

    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, userRole]
    );

    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi",
      });
    }

    const [rows]: any = await db.query(
      "SELECT id, name, email, password, role FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "2h";
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: expiresIn as any }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// 3. Request Reset Password via Email
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi" });
    }

    // Cek apakah user terdaftar
    const [users]: any = await db.query(
      "SELECT id, name, email FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      // Demi keamanan, hindari memberi tahu hacker apakah email terdaftar/tidak
      return res.json({
        message: "Jika email terdaftar di sistem kami, instruksi reset password telah dikirim.",
      });
    }

    const user = users[0];

    // Generate token reset password
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Kadaluwarsa token dalam waktu 30 menit
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Simpan token ke database
    await db.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [user.id, tokenHash, expiresAt]
    );

    const resetLink = `${process.env.APP_URL || "http://localhost:3001"}/reset-password?token=${rawToken}`;

    // Kirim email
    const mailInfo = await mailer.sendMail({
      from: `"Admin Akademik" <${process.env.MAIL_USER || "admin@akademik.com"}>`,
      to: user.email,
      subject: "Reset Password Akun",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Reset Password Akun Anda</h2>
          <p>Halo ${user.name},</p>
          <p>Kami menerima permintaan untuk mereset password akun Sistem Akademik Anda.</p>
          <p>Silakan klik tautan di bawah ini untuk mengatur ulang password Anda:</p>
          <p style="margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          </p>
          <p>Link ini berlaku selama <strong>30 menit</strong>.</p>
          <p>Jika Anda tidak meminta perubahan ini, Anda dapat mengabaikan email ini dengan aman.</p>
        </div>
      `,
    });

    // Jika menggunakan Mock StreamTransport, cetak hasil email ke konsol server
    if (mailInfo && "message" in mailInfo) {
      console.log("\n================ [MOCK MAIL SENT] ================");
      console.log(`To: ${user.email}`);
      console.log(`Link Reset Password: ${resetLink}`);
      console.log("==================================================\n");
    }

    res.json({
      message: "Instruksi reset password telah dikirim ke email Anda.",
    });
  } catch (error) {
    console.error("Mail error:", error);
    res.status(500).json({ message: "Gagal mengirim email reset password" });
  }
};

// 4. Update Password Menggunakan Token Email
export const resetPasswordWithToken = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token dan password baru wajib diisi" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter" });
    }

    // Hash token dari request untuk dibandingkan dengan hash di database
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Cari token yang masih aktif & belum pernah digunakan
    const [tokens]: any = await db.query(
      `SELECT id, user_id FROM password_reset_tokens 
       WHERE token_hash = ? AND expires_at > NOW() AND used_at IS NULL`,
      [tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: "Token tidak valid atau sudah expired" });
    }

    const resetToken = tokens[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password user
    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, resetToken.user_id]
    );

    // Tandai token telah digunakan
    await db.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?",
      [resetToken.id]
    );

    res.json({ message: "Password berhasil diperbarui. Silakan login kembali." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
