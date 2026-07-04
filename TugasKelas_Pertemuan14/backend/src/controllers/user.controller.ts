import { Request, Response } from "express";
import db from "../config/database";
import bcrypt from "bcrypt";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at, updated_at FROM users ORDER BY id DESC"
    );
    res.json({
      message: "Data user berhasil diambil",
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Nama, email, password, dan role wajib diisi",
      });
    }

    if (!["admin", "operator", "viewer"].includes(role)) {
      return res.status(400).json({
        message: "Role harus admin, operator, atau viewer",
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

    const [result]: any = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    res.status(201).json({
      message: "User berhasil ditambahkan",
      data: {
        id: result.insertId,
        name,
        email,
        role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password baru wajib diisi",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password minimal 6 karakter",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result]: any = await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "Password berhasil di-reset" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
