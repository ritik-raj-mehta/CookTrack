// controllers/authController.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import Kitchen from '../models/Kitchen.js';

const createToken = (payload, expiresMinutes) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: `${expiresMinutes}m`
  });
};

const registerUser = async (req, res) => {
  const { userName, userPassword, userEmail, kitchenName, phoneNumber } = req.body;

  try {
    const existing = await User.findOne({ userEmail });
    if (existing) {
      return res
        .status(400)
        .json({ isSuccess: false, message: 'User already exists.' });
    }

    if (!userPassword || userPassword.length < 8 || userPassword.length > 20) {
      return res.status(400).json({
        isSuccess: false,
        message: 'Password must be 8-20 characters.'
      });
    }

    const hashed = await bcrypt.hash(userPassword, 10);

    // create user as KitchenAdmin
    const user = new User({
      userName,
      userPassword: hashed,
      userEmail,
      role: 'KitchenAdmin',
      kitchenName,
      phoneNumber
    });
    await user.save();

    // create kitchen for this user
    const newKitchen = new Kitchen({
      kitchenName: `${kitchenName}'s Kitchen`,
      kitchenId: user.kitchenId,
      createdBy: user.userEmail,
      members: [user._id.toString()]
    });
    await newKitchen.save();

    return res.json({
      isSuccess: true,
      message: 'User registered successfully.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
    });
  }
};



const registerToKitchen = async (req, res) => {
  const { userName, userPassword, userEmail, kitchenId, kitchenName, phoneNumber } =
    req.body;

  try {
    const existing = await User.findOne({ userEmail });
    if (existing) {
      return res
        .status(400)
        .json({ isSuccess: false, message: 'User already exists.' });
    }

    if (!userPassword || userPassword.length < 8 || userPassword.length > 20) {
      return res.status(400).json({
        isSuccess: false,
        message: 'Password must be 8-20 characters.'
      });
    }

    const hashed = await bcrypt.hash(userPassword, 10);

    const user = new User({
      userName,
      userPassword: hashed,
      userEmail,
      kitchenName,
      role: 'User',
      kitchenId,
      phoneNumber
    });
    await user.save();

    // add user id to kitchen members
    const kitchen = await Kitchen.findOne({ kitchenId });
    if (!kitchen) {
      return res
        .status(404)
        .json({ isSuccess: false, message: 'Kitchen not found.' });
    }

    kitchen.members.push(user._id.toString());
    kitchen.updatedAt = new Date();
    await kitchen.save();

    return res.json({
      isSuccess: true,
      message: 'User registered to kitchen successfully.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
    });
  }
};



const loginUser = async (req, res) => {
  const { userEmail, userPassword } = req.body;

  try {
    const user = await User.findOne({ userEmail });
    if (!user) {
      return res
        .status(404)
        .json({ isSuccess: false, message: 'No document found' });
    }

    const isPasswordValid = await bcrypt.compare(
      userPassword,
      user.userPassword
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ isSuccess: false, message: 'Invalid password' });
    }

    // Use minutes for expiry (fallback 1440 = 1 day)
    const jwtExpires = parseInt(
      process.env.JWT_EXPIRES_MINUTES || '1440',
      10
    );

    const payload = {
      userEmail: user.userEmail,
      role: user.role,
      userName: user.userName,
      KitchenId: user.kitchenId,
      Id: user._id.toString()
    };

    const token = createToken(payload, jwtExpires);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: new Date(Date.now() + jwtExpires * 60 * 1000),
      path: "/"
    };

    res.cookie('jwt', token, cookieOptions);

    return res.json({
      isSuccess: true,
      message: 'Login successful',
      role: user.role,
      name: user.userName,
      kitchenId: user.kitchenId,
      id: user._id.toString(),
      token,
      expiresAt: cookieOptions.expires
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occured : ' + err.message
    });
  }
};



const getMe = async (req, res) => {
  try {
    const claims = req.user; // from auth middleware
    const userId = claims.Id;
    const email = claims.userEmail;
    const role = claims.role;
    const username = claims.userName;
    const kitchenId = claims.KitchenId;

    return res.json({ email, role, username, kitchenId, userId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: err.message
    });
  }
};



const logout = (req, res) => {
  try {
    console.log("🔐 Logout called - clearing jwt cookie");
    console.log("Cookies in request:", req.cookies);
    
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 0,  // Immediately expire
      path: "/"
    });

    console.log("✅ JWT cookie cleared");
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error("❌ Logout error:", err);
    return res.status(500).json({
      isSuccess: false,
      message: err.message
    });
  }
};

export default {
  registerUser,
  registerToKitchen,
  loginUser,
  getMe,
  logout
};
