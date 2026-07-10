import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import db from "../config/database";

// Helper: Validasi format email sederhana
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Helper: Generator password sementara yang lebih aman (12 karakter alfanumerik)
function generateTemporaryPassword(): string {
  return crypto.randomBytes(6).toString("base64url"); // menghasilkan 8 karakter URL-safe
}

// 1. Get All Users (Tanpa mengembalikan password hash)
//    Mendukung search query & pagination
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || "";
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params: any[] = [];

    if (search.trim()) {
      whereClause = "WHERE name LIKE ? OR email LIKE ? OR role LIKE ?";
      const likeSearch = `%${search.trim()}%`;
      params.push(likeSearch, likeSearch, likeSearch);
    }

    // Hitung total data
    const [countResult]: any = await db.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    // Ambil data user tanpa field password
    const [rows] = await db.query(
      `SELECT id, name, email, role, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      message: "Data user berhasil diambil",
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// 2. Create User oleh Admin
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Validasi ketat
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Nama, email, password, dan role wajib diisi",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Nama harus minimal 2 karakter" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password harus minimal 6 karakter" });
    }

    const allowedRoles = ["admin", "operator", "viewer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role tidak valid. Gunakan: admin, operator, atau viewer" });
    }

    // Cek duplikasi email
    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email sudah terdaftar di sistem" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result]: any = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), hashedPassword, role]
    );

    res.status(201).json({
      message: "User berhasil ditambahkan",
      data: {
        id: result.insertId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
      },
    });
  } catch (error) {
    console.error("createUser error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// 3. Update User oleh Admin (Nama, Email, dan Role)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Nama, email, dan role wajib diisi" });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ message: "Nama harus minimal 2 karakter" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    const allowedRoles = ["admin", "operator", "viewer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role tidak valid" });
    }

    // Cek user ada
    const [userCheck]: any = await db.query("SELECT id FROM users WHERE id = ?", [id]);
    if (userCheck.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Cek duplikasi email pada user lain
    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email.trim().toLowerCase(), id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email sudah digunakan oleh user lain" });
    }

    await db.query(
      "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
      [name.trim(), email.trim().toLowerCase(), role, id]
    );

    res.json({
      message: "User berhasil diperbarui",
      data: { id: Number(id), name: name.trim(), email: email.trim().toLowerCase(), role },
    });
  } catch (error) {
    console.error("updateUser error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// 4. Delete User oleh Admin
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = (req as any).user?.id;

    // Cegah admin menghapus diri sendiri
    if (Number(id) === currentUserId) {
      return res.status(403).json({ message: "Tidak dapat menghapus akun Anda sendiri" });
    }

    const [result]: any = await db.query(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Bersihkan token reset password milik user yang dihapus
    await db.query("DELETE FROM password_reset_tokens WHERE user_id = ?", [id]);

    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("deleteUser error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// 5. Reset Password oleh Admin
export const resetPasswordByAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Cek user ada
    const [userCheck]: any = await db.query(
      "SELECT id, name FROM users WHERE id = ?",
      [id]
    );
    if (userCheck.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id]
    );

    res.json({
      message: `Password user "${userCheck[0].name}" berhasil direset`,
      temporaryPassword,
      note: "Salin password ini sekarang. Password sementara hanya ditampilkan sekali.",
    });
  } catch (error) {
    console.error("resetPasswordByAdmin error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
