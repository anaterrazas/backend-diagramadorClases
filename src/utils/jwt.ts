// src/utils/jwt.ts
import jwt, { JwtPayload, SignOptions, Secret } from 'jsonwebtoken';

const ACCESS_SECRET: Secret  = process.env.JWT_SECRET     ?? 'access_secret';
const REFRESH_SECRET: Secret = process.env.REFRESH_SECRET ?? 'refresh_secret';

// Acepta "60", "1m", "15m", "1h", "7d", etc.
// Tipamos explícitamente como SignOptions['expiresIn'] para que TS no se queje.
const ACCESS_EXPIRES_IN: SignOptions['expiresIn']  =
  (process.env.JWT_ACCESS_EXPIRES  ?? '15m') as SignOptions['expiresIn'];

const REFRESH_EXPIRES_IN: SignOptions['expiresIn'] =
  (process.env.JWT_REFRESH_EXPIRES ?? '7d') as SignOptions['expiresIn'];

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
};

export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
};
