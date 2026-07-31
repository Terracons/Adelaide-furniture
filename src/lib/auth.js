/**
 * ============================================================================
 *  Authentication — password hashing + signed session cookies.  SERVER ONLY.
 * ============================================================================
 *  Replaces the old demo-grade client check. Passwords are bcrypt-hashed;
 *  sessions are stateless JWTs (jose) stored in an httpOnly cookie.
 * ============================================================================
 */
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'adl_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error('SESSION_SECRET is missing or too short (need 16+ chars).');
  }
  return new TextEncoder().encode(s);
}

/* --------------------------------------------------------------- passwords  */

export function hashPassword(plain) {
  return bcrypt.hash(String(plain), 10);
}

export function verifyPassword(plain, hash) {
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(String(plain), String(hash));
}

/* ---------------------------------------------------------------- sessions  */

/** Sign a session token. `payload` is small: { id, role, name, email }. */
export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

/* ----------------------------------------- cookie helpers (route handlers)  */

export async function setSessionCookie(payload) {
  const token = await signSession(payload);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
}

/** Current session (or null) read from the request cookie. */
export async function getSession() {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

/**
 * Guard for admin route handlers. Returns the session, or throws an
 * AuthError the handler catches and turns into a 401.
 */
export class AuthError extends Error {
  constructor(message = 'Unauthorised', status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') throw new AuthError();
  return session;
}

export async function requireUser() {
  const session = await getSession();
  if (!session) throw new AuthError();
  return session;
}
