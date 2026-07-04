import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import {
  getAllUsers,
  createUser,
  resetPassword,
} from "../controllers/user.controller";

const router = Router();

// Semua route ini khusus admin
router.get("/", authMiddleware, allowRoles("admin"), getAllUsers);
router.post("/", authMiddleware, allowRoles("admin"), createUser);
router.patch("/:id/reset-password", authMiddleware, allowRoles("admin"), resetPassword);

export default router;
