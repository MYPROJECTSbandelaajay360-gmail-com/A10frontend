import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const signAccessToken = (payload: TokenPayload): string => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn as any,
    issuer: 'hrms-portal',
  });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: expiresIn as any,
    issuer: 'hrms-portal',
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET, {
    issuer: 'hrms-portal',
  }) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET, {
    issuer: 'hrms-portal',
  }) as TokenPayload;
};
