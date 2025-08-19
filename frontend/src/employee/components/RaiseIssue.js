import React, { useState } from 'react';
import axios from 'axios';

const RaiseIssue = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    const raisedBy = localStorage.getItem('userId');
    try {
    await axios.post(`${process.env.REACT_APP_API_URL}/api/issues/raise`, {
        title, description, priority, raisedBy
      });
      setSuccessMsg('✅ Issue submitted successfully!');
      setTitle('');
      setDescription('');
      setPriority('Medium');
    } catch (err) {
      setErrorMsg('❌ Failed to submit issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0',
        margin: '0'
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(25, 118, 210, 0.13)',
          padding: '40px 24px 32px 24px',
          width: '100%',
          maxWidth: '420px',
          border: '1px solid #e3e9ee',
          position: 'relative',
          margin: '40px 0'
        }}
      >
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: '#1976d2',
          marginBottom: '28px',
          textAlign: 'center',
          letterSpacing: '1px'
        }}>
          🛠️ Raise an Issue
        </h2>
        {successMsg && (
          <div style={{
            background: '#e8f5e9',
            color: '#388e3c',
            borderRadius: '7px',
            padding: '10px 0',
            marginBottom: '18px',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '1.05rem'
          }}>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{
            background: '#ffebee',
            color: '#d32f2f',
            borderRadius: '7px',
            padding: '10px 0',
            marginBottom: '18px',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '1.05rem'
          }}>
            {errorMsg}
          </div>
        )}
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: '100%',
            padding: '14px',
            marginBottom: '18px',
            borderRadius: '8px',
            border: '1.5px solid #e3e9ee',
            fontSize: '1.08rem',
            outline: 'none',
            boxSizing: 'border-box',
            background: '#f8fafc',
            transition: 'border 0.18s'
          }}
          onFocus={e => e.target.style.border = '1.5px solid #1976d2'}
          onBlur={e => e.target.style.border = '1.5px solid #e3e9ee'}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          style={{
            width: '100%',
            padding: '14px',
            marginBottom: '18px',
            borderRadius: '8px',
            border: '1.5px solid #e3e9ee',
            fontSize: '1.08rem',
            outline: 'none',
            resize: 'vertical',
            boxSizing: 'border-box',
            background: '#f8fafc',
            transition: 'border 0.18s'
          }}
          onFocus={e => e.target.style.border = '1.5px solid #1976d2'}
          onBlur={e => e.target.style.border = '1.5px solid #e3e9ee'}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '26px',
            borderRadius: '8px',
            border: '1.5px solid #e3e9ee',
            fontSize: '1.08rem',
            outline: 'none',
            background: '#f8fafc',
            transition: 'border 0.18s'
          }}
          onFocus={e => e.target.style.border = '1.5px solid #1976d2'}
          onBlur={e => e.target.style.border = '1.5px solid #e3e9ee'}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim() || !description.trim()}
          style={{
            width: '100%',
            padding: '15px',
            background: loading ? '#bfc9d1' : 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '1.13rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.18s, box-shadow 0.18s',
            boxShadow: loading ? 'none' : '0 2px 12px rgba(25,118,210,0.08)'
          }}
          onMouseOver={e => {
            if (!loading) e.target.style.background = '#1252a2';
          }}
          onMouseOut={e => {
            if (!loading) e.target.style.background = 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)';
          }}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default RaiseIssue;
