import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Debug email configuration
console.log('📧 Email Configuration:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***PROVIDED***' : '❌ MISSING');

// Create transporter with better error handling
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Generate 6-digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP Email with better logging
export const sendOTPEmail = async (to, otp, userName) => {
  console.log(`📧 Attempting to send OTP to: ${to}`);
  console.log(`🔢 OTP: ${otp}`);
  console.log(`👤 User: ${userName}`);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Email Verification - INCOR Group',
    text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(90deg, #1976d2 60%, #0d47a1 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🔐 Email Verification</h1>
            <p style="color: #e3f2fd; margin: 10px 0 0 0; font-size: 16px;">INCOR Group Employee Portal</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1976d2; margin: 0 0 20px 0; font-size: 24px;">Hello ${userName}!</h2>
            <p style="font-size: 16px; margin-bottom: 25px; line-height: 1.6;">
              Please use the verification code below to complete your email verification:
            </p>
            
            <!-- OTP Code -->
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #f8fafc; 
                          border: 2px solid #1976d2; 
                          border-radius: 12px; 
                          padding: 20px; 
                          display: inline-block;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your Verification Code:</p>
                <h1 style="margin: 0; 
                           color: #1976d2; 
                           font-size: 36px; 
                           font-weight: bold; 
                           letter-spacing: 8px;
                           font-family: 'Courier New', monospace;">
                  ${otp}
                </h1>
              </div>
            </div>
            
            <!-- Warning -->
            <div style="background: #fff3cd; 
                        border: 1px solid #ffeaa7; 
                        border-radius: 6px; 
                        padding: 15px; 
                        margin: 25px 0;">
              <p style="margin: 0; color: #856404; font-weight: bold;">
                ⚠️ <strong>Important:</strong> This code will expire in 10 minutes for security reasons.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you did not request this verification, please ignore this email.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e3e7ee;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated message from INCOR Group Employee Portal<br>
              © ${new Date().getFullYear()} INCOR Group. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully to:', to);
    console.log('📧 Message ID:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ OTP email send error:', err);
    throw err;
  }
};