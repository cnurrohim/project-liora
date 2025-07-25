import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Tes koneksi saat pertama dijalankan
db.connect()
  .then((client) => {
    return client
      .query("SELECT NOW()")
      .then((res) => {
        console.log("✅ Database connected at", res.rows[0].now);
        client.release();
      })
      .catch((err) => {
        client.release();
        console.error("❌ Error running test query", err);
      });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
  });
