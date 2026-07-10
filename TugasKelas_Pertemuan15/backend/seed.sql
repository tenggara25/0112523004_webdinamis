CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator', 'viewer') NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Admin Akun', 'admin@mail.com', '$2b$10$5yvPEQAZ0B4NAyThIUhSJ.P0nhd9zdPlLqxMqkom4l8kEOkti/PRW', 'admin'),
('Operator Akun', 'operator@mail.com', '$2b$10$5yvPEQAZ0B4NAyThIUhSJ.P0nhd9zdPlLqxMqkom4l8kEOkti/PRW', 'operator'),
('Viewer Akun', 'viewer@mail.com', '$2b$10$5yvPEQAZ0B4NAyThIUhSJ.P0nhd9zdPlLqxMqkom4l8kEOkti/PRW', 'viewer');
