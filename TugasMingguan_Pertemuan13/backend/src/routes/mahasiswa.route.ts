import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  getAllMahasiswa,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
} from "../controllers/mahasiswa.controller";

const router = Router();

// Semua route mahasiswa dilindungi oleh authMiddleware
router.get("/", authMiddleware, getAllMahasiswa);
router.post("/", authMiddleware, createMahasiswa);
router.put("/:id", authMiddleware, updateMahasiswa);
router.delete("/:id", authMiddleware, deleteMahasiswa);

export default router;
