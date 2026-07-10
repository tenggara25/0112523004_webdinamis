# Panduan Langkah-Langkah Pengerjaan Tugas Kelas - Pertemuan 15
### CRUD Daftar User & Fitur Reset Password (Admin & Email SMTP)

Panduan ini berisi instruksi lengkap beserta seluruh kode program yang siap disalin untuk menyelesaikan tugas kelas **Pertemuan 15** pada direktori `C:\Users\alams\Downloads\0112523004_webdinamis\TugasKelas_Pertemuan15`.

---

## 📋 DAFTAR LANGKAH

1. [Bagian 1: Instalasi & Konfigurasi Mailer (Backend)](#bagian-1-instalasi--konfigurasi-mailer-backend)
2. [Bagian 2: Migrasi Database (Tabel Reset Token)](#bagian-2-migrasi-database-tabel-reset-token)
3. [Bagian 3: Controller & Route CRUD User (Admin-Only)](#bagian-3-controller--route-crud-user-admin-only)
4. [Bagian 4: Fitur Reset Password via Email (Backend)](#bagian-4-fitur-reset-password-via-email-backend)
5. [Bagian 5: Integrasi Routing Backend Utama](#bagian-5-integrasi-routing-backend-utama)
6. [Bagian 6: Frontend - Halaman Manajemen User (Admin)](#bagian-6-frontend---halaman-manajemen-user-admin)
7. [Bagian 7: Frontend - Form Lupa Password & Reset Password](#bagian-7-frontend---form-lupa-password--reset-password)
8. [Bagian 8: Frontend - Update Navbar & Login Page Link](#bagian-8-frontend---update-navbar--login-page-link)
9. [Bagian 9: Pengujian Aplikasi](#bagian-9-pengujian-aplikasi)

---

## 🛠️ Bagian 1: Instalasi & Konfigurasi Mailer (Backend)

Buka terminal di folder backend (`TugasKelas_Pertemuan15\backend`) lalu ikuti langkah berikut:

### Langkah 1.1: Install Dependencies
Jalankan perintah berikut untuk menginstal `nodemailer` dan tipe data pendukungnya:
```bash
npm install nodemailer
npm install -D @types/nodemailer
```

### Langkah 1.2: Tambahkan Variabel Lingkungan di `.env`
Buka file `backend/.env` dan tambahkan baris konfigurasi SMTP berikut di bagian bawah:
```env
# Mail configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=nama.email@gmail.com
MAIL_PASS=app_password_16_karakter
APP_URL=http://localhost:3001
```
> [!NOTE]
> Jika Anda belum memiliki/mengkonfigurasi App Password Gmail, biarkan default atau kosong. Sistem mailer di bawah ini dirancang untuk otomatis mendeteksi hal tersebut dan mengaktifkan **Mock StreamTransport** (menampilkan isi email di konsol/terminal server tanpa crash).

### Langkah 1.3: Buat Konfigurasi Mailer
Buat file baru di `backend/src/config/mail.ts` dan masukkan kode berikut:
```typescript
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Menggunakan Mock Transport jika data login SMTP masih bernilai placeholder/kosong
const isMockMail =
  !process.env.MAIL_USER ||
  process.env.MAIL_USER === "nama.email@gmail.com" ||
  !process.env.MAIL_PASS;

export const mailer = nodemailer.createTransport(
  isMockMail
    ? {
        streamTransport: true,
        newline: "windows",
        buffer: true,
      }
    : {
        host: process.env.MAIL_HOST || "smtp.gmail.com",
        port: Number(process.env.MAIL_PORT) || 465,
        secure: process.env.MAIL_SECURE === "true",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      }
);

if (isMockMail) {
  console.log("⚠️ MAIL_USER atau MAIL_PASS belum dikonfigurasi secara valid.");
  console.log("⚠️ Sistem otomatis menggunakan Mock StreamTransport (email akan tercetak langsung di terminal backend).");
}
```

---

## 🗄️ Bagian 2: Migrasi Database (Tabel Reset Token)

Kita perlu membuat tabel `password_reset_tokens` di database. Agar proses migrasi berjalan otomatis tanpa perlu masuk ke MySQL secara manual, kita bisa memodifikasi berkas database seeder.

### Langkah 2: Edit `backend/src/seed.ts`
Buka file `backend/src/seed.ts` dan ganti isinya dengan kode berikut:
```typescript
import db from "./config/database";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Starting database seeding...");

  try {
    // 1. Create table users if it does not exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'operator', 'viewer') NOT NULL DEFAULT 'viewer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Users table verified.");

    // 2. Create table password_reset_tokens if it does not exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("Password reset tokens table verified.");

    // 3. Define users to seed
    const usersToSeed = [
      {
        name: "Admin Akun",
        email: "admin@mail.com",
        password: "password123",
        role: "admin",
      },
      {
        name: "Operator Akun",
        email: "operator@mail.com",
        password: "password123",
        role: "operator",
      },
      {
        name: "Viewer Akun",
        email: "viewer@mail.com",
        password: "password123",
        role: "viewer",
      },
    ];

    for (const u of usersToSeed) {
      const [existing]: any = await db.query(
        "SELECT id FROM users WHERE email = ?",
        [u.email]
      );

      if (existing.length === 0) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        await db.query(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          [u.name, u.email, hashedPassword, u.role]
        );
        console.log(`Seeded user: ${u.email} (${u.role})`);
      } else {
        console.log(`User already exists: ${u.email}`);
      }
    }

    console.log("Seeding & migration process completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await db.end();
  }
}

seed();
```
Untuk menjalankan proses migrasi database ini, jalankan perintah di bawah pada folder `backend`:
```bash
npx ts-node -O "{\"module\": \"commonjs\"}" src/seed.ts
```

---

## 🔒 Bagian 3: Controller & Route CRUD User (Admin-Only)

### Langkah 3.1: Buat User Controller
Buat file baru di `backend/src/controllers/user.controller.ts` dan masukkan kode berikut:
```typescript
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import db from "../config/database";

// 1. Get All Users (Tanpa mengembalikan password hash)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY id DESC`
    );

    res.json({
      message: "Data user berhasil diambil",
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// 2. Create User oleh Admin
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Nama, email, password, dan role wajib diisi",
      });
    }

    const allowedRoles = ["admin", "operator", "viewer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role tidak valid" });
    }

    // Cek duplikasi email
    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ message: "User berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// 3. Update User oleh Admin (Nama, Email, dan Role)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Nama, email, dan role wajib diisi" });
    }

    const allowedRoles = ["admin", "operator", "viewer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role tidak valid" });
    }

    // Cek duplikasi email pada user lain
    const [existing]: any = await db.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email sudah digunakan oleh user lain" });
    }

    const [result]: any = await db.query(
      "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
      [name, email, role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "User berhasil diperbarui" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// 4. Delete User oleh Admin
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [result]: any = await db.query(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Helper generator password sementara
function generateTemporaryPassword() {
  return Math.random().toString(36).slice(-10);
}

// 5. Reset Password oleh Admin
export const resetPasswordByAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const [result]: any = await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({
      message: "Password berhasil direset",
      temporaryPassword,
      note: "Tampilkan hanya sekali, lalu minta user mengganti password.",
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
```

### Langkah 3.2: Buat User Router
Buat file baru di `backend/src/routes/user.route.ts` dan masukkan kode berikut:
```typescript
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
```

---

## 📧 Bagian 4: Fitur Reset Password via Email (Backend)

Untuk melengkapi alur reset password mandiri melalui email oleh user:

### Langkah 4.1: Edit `backend/src/controllers/auth.controller.ts`
Buka file `backend/src/controllers/auth.controller.ts`, lalu:
1. Tambahkan impor di bagian atas:
```typescript
import crypto from "crypto";
import { mailer } from "../config/mail";
```
2. Tambahkan kedua controller ini di bagian paling bawah file:
```typescript
// 3. Request Reset Password via Email
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi" });
    }

    // Cek apakah user terdaftar
    const [users]: any = await db.query(
      "SELECT id, name, email FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      // Demi keamanan, hindari memberi tahu hacker apakah email terdaftar/tidak
      return res.json({
        message: "Jika email terdaftar di sistem kami, instruksi reset password telah dikirim.",
      });
    }

    const user = users[0];

    // Generate token reset password
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Kadaluwarsa token dalam waktu 30 menit
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Simpan token ke database
    await db.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
      [user.id, tokenHash, expiresAt]
    );

    const resetLink = `${process.env.APP_URL || "http://localhost:3001"}/reset-password?token=${rawToken}`;

    // Kirim email
    const mailInfo = await mailer.sendMail({
      from: `"Admin Akademik" <${process.env.MAIL_USER || "admin@akademik.com"}>`,
      to: user.email,
      subject: "Reset Password Akun",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Reset Password Akun Anda</h2>
          <p>Halo ${user.name},</p>
          <p>Kami menerima permintaan untuk mereset password akun Sistem Akademik Anda.</p>
          <p>Silakan klik tautan di bawah ini untuk mengatur ulang password Anda:</p>
          <p style="margin: 20px 0;">
            <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          </p>
          <p>Link ini berlaku selama <strong>30 menit</strong>.</p>
          <p>Jika Anda tidak meminta perubahan ini, Anda dapat mengabaikan email ini dengan aman.</p>
        </div>
      `,
    });

    // Jika menggunakan Mock StreamTransport, cetak hasil email ke konsol server
    if (mailInfo && "message" in mailInfo) {
      console.log("\n================ [MOCK MAIL SENT] ================");
      console.log(`To: ${user.email}`);
      console.log(`Link Reset Password: ${resetLink}`);
      console.log("==================================================\n");
    }

    res.json({
      message: "Instruksi reset password telah dikirim ke email Anda.",
    });
  } catch (error) {
    console.error("Mail error:", error);
    res.status(500).json({ message: "Gagal mengirim email reset password" });
  }
};

// 4. Update Password Menggunakan Token Email
export const resetPasswordWithToken = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token dan password baru wajib diisi" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password minimal 6 karakter" });
    }

    // Hash token dari request untuk dibandingkan dengan hash di database
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Cari token yang masih aktif & belum pernah digunakan
    const [tokens]: any = await db.query(
      `SELECT id, user_id FROM password_reset_tokens 
       WHERE token_hash = ? AND expires_at > NOW() AND used_at IS NULL`,
      [tokenHash]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ message: "Token tidak valid atau sudah expired" });
    }

    const resetToken = tokens[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password user
    await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, resetToken.user_id]
    );

    // Tandai token telah digunakan
    await db.query(
      "UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?",
      [resetToken.id]
    );

    res.json({ message: "Password berhasil diperbarui. Silakan login kembali." });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
```

### Langkah 4.2: Edit `backend/src/routes/auth.route.ts`
Buka file `backend/src/routes/auth.route.ts`, lalu:
1. Daftarkan controller baru tersebut pada import:
```typescript
import { register, login, requestPasswordReset, resetPasswordWithToken } from "../controllers/auth.controller";
```
2. Tambahkan kedua route ini di bagian paling bawah sebelum `export default`:
```typescript
router.post("/request-reset-password", requestPasswordReset);
router.post("/reset-password", resetPasswordWithToken);
```

---

## 🔗 Bagian 5: Integrasi Routing Backend Utama

### Langkah 5: Edit `backend/src/app.ts`
Buka file `backend/src/app.ts`, daftarkan route `/api/users` dengan mengubah kodenya menjadi seperti berikut:
```typescript
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";
import mahasiswaRoutes from "./routes/mahasiswa.route";
import prodiRoutes from "./routes/prodi.route";
import userRoutes from "./routes/user.route"; // 1. Impor router user baru

const app = express();

app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Route auth (register, login, logout, reset-password) - tidak perlu token JWT
app.use("/api/auth", authRoutes);

// Route yang dilindungi (perlu token JWT)
app.use("/api/mahasiswa", mahasiswaRoutes);
app.use("/api/prodi", prodiRoutes);
app.use("/api/users", userRoutes); // 2. Hubungkan route user baru

export default app;
```

---

## 💻 Bagian 6: Frontend - Halaman Manajemen User (Admin)

Sekarang kita berpindah ke bagian **Frontend** (`TugasKelas_Pertemuan15\frontend`).

### Langkah 6: Buat `frontend/src/app/users/page.tsx`
Buat file halaman baru di `frontend/src/app/users/page.tsx` dan isi dengan kode dashboard admin berikut:
```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getUser, getToken } from "@/lib/auth";
import Navbar from "@/components/Navbar";

type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "operator" | "viewer";
  created_at: string;
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // State Modal CRUD
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "viewer" });
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // State hasil reset password sementara
  const [tempPasswordInfo, setTempPasswordInfo] = useState<{ name: string; pass: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data user");
      }
      setUsers(result.data);
    } catch (err: any) {
      alert(err.message);
      router.replace("/mahasiswa"); // Tendang kembali jika bukan admin atau gagal auth
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    const user = getUser();
    if (user.role !== "admin") {
      alert("Akses ditolak: Hanya admin yang dapat mengelola user!");
      router.replace("/mahasiswa");
      return;
    }
    setCurrentUser(user);
    fetchUsers();
  }, [router, fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const isEdit = !!editId;
    const url = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/users/${editId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/users`;

    const method = isEdit ? "PUT" : "POST";
    
    // Jangan kirim password kosong saat edit (password tidak diubah lewat PUT /users/:id)
    const payload = isEdit 
      ? { name: formData.name, email: formData.email, role: formData.role }
      : formData;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setShowForm(false);
      setEditId(null);
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const handleEdit = (u: User) => {
    setEditId(u.id);
    setFormData({ name: u.name, email: u.email, password: "", role: u.role });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      setDeleteId(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (u: User) => {
    if (!confirm(`Apakah Anda yakin ingin mereset password untuk user "${u.name}"?`)) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${u.id}/reset-password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      // Tampilkan password baru yang digenerate oleh backend
      setTempPasswordInfo({ name: u.name, pass: result.temporaryPassword });
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Daftar User Sistem</h2>
            <p className="text-text-muted text-sm mt-1">Admin Panel - Mengelola Hak Akses & Password</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setFormData({ name: "", email: "", password: "", role: "viewer" });
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl cursor-pointer transition-all"
          >
            + Tambah User Baru
          </button>
        </div>

        {/* Notifikasi Hasil Reset Password Sementara */}
        {tempPasswordInfo && (
          <div className="bg-success/15 border border-success/30 rounded-2xl p-5 mb-6">
            <h4 className="text-success font-bold text-lg mb-2">Password Sementara Berhasil Dibuat!</h4>
            <p className="text-sm text-text-muted mb-3">
              Salin password sementara di bawah ini untuk pengguna <strong>{tempPasswordInfo.name}</strong>. 
              Pemberitahuan ini hanya akan tampil sekali.
            </p>
            <div className="flex items-center gap-3 bg-card px-4 py-3 rounded-xl border border-border w-max font-mono text-lg text-accent">
              {tempPasswordInfo.pass}
            </div>
            <button
              onClick={() => setTempPasswordInfo(null)}
              className="mt-4 px-4 py-2 bg-success text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Saya Mengerti & Sudah Menyalin
            </button>
          </div>
        )}

        {/* Tabel User */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-text-muted">Loading data...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-20 text-text-muted">Tidak ada data user.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-card-hover/50 text-left">
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">No</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">Nama</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase">Tanggal Terdaftar</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-muted uppercase text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-card-hover/30 transition-all">
                      <td className="px-6 py-4 text-sm text-text-muted">{i + 1}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">{u.name} {currentUser?.id === u.id && <span className="text-xs bg-accent/20 text-accent font-normal px-2 py-0.5 rounded-full ml-1.5">Anda</span>}</td>
                      <td className="px-6 py-4 text-sm text-text-muted">{u.email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          u.role === "admin" ? "bg-danger/15 text-danger" :
                          u.role === "operator" ? "bg-primary/15 text-primary" :
                          "bg-accent/15 text-accent"
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-muted">
                        {new Date(u.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-lg cursor-pointer transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleResetPassword(u)}
                          className="px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-xs font-medium rounded-lg cursor-pointer transition-all"
                          title="Reset Password Pengguna"
                        >
                          Reset Pass
                        </button>
                        {currentUser?.id !== u.id && (
                          <button
                            onClick={() => setDeleteId(u.id)}
                            className="px-3 py-1.5 bg-danger/10 hover:bg-danger/20 text-danger text-xs font-medium rounded-lg cursor-pointer transition-all"
                          >
                            Hapus
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Tambah / Edit */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-foreground mb-5">
              {editId ? "Ubah Data" : "Tambah"} User Baru
            </h3>
            {formError && (
              <div className="bg-danger/10 border border-danger/20 text-danger rounded-xl px-4 py-3 text-sm mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="email@example.com"
                />
              </div>

              {!editId && (
                <div>
                  <label className="block text-sm text-text-muted mb-1.5">Password Awal</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-text-muted mb-1.5">Role Akses</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-xl text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="viewer">Viewer (Hanya Melihat)</option>
                  <option value="operator">Operator (Ubah/Tambah Mahasiswa)</option>
                  <option value="admin">Admin (Akses Penuh)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl cursor-pointer font-semibold transition-all"
                >
                  {editId ? "Simpan Perubahan" : "Simpan User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditId(null);
                  }}
                  className="flex-1 py-2.5 bg-card-hover hover:bg-slate-700 text-foreground rounded-xl cursor-pointer transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-2">Hapus User?</h3>
            <p className="text-sm text-text-muted mb-6">
              Pengguna yang dihapus tidak akan dapat masuk kembali ke sistem.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-danger hover:bg-rose-600 text-white rounded-xl cursor-pointer font-semibold transition-all"
              >
                Ya, Hapus
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 bg-card-hover hover:bg-slate-700 text-foreground rounded-xl cursor-pointer transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 📧 Bagian 7: Frontend - Halaman Lupa Password & Reset Password

Sekarang kita buat halaman untuk alur penanganan reset password mandiri via email.

### Langkah 7.1: Buat Halaman Lupa Password (`frontend/src/app/forgot-password/page.tsx`)
Buat file baru di `frontend/src/app/forgot-password/page.tsx` and isi dengan kode berikut:
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/request-reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal memproses permintaan");
      }

      setMessage(result.message);
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Tidak dapat terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Background Ornamen */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Lupa Password?</h1>
          <p className="text-text-muted mt-2">
            Kami akan mengirimkan link untuk mengatur ulang password Anda
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleRequestReset} className="space-y-5">
            {error && (
              <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3 text-sm">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-muted mb-2">
                Alamat Email Terdaftar
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-foreground placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg transition-all"
            >
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-primary hover:text-primary-hover font-medium text-sm">
              ← Kembali ke halaman Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Langkah 7.2: Buat Halaman Reset Password Baru (`frontend/src/app/reset-password/page.tsx`)
Buat file baru di `frontend/src/app/reset-password/page.tsx` and isi dengan kode berikut:
```tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token tidak ditemukan di link URL. Link tidak valid!");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token) {
      setError("Token tidak valid.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengatur ulang password");
      }

      setMessage(result.message);
      setNewPassword("");
      setConfirmPassword("");

      // Alihkan ke login setelah 3 detik
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-success/10 border border-success/30 text-success rounded-xl px-4 py-3 text-sm">
            {message}
          </div>
        )}

        <div>
          <label htmlFor="pass" className="block text-sm font-medium text-text-muted mb-2">
            Password Baru
          </label>
          <input
            id="pass"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Masukkan password baru"
            required
            disabled={!token || loading}
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-foreground placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label htmlFor="confirmPass" className="block text-sm font-medium text-text-muted mb-2">
            Konfirmasi Password Baru
          </label>
          <input
            id="confirmPass"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password baru"
            required
            disabled={!token || loading}
            className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-foreground placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <button
          type="submit"
          disabled={!token || loading}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg transition-all"
        >
          {loading ? "Memproses..." : "Perbarui Password"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-primary hover:text-primary-hover font-medium text-sm">
          Kembali ke halaman Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-4">
            <span className="text-3xl">🔓</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
          <p className="text-text-muted mt-2">Buat password baru untuk akun Anda</p>
        </div>

        <Suspense fallback={<div className="bg-card border border-border rounded-2xl p-8 text-center text-text-muted">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
```

---

## 💅 Bagian 8: Frontend - Update Navbar & Login Page Link

### Langkah 8.1: Modifikasi Navbar (`frontend/src/components/Navbar.tsx`)
Kita akan menambahkan navigasi link bagi admin agar bisa beralih dari halaman Mahasiswa ke halaman User.
Buka file `frontend/src/components/Navbar.tsx` dan gantikan isinya dengan kode berikut:
```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getUser, getToken, logout, isLoggedIn } from "@/lib/auth";
import Link from "next/link";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }
    setUser(getUser());
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });
    } catch {
      /* silent */
    }
    logout();
  };

  if (!user) return null;

  return (
    <nav className="bg-card border-b border-border px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-lg font-bold text-foreground">Sistem Akademik</h1>
            <p className="text-xs text-text-muted">Tugas Kelas Pertemuan 15 - CRUD User & Reset Pass</p>
          </div>

          {/* Navigasi Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/mahasiswa"
              className={`text-sm font-medium px-3 py-2 rounded-xl transition-all ${
                pathname === "/mahasiswa"
                  ? "bg-primary/20 text-primary-hover font-semibold"
                  : "text-text-muted hover:bg-card-hover hover:text-foreground"
              }`}
            >
              Data Mahasiswa
            </Link>

            {user.role === "admin" && (
              <Link
                href="/users"
                className={`text-sm font-medium px-3 py-2 rounded-xl transition-all ${
                  pathname === "/users"
                    ? "bg-primary/20 text-primary-hover font-semibold"
                    : "text-text-muted hover:bg-card-hover hover:text-foreground"
              }`}
              >
                Kelola User (Admin)
              </Link>
            )}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-card-hover cursor-pointer transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-primary font-bold text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground hidden sm:block">
              {user.name}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                user.role === "admin"
                  ? "bg-danger/20 text-danger"
                  : user.role === "operator"
                  ? "bg-primary/20 text-primary"
                  : "bg-accent/20 text-accent"
              }`}
            >
              {user.role}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-border bg-slate-850">
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-text-muted truncate">{user.email}</p>
              </div>

              {/* Tautan Tambahan Mobile di dropdown */}
              <div className="block md:hidden border-b border-border">
                <Link
                  href="/mahasiswa"
                  onClick={() => setShowDropdown(false)}
                  className="block px-4 py-2.5 text-sm text-foreground hover:bg-card-hover"
                >
                  Data Mahasiswa
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/users"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-2.5 text-sm text-foreground hover:bg-card-hover font-medium text-indigo-400"
                  >
                    Kelola User
                  </Link>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-danger hover:bg-danger/10 cursor-pointer font-medium transition-all"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
```

### Langkah 8.2: Tambahkan Link Lupa Password di Login Page (`frontend/src/app/login/page.tsx`)
Buka file `frontend/src/app/login/page.tsx` dan ubah input password & tombol submit untuk menyisipkan link **"Lupa password?"** di atas tombol login.

Gantikan baris **81-91** di `login/page.tsx`:
```tsx
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-medium text-text-muted">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary-hover font-semibold">Lupa password?</Link>
              </div>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan password" required
                className="w-full px-4 py-3 bg-input-bg border border-input-border rounded-xl text-foreground placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-primary/25 transition-all">
              {loading ? "Memproses..." : "Login"}
            </button>
```

---

## 🧪 Bagian 9: Pengujian Aplikasi

### Langkah 9.1: Jalankan Server Backend
Masuk ke folder `backend` di terminal Anda, lalu jalankan:
```bash
npm run dev
```

### Langkah 9.2: Jalankan Server Frontend
Masuk ke folder `frontend` di terminal Anda, lalu jalankan:
```bash
npm run dev
```

### Skenario Pengujian 1: CRUD User & Reset Password (Oleh Admin)
1. Buka browser ke `http://localhost:3001/login`.
2. Login sebagai admin:
   - **Email**: `admin@mail.com`
   - **Password**: `password123`
3. Setelah login, Anda akan dialihkan ke `/mahasiswa`. Pada bagian kanan atas Navbar, klik link **Kelola User (Admin)**.
4. Anda akan berada di halaman `/users`. Coba lakukan:
   - Tambah user baru (misalnya `testuser@mail.com`).
   - Ubah data user (nama, role).
   - Klik tombol **Reset Pass** pada baris user baru. Sebuah kotak dialog berhasil direset akan muncul dan memperlihatkan **Password Sementara** (misal: `p3x8shd82j`).
   - Logout lalu login menggunakan `testuser@mail.com` dengan password sementara tersebut untuk membuktikan fungsionalitasnya.

### Skenario Pengujian 2: Proteksi Role (Admin-Only)
1. Logout dari admin, lalu masuk menggunakan operator (`operator@mail.com` / `password123`) atau viewer (`viewer@mail.com` / `password123`).
2. Cobalah mengetik langsung di bilah URL browser: `http://localhost:3001/users`.
3. Anda akan ditendang kembali ke `/mahasiswa` dengan pesan peringatan bahwa Anda tidak berhak masuk ke fitur admin tersebut.

### Skenario Pengujian 3: Reset Password via Email (Mandiri)
1. Pada halaman login (`http://localhost:3001/login`), klik link **Lupa password?**.
2. Masukkan alamat email terdaftar, contoh: `admin@mail.com`, lalu kirim.
3. Karena kita menggunakan *Mock Transport* (selama kredensial SMTP belum diubah di `.env`), buka terminal tempat server **backend** Anda berjalan.
4. Anda akan melihat print log email di terminal seperti ini:
   ```text
   ================ [MOCK MAIL SENT] ================
   To: admin@mail.com
   Link Reset Password: http://localhost:3001/reset-password?token=a8b3d88f8d9b1c7c88b90a99c92bdfa9a3b2c129eef110aa00bbccddeeff1122
   ==================================================
   ```
5. Salin link tersebut dan buka di browser Anda.
6. Masukkan password baru (contoh: `adminbaru123`) dan konfirmasikan.
7. Setelah password berhasil diperbarui, login kembali ke sistem menggunakan password baru tersebut.
