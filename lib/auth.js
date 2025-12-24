import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'Cementerio2025_Secret_Key_Admin_Panel';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Cementerio2025_Root';

export const validateAdminLogin = (username, password) => {
  return username === 'admin' && password === ADMIN_PASSWORD;
};

export const generateToken = (adminId) => {
  return jwt.sign({ adminId, iat: Date.now() }, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const isAdmin = (token) => {
  return verifyToken(token) !== null;
};
