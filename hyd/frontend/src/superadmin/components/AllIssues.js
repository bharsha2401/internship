import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const contentContainerStyle = {
  padding: '40px',
  maxWidth: '1200px',
  margin: '40px auto',
  background: '#f7f8fa',
  minHeight: '100vh',
  boxSizing: 'border-box'
};

const cardStyle = {
  background: '#fff',
  borderRadius: '18px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
  padding: '40px 48px',
  minHeight: 'calc(100vh - 120px)',
  boxSizing: 'border-box',
  border: '1px solid #e3e7ee'
};

const issueCardStyle = {
  border: '1px solid #e3e7ee',
  borderRadius: '12px',
  padding: '24px 28px',
  background: '#f8fafc',
  boxShadow: '0 1px 4px rgba(30,64,175,0.05)',
  width: '100%',
  maxWidth: '100%',
  transition: 'box-shadow 0.18s',
  position: 'relative'
};

const ViewIssues = () => {
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [newComment, setNewComment] = useState('');
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Memoize fetchIssues to satisfy eslint exhaustive-deps
  const fetchIssues = useCallback(async () => {
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
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleStatusChange = async (id, newStatus) => {
    await axios.put(`http://localhost:5000/api/issues/${id}/status`, { status: newStatus });
    fetchIssues();
  };

  const handleAddComment = async () => {
    if (!newComment || !selectedIssue) return;
    const userId = localStorage.getItem('userId');
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
    <div style={contentContainerStyle}>
      <h2
        style={{
          marginBottom: '25px',
          fontSize: '2.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#1976d2',
          fontWeight: 700
        }}
      >
        <span role="img" aria-label="issues">🛠️</span> Manage Issues
      </h2>
      <div style={{
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        flexWrap: 'wrap'
      }}>
        <label>Status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #bfc9d1', fontSize: '15px' }}>
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        <label>Priority:</label>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #bfc9d1', fontSize: '15px' }}>
          <option value="">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button onClick={exportExcel} style={{
          marginLeft: 'auto',
          padding: '8px 18px',
          background: 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '7px',
          fontWeight: 600,
          fontSize: '15px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(25,118,210,0.07)'
        }}>📥 Export Excel</button>
        <button onClick={exportPdf} style={{
          padding: '8px 18px',
          background: 'linear-gradient(90deg, #388e3c 60%, #1b5e20 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '7px',
          fontWeight: 600,
          fontSize: '15px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(56,142,60,0.07)'
        }}>📄 Export PDF</button>
      </div>
      <div style={cardStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', width: '100%' }}>
          {issues.map((issue) => (
            <div
              key={issue._id}
              style={issueCardStyle}
            >
              <h3 style={{ color: '#1976d2', marginBottom: '8px', fontWeight: 700 }}>{issue.title}</h3>
              <p style={{ color: '#333', marginBottom: '8px' }}>{issue.description}</p>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span><strong>Priority:</strong> <span style={{ color: issue.priority === 'High' ? '#d32f2f' : issue.priority === 'Medium' ? '#fbc02d' : '#388e3c' }}>{issue.priority}</span></span>
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
                <span><strong>Raised By:</strong>
                  <span style={{
                    fontWeight: statusFilter ? 'bold' : 'normal',
                    background: statusFilter ? '#e3e9f7' : 'transparent',
                    padding: statusFilter ? '2px 6px' : 0,
                    borderRadius: '5px'
                  }}>
                    {issue.raisedBy?.name || 'Unknown'}
                  </span>
                </span>
                <span>🕒 {new Date(issue.createdAt).toLocaleString()}</span>
              </div>

              <div style={{ marginTop: '14px', background: '#fff', borderRadius: '8px', padding: '14px', boxShadow: '0 1px 4px rgba(30,64,175,0.04)' }}>
                <h4 style={{ margin: 0, color: '#1a237e', fontWeight: 600 }}>💬 Comments:</h4>
                <ul style={{ margin: '10px 0 0 0', padding: 0, listStyle: 'none' }}>
                  {issue.comments?.map((c, idx) => (
                    <li key={idx} style={{ marginBottom: '6px', color: '#333' }}>
                      <strong>{c.createdBy?.name || 'Anonymous'}:</strong> {c.text} <small style={{ color: '#888' }}>({new Date(c.createdAt).toLocaleString()})</small>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder="Add comment..."
                    value={selectedIssue === issue._id ? newComment : ''}
                    onChange={(e) => {
                      setSelectedIssue(issue._id);
                      setNewComment(e.target.value);
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #bfc9d1',
                      fontSize: '15px'
                    }}
                  />
                  <button
                    onClick={handleAddComment}
                    style={{
                      padding: '8px 18px',
                      background: 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewIssues;
