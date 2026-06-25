export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pirai_user_id');
}

export function setUserId(id: string) {
  localStorage.setItem('pirai_user_id', id);
}

export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pirai_email');
}

export function getUserName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('pirai_name');
}

export function clearAuth() {
  localStorage.removeItem('pirai_user_id');
  localStorage.removeItem('pirai_email');
  localStorage.removeItem('pirai_name');
}

export function isAuthenticated(): boolean {
  return !!getUserId();
}
