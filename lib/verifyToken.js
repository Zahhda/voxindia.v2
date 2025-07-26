import jwt from 'jsonwebtoken';

export function verifyToken(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) throw new Error('Missing authorization header');

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) throw new Error('Missing token');

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set in env');

  try {
    const decoded = jwt.verify(token, secret);
    return decoded; // contains user info, e.g., phone or id
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}
