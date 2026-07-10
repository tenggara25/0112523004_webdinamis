import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import mahasiswaRoutes from "./routes/mahasiswa.route";
import prodiRoutes from "./routes/prodi.route";
import userRoutes from "./routes/user.route";

const app = express();

app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Route auth (register, login, logout) - tidak perlu token
app.use("/api/auth", authRoutes);

// Route yang dilindungi (perlu token)
app.use("/api/mahasiswa", mahasiswaRoutes);
app.use("/api/prodi", prodiRoutes);
app.use("/api/users", userRoutes);

export default app;
