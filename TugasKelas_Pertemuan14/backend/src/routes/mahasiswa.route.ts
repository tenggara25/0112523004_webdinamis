import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import {
  getAllMahasiswa,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
} from "../controllers/mahasiswa.controller";

const router = Router();

// Semua route mahasiswa dilindungi oleh authMiddleware dan role authorization
router.get(
  "/",
  authMiddleware,
  allowRoles("admin", "operator", "viewer"),
  getAllMahasiswa
);

router.post(
  "/",
  authMiddleware,
  allowRoles("admin", "operator"),
  createMahasiswa
);

router.put(
  "/:id",
  authMiddleware,
  allowRoles("admin", "operator"),
  updateMahasiswa
);

router.delete(
  "/:id",
  authMiddleware,
  allowRoles("admin"),
  deleteMahasiswa
);

export default router;
