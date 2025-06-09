const TOKEN_KEY = 'auth_token';
const EXPIRY_KEY = 'auth_token_expiry';

export function saveAuthToken(token: string, expiresInSeconds: number) {
  localStorage.setItem(TOKEN_KEY, token);
  const expiryTime = Date.now() + expiresInSeconds * 1000;
  localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);

  if (!token || !expiry) return false;

  const expiryTime = parseInt(expiry, 10);
  if (Date.now() > expiryTime) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    return false;
  }

  return true;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}
