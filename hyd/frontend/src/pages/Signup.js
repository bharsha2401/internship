// client/src/pages/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Countdown timer for resend OTP
  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // STEP 3: Send OTP function - only requires name and email
  const handleSendOTP = async () => {
    if (!formData.name || !formData.email) {
      setError('Please fill in your name and email first');
      return;
    }

    setOtpLoading(true);
    setError('');
    setMessage('');

    try {
      // Send OTP for email verification (don't create account yet)
      await axios.post('http://localhost:5000/api/auth/send-email-otp', {
        name: formData.name,
        email: formData.email
      });

      setMessage('OTP sent successfully! Please check your email.');
      setOtpSent(true);
      setCountdown(60);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // STEP 3: Verify OTP function
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await axios.post('http://localhost:5000/api/auth/verify-email-otp', {
        email: formData.email,
        otp
      });

      setMessage('✅ Email verified successfully! Now create your password.');
      setEmailVerified(true);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP function
  const handleResendOTP = async () => {
    setOtpLoading(true);
    setError('');
    setMessage('');

    try {
      await axios.post('http://localhost:5000/api/auth/send-email-otp', {
        name: formData.name,
        email: formData.email
      });
      setMessage('New OTP sent successfully! Please check your email.');
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // STEP 5: Final signup function - creates account after email verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!emailVerified) {
      setError('Please verify your email first');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Create account after email verification
      await axios.post('http://localhost:5000/api/auth/create-account', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'Employee'
      });

      setMessage('✅ Account created successfully!');
      
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Account created successfully! Please login with your credentials.',
            email: formData.email
          }
        });
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundImage: 'url("/background.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        background: 'rgba(255,255,255,0.97)',
        padding: '40px 32px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(2px)'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '30px',
          color: '#1976d2',
          fontWeight: 700,
          fontSize: '28px'
        }}>
          👋 Join INCOR Group
        </h2>

        <form onSubmit={handleSubmit}>
          {/* STEP 1: Name Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              Step 1: Full Name <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={emailVerified}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                background: emailVerified ? '#f0f0f0' : '#f8fafc',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* STEP 2: Email Field with Send OTP Button */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              Step 2: Email Address <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={emailVerified}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  background: emailVerified ? '#f0f0f0' : '#f8fafc',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={otpLoading || emailVerified || !formData.email || !formData.name}
                style={{
                  padding: '12px 16px',
                  background: (otpLoading || emailVerified || !formData.email || !formData.name) 
                    ? '#ccc' 
                    : 'linear-gradient(90deg, #28a745 60%, #1e7e34 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: (otpLoading || emailVerified || !formData.email || !formData.name) ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {otpLoading ? 'Sending...' : emailVerified ? '✓ Verified' : 'Send OTP'}
              </button>
            </div>
          </div>

          {/* STEP 3: OTP Input Field - Only show after OTP is sent */}
          {otpSent && !emailVerified && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Step 3: Enter OTP <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e1e5e9',
                    fontSize: '18px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    letterSpacing: '4px',
                    background: '#f8fafc',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  style={{
                    padding: '12px 16px',
                    background: (loading || otp.length !== 6) 
                      ? '#ccc' 
                      : 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              
              {/* Resend OTP Button */}
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={otpLoading || countdown > 0}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: countdown > 0 ? '#ccc' : '#1976d2',
                    cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    textDecoration: 'underline'
                  }}
                >
                  {otpLoading ? 'Sending...' : 
                   countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Password Field - Only show after email verification */}
          {emailVerified && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                Step 4: Create Password <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password (min 6 characters)"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '16px',
                  background: '#f8fafc',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* UPDATED: Submit Button without "Step 5:" */}
          <button
            type="submit"
            disabled={!emailVerified || !formData.password || loading}
            style={{
              width: '100%',
              padding: '15px',
              background: (!emailVerified || !formData.password || loading) 
                ? '#ccc' 
                : 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 600,
              cursor: (!emailVerified || !formData.password || loading) ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {loading ? 'Creating Account...' : 'Complete Signup'}
          </button>
        </form>

        {/* Success Message */}
        {message && (
          <div style={{
            padding: '12px',
            background: message.includes('✅') ? '#d4edda' : '#d1ecf1',
            color: message.includes('✅') ? '#155724' : '#0c5460',
            borderRadius: '6px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '6px',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Login Link */}
        <p style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{
              color: '#1976d2',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
