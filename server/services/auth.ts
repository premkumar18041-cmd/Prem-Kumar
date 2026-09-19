import crypto from 'crypto';
import { db } from '../db.js';
import type { User, RoleName } from '../../src/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'iver_accessories_secure_token_secret_2026';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_salt_accessories_lt').digest('hex');
}

export function createToken(userId: string, role: RoleName): string {
  const payload = JSON.stringify({
    uid: userId,
    role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): { uid: string; role: RoleName } | null {
  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;

    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(encodedPayload).digest('base64url');
    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (Date.now() > decoded.exp) return null;

    return { uid: decoded.uid, role: decoded.role };
  } catch {
    return null;
  }
}

export function getUserByToken(token: string): User | null {
  const verified = verifyToken(token);
  if (!verified) return null;
  const user = db.users.get(verified.uid);
  return user || null;
}

export function checkPermission(userRole: RoleName, allowedRoles: RoleName[]): boolean {
  if (userRole === 'SUPER_ADMIN') return true;
  return allowedRoles.includes(userRole);
}
