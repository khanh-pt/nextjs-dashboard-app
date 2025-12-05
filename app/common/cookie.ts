'use server';

import { cookies } from 'next/headers';

type ResponseCookieOption = {
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'lax' | 'strict' | 'none';
  secure?: boolean;
};

const defaultCookieOptions: ResponseCookieOption = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

export async function getCookie(cookieName: string) {
  const cookiesRequestHeader = await cookies();
  return cookiesRequestHeader.get(cookieName)?.value;
}

export async function setCookie({
  cookieName,
  value,
  options = defaultCookieOptions,
}: {
  cookieName: string;
  value: string;
  options?: ResponseCookieOption;
}) {
  const cookiesRequestHeader = await cookies();
  cookiesRequestHeader.set({
    name: cookieName,
    value,
    ...options,
  });
}

export async function deleteCookie(cookieName: string) {
  const cookiesRequestHeader = await cookies();
  return cookiesRequestHeader.delete(cookieName);
}
