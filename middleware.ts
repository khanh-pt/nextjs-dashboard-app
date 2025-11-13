import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // https://nextjs.org/docs/app/api-reference/file-conventions/middleware#matcher
  // next version >= 16 change middleware to proxy
  // https://nextjs.org/docs/app/api-reference/file-conventions/proxy#migration-to-proxy
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
