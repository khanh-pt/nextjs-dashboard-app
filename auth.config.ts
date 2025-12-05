import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const authConfig = {
  pages: {
    signIn: '/learning/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isRequireAuth = ['/learning/dashboard', '/manage'].some((path) =>
        nextUrl.pathname.startsWith(path),
      );

      if (isLoggedIn && nextUrl.pathname === '/login') {
        return false; // Redirect logged-in users away from login page
      }

      if (isRequireAuth) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
  },
  providers: [Credentials({})],
} satisfies NextAuthConfig;
