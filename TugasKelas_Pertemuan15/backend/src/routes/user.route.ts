import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPasswordByAdmin,
} from "../controllers/user.controller";

const router = Router();

// Proteksi global untuk endpoint user: Harus login dan role-nya wajib ADMIN
router.use(authMiddleware as any);
router.use(allowRoles("admin") as any);

router.get("/", getAllUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.patch("/:id/reset-password", resetPasswordByAdmin);

export default router;
