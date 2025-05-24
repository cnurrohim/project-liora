import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const postgresPool = new Pool({
  connectionString: process.env.DATABASE_URL_POSTGRESQL,
});

export async function checkPostgresConnection() {
  try {
    const client = await postgresPool.connect();
    const res = await client.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected. Server time:', res.rows[0].now);
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err);
  }
}
