// server/middleware/roleMiddleware.js

/**
 * Generic role check middleware
 * Usage: roleMiddleware(['Admin', 'SuperAdmin'])
 */
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user logged in' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied: Role '${req.user.role}' is not permitted` });
    }

    next();
  };
};


export const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'SuperAdmin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: SuperAdmin only' });
  }
};

export default roleMiddleware;
