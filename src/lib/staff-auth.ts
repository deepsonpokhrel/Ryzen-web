// Staff sign in with a username; the backend account uses an internal email.
export const DEMO_STAFF = { username: 'admin', password: 'admin214' } as const;
export function staffEmailFor(username: string) {
  const u = username.trim().toLowerCase();
  return u.includes('@') ? u : `${u.replace(/[^a-z0-9._-]/g, '')}@staff.ryzenx.cinema`;
}
