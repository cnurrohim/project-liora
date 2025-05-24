import dotenv from 'dotenv';
dotenv.config();
import mysql, { RowDataPacket } from 'mysql2/promise';

export const mysqlPool = mysql.createPool({
  uri: process.env.DATABASE_URL_MYSQL,
});

interface NowRow extends RowDataPacket {
  now: string;
}

export async function checkMySQLConnection() {
  try {
    const conn = await mysqlPool.getConnection();
    const [rows] = await conn.query<NowRow[]>('SELECT NOW() AS now');
    console.log('✅ MySQL connected. Server time :', rows[0].now);
    conn.release();
  } catch (err) {
    console.error('❌ MySQL connection error:', err);
  }
}
