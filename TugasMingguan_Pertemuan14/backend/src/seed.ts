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

    // 2. Define users to seed
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

    console.log("Seeding process completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
  } finally {
    await db.end();
  }
}

seed();
