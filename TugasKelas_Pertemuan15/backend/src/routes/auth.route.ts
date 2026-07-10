import { Router } from "express";
import { register, login, requestPasswordReset, resetPasswordWithToken } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", (req, res) => {
  res.json({ message: "Logout berhasil. Hapus token di frontend." });
});
router.post("/request-reset-password", requestPasswordReset);
router.post("/reset-password", resetPasswordWithToken);

export default router;
