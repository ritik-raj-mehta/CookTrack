import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/User.js';
import Kitchen from '../models/Kitchen.js';
import Otp from '../models/Otp.js';
import { sendOtpEmail } from '../config/emailService.js';

const getRefreshSecret = () => {
  return process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET + '_refresh_secret_key');
};

const createAccessToken = (payload) => {
  const expiresMinutes = parseInt(process.env.JWT_ACCESS_EXPIRES_MINUTES || '15', 10);
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: `${expiresMinutes}m`
  });
};

const createRefreshToken = (payload) => {
  const expiresDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7', 10);
  return jwt.sign(payload, getRefreshSecret(), {
    expiresIn: `${expiresDays}d`
  });
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const accessMinutes = parseInt(process.env.JWT_ACCESS_EXPIRES_MINUTES || '15', 10);
  const refreshDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7', 10);

  const baseCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  };

  // Set Access Token cookie (also set 'jwt' for full backward compatibility)
  res.cookie('jwt', accessToken, {
    ...baseCookieOptions,
    expires: new Date(Date.now() + accessMinutes * 60 * 1000)
  });

  res.cookie('accessToken', accessToken, {
    ...baseCookieOptions,
    expires: new Date(Date.now() + accessMinutes * 60 * 1000)
  });

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...baseCookieOptions,
      expires: new Date(Date.now() + refreshDays * 24 * 60 * 60 * 1000)
    });
  }
};

const clearAuthCookies = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 0,
    path: '/'
  };

  res.cookie('jwt', '', clearOptions);
  res.cookie('accessToken', '', clearOptions);
  res.cookie('refreshToken', '', clearOptions);
};

const createToken = createAccessToken;

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

    console.log(`\n========================================`);
    console.log(`🔑 [CookTrack Local OTP] For ${cleanEmail}: ${otpCode}`);
    console.log(`========================================\n`);

    // Send email using emailService (supports Resend HTTP API, Brevo, and SMTP with fast timeout)
    let emailResult = null;
    try {
      emailResult = await sendOtpEmail(cleanEmail, otpCode, userName);
    } catch (emailErr) {
      console.error('[authController] Failed to send email via emailService:', emailErr);
    }

    const emailSent = emailResult && emailResult.success;
    const isDev = process.env.NODE_ENV !== 'production';
    const superAdminEmail = (process.env.SUPERADMIN_EMAIL || 'ritikmehta9835@gmail.com').toLowerCase();
    const isAdminEmail = cleanEmail === superAdminEmail;
    const allowDevAutoFill = isDev && isAdminEmail;

    return res.json({
      isSuccess: true,
      requiresOtp: true,
      email: cleanEmail,
      message: emailSent
        ? 'Verification code sent to your email. Please check your inbox (and spam folder) to complete signup.'
        : 'Verification code generated! Please enter the code below to complete signup.',
      devOtp: allowDevAutoFill ? otpCode : null,
      warning: allowDevAutoFill ? 'Local Admin Mode: Direct auto-fill code provided for platform administrator.' : null,
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

    console.log(`\n========================================`);
    console.log(`🔑 [CookTrack Local OTP] For ${cleanEmail}: ${otpCode}`);
    console.log(`========================================\n`);

    // Send email using emailService (supports Resend HTTP API, Brevo, and SMTP with fast timeout)
    let emailResult = null;
    try {
      emailResult = await sendOtpEmail(cleanEmail, otpCode, userName);
    } catch (emailErr) {
      console.error('[authController] Failed to send email via emailService:', emailErr);
    }

    const emailSent = emailResult && emailResult.success;
    const isDev = process.env.NODE_ENV !== 'production';
    const superAdminEmail = (process.env.SUPERADMIN_EMAIL || 'ritikmehta9835@gmail.com').toLowerCase();
    const isAdminEmail = cleanEmail === superAdminEmail;
    const allowDevAutoFill = isDev && isAdminEmail;

    return res.json({
      isSuccess: true,
      requiresOtp: true,
      email: cleanEmail,
      kitchenId: cleanKitchenId,
      message: emailSent
        ? 'Verification code sent to your email. Please check your inbox (and spam folder) to join kitchen.'
        : 'Verification code generated! Please enter the code below to join kitchen.',
      devOtp: allowDevAutoFill ? otpCode : null,
      warning: allowDevAutoFill ? 'Local Admin Mode: Direct auto-fill code provided for platform administrator.' : null,
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
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;
      if (otpRecord.attempts >= 5) {
        await Otp.deleteMany({ email: cleanEmail });
        return res.status(400).json({
          isSuccess: false,
          message: 'Maximum verification attempts exceeded. Please request a new code.'
        });
      }
      await otpRecord.save();
      return res.status(400).json({
        isSuccess: false,
        message: `Invalid verification code. ${5 - otpRecord.attempts} attempt(s) remaining.`
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

    // Auto-login: issue Access and Refresh Tokens
    const payload = {
      userEmail: user.userEmail,
      role: user.role,
      userName: user.userName,
      KitchenId: user.kitchenId,
      Id: user._id.toString()
    };

    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // Save refresh token on user document for revocation control
    user.refreshToken = refreshToken;
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    return res.json({
      isSuccess: true,
      email: user.userEmail,
      role: user.role,
      username: user.userName,
      kitchenId: user.kitchenId,
      userId: user._id.toString(),
      accessToken,
      token: accessToken,
      refreshToken,
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

    console.log(`\n========================================`);
    console.log(`🔑 [CookTrack Local OTP RESEND] For ${cleanEmail}: ${newOtp}`);
    console.log(`========================================\n`);

    let emailResult = null;
    try {
      emailResult = await sendOtpEmail(cleanEmail, newOtp, otpRecord.signupData?.userName);
    } catch (emailErr) {
      console.error('[authController] Failed to resend email:', emailErr);
    }

    const emailSent = emailResult && emailResult.success;
    const isDev = process.env.NODE_ENV !== 'production';
    const superAdminEmail = (process.env.SUPERADMIN_EMAIL || 'ritikmehta9835@gmail.com').toLowerCase();
    const isAdminEmail = cleanEmail === superAdminEmail;
    const allowDevAutoFill = isDev && isAdminEmail;

    return res.json({
      isSuccess: true,
      message: emailSent
        ? 'A new verification code has been sent to your email.'
        : 'A new verification code has been generated.',
      devOtp: allowDevAutoFill ? newOtp : null,
      warning: allowDevAutoFill ? 'Local Admin Mode: Direct auto-fill code provided for platform administrator.' : null,
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

    if (user.isSuspended) {
      return res.status(403).json({
        isSuccess: false,
        message: 'Your account has been suspended by the platform administrator.'
      });
    }

    // Auto-sync SuperAdmin role for designated owner email
    const superAdminEmail = (process.env.SUPERADMIN_EMAIL || 'ritikmehta9835@gmail.com').toLowerCase();
    if (user.userEmail && user.userEmail.toLowerCase() === superAdminEmail && user.role !== 'SuperAdmin') {
      user.role = 'SuperAdmin';
    }
    user.lastLogin = new Date();

    const payload = {
      userEmail: user.userEmail,
      role: user.role,
      userName: user.userName,
      KitchenId: user.kitchenId,
      Id: user._id.toString()
    };

    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // Save refresh token on user document for revocation control
    user.refreshToken = refreshToken;
    await user.save();

    setAuthCookies(res, accessToken, refreshToken);

    const accessMinutes = parseInt(process.env.JWT_ACCESS_EXPIRES_MINUTES || '15', 10);

    return res.json({
      isSuccess: true,
      message: 'Login successful',
      role: user.role,
      name: user.userName,
      kitchenId: user.kitchenId,
      id: user._id.toString(),
      accessToken,
      token: accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + accessMinutes * 60 * 1000)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred : ' + err.message
    });
  }
};

/**
 * Refresh Access Token using Refresh Token
 */
const refreshAccessToken = async (req, res) => {
  try {
    let token = req.cookies?.refreshToken;
    if (!token && req.body?.refreshToken) {
      token = req.body.refreshToken;
    }

    if (!token) {
      return res.status(401).json({
        isSuccess: false,
        message: 'No refresh token provided.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getRefreshSecret());
    } catch (err) {
      clearAuthCookies(res);
      return res.status(403).json({
        isSuccess: false,
        message: 'Invalid or expired refresh token. Please sign in again.'
      });
    }

    // Verify user exists and token matches database record
    const user = await User.findById(decoded.Id);
    if (!user || user.refreshToken !== token) {
      clearAuthCookies(res);
      return res.status(403).json({
        isSuccess: false,
        message: 'Refresh token has been revoked or is invalid.'
      });
    }

    const payload = {
      userEmail: user.userEmail,
      role: user.role,
      userName: user.userName,
      KitchenId: user.kitchenId,
      Id: user._id.toString()
    };

    const newAccessToken = createAccessToken(payload);
    setAuthCookies(res, newAccessToken);

    return res.json({
      isSuccess: true,
      accessToken: newAccessToken,
      token: newAccessToken,
      message: 'Token refreshed successfully'
    });
  } catch (err) {
    console.error('Refresh token error:', err);
    return res.status(500).json({
      isSuccess: false,
      message: 'Exception Occurred: ' + err.message
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

    if (user.isSuspended) {
      clearAuthCookies(res);
      return res.status(403).json({
        isSuccess: false,
        message: 'Your account has been suspended by the platform administrator.'
      });
    }

    // Auto-sync SuperAdmin role for designated owner email
    const superAdminEmail = (process.env.SUPERADMIN_EMAIL || 'ritikmehta9835@gmail.com').toLowerCase();
    if (user.userEmail && user.userEmail.toLowerCase() === superAdminEmail && user.role !== 'SuperAdmin') {
      user.role = 'SuperAdmin';
      await user.save();
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

const logout = async (req, res) => {
  try {
    const token = req.cookies?.accessToken || req.cookies?.jwt;
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded?.Id) {
          await User.findByIdAndUpdate(decoded.Id, { refreshToken: null });
        }
      } catch (e) {
        // ignore decode error on logout
      }
    }

    clearAuthCookies(res);
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
  refreshAccessToken,
  getMe,
  logout
};
