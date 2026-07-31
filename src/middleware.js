import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'adl_session';

// Edge-safe: only verifies the JWT (no bcrypt, no next/headers).
async function readSession(token) {
  if (!token || !process.env.SESSION_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.SESSION_SECRET));
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Everything under /admin except the login page requires an admin session.
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = await readSession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session || session.role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
