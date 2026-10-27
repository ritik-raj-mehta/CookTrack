import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    let token = req.cookies?.jwt;
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
      message: 'Invalid token'
    });
  }
};

export default authMiddleware;