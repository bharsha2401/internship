import nodemailer from 'nodemailer';

// Debug email configuration
console.log('📧 Booking Email Configuration:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***PROVIDED***' : '❌ MISSING');

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
    console.error('❌ Booking email configuration error:', error);
  } else {
    console.log('✅ Booking email server is ready to send messages');
  }
});

export const sendBookingConfirmation = async (to, roomName, date, startTime, endTime, userName = 'User') => {
  console.log(`📧 Sending booking confirmation to: ${to}`);
  console.log(`🏢 Room: ${roomName}`);
  console.log(`📅 Date: ${date}`);
  console.log(`⏰ Time: ${startTime} - ${endTime}`);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Room Booking Confirmation - INCOR Group',
    text: `Your booking for room "${roomName}" on ${date} from ${startTime} to ${endTime} is confirmed.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Room Booking Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(90deg, #2e7d32 60%, #1b5e20 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🏢 Room Booking Confirmed!</h1>
            <p style="color: #c8e6c9; margin: 10px 0 0 0; font-size: 16px;">INCOR Group Employee Portal</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #2e7d32; margin: 0 0 20px 0; font-size: 24px;">Hello ${userName}!</h2>
            <p style="font-size: 16px; margin-bottom: 25px; line-height: 1.6;">
              Great news! Your room booking has been successfully confirmed. Here are the details:
            </p>
            
            <!-- Booking Details Card -->
            <div style="background: #f8fafc; 
                        border: 2px solid #2e7d32; 
                        border-radius: 12px; 
                        padding: 25px; 
                        margin: 30px 0;">
              <h3 style="margin: 0 0 20px 0; color: #2e7d32; font-size: 20px; text-align: center;">📋 Booking Details</h3>
              
              <div style="display: grid; gap: 15px;">
                <!-- Room Name -->
                <div style="display: flex; align-items: center; padding: 12px; background: #fff; border-radius: 8px; border-left: 4px solid #2e7d32;">
                  <div style="margin-right: 15px; font-size: 24px;">🏢</div>
                  <div>
                    <div style="font-weight: bold; color: #2e7d32; font-size: 14px;">ROOM</div>
                    <div style="font-size: 18px; color: #333; font-weight: bold;">${roomName}</div>
                  </div>
                </div>
                
                <!-- Date -->
                <div style="display: flex; align-items: center; padding: 12px; background: #fff; border-radius: 8px; border-left: 4px solid #1976d2;">
                  <div style="margin-right: 15px; font-size: 24px;">📅</div>
                  <div>
                    <div style="font-weight: bold; color: #1976d2; font-size: 14px;">DATE</div>
                    <div style="font-size: 18px; color: #333; font-weight: bold;">${date}</div>
                  </div>
                </div>
                
                <!-- Time -->
                <div style="display: flex; align-items: center; padding: 12px; background: #fff; border-radius: 8px; border-left: 4px solid #f57c00;">
                  <div style="margin-right: 15px; font-size: 24px;">⏰</div>
                  <div>
                    <div style="font-weight: bold; color: #f57c00; font-size: 14px;">TIME</div>
                    <div style="font-size: 18px; color: #333; font-weight: bold;">${startTime} - ${endTime}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Important Notes -->
            <div style="background: #e8f5e8; 
                        border: 1px solid #4caf50; 
                        border-radius: 8px; 
                        padding: 20px; 
                        margin: 25px 0;">
              <h4 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 18px;">
                📝 Important Notes:
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #2e7d32;">
                <li style="margin-bottom: 8px;">Please arrive on time for your booking</li>
                <li style="margin-bottom: 8px;">Cancel at least 1 hour before if you can't make it</li>
              </ul>
            </div>
            
            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #2e7d32; color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                🎉 Booking Confirmed Successfully!
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
              Need to make changes? Please contact our support team or use the employee portal.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e3e7ee;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated message from INCOR Group Employee Portal<br>
              📧 Email: support@incorgroup.com | 📞 Phone: +1-234-567-8900<br>
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
    console.log('✅ Booking confirmation email sent successfully to:', to);
    console.log('📧 Message ID:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Booking confirmation email send error:', err);
    throw err;
  }
};

export const sendBookingCancellation = async (to, roomName, date, time, userName = 'User') => {
  console.log(`📧 Sending booking cancellation to: ${to}`);
  console.log(`🏢 Room: ${roomName}`);
  console.log(`📅 Date: ${date}`);
  console.log(`⏰ Time: ${time}`);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Room Booking Cancelled - INCOR Group',
    text: `Your booking for room "${roomName}" on ${date} at ${time} has been cancelled.`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Room Booking Cancelled</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(90deg, #d32f2f 60%, #b71c1c 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">❌ Room Booking Cancelled</h1>
            <p style="color: #ffcdd2; margin: 10px 0 0 0; font-size: 16px;">INCOR Group Employee Portal</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #d32f2f; margin: 0 0 20px 0; font-size: 24px;">Hello ${userName}!</h2>
            <p style="font-size: 16px; margin-bottom: 25px; line-height: 1.6;">
              We wanted to inform you that your room booking has been cancelled. Here are the details of the cancelled booking:
            </p>
            
            <!-- Cancelled Booking Details Card -->
            <div style="background: #f8fafc; 
                        border: 2px solid #d32f2f; 
                        border-radius: 12px; 
                        padding: 25px; 
                        margin: 30px 0;">
              <h3 style="margin: 0 0 20px 0; color: #d32f2f; font-size: 20px; text-align: center;">🚫 Cancelled Booking Details</h3>
              
              <div style="display: grid; gap: 15px;">
                <!-- Room Name -->
                <div style="display: flex; align-items: center; padding: 12px; background: #fff; border-radius: 8px; border-left: 4px solid #d32f2f;">
                  <div style="margin-right: 15px; font-size: 24px;">🏢</div>
                  <div>
                    <div style="font-weight: bold; color: #d32f2f; font-size: 14px;">ROOM</div>
                    <div style="font-size: 18px; color: #333; font-weight: bold;">${roomName}</div>
                  </div>
                </div>
                
                <!-- Date -->
                <div style="display: flex; align-items: center; padding: 12px; background: #fff; border-radius: 8px; border-left: 4px solid #1976d2;">
                  <div style="margin-right: 15px; font-size: 24px;">📅</div>
                  <div>
                    <div style="font-weight: bold; color: #1976d2; font-size: 14px;">DATE</div>
                    <div style="font-size: 18px; color: #333; font-weight: bold;">${date}</div>
                  </div>
                </div>
                
                <!-- Time -->
                <div style="display: flex; align-items: center; padding: 12px; background: #fff; border-radius: 8px; border-left: 4px solid #f57c00;">
                  <div style="margin-right: 15px; font-size: 24px;">⏰</div>
                  <div>
                    <div style="font-weight: bold; color: #f57c00; font-size: 14px;">TIME</div>
                    <div style="font-size: 18px; color: #333; font-weight: bold;">${time}</div>
                  </div>
                </div>
                
                <!-- Cancellation Status -->
                <div style="display: flex; align-items: center; padding: 12px; background: #fff; border-radius: 8px; border-left: 4px solid #9c27b0;">
                  <div style="margin-right: 15px; font-size: 24px;">📋</div>
                  <div>
                    <div style="font-weight: bold; color: #9c27b0; font-size: 14px;">STATUS</div>
                    <div style="font-size: 18px; color: #d32f2f; font-weight: bold;">CANCELLED</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Information Box -->
            <div style="background: #fff3e0; 
                        border: 1px solid #ff9800; 
                        border-radius: 8px; 
                        padding: 20px; 
                        margin: 25px 0;">
              <h4 style="margin: 0 0 15px 0; color: #f57c00; font-size: 18px;">
                ℹ️ What happens next?
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #f57c00;">
                <li style="margin-bottom: 8px;">The room slot is now available for other bookings</li>
                <li style="margin-bottom: 8px;">You can make a new booking anytime through the portal</li>
              </ul>
            </div>
            
            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #d32f2f; color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                🔄 Need to Book Again? Use Employee Portal
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
              This cancellation was processed automatically. If you have any questions, please contact our support team.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e3e7ee;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              This is an automated message from INCOR Group Employee Portal<br>
              📧 Email: support@incorgroup.com | 📞 Phone: +1-234-567-8900<br>
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
    console.log('✅ Booking cancellation email sent successfully to:', to);
    console.log('📧 Message ID:', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Booking cancellation email send error:', err);
    throw err;
  }
};