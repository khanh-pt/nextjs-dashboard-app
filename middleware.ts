import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: [
    // Only run middleware on routes that actually need auth
    '/articles/:path*',
    '/manage/:path*',
    // Add other protected routes here
  ],
};

/**
 * Decode JWT token without verification (only for reading expiration)
 * For security: This is safe because we only use it to check if we need to refresh
 * The actual validation happens on the backend when using the token
 */
function decodeJWT(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64url').toString('utf-8'),
    );
    return payload;
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired or will expire soon
 * @param token - JWT token string
 * @param bufferSeconds - Refresh token this many seconds before actual expiration (default: 60)
 */
function isTokenExpired(token: string, bufferSeconds: number = 0): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const bufferTime = bufferSeconds * 1000;

  return now >= expirationTime - bufferTime;
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<{ token?: string; refreshToken?: string } | null> {
  const response = await fetch(
    `${process.env.NEST_BE_URL}/users/refresh-token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    },
  );

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  // keep user away from login/register if have access token
  if (pathname.startsWith('/login') && accessToken) {
    return NextResponse.redirect(new URL('/manage/articles', req.url));
  }

  // how to protected routes, if no access token, redirect to login
  if (pathname.startsWith('/articles/create')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  if (accessToken && isTokenExpired(accessToken) && refreshToken) {
    const tokens = await refreshAccessToken(refreshToken);

    console.log(
      'Middleware Refresh Tokens------------------------------------------------------------:',
      tokens,
    );

    if (tokens && tokens.token && tokens.refreshToken) {
      // Create response and set new cookies
      const response = NextResponse.next();

      response.cookies.set('kakak', Math.random().toString());

      response.cookies.set('accessToken', tokens.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      response.cookies.set('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    }

    // clear cookies
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  return NextResponse.next();
}
