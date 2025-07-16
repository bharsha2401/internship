import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const pageStyle = {
    backgroundImage: 'url("/background.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    width: '100%',
    margin: 0,
    padding: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
  };

  const boxStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: 'white',
    padding: '40px',
    borderRadius: '8px',
    textAlign: 'center',
    width: '90%',
    maxWidth: '600px'
  };

  const buttonContainer = {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    gap: '15px'
  };

  const buttonStyle = {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  };

  const loginStyle = {
    ...buttonStyle,
    backgroundColor: '#28a745',
    color: 'white'
  };

  const signupStyle = {
    ...buttonStyle,
    backgroundColor: '#007bff',
    color: 'white'
  };

  return (
    <div style={pageStyle}>
      <div style={boxStyle}>
        <h2>Welcome to InCor Group Employee Portal</h2>
        <p>
          This portal is designed to streamline communication and resource
          management within InCor Group. Please login or signup to access the features.
        </p>
        <div style={buttonContainer}>
          <Link 
            to="/login" 
            style={loginStyle}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#218838';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#28a745';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
          >
            Login
          </Link>
          <Link 
            to="/signup" 
            style={signupStyle}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0, 123, 255, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
