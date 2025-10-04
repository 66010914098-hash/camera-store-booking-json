
---

## ⚙️ วิธีติดตั้ง (Run Local)

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. สร้างไฟล์ .env และใส่ข้อมูล Neon
DATABASE_URL=postgresql://USERNAME:PASSWORD@ep-xxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# 3. รันเซิร์ฟเวอร์
npm start
