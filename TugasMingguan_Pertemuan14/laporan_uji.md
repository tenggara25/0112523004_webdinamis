# Laporan Singkat Hasil Uji Endpoint - Tugas Mingguan Pertemuan 14

Dokumen ini berisi laporan pengujian hak akses API (Endpoint Authorization) berdasarkan tiga role: **Admin**, **Operator**, dan **Viewer** pada Sistem Akademik.

## Akun Uji

Berikut adalah tiga akun uji yang telah dibuat dan digunakan untuk pengujian:
1. **Admin**: `admin@mail.com` (password: `password123`)
2. **Operator**: `operator@mail.com` (password: `password123`)
3. **Viewer**: `viewer@mail.com` (password: `password123`)

---

## Tabel Hasil Uji Endpoint

Pengujian dilakukan dengan mengirimkan request HTTP menggunakan token JWT yang sesuai untuk masing-masing akun.

| Role | Endpoint | HTTP Method | Status Code Diharapkan | Status Code Aktual | Status Uji | Keterangan |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Viewer** | `/api/mahasiswa` | GET | 200 | 200 | **LULUS** | Berhasil membaca data mahasiswa. |
| **Viewer** | `/api/mahasiswa` | POST | 403 | 403 | **LULUS** | Ditolak: *Anda tidak memiliki akses ke fitur ini*. |
| **Viewer** | `/api/mahasiswa/:id` | PUT | 403 | 403 | **LULUS** | Ditolak: *Anda tidak memiliki akses ke fitur ini*. |
| **Viewer** | `/api/mahasiswa/:id` | DELETE | 403 | 403 | **LULUS** | Ditolak: *Anda tidak memiliki akses ke fitur ini*. |
| | | | | | | |
| **Operator**| `/api/mahasiswa` | GET | 200 | 200 | **LULUS** | Berhasil membaca data mahasiswa. |
| **Operator**| `/api/mahasiswa` | POST | 201 | 201 | **LULUS** | Berhasil menambahkan mahasiswa baru. |
| **Operator**| `/api/mahasiswa/:id` | PUT | 200 | 200 | **LULUS** | Berhasil memperbarui data mahasiswa. |
| **Operator**| `/api/mahasiswa/:id` | DELETE | 403 | 403 | **LULUS** | Ditolak: *Anda tidak memiliki akses ke fitur ini*. |
| | | | | | | |
| **Admin** | `/api/mahasiswa` | GET | 200 | 200 | **LULUS** | Berhasil membaca data mahasiswa. |
| **Admin** | `/api/mahasiswa` | POST | 201 | 201 | **LULUS** | Berhasil menambahkan mahasiswa baru. |
| **Admin** | `/api/mahasiswa/:id` | PUT | 200 | 200 | **LULUS** | Berhasil memperbarui data mahasiswa. |
| **Admin** | `/api/mahasiswa/:id` | DELETE | 200 | 200 | **LULUS** | Berhasil menghapus data mahasiswa. |

---

## Ringkasan Hak Akses UI (Frontend)

Sesuai dengan role masing-masing pengguna, tombol aksi pada dashboard mahasiswa disembunyikan/ditampilkan sebagai berikut:

1. **Admin**:
   - Tombol **`+ Tambah Mahasiswa`** -> **Ditampilkan**
   - Tombol **Edit** (✏️) -> **Ditampilkan**
   - Tombol **Hapus** (🗑️) -> **Ditampilkan**

2. **Operator**:
   - Tombol **`+ Tambah Mahasiswa`** -> **Ditampilkan**
   - Tombol **Edit** (✏️) -> **Ditampilkan**
   - Tombol **Hapus** (🗑️) -> **Disembunyikan**

3. **Viewer**:
   - Tombol **`+ Tambah Mahasiswa`** -> **Disembunyikan**
   - Tombol **Edit** (✏️) -> **Disembunyikan**
   - Tombol **Hapus** (🗑️) -> **Disembunyikan** (Kolom aksi disembunyikan sepenuhnya)
