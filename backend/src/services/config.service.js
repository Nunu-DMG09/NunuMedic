export function getSecretKey() {
  const key = process.env.JWT_SECRET;
  if (!key) throw new Error('JWT secret key not set in environment variables.');
  return key;
}

export function getTokenExpiration() {
  const exp = process.env.JWT_EXP;
  return exp ? parseInt(exp, 10) : 3600; // seconds
}