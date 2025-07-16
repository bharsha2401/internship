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
    <div style={{ padding: '30px' }}>
      <h2>🛠️ Manage Issues</h2>

      <div style={{ marginBottom: '20px' }}>
        <label>Status: </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>

        <label style={{ marginLeft: '20px' }}>Priority: </label>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button onClick={exportExcel} style={{ marginLeft: '20px' }}>📥 Export Excel</button>
        <button onClick={exportPdf} style={{ marginLeft: '10px' }}>📄 Export PDF</button>
      </div>

      {issues.map((issue) => (
        <div key={issue._id} style={{
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '15px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>{issue.title}</h3>
          <p>{issue.description}</p>
          <p><strong>Priority:</strong> {issue.priority}</p>
          <p>
            <strong>Status:</strong>
            <select value={issue.status} onChange={(e) => handleStatusChange(issue._id, e.target.value)} style={{ marginLeft: '10px' }}>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
          </p>
          <p><strong>Raised By:</strong> {issue.raisedBy?.name || 'Unknown'} | 🕒 {new Date(issue.createdAt).toLocaleString()}</p>

          <div style={{ marginTop: '10px' }}>
            <h4>💬 Comments:</h4>
            <ul>
              {issue.comments?.map((c, idx) => (
                <li key={idx}>
                  <strong>{c.createdBy?.name || 'Anonymous'}:</strong> {c.text} <small>({new Date(c.createdAt).toLocaleString()})</small>
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
              style={{ width: '80%' }}
            />
            <button onClick={handleAddComment}>➕</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewIssues;
