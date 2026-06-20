import { Request, Response } from "express";
import pool from "../config/db";

export const getAllMahasiswa = async (
  req: Request,
  res: Response
) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM mahasiswa ORDER BY id DESC"
    );

    res.status(200).json({
      message: "Data mahasiswa berhasil diambil",
      data: rows,
    });
  } catch (error) {
    console.error("Error Database:");
    console.error(error);
    res.status(500).json({
      message: "Gagal mengambil data",
      error,
    });
  }
};

export const createMahasiswa = async (
  req: Request,
  res: Response
) => {
  try {
    const { nim, nama, prodi, angkatan } = req.body;

    const [result]: any = await pool.query(
      `
      INSERT INTO mahasiswa
      (nim,nama,prodi,angkatan)
      VALUES (?,?,?,?)
      `,
      [nim, nama, prodi, angkatan]
    );

    res.status(201).json({
      message: "Data mahasiswa berhasil ditambahkan",
      data: {
        id: result.insertId,
        nim,
        nama,
        prodi,
        angkatan,
      },
    });
  } catch (error) {
    console.error("Error Database:");
    console.error(error);

    res.status(500).json({
      message: "Gagal menambah data",
      error,
    });
  }
};

export const updateMahasiswa = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { nim, nama, prodi, angkatan } = req.body;

    await pool.query(
      `
      UPDATE mahasiswa
      SET nim=?, nama=?, prodi=?, angkatan=?
      WHERE id=?
      `,
      [nim, nama, prodi, angkatan, id]
    );

    res.status(200).json({
      message: "Data mahasiswa berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error Database:");
    console.error(error);
    res.status(500).json({
      message: "Gagal update data",
    });
  }
};

export const deleteMahasiswa = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM mahasiswa WHERE id=?",
      [id]
    );

    res.status(200).json({
      message: "Data mahasiswa berhasil dihapus",
    });
  } catch (error) {
    console.error("Error Database:");
    console.error(error);
    res.status(500).json({
      message: "Gagal menghapus data",
    });
  }
};