const TOKEN_BYTES = 32;
const COOKIE_NAME = 'csrf-token';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateCsrfToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

export function getCsrfCookieName(): string {
  return COOKIE_NAME;
}

export function getCsrfHeaderName(): string {
  return 'x-csrf-token';
}

export function validateCsrfToken(token: string | null, cookie: string | null): boolean {
  if (!token || !cookie) return false;
  if (token.length !== TOKEN_BYTES * 2 || cookie.length !== TOKEN_BYTES * 2) return false;
  // Constant-time comparison to prevent timing attacks
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ cookie.charCodeAt(i);
  }
  return diff === 0;
}

export function requireCsrf(request: Request): { valid: boolean; message?: string } {
  const cookieStr = request.headers.get('cookie') || '';
  const match = cookieStr.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  const csrfCookie = match ? decodeURIComponent(match[1]) : null;
  const csrfHeader = request.headers.get(getCsrfHeaderName());
  if (!validateCsrfToken(csrfHeader, csrfCookie)) {
    return { valid: false, message: 'CSRF token inválido' };
  }
  return { valid: true };
}
