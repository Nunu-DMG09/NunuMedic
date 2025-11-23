import jwt from 'jsonwebtoken';
import { getSecretKey, getTokenExpiration } from './config.service.js';

export function createJWT(data) {
  const key = getSecretKey();
  const exp = getTokenExpiration();
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + exp,
    data
  };
  return jwt.sign(payload, key, { algorithm: 'HS256' });
}

export function verifyJWT(token) {
  const key = getSecretKey();
  try {
    const decoded = jwt.verify(token, key, { algorithms: ['HS256'] });
    return decoded;
  } catch (err) {
    const e = new Error('Invalid JWT: ' + (err.message || err));
    e.original = err;
    throw e;
  }
}

export function getExpiryMs() {
  return getTokenExpiration() * 1000;
}