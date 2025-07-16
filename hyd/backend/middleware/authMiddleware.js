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
    
    // Use 'id' instead of 'userId' to match how JWT is created in login
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password'); // Changed from decoded.userId to decoded.id
    
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
  return (req, res, next) => {
    const role = req.user?.role || req.headers.role;
    if (!requiredRoles.includes(role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
