import nodemailer from 'nodemailer';

// Debug: Log environment variables for email
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***HIDDEN***' : undefined);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 465,
  secure: process.env.EMAIL_SECURE === 'true' || !process.env.EMAIL_SECURE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetEmail = async (to, resetLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password Reset Request - INCOR Group',
    text: `You requested a password reset. Click this link to reset your password: ${resetLink}
    
This link will expire in 1 hour.
    
If you did not request this reset, please ignore this email.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          @media only screen and (max-width: 600px) {
            .email-container {
              padding: 10px !important;
            }
          }
        </style>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div class="email-container" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(90deg, #1976d2 60%, #0d47a1 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🔐 Password Reset</h1>
            <p style="color: #e3f2fd; margin: 10px 0 0 0; font-size: 16px;">INCOR Group Employee Portal</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1976d2; margin: 0 0 20px 0; font-size: 24px;">Hello!</h2>
            <p style="font-size: 16px; margin-bottom: 25px; line-height: 1.6;">
              You requested a password reset for your INCOR Group account. Click the button below to reset your password:
            </p>
            
            <!-- Reset Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background: linear-gradient(90deg, #1976d2 60%, #0d47a1 100%); 
                        color: white; 
                        padding: 15px 35px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        display: inline-block;
                        font-weight: bold;
                        font-size: 16px;
                        box-shadow: 0 4px 15px rgba(25,118,210,0.3);
                        transition: all 0.2s;">
                🔑 Reset My Password
              </a>
            </div>
            
            <!-- Warning -->
            <div style="background: #fff3cd; 
                        border: 1px solid #ffeaa7; 
                        border-radius: 6px; 
                        padding: 15px; 
                        margin: 25px 0;">
              <p style="margin: 0; color: #856404; font-weight: bold;">
                ⚠️ <strong>Important:</strong> This link will expire in 1 hour for security reasons.
              </p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              If you did not request this password reset, please ignore this email and your password will remain unchanged.
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
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully to:', to);
  } catch (err) {
    console.error('❌ Email send error:', err);
    throw err;
  }
};

export const sendPasswordChangedEmail = async (to) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password Changed Successfully - INCOR Group',
    text: 'Your password was recently changed. If you did not perform this action, please contact support immediately.',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(90deg, #28a745 60%, #1e7e34 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">✅ Password Changed</h1>
            <p style="color: #d4edda; margin: 10px 0 0 0; font-size: 16px;">INCOR Group Employee Portal</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px; text-align: center;">
            <h2 style="color: #28a745; margin: 0 0 20px 0; font-size: 24px;">Password Successfully Updated!</h2>
            <p style="font-size: 16px; margin-bottom: 25px; color: #333;">
              Your password for INCOR Group Employee Portal was recently changed.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; padding: 20px; margin: 25px 0;">
              <p style="margin: 0; color: #155724; font-weight: bold;">
                🔒 Your account is now secure with your new password.
              </p>
            </div>
            
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px; padding: 15px; margin: 25px 0;">
              <p style="margin: 0; color: #721c24; font-weight: bold;">
                ⚠️ If you did not make this change, please contact support immediately.
              </p>
            </div>
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
    await transporter.sendMail(mailOptions);
    console.log('✅ Password changed email sent successfully to:', to);
  } catch (err) {
    console.error('❌ Email send error:', err);
    throw err;
  }
};
