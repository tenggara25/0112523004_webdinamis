import { Router } from "express";
import { uploadFotoMahasiswa } from "../middlewares/upload.middleware";

import {
  getAllMahasiswa,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
} from "../controllers/mahasiswa.controller";
 
const router = Router();
 
router.get("/", getAllMahasiswa);
router.post("/", uploadFotoMahasiswa.single("foto"), createMahasiswa);
router.put("/:id", uploadFotoMahasiswa.single("foto"), updateMahasiswa);
router.delete("/:id", deleteMahasiswa);
 
export default router;
