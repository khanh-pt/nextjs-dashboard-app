import { getCookie } from '@/app/common/cookie';

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const accessToken = await getCookie('accessToken');

  init.headers = {
    ...init.headers,
    ...(accessToken ? { Authorization: `Token ${accessToken}` } : {}),
  };
  return await fetch(input, init);
}
