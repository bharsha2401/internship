import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [addingComment, setAddingComment] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '', show: false });
  
  // Use ref to track if request is in progress to prevent duplicate calls
  const isRequestInProgress = useRef(false);

  // Show notification helper
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification({ message: '', type: '', show: false });
    }, 4000);
  }, []); // No dependencies needed

  // Memoize fetchIssues to satisfy eslint exhaustive-deps
  const fetchIssues = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isRequestInProgress.current) {
      console.log('Request already in progress, skipping...');
      return;
    }

    try {
      isRequestInProgress.current = true;
      setLoading(true);
      
      console.log('Fetching issues with filters:', { statusFilter, priorityFilter });
      
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/issues/all`, {
        params: {
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
        },
      });
      
      console.log('Issues fetched successfully:', res.data.length, 'issues');
      setIssues(res.data);
    } catch (err) {
      console.error('Error fetching issues:', err);
      showNotification('Failed to load issues. Please try again.', 'error');
    } finally {
      setLoading(false);
      isRequestInProgress.current = false;
    }
  }, [statusFilter, priorityFilter, showNotification]);

  useEffect(() => {
    console.log('Filter changed - fetching issues');
    fetchIssues();
  }, [fetchIssues]);

  const handleStatusChange = async (id, newStatus) => {
    if (updatingStatus[id]) return; // Prevent multiple updates for same issue
    
    try {
      setUpdatingStatus(prev => ({ ...prev, [id]: true }));
      const token = localStorage.getItem('token');
      
      await axios.put(`${process.env.REACT_APP_API_URL}/api/issues/${id}/status`, { status: newStatus }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      showNotification('Issue status updated successfully!', 'success');
      fetchIssues();
    } catch (err) {
      console.error('Error updating status:', err);
      showNotification('Failed to update issue status. Please try again.', 'error');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleAddComment = async () => {
    if (!newComment?.trim() || !selectedIssue || addingComment) return;
    
    try {
      setAddingComment(true);
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (!userId) {
        showNotification('User not authenticated. Please log in again.', 'error');
        return;
      }

      if (!token) {
        showNotification('Authentication token missing. Please log in again.', 'error');
        return;
      }
      
      console.log('Adding comment:', {
        issueId: selectedIssue,
        text: newComment.trim(),
        userId: userId
      });

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/issues/${selectedIssue}/comment`, {
        text: newComment.trim(),
        createdBy: userId,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Comment added successfully:', response.data);
      showNotification('Comment added successfully!', 'success');
      setNewComment('');
      setSelectedIssue(null);
      fetchIssues();
    } catch (err) {
      console.error('Error adding comment:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        issueId: selectedIssue,
        userId: localStorage.getItem('userId')
      });

      let errorMessage = 'Failed to add comment. Please try again.';
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data.message || 'Invalid input. Please check your comment.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Issue not found. Please refresh the page.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Not authorized. Please log in again.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      showNotification(errorMessage, 'error');
    } finally {
      setAddingComment(false);
    }
  };

  const exportExcel = () => {
    try {
      window.open(`${process.env.REACT_APP_API_URL}/api/issues/export/excel`, '_blank');
      showNotification('Excel export initiated!', 'success');
    } catch (err) {
      console.error('Error exporting Excel:', err);
      showNotification('Failed to export Excel file. Please try again.', 'error');
    }
  };

  const exportPdf = () => {
    try {
      window.open(`${process.env.REACT_APP_API_URL}/api/issues/export/pdf`, '_blank');
      showNotification('PDF export initiated!', 'success');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      showNotification('Failed to export PDF file. Please try again.', 'error');
    }
  };

  return (
    <div style={contentContainerStyle}>
      {/* Notification */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          borderRadius: '8px',
          background: notification.type === 'success' ? '#4caf50' : 
                     notification.type === 'error' ? '#f44336' : '#2196f3',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontWeight: 600,
          maxWidth: '400px',
          wordWrap: 'break-word'
        }}>
          {notification.message}
        </div>
      )}
      
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
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px',
            fontSize: '18px',
            color: '#1976d2'
          }}>
            ⏳ Loading issues...
          </div>
        ) : issues.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px',
            fontSize: '18px',
            color: '#666'
          }}>
            📋 No issues found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', width: '100%' }}>
            {issues.map((issue) => (
            <div
              key={issue._id}
              style={issueCardStyle}
            >
              <h3 style={{ color: '#1976d2', marginBottom: '8px', fontWeight: 700 }}>{issue?.title || 'Untitled Issue'}</h3>
              <p style={{ color: '#333', marginBottom: '8px' }}>{issue?.description || 'No description available'}</p>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span><strong>Priority:</strong> <span style={{ color: issue?.priority === 'High' ? '#d32f2f' : issue?.priority === 'Medium' ? '#fbc02d' : '#388e3c' }}>{issue?.priority || 'Medium'}</span></span>
                <span>
                  <strong>Status:</strong>
                  <select
                    value={issue?.status || 'Pending'}
                    onChange={(e) => handleStatusChange(issue?._id, e.target.value)}
                    disabled={updatingStatus[issue?._id] || !issue?._id}
                    style={{ 
                      marginLeft: '10px', 
                      padding: '6px 12px', 
                      borderRadius: '6px', 
                      border: '1px solid #bfc9d1', 
                      fontSize: '15px',
                      opacity: updatingStatus[issue?._id] ? 0.6 : 1,
                      cursor: updatingStatus[issue?._id] ? 'not-allowed' : 'pointer'
                    }}
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
                <span>🕒 {issue?.createdAt ? new Date(issue.createdAt).toLocaleString() : 'Unknown date'}</span>
              </div>

              <div style={{ marginTop: '14px', background: '#fff', borderRadius: '8px', padding: '14px', boxShadow: '0 1px 4px rgba(30,64,175,0.04)' }}>
                <h4 style={{ margin: 0, color: '#1a237e', fontWeight: 600 }}>💬 Comments:</h4>
                <ul style={{ margin: '10px 0 0 0', padding: 0, listStyle: 'none' }}>
                  {issue?.comments?.length > 0 ? issue.comments.map((c, idx) => (
                    <li key={idx} style={{ marginBottom: '6px', color: '#333' }}>
                      <strong>{c?.createdBy?.name || 'Anonymous'}:</strong> {c?.text || 'No comment text'} <small style={{ color: '#888' }}>({c?.createdAt ? new Date(c.createdAt).toLocaleString() : 'Unknown date'})</small>
                    </li>
                  )) : (
                    <li style={{ color: '#888', fontStyle: 'italic' }}>No comments yet</li>
                  )}
                </ul>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder="Add comment..."
                    value={selectedIssue === issue?._id ? newComment : ''}
                    onChange={(e) => {
                      if (issue?._id) {
                        setSelectedIssue(issue._id);
                        setNewComment(e.target.value);
                      }
                    }}
                    disabled={addingComment}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #bfc9d1',
                      fontSize: '15px',
                      opacity: addingComment ? 0.6 : 1
                    }}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={addingComment || !newComment?.trim()}
                    style={{
                      padding: '8px 18px',
                      background: addingComment || !newComment?.trim() ? '#ccc' : 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '7px',
                      fontWeight: 600,
                      fontSize: '15px',
                      cursor: addingComment || !newComment?.trim() ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 8px rgba(25,118,210,0.07)'
                    }}
                  >
                    {addingComment ? '⏳' : '➕'}
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewIssues;
