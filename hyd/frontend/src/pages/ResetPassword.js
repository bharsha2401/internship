import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // ✅ Use IP address for mobile compatibility
  const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.0.103:5000';

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }
    
    console.log('Token received:', token);
    
    // Optional: Validate token format (should be 64 characters hex)
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      setError('Invalid token format');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('Submitting to:', `${API_URL}/api/auth/reset-password`);
      const res = await axios.post(`${API_URL}/api/auth/reset-password`, { 
        token, 
        newPassword 
      });
      
      setMessage(res.data.message || 'Password reset successful!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Error resetting password.');
    } finally {
      setLoading(false);
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
        maxWidth: '400px',
        width: '100%',
        background: 'rgba(255,255,255,0.97)',
        padding: '32px 28px 24px 28px',
        borderRadius: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        backdropFilter: 'blur(2px)'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '28px',
          color: '#222',
          fontWeight: 700,
          letterSpacing: '1px'
        }}>Reset Password</h2>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="newPassword" style={{ fontWeight: 500, color: '#333' }}>
            New Password:
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                paddingRight: '50px',
                margin: '12px 0',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                background: '#f8fafc',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          
          <label htmlFor="confirmPassword" style={{ fontWeight: 500, color: '#333' }}>
            Confirm Password:
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                paddingRight: '50px',
                margin: '12px 0',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                background: '#f8fafc',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading 
                ? '#6c757d' 
                : 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '17px',
              fontWeight: 600,
              marginTop: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        {message && (
          <p style={{ 
            color: '#28a745', 
            textAlign: 'center', 
            marginTop: '18px', 
            fontWeight: 500 
          }}>
            {message}
          </p>
        )}
        
        {error && (
          <p style={{ 
            color: '#d32f2f', 
            textAlign: 'center', 
            marginTop: '18px', 
            fontWeight: 500 
          }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
