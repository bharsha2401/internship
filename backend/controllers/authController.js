// server/controllers/authController.js

import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendResetEmail, sendPasswordChangedEmail } from '../utils/email.js';
import { generateOTP, sendOTPEmail } from '../utils/otpEmail.js';
import { sendWelcomeEmail } from '../utils/mailer.js';
import nodemailer from 'nodemailer';

// Store temporary email verification data (in production, use Redis)
const tempEmailVerifications = new Map();

// ================== NEW FUNCTIONS FOR STEP-BY-STEP SIGNUP ==================

// ------------------ STEP 3: SEND EMAIL OTP (NEW) ------------------
export const sendEmailOTP = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store temporarily
    tempEmailVerifications.set(email, {
      name,
      otp,
      otpExpires,
      verified: false
    });

    // Send OTP email
    await sendOTPEmail(email, otp, name);
    res.status(200).json({ 
      message: 'OTP sent successfully. Please check your email.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ------------------ STEP 3: VERIFY EMAIL OTP (NEW) ------------------
export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Get temporary verification data
    const tempData = tempEmailVerifications.get(email);
    if (!tempData) {
      return res.status(404).json({ message: 'Email verification not found or expired' });
    }

    // Check if already verified
    if (tempData.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Check OTP validity
    if (tempData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check OTP expiration
    if (tempData.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Mark as verified
    tempData.verified = true;
    tempEmailVerifications.set(email, tempData);

    res.status(200).json({
      message: 'Email verified successfully',
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ------------------ STEP 5: CREATE ACCOUNT (NEW) ------------------
export const createAccount = async (req, res) => {
  console.log('🔔 [createAccount] called with:', req.body);
  try {
    const { name, email, password, role } = req.body;
    
    // Check if email was pre-verified
    const tempData = tempEmailVerifications.get(email);
    if (!tempData || !tempData.verified) {
      return res.status(400).json({ message: 'Email not verified' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (already verified)
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Employee',
      isVerified: true, // Already verified via email OTP
      otp: undefined,
      otpExpires: undefined
    });

    await user.save();
    console.log('➡️ Sending welcome email to', user.email);
    await sendWelcomeEmail(user.email, user.name);
    console.log('✅ Welcome email sent to', user.email);

    // Clean up temporary data
    tempEmailVerifications.delete(email);

    res.status(201).json({ 
      message: 'Account created successfully',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ================== KEEP ALL YOUR EXISTING FUNCTIONS ==================

// ------------------ SIGNUP (EXISTING - Keep for backward compatibility) ------------------
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'User already exists and is verified' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    if (existingUser && !existingUser.isVerified) {
      // Update existing unverified user
      existingUser.name = name;
      existingUser.password = hashedPassword;
      existingUser.role = role || 'Employee';
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
      
      // Send OTP email
      await sendOTPEmail(email, otp, name);
      
      return res.status(201).json({ 
        message: 'OTP sent successfully. Please verify your email.',
        userId: existingUser._id,
        email: existingUser.email
      });
    } else {
      // Create new user (unverified)
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: role || 'Employee',
        otp,
        otpExpires,
        isVerified: false
      });

      await user.save();

      // Send OTP email
      await sendOTPEmail(email, otp, name);

      res.status(201).json({ 
        message: 'OTP sent successfully. Please verify your email.',
        userId: user._id,
        email: user.email
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ------------------ VERIFY OTP ------------------
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Check OTP validity
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Check OTP expiration
    if (user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    console.log('➡️ Sending welcome email to', user.email);
    await sendWelcomeEmail(user.email, user.name);
    console.log('✅ Welcome email sent to', user.email);

    res.status(200).json({
      message: 'Email verified successfully. Account created!',
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ------------------ RESEND OTP ------------------
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update user
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, user.name);

    res.status(200).json({ 
      message: 'New OTP sent successfully. Please check your email.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ------------------ LOGIN ------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // BYPASS: Allow default SuperAdmin to login without verification
    if (!user.isVerified && user.email !== 'superadmin@incorgroup.com') {
      console.log(`🔄 User ${email} not verified, generating new OTP...`);
      
      // Generate new OTP
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Update user with new OTP
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      console.log(`📧 Sending OTP ${otp} to ${email}...`);
      
      // Send OTP email
      try {
        await sendOTPEmail(email, otp, user.name);
        console.log(`✅ OTP email sent successfully to ${email}`);
      } catch (emailError) {
        console.error('❌ Failed to send OTP email:', emailError);
        return res.status(500).json({ message: 'Failed to send verification email' });
      }

      return res.status(400).json({
        message: 'Your account is not verified. We have sent a new verification code to your email.',
        needsVerification: true,
        email: user.email,
        userName: user.name
      });
    }

    // Generate JWT token for verified users (or SuperAdmin)
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ------------------ FORGOT PASSWORD ------------------
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    await sendResetEmail(email, resetLink);

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error("🔴 Forgot password error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ------------------ RESET PASSWORD ------------------
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error("🔴 Reset password error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ------------------ CHANGE PASSWORD ------------------
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    try {
      await sendPasswordChangedEmail(user.email);
    } catch (err) {
      console.error('Failed to send password changed email:', err);
    }

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error("🔴 Change password error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ------------------ GET PROFILE ------------------
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error("🔴 Get profile error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ------------------ UPDATE PROFILE ------------------
export const updateProfile = async (req, res) => {
  try {
    const { name, gender, dob } = req.body;
    const updateData = { name, gender, dob };
    
    if (req.file) {
      updateData.picture = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error("🔴 Update profile error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};