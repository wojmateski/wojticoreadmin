import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const JWT_ISS = process.env.JWT_ISS || "login.wojticore.pl";
const JWT_AUD = process.env.JWT_AUD || "wojticore-clients";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "900"; // seconds
const REFRESH_EXPIRES_IN = Number(process.env.REFRESH_EXPIRES_IN || 60 * 60 * 24 * 30);

export type TokenPayload = {
  sub: string;
  email: string;
  role: Role;
  aud: string;
  iss: string;
};

export function signJwt(payload: Omit<TokenPayload, "aud" | "iss">) {
  return jwt.sign({ ...payload, aud: JWT_AUD, iss: JWT_ISS }, JWT_SECRET, {
    expiresIn: Number(JWT_EXPIRES_IN)
  });
}

export function verifyJwt(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET, { audience: JWT_AUD, issuer: JWT_ISS }) as TokenPayload;
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createRefreshToken(userId: string) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_IN * 1000);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  return { token, expiresAt };
}

export async function rotateRefreshToken(oldToken: string) {
  const existing = await prisma.refreshToken.findUnique({ where: { token: oldToken }, include: { user: true } });
  if (!existing || existing.expiresAt < new Date()) {
    throw new Error("Refresh token invalid/expired");
  }
  await prisma.refreshToken.delete({ where: { token: oldToken } });
  const { token, expiresAt } = await createRefreshToken(existing.userId);
  const accessToken = signJwt({ sub: existing.user.id, email: existing.user.email, role: existing.user.role });
  return { accessToken, refreshToken: token, refreshExpiresAt: expiresAt };
}
