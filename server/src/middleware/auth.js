import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    let token = req.cookies?.accessToken || req.cookies?.jwt;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        isSuccess: false,
        message: 'Not authenticated'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // attach user data to req.user
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      isSuccess: false,
      message: 'Token expired or invalid',
      isTokenExpired: err.name === 'TokenExpiredError'
    });
  }
};

/**
 * Ensures authenticated user belongs to the kitchen referenced in route parameters
 * Prevents Broken Object-Level Authorization (BOLA / IDOR)
 */
export const verifyKitchenAccess = (req, res, next) => {
  try {
    const routeKitchenId = req.params.kitchenId;
    const userKitchenId = req.user?.KitchenId || req.user?.kitchenId;

    if (!routeKitchenId) {
      return next();
    }

    if (routeKitchenId !== userKitchenId) {
      return res.status(403).json({
        isSuccess: false,
        message: 'Access denied: You do not belong to this kitchen.'
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({
      isSuccess: false,
      message: 'Authorization check failed: ' + err.message
    });
  }
};

export default authMiddleware;
