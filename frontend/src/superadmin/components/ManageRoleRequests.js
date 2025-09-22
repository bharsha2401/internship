import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageRoleRequests = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState({});
  const [reviewData, setReviewData] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      const url = statusFilter 
        ? `${process.env.REACT_APP_API_URL}/api/role-requests/all?status=${statusFilter}`
        : `${process.env.REACT_APP_API_URL}/api/role-requests/all`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to fetch role requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId, status) => {
    const reviewNote = reviewData[requestId] || '';

    if (!reviewNote.trim()) {
      setError('Please provide a review note');
      return;
    }

    setReviewLoading({ ...reviewLoading, [requestId]: true });
    setError('');
    setMessage('');

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/role-requests/review/${requestId}`, {
        status,
        reviewNote: reviewNote.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage(`Request ${status.toLowerCase()} successfully!`);
      fetchRequests();
      setReviewData({ ...reviewData, [requestId]: '' });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to review request');
    } finally {
      setReviewLoading({ ...reviewLoading, [requestId]: false });
    }
  };

  const updateReviewNote = (requestId, note) => {
    setReviewData({ ...reviewData, [requestId]: note });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f8fafc 60%, #e3e9f7 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{
          marginBottom: '32px',
          fontSize: '2.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#1976d2',
          fontWeight: 700
        }}>
          <span role="img" aria-label="requests">📋</span> Manage Role Requests
        </h2>

        {/* Success/Error Messages */}
        {message && (
          <div style={{
            padding: '12px',
            background: '#d4edda',
            color: '#155724',
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'center'
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
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Filter */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label style={{ fontWeight: 500, color: '#333' }}>Filter by Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '16px',
              background: '#f8fafc'
            }}
          >
            <option value="">All Requests</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Requests List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            No role requests found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {requests.map(request => (
              <div
                key={request._id}
                style={{
                  border: '1px solid #e3e9ee',
                  borderRadius: '12px',
                  padding: '24px',
                  background: '#f8fafc'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ color: '#1976d2', margin: '0 0 8px 0' }}>
                      {(request.requestedBy?.name || 'Unknown User')} ({request.requestedBy?.email || 'no-email'})
                    </h3>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                      {(request.currentRole || 'N/A')} → {(request.requestedRole || 'N/A')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'white',
                      background: request.status === 'Pending' ? '#ffc107' :
                                request.status === 'Approved' ? '#28a745' : '#dc3545'
                    }}>
                      {request.status || 'Unknown'}
                    </div>
                    <div style={{ color: '#666', fontSize: '14px', marginTop: '4px' }}>
                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '—'}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: '#333' }}>Reason:</strong>
                  <p style={{ color: '#666', margin: '8px 0', lineHeight: 1.5 }}>
                    {request.reason || '—'}
                  </p>
                </div>

                {request.status === 'Pending' ? (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
                        Review Note: <span style={{ color: '#e74c3c' }}>*</span>
                      </label>
                      <textarea
                        value={reviewData[request._id] || ''}
                        onChange={(e) => updateReviewNote(request._id, e.target.value)}
                        placeholder="Provide a reason for your decision..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '16px',
                          background: '#fff',
                          boxSizing: 'border-box',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleReview(request._id, 'Approved')}
                        disabled={reviewLoading[request._id]}
                        style={{
                          background: reviewLoading[request._id] ? '#ccc' : 'linear-gradient(90deg, #28a745 60%, #1e7e34 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          cursor: reviewLoading[request._id] ? 'not-allowed' : 'pointer',
                          fontSize: '16px',
                          fontWeight: 600
                        }}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleReview(request._id, 'Rejected')}
                        disabled={reviewLoading[request._id]}
                        style={{
                          background: reviewLoading[request._id] ? '#ccc' : 'linear-gradient(90deg, #dc3545 60%, #c82333 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          cursor: reviewLoading[request._id] ? 'not-allowed' : 'pointer',
                          fontSize: '16px',
                          fontWeight: 600
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: '16px', padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #e3e9ee' }}>
                    <strong style={{ color: '#333' }}>Review:</strong>
                    <p style={{ color: '#666', margin: '8px 0' }}>
                      {request.reviewNote}
                    </p>
                    <small style={{ color: '#888' }}>
                      Reviewed by: {request.reviewedBy?.name || '—'} on {request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString() : '—'}
                    </small>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRoleRequests;