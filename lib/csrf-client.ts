import { getCsrfCookieName, getCsrfHeaderName } from './csrf';

export function getCsrfToken(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${getCsrfCookieName()}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function csrfFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getCsrfToken();
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { [getCsrfHeaderName()]: token } : {}),
    },
    credentials: 'include',
  });
}
