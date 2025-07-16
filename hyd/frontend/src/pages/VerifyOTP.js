import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get email from location state
  const email = location.state?.email;
  const userName = location.state?.userName;

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Use the old verify-otp endpoint for unverified users
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        email,
        otp
      });

      // Show success message
      setVerificationSuccess(true);
      setMessage('🎉 Account verified successfully! You can now login with your credentials.');
      
      // Redirect to login after showing success message
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Account verified successfully! Please login with your credentials.',
            email: email
          }
        });
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setMessage('');
    setError('');

    try {
      // Use the old resend-otp endpoint for unverified users
      await axios.post('http://localhost:5000/api/auth/resend-otp', { email });
      setMessage('New OTP sent successfully! Please check your email.');
      setCountdown(60); // 60 second countdown
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #f0f4f8 60%, #c9e7fa 100%)',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        background: 'rgba(255,255,255,0.97)',
        padding: '40px 32px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(2px)',
        textAlign: 'center'
      }}>
        {!verificationSuccess ? (
          <>
            <h2 style={{
              marginBottom: '20px',
              color: '#1976d2',
              fontWeight: 700,
              fontSize: '28px'
            }}>
              📧 Verify Your Email
            </h2>
            
            <p style={{
              marginBottom: '30px',
              color: '#666',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              We've sent a 6-digit verification code to<br />
              <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerifyOTP}>
              <div style={{
                marginBottom: '25px'
              }}>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    fontSize: '24px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    border: '2px solid #e1e5e9',
                    fontFamily: 'monospace',
                    letterSpacing: '8px',
                    boxSizing: 'border-box',
                    background: '#f8fafc'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                style={{
                  width: '100%',
                  padding: '15px',
                  background: (loading || otp.length !== 6) 
                    ? '#ccc' 
                    : 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 600,
                  cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer',
                  marginBottom: '20px'
                }}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            {/* Resend OTP Button */}
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={handleResendOTP}
                disabled={resendLoading || countdown > 0}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: countdown > 0 ? '#ccc' : '#1976d2',
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  textDecoration: 'underline'
                }}
              >
                {resendLoading ? 'Sending...' : 
                 countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>

            <p style={{
              color: '#666',
              fontSize: '14px',
              marginTop: '20px'
            }}>
              Didn't receive the email? Check your spam folder or click resend.
            </p>
          </>
        ) : (
          // Success Screen
          <>
            <div style={{
              marginBottom: '30px'
            }}>
              <div style={{
                fontSize: '64px',
                marginBottom: '20px'
              }}>
                ✅
              </div>
              <h2 style={{
                marginBottom: '20px',
                color: '#28a745',
                fontWeight: 700,
                fontSize: '28px'
              }}>
                Verification Successful!
              </h2>
              <p style={{
                color: '#666',
                fontSize: '16px',
                lineHeight: '1.5'
              }}>
                Your account has been successfully verified.<br />
                You can now login with your credentials.
              </p>
            </div>

            <div style={{
              padding: '15px',
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{
                margin: 0,
                color: '#155724',
                fontSize: '14px',
                fontWeight: 500
              }}>
                🎉 Welcome to INCOR Group! Redirecting to login page...
              </p>
            </div>

            <button
              onClick={() => navigate('/login', {
                state: {
                  message: 'Account verified successfully! Please login with your credentials.',
                  email: email
                }
              })}
              style={{
                width: '100%',
                padding: '15px',
                background: 'linear-gradient(90deg, #28a745 60%, #1e7e34 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Continue to Login
            </button>
          </>
        )}

        {message && !verificationSuccess && (
          <div style={{
            padding: '12px',
            background: '#d4edda',
            color: '#155724',
            borderRadius: '6px',
            marginBottom: '15px'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '6px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyOTP;