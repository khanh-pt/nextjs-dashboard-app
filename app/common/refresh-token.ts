export async function refreshAccessToken(
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

/**
 * Decode JWT token without verification (only for reading expiration)
 * For security: This is safe because we only use it to check if we need to refresh
 * The actual validation happens on the backend when using the token
 */
export function decodeJWT(token: string): { exp?: number } | null {
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
export function isTokenExpired(
  token: string,
  bufferSeconds: number = 0,
): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const bufferTime = bufferSeconds * 1000;

  return now >= expirationTime - bufferTime;
}
