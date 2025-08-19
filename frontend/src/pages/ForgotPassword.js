import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Use IP address for mobile compatibility
  const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.0.103:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setMessage(res.data.message || 'Password reset email sent! Check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending reset email.');
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
        }}>Forgot Password</h2>
        
        <form onSubmit={handleSubmit}>
          <label htmlFor="email" style={{ fontWeight: 500, color: '#333' }}>
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              margin: '12px 0',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '16px',
              background: '#f8fafc',
              boxSizing: 'border-box'
            }}
          />
          
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
            {loading ? 'Sending...' : 'Send Reset Email'}
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

export default ForgotPassword;
