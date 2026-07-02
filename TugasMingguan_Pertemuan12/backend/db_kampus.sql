-- ==============================================
-- SQL Setup untuk Tugas Pertemuan 12
-- Jalankan script ini di MySQL / phpMyAdmin
-- ==============================================

CREATE DATABASE IF NOT EXISTS db_kampus;
USE db_kampus;

-- Tabel Prodi
CREATE TABLE IF NOT EXISTS prodi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_prodi VARCHAR(100) NOT NULL
);

-- Tabel Mahasiswa (menggunakan prodi_id, bukan nama prodi langsung)
CREATE TABLE IF NOT EXISTS mahasiswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nim VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(100) NOT NULL,
    prodi_id INT NOT NULL,
    angkatan INT NOT NULL,
    foto VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (prodi_id) REFERENCES prodi(id)
);

-- Data contoh Prodi
INSERT INTO prodi (nama_prodi) VALUES 
('Teknik Informatika'), 
('Sistem Informasi'), 
('Manajemen Informatika');

-- Data contoh Mahasiswa
INSERT INTO mahasiswa (nim, nama, prodi_id, angkatan) VALUES
('2023001', 'Ahmad Fauzi', 1, 2023),
('2023002', 'Siti Nurhaliza', 2, 2023),
('2023003', 'Budi Santoso', 3, 2023),
('2024001', 'Dewi Lestari', 1, 2024),
('2024002', 'Rizky Pratama', 2, 2024);
