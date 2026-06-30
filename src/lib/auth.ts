export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pirai_user_id');
}

export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pirai_email');
}

export function getUserName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pirai_name');
}

export function setAuth(userId: string, email: string, name: string) {
  localStorage.setItem('pirai_user_id', userId);
  localStorage.setItem('pirai_email', email);
  localStorage.setItem('pirai_name', name);
}

export function clearAuth() {
  localStorage.removeItem('pirai_user_id');
  localStorage.removeItem('pirai_email');
  localStorage.removeItem('pirai_name');
}

export function isAuthenticated(): boolean {
  return !!getUserId();
}
