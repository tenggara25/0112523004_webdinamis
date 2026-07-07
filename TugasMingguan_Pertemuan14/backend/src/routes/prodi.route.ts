import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getAllProdi } from "../controllers/prodi.controller";

const router = Router();

router.get("/", authMiddleware, getAllProdi);

export default router;
