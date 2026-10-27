import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/User.js';
import Kitchen from '../models/Kitchen.js';
import Otp from '../models/Otp.js';
import { sendOtpEmail } from '../config/emailService.js';

const createToken = (payload, expiresMinutes) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: `${expiresMinutes}m`
  });
};

const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerUser = async (req, res) => {
  const { userName, userPassword, userEmail, kitchenName, phoneNumber } = req.body;

  try {
    if (!phoneNumber || !String(phoneNumber).trim()) {
      return res.status(400).json({
        isSuccess: false,
        message: 'Mobile number is compulsory.'
      });
    }

    const cleanEmail = String(userEmail || '').trim().toLowerCase();
    const existing = await User.findOne({ userEmail: cleanEmail });
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
    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Remove any previous pending OTP for this email
    await Otp.deleteMany({ email: cleanEmail });

    // Store in Otp collection
    await Otp.create({
      email: cleanEmail,
      otp: otpCode,
      signupData: {
        userName: userName.trim(),
        userPassword: hashed,
        userEmail: cleanEmail,
        phoneNumber: String(phoneNumber).trim(),
        kitchenName: kitchenName ? kitchenName.trim() : 'My Kitchen',
        type: 'CREATE_KITCHEN',
      },
      expiresAt,
    });

    // Send email using nodemailer
    let emailResult = null;
    try {
      emailResult = await sendOtpEmail(cleanEmail, otpCode, userName);
    } catch (emailErr) {
      console.error('[authController] Failed to send email via nodemailer:', emailErr);
    }

    return res.json({
      isSuccess: true,
      requiresOtp: true,
      email: cleanEmail,
      message: 'Verification code sent to your email. Please verify to complete signup.',
      previewUrl: emailResult?.previewUrl || null,
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
    if (!phoneNumber || !String(phoneNumber).trim()) {
      return res.status(400).json({
        isSuccess: false,
        message: 'Mobile number is compulsory.'
      });
    }

    const cleanEmail = String(userEmail || '').trim().toLowerCase();
    const existing = await User.findOne({ userEmail: cleanEmail });
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

    // verify kitchen exists before generating OTP
    const cleanKitchenId = String(kitchenId || '').trim();
    const kitchen = await Kitchen.findOne({ kitchenId: cleanKitchenId });
    if (!kitchen) {
      return res
        .status(404)
        .json({ isSuccess: false, message: 'Kitchen not found with this code.' });
    }

    const hashed = await bcrypt.hash(userPassword, 10);
    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Remove any previous pending OTP for this email
    await Otp.deleteMany({ email: cleanEmail });

    // Store in Otp collection
    await Otp.create({
      email: cleanEmail,
      otp: otpCode,
      signupData: {
        userName: userName.trim(),
        userPassword: hashed,
        userEmail: cleanEmail,
        phoneNumber: String(phoneNumber).trim(),
        kitchenName: kitchenName || kitchen.kitchenName,
        kitchenId: cleanKitchenId,
        type: 'JOIN_KITCHEN',
      },
      expiresAt,
    });

    // Send email using nodemailer
    let emailResult = null;
    try {
      emailResult = await sendOtpEmail(cleanEmail, otpCode, userName);
    } catch (emailErr) {
      console.error('[authController] Failed to send email via nodemailer:', emailErr);
    }

    return res.json({
      isSuccess: true,
      requiresOtp: true,
      email: cleanEmail,
      kitchenId: cleanKitchenId,
      message: 'Verification code sent to your email. Please verify to join kitchen.',
      previewUrl: emailResult?.previewUrl || null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
    });
  }
};

/**
 * Verify OTP and complete registration, auto-login user
 */
const verifyOtpAndRegister = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanOtp = String(otp || '').trim();

    if (!cleanEmail || !cleanOtp) {
      return res.status(400).json({
        isSuccess: false,
        message: 'Email and OTP code are required.'
      });
    }

    const otpRecord = await Otp.findOne({ email: cleanEmail });
    if (!otpRecord) {
      return res.status(400).json({
        isSuccess: false,
        message: 'No verification code found or it has expired. Please sign up again.'
      });
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteMany({ email: cleanEmail });
      return res.status(400).json({
        isSuccess: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    if (otpRecord.otp !== cleanOtp) {
      return res.status(400).json({
        isSuccess: false,
        message: 'Invalid verification code. Please check your email and try again.'
      });
    }

    // OTP is valid! Retrieve signup data
    const { signupData } = otpRecord;

    // Check if user somehow was registered in between
    const existing = await User.findOne({ userEmail: cleanEmail });
    if (existing) {
      await Otp.deleteMany({ email: cleanEmail });
      return res.status(400).json({
        isSuccess: false,
        message: 'User is already registered. Please sign in.'
      });
    }

    let user;

    if (signupData.type === 'CREATE_KITCHEN') {
      // Create user as KitchenAdmin
      user = new User({
        userName: signupData.userName,
        userPassword: signupData.userPassword,
        userEmail: signupData.userEmail,
        role: 'KitchenAdmin',
        kitchenName: signupData.kitchenName,
        phoneNumber: signupData.phoneNumber,
      });
      await user.save();

      // Create kitchen for this user
      const newKitchen = new Kitchen({
        kitchenName: `${signupData.kitchenName}'s Kitchen`,
        kitchenId: user.kitchenId,
        createdBy: user.userEmail,
        members: [user._id.toString()]
      });
      await newKitchen.save();
    } else {
      // JOIN_KITCHEN
      const kitchen = await Kitchen.findOne({ kitchenId: signupData.kitchenId });
      if (!kitchen) {
        return res.status(404).json({
          isSuccess: false,
          message: 'Kitchen not found with this code.'
        });
      }

      user = new User({
        userName: signupData.userName,
        userPassword: signupData.userPassword,
        userEmail: signupData.userEmail,
        kitchenName: signupData.kitchenName || kitchen.kitchenName,
        role: 'User',
        kitchenId: signupData.kitchenId,
        phoneNumber: signupData.phoneNumber,
      });
      await user.save();

      if (!kitchen.members.includes(user._id.toString())) {
        kitchen.members.push(user._id.toString());
        kitchen.updatedAt = new Date();
        await kitchen.save();
      }
    }

    // Delete verified OTP record
    await Otp.deleteMany({ email: cleanEmail });

    // Auto-login: issue JWT cookie directly
    const jwtExpires = parseInt(process.env.JWT_EXPIRES_MINUTES || '1440', 10);
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
      email: user.userEmail,
      role: user.role,
      username: user.userName,
      kitchenId: user.kitchenId,
      userId: user._id.toString(),
      message: 'Email verified successfully! Welcome to your kitchen.'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
    });
  }
};

/**
 * Resend OTP to email
 */
const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return res.status(400).json({
        isSuccess: false,
        message: 'Email is required.'
      });
    }

    const otpRecord = await Otp.findOne({ email: cleanEmail });
    if (!otpRecord) {
      return res.status(400).json({
        isSuccess: false,
        message: 'No pending registration found. Please sign up again.'
      });
    }

    const newOtp = generateOtpCode();
    otpRecord.otp = newOtp;
    otpRecord.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await otpRecord.save();

    let emailResult = null;
    try {
      emailResult = await sendOtpEmail(cleanEmail, newOtp, otpRecord.signupData?.userName);
    } catch (emailErr) {
      console.error('[authController] Failed to resend email:', emailErr);
    }

    return res.json({
      isSuccess: true,
      message: 'A new verification code has been sent to your email.',
      previewUrl: emailResult?.previewUrl || null,
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
    const user = await User.findById(claims.Id);
    if (!user) {
      return res.status(404).json({ isSuccess: false, message: 'User not found' });
    }

    return res.json({
      email: user.userEmail,
      role: user.role,
      username: user.userName,
      kitchenId: user.kitchenId,
      userId: user._id.toString()
    });
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
  verifyOtpAndRegister,
  resendOtp,
  loginUser,
  getMe,
  logout
};
