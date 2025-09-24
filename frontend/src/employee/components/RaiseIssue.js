import React, { useState, useEffect, useRef } from 'react';
// Centralized API client handles baseURL + Authorization header
import apiClient from '../../apiClient';

const RaiseIssue = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [userIssues, setUserIssues] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const pollTimer = useRef(null);

  const userId = localStorage.getItem('userId');

  // Helper: safe fetch user issues only if userId exists
  const fetchUserIssues = async () => {
    if (!userId) {
      // Avoid spamming backend with /undefined and stop any existing interval
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
      return;
    }
    try {
      const res = await apiClient.get(`/api/issues/user/${userId}`);
      setUserIssues(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Failed to load user issues:', err?.response?.data || err.message);
      // keep existing list rather than blanking to reduce flicker
    }
  };

  useEffect(() => {
    fetchUserIssues();
    // Start polling only if userId exists
    if (userId) {
      pollTimer.current = setInterval(fetchUserIssues, 10000);
    }
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  // Intentionally exclude fetchUserIssues from deps, userId sufficient
  }, [userId]);

  const handleSubmit = async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    if (!userId) {
      setErrorMsg('❌ You must be logged in to raise an issue.');
      setLoading(false);
      return;
    }
    try {
      const payload = { title: title.trim(), description: description.trim(), priority, raisedBy: userId };
      await apiClient.post('/api/issues/raise', payload);
      setSuccessMsg('✅ Issue submitted successfully!');
      setTitle('');
      setDescription('');
      setPriority('Medium');
      // Optimistic refresh
      fetchUserIssues();
    } catch (err) {
      console.error('Issue raise failed:', err?.response?.data || err.message);
      setErrorMsg(err?.response?.data?.message || '❌ Failed to submit issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 72px)',
        background: '#f4f8fb',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
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
      <div
        style={{
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(25, 118, 210, 0.13)',
          padding: '40px 24px 32px 24px',
          width: '100%',
          maxWidth: '600px',
          border: '1px solid #e3e9ee',
          margin: '40px 32px'
        }}
      >
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: '#1976d2',
          marginBottom: '24px',
          textAlign: 'center',
          letterSpacing: '1px'
        }}>
          👀 Your Raised Issues
        </h2>
        <div style={{ textAlign: 'center', marginBottom: '12px', color: '#1976d2', fontWeight: 600 }}>
          Total Issues Raised: {userIssues.length}
        </div>
        {userIssues.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center' }}>No issues raised yet.</p>
        ) : (
          userIssues.map(issue => (
            <div key={issue._id} style={{
              border: '1px solid #e3e9ee',
              borderRadius: '10px',
              padding: '18px',
              marginBottom: '18px',
              background: '#f8fafc',
              boxShadow: '0 2px 8px rgba(30,64,175,0.07)'
            }}>
              <h3 style={{
                color: '#1976d2',
                marginBottom: '8px',
                fontWeight: 700
              }}>{issue.title}</h3>
              <p style={{ color: '#333', marginBottom: '8px' }}>{issue.description}</p>
              <div style={{ display: 'flex', gap: '18px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span>
                  <strong>Priority:</strong> <span style={{ color: issue.priority === 'High' ? '#d32f2f' : issue.priority === 'Medium' ? '#fbc02d' : '#388e3c' }}>{issue.priority}</span>
                </span>
                <span>
                  <strong>Status:</strong> <span style={{ color: '#1976d2' }}>{issue.status}</span>
                </span>
              </div>
              <p style={{ color: '#666', marginBottom: '8px' }}>
                <strong>Created:</strong> {new Date(issue.createdAt).toLocaleString()}
              </p>
              {/* Comments Section */}
              <div style={{ marginTop: '10px' }}>
                <h4 style={{ color: '#1976d2', marginBottom: '6px' }}>💬 Comments:</h4>
                <ul style={{ paddingLeft: '18px', marginBottom: '10px' }}>
                  {issue.comments && issue.comments.length > 0 ? (
                    issue.comments.map((c, idx) => (
                      <li key={idx} style={{ marginBottom: '6px', color: '#444' }}>
                        <strong>{c.createdBy?.name || 'Anonymous'}:</strong> {c.text}
                      </li>
                    ))
                  ) : (
                    <li style={{ color: '#888' }}>No comments yet.</li>
                  )}
                </ul>
                {/* Add comment box for employee */}
                <input
                  type="text"
                  placeholder="Add comment..."
                  value={selectedIssue === issue._id ? newComment : ''}
                  onChange={e => {
                    setSelectedIssue(issue._id);
                    setNewComment(e.target.value);
                  }}
                  style={{
                    width: '80%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '15px',
                    background: '#fff',
                    marginRight: '8px'
                  }}
                />
                <button
                  onClick={async () => {
                    if (!newComment || !selectedIssue) return;
                    if (!userId) return;
                    try {
                      await apiClient.post(`/api/issues/${selectedIssue}/comment`, {
                        text: newComment.trim(),
                        createdBy: userId,
                      });
                    } catch (e) {
                      console.error('Failed to add comment:', e?.response?.data || e.message);
                    }
                    setNewComment('');
                    setSelectedIssue(null);
                    fetchUserIssues(); // <-- Refetch issues to get latest comments
                  }}
                  style={{
                    padding: '8px 18px',
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '7px',
                    fontWeight: 600,
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                >
                  ➕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RaiseIssue;