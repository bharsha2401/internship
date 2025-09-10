import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ViewIssues = () => {
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);

  const fetchIssues = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/issues/all', {
        params: {
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
        },
      });
      setIssues(res.data);
    } catch (err) {
      alert('Failed to load issues');
    }
  };

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter]);

  const handleStatusChange = async (id, newStatus) => {
    await axios.put(`http://localhost:5000/api/issues/${id}/status`, { status: newStatus });
    fetchIssues();
  };

  const handleAddComment = async () => {
    if (!newComment || !selectedIssue) return;
    const userId = localStorage.getItem('userId'); // Or get from auth context
    await axios.post(`http://localhost:5000/api/issues/${selectedIssue}/comment`, {
      text: newComment,
      createdBy: userId,
    });
    setNewComment('');
    setSelectedIssue(null);
    fetchIssues();
  };

  const exportExcel = () => {
    window.open('http://localhost:5000/api/issues/export/excel', '_blank');
  };

  const exportPdf = () => {
    window.open('http://localhost:5000/api/issues/export/pdf', '_blank');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f8fa',
      padding: '0',
      margin: '0'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1000px',
        margin: '40px auto',
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 4px 24px rgba(30,64,175,0.10)',
        padding: '40px 48px',
        minHeight: 'calc(100vh - 120px)',
        boxSizing: 'border-box'
      }}>
        <h2 style={{
          marginBottom: '28px',
          fontSize: '2.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#1976d2',
          fontWeight: 800,
          letterSpacing: '1px'
        }}>
          <span role="img" aria-label="issues">🛠️</span> View Issues
        </h2>
        {issues.map((issue) => (
          <div key={issue._id} style={{
            border: '1px solid #e3e7ee',
            borderRadius: '8px',
            padding: '20px',
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
            <div style={{ display: 'flex', gap: '24px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span>
                <strong>Priority:</strong> <span style={{ color: issue.priority === 'High' ? '#d32f2f' : issue.priority === 'Medium' ? '#fbc02d' : '#388e3c' }}>{issue.priority}</span>
              </span>
              <span>
                <strong>Status:</strong>
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                  style={{ marginLeft: '10px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #bfc9d1', fontSize: '15px' }}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </span>
            </div>
            <p style={{ color: '#666', marginBottom: '8px' }}>
              <strong>Raised By:</strong> {issue.raisedBy?.name || 'Unknown'} | 🕒 {new Date(issue.createdAt).toLocaleString()}
            </p>
            <div style={{ marginTop: '10px' }}>
              <h4 style={{ color: '#1976d2', marginBottom: '6px' }}>💬 Comments:</h4>
              <ul style={{ paddingLeft: '18px', marginBottom: '10px' }}>
                {issue.comments?.map((c, idx) => (
                  <li key={idx} style={{ marginBottom: '6px', color: '#444' }}>
                    <strong>{c.createdBy?.name || 'Anonymous'}:</strong> {c.text} <small style={{ color: '#888' }}>({new Date(c.createdAt).toLocaleString()})</small>
                  </li>
                ))}
              </ul>
              <input
                type="text"
                placeholder="Add comment..."
                value={selectedIssue === issue._id ? newComment : ''}
                onChange={(e) => {
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
                onClick={handleAddComment}
                style={{
                  padding: '8px 18px',
                  background: '#1976d2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '7px',
                  fontWeight: 600,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(25,118,210,0.07)'
                }}
              >
                ➕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewIssues;
