import { NextRequest, NextResponse } from 'next/server';
import { isTokenExpired, refreshAccessToken } from '@/app/common/refresh-token';

export const config = {
  matcher: [
    // Only run middleware on routes that actually need auth
    '/articles/:path*',
    '/manage/:path*',
    // Add other protected routes here
  ],
};

export default async function middleware(req: NextRequest) {
  console.log(
    '=================== Middleware running for: ===================',
    req.nextUrl.pathname,
  );
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
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set(
        'redirectTo',
        `${pathname}${req.nextUrl.search}`,
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  if (accessToken && isTokenExpired(accessToken) && refreshToken) {
    const tokens = await refreshAccessToken(refreshToken);

    if (tokens && tokens.token && tokens.refreshToken) {
      // Create response and set new cookies
      const response = NextResponse.next();

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

      response.cookies.set('random', Math.random().toString());

      return response;
    }

    // clear cookies
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  const response = NextResponse.next();

  return response;
}
