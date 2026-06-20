import { Router } from "express";

import {
  getAllMahasiswa,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
} from "../controllers/mahasiswa.controller";

const router = Router();

router.get("/", getAllMahasiswa);

router.post("/", createMahasiswa);

router.put("/:id", updateMahasiswa);

router.delete("/:id", deleteMahasiswa);

export default router;