// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    // Decode token and flexibly support multiple id field names
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const decodedId = decoded.id || decoded.userId || decoded._id;
    if (!decodedId) {
      return res.status(401).json({ message: 'Not authorized, invalid token payload' });
    }
    req.user = await User.findById(decodedId).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'SuperAdmin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: SuperAdmin only' });
  }
};

// Generic role check middleware
export default function(requiredRoles) {
  const normalizedRequired = requiredRoles.map(r => r.toLowerCase());
  return (req, res, next) => {
    const rawRole = req.user?.role || req.headers.role;
    const role = (rawRole || '').toLowerCase();
    if (!role || !normalizedRequired.includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}
