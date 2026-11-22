import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const superAdminAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken || req.cookies?.jwt;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        isSuccess: false,
        message: 'Authentication required. Please sign in.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded.userId || decoded.Id;

    if (!userId) {
      return res.status(401).json({
        isSuccess: false,
        message: 'Malformed token payload. Access denied.',
      });
    }

    // Lookup user in DB to verify latest role & suspension status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        isSuccess: false,
        message: 'User account not found.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        isSuccess: false,
        message: 'Your account has been suspended by the platform administrator.',
      });
    }

    // Recognized SuperAdmin email check (from env or primary owner)
    const superAdminEmail = (process.env.SUPERADMIN_EMAIL || 'ritikmehta9835@gmail.com').toLowerCase();
    const isOwnerEmail = user.userEmail && user.userEmail.toLowerCase() === superAdminEmail;

    if (user.role !== 'SuperAdmin' && !isOwnerEmail) {
      return res.status(403).json({
        isSuccess: false,
        message: 'Access denied: Super Admin privileges required.',
      });
    }

    // Auto-sync role if owner email
    if (isOwnerEmail && user.role !== 'SuperAdmin') {
      user.role = 'SuperAdmin';
      await user.save();
    }

    req.user = {
      ...decoded,
      id: user._id.toString(),
      userId: user._id.toString(),
      userEmail: user.userEmail,
      role: 'SuperAdmin',
      userName: user.userName,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      isSuccess: false,
      message: 'Token expired or invalid.',
      isTokenExpired: err.name === 'TokenExpiredError',
    });
  }
};
