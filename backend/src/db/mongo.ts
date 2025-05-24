import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const client = new MongoClient(mongoUrl);

export async function connectMongo() {
  try {
    await client.connect();
    console.log('✅ MongoDB connected');

    const db = client.db('project_db');
    return db;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}
