// server/routes/authRoutes.js

import express from 'express';
import multer from 'multer';
import {
  login,
  signup,
  verifyOTP,         // Keep existing
  resendOTP,         // Keep existing
  sendEmailOTP,      // ADD THIS NEW FUNCTION
  verifyEmailOTP,    // ADD THIS NEW FUNCTION
  createAccount,     // ADD THIS NEW FUNCTION
  changePassword,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js'; // Make sure this path is correct

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
});

// ----------------- AUTH ROUTES -----------------
router.post('/login', login);
router.post('/signup', signup);                   // Keep existing
router.post('/verify-otp', verifyOTP);            // Keep existing
router.post('/resend-otp', resendOTP);            // Keep existing

// ADD THESE NEW ROUTES FOR STEP-BY-STEP SIGNUP:
router.post('/send-email-otp', sendEmailOTP);     // NEW: Step 3 - Send OTP
router.post('/verify-email-otp', verifyEmailOTP); // NEW: Step 3 - Verify OTP  
router.post('/create-account', createAccount);    // NEW: Step 5 - Create Account

router.post('/change-password', protect, changePassword);

// profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('picture'), updateProfile);

export default router;
