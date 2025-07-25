import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// export const hashPassword = async (plain: string) => {
//   return await bcrypt.hash(plain, 10);
// };

// export const comparePassword = async (plain: string, hash: string) => {
//   return await bcrypt.compare(plain, hash);
// };

// export const generateToken = (payload: object) => {
//   return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
// };

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "60m" }); // 15 menit
}

export function generateRefreshToken(payload: object): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "120m" }); // 7 hari
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  inputPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(inputPassword, hashedPassword);
}
