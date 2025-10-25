import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3600s';
export const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
