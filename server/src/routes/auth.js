import express from 'express';
import authCtrl from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Register a new user
router.post('/register', authCtrl.registerUser);

// Register user to a kitchen
router.post('/registerToKitchen', authCtrl.registerToKitchen);

// Login user
router.post('/login', authCtrl.loginUser);

// Get logged-in user's profile
router.get('/me', authMiddleware, authCtrl.getMe);

// Logout user
router.post('/logout', authCtrl.logout);

export default router;
