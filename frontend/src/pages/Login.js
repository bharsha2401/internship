import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for success message from signup or password reset
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.email) {
        setEmail(location.state.email);
      }
      // Clear the message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    
    try {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const res = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password
      });

      const { token, user } = res.data;

      // Store user data in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('name', user.name);
      localStorage.setItem('email', user.email);

      // Show success message
      setSuccessMessage('Login successful! Redirecting...');

      // Redirect based on role after a short delay
      setTimeout(() => {
        if (user.role === 'SuperAdmin') navigate('/super-admin');
        else if (user.role === 'Admin') navigate('/admin');
        else if (user.role === 'Employee') navigate('/employee');
        else navigate('/');
      }, 1000);
      
    } catch (err) {
      console.error('Login error:', err);
      
      // Check if user needs verification (only for unverified accounts)
      if (err.response?.data?.needsVerification) {
        setError('Account not verified. Verification code sent to your email. Redirecting...');
        console.log('Redirecting to verify OTP with:', {
          email: err.response.data.email,
          userName: err.response.data.userName
        });
        setTimeout(() => {
          navigate('/verify-otp', {
            state: {
              email: err.response.data.email,
              userName: err.response.data.userName || 'User'
            }
          });
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
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
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: 'rgba(255,255,255,0.95)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
        backdropFilter: 'blur(10px)'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '28px',
          color: '#222',
          fontWeight: 700,
          letterSpacing: '1px'
        }}>Login</h2>
        
        {/* Success Message */}
        {successMessage && (
          <div style={{
            padding: '15px',
            background: '#d4edda',
            color: '#155724',
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'center',
            border: '1px solid #c3e6cb'
          }}>
            <strong>✅ {successMessage}</strong>
          </div>
        )}
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
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
          
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                margin: '12px 0',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                background: '#f8fafc',
                paddingRight: '70px',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#ccc' : 'linear-gradient(90deg, #007bff 60%, #0056b3 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '17px',
              fontWeight: 600,
              marginTop: '10px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        
        {error && (
          <div style={{
            padding: '12px',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '6px',
            marginTop: '15px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <div style={{
          textAlign: 'center',
          marginTop: '18px',
          color: '#333',
          fontSize: '15px'
        }}>
          Don't have an account?{' '}
          <span
            style={{
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginLeft: '4px',
              fontWeight: 500
            }}
            onClick={() => navigate('/signup')}
          >
            Sign up
          </span>
        </div>
        
        <div style={{
          textAlign: 'center',
          marginTop: '12px'
        }}>
          <span
            style={{
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;