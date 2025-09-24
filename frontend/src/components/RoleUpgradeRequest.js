import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';

const RoleUpgradeRequest = () => {
  const [requestedRole, setRequestedRole] = useState('');
  const [reason, setReason] = useState('');
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const currentRole = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  // Determine available roles to request
  const getAvailableRoles = () => {
    if (currentRole === 'Employee') {
      return [{ value: 'Admin', label: 'Admin' }, { value: 'SuperAdmin', label: 'Super Admin' }];
    } else if (currentRole === 'Admin') {
      return [{ value: 'SuperAdmin', label: 'Super Admin' }];
    }
    return [];
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const res = await apiClient.get('/api/role-requests/my-requests');
      setMyRequests(res.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setMyRequests([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestedRole || !reason.trim()) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await apiClient.post('/api/role-requests/create', {
        requestedRole,
        reason: reason.trim()
      });

      setMessage('Role upgrade request submitted successfully!');
      setRequestedRole('');
      setReason('');
      setShowForm(false);
      fetchMyRequests();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const availableRoles = getAvailableRoles();
  const hasPendingRequest = myRequests.some(req => req.status === 'Pending');

  if (availableRoles.length === 0) {
    return null; // SuperAdmin doesn't need to request upgrades
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      marginBottom: '24px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{
          color: '#1976d2',
          margin: 0,
          fontSize: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🚀 Role Upgrade Request
        </h3>
        {!showForm && !hasPendingRequest && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: 'linear-gradient(90deg, #1976d2 60%, #0d47a1 100%)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            Request Upgrade
          </button>
        )}
      </div>

      {/* Success Message */}
      {message && (
        <div style={{
          padding: '12px',
          background: '#d4edda',
          color: '#155724',
          borderRadius: '6px',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '12px',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '6px',
          marginBottom: '15px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Request Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              Current Role: <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{currentRole}</span>
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              Requested Role: <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <select
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                background: '#f8fafc',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Select Role</option>
              {availableRoles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#333' }}>
              Reason for Request: <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you need this role upgrade..."
              required
              maxLength={500}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '16px',
                background: '#f8fafc',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
            <small style={{ color: '#666' }}>{reason.length}/500 characters</small>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#ccc' : 'linear-gradient(90deg, #28a745 60%, #1e7e34 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setRequestedRole('');
                setReason('');
                setError('');
              }}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* My Requests */}
      <div>
        <h4 style={{ color: '#333', marginBottom: '16px' }}>My Requests</h4>
        {myRequests.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No requests submitted yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {myRequests.map(request => (
              <div
                key={request._id}
                style={{
                  padding: '16px',
                  border: '1px solid #e3e9ee',
                  borderRadius: '8px',
                  background: '#f8fafc'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <strong style={{ color: '#1976d2' }}>
                      {request.currentRole} → {request.requestedRole}
                    </strong>
                    <div style={{
                      display: 'inline-block',
                      marginLeft: '12px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white',
                      background: request.status === 'Pending' ? '#ffc107' :
                                request.status === 'Approved' ? '#28a745' : '#dc3545'
                    }}>
                      {request.status}
                    </div>
                  </div>
                  <small style={{ color: '#666' }}>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <p style={{ color: '#333', margin: '8px 0', fontSize: '14px' }}>
                  <strong>Reason:</strong> {request.reason}
                </p>
                {request.reviewNote && (
                  <p style={{ color: '#666', margin: '8px 0', fontSize: '14px' }}>
                    <strong>Review Note:</strong> {request.reviewNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleUpgradeRequest;