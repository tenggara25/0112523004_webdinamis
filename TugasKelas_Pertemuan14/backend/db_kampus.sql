-- Tabel users untuk authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator', 'viewer') NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel prodi
CREATE TABLE IF NOT EXISTS prodi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_prodi VARCHAR(100) NOT NULL
);

-- Tabel mahasiswa
CREATE TABLE IF NOT EXISTS mahasiswa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nim VARCHAR(20) NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  prodi_id INT NOT NULL,
  angkatan INT NOT NULL,
  foto VARCHAR(255) DEFAULT NULL,
  FOREIGN KEY (prodi_id) REFERENCES prodi(id)
);

-- Data awal prodi
INSERT IGNORE INTO prodi (id, nama_prodi) VALUES
(1, 'Teknik Informatika'),
(2, 'Sistem Informasi'),
(3, 'Teknik Elektro');
