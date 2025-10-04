import express from "express";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config(); // โหลดค่า DATABASE_URL จากไฟล์ .env

const { Pool } = pkg;
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// เชื่อมต่อ Neon DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // จำเป็นสำหรับ Neon
});

// ✅ Test connection
pool.connect()
  .then(() => console.log("✅ Connected to Neon Postgres"))
  .catch(err => console.error("❌ DB connection error", err));

// ------------------------- ROUTES -------------------------

// สมัครสมาชิก
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "กรอกข้อมูลไม่ครบ" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashed]
    );
    res.json({ message: "สมัครสมาชิกสำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" });
  }
});

// ล็อกอิน
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "กรอกข้อมูลไม่ครบ" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];
    if (!user) return res.json({ error: "ไม่พบบัญชี" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ error: "รหัสผ่านไม่ถูกต้อง" });

    res.json({ message: "เข้าสู่ระบบสำเร็จ", name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// จองกล้อง
app.post("/api/book", async (req, res) => {
  const { name, email, camera, date, note } = req.body;
  if (!name || !email || !camera || !date) {
    return res.status(400).json({ error: "กรอกข้อมูลไม่ครบ" });
  }

  try {
    await pool.query(
      "INSERT INTO bookings (name, email, camera, date, note, status) VALUES ($1,$2,$3,$4,$5,$6)",
      [name, email, camera, date, note || "", "Pending"]
    );
    res.json({ message: "จองสำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถจองได้" });
  }
});

// ดูการจองของผู้ใช้
app.post("/api/mybookings", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "กรอกอีเมล" });
  }

  try {
    const result = await pool.query("SELECT * FROM bookings WHERE email=$1 ORDER BY date DESC", [email]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ไม่สามารถดึงข้อมูลได้" });
  }
});

// ------------------------- START SERVER -------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
