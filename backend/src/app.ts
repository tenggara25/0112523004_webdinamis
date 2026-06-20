import express from "express";
import cors from "cors";
import mahasiswaRoutes from "./routes/mahasiswa.route";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend Express berjalan" });
});

app.use("/api/mahasiswa", mahasiswaRoutes);

export default app;
