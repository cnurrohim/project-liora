import { checkPostgresConnection } from './postgresql'; // atau ganti jadi './mysql' jika pakai MySQL
import { connectMongo } from './mongo';
import { checkMySQLConnection } from './mysql';

export async function initDatabases() {
  await checkPostgresConnection(); // atau checkMySQLConnection()
  await connectMongo();
  await checkMySQLConnection();
}

