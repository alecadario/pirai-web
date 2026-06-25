export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_id');
}

export function setUserId(id: string) {
  localStorage.setItem('user_id', id);
}

export function clearAuth() {
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_email');
}

export function isAuthenticated(): boolean {
  return !!getUserId();
}
