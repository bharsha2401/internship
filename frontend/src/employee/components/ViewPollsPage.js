import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ViewPollsPage = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voteMessage, setVoteMessage] = useState('');

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/polls/all');
      setPolls(res.data);
    } catch {
      setPolls([]);
    }
    setLoading(false);
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.userId || decoded._id || decoded.id || null;
    } catch {
      return null;
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    const userId = getUserIdFromToken();
    setVoteMessage('');
    try {
      await axios.post(
        `http://localhost:5000/api/polls/vote/${pollId}/${optionIndex}`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            role: localStorage.getItem('role')
          }
        }
      );
      setVoteMessage('Vote submitted!');
      fetchPolls();
    } catch (err) {
      setVoteMessage('Failed to submit vote.');
    }
  };

  return (
    <div style={{ margin: '40px auto', maxWidth: '700px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(30,64,175,0.10)', padding: '40px 32px', minHeight: '400px' }}>
      <h2 style={{ color: '#1976d2', marginBottom: '24px', textAlign: 'center' }}>Active Polls</h2>
      {loading ? (
        <p>Loading polls...</p>
      ) : polls.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#888' }}>No polls available.</p>
      ) : (
        polls.map((poll) => {
          const userId = getUserIdFromToken();
          return (
            <div key={poll._id} style={{ marginBottom: '32px', padding: '24px', border: '1px solid #e3e9ee', borderRadius: '10px', background: '#f8fafc' }}>
              <strong style={{ fontSize: '1.15rem', color: '#1976d2' }}>{poll.question}</strong>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '14px' }}>
                {poll.options.map((opt, idx) => {
                  const hasVoted = poll.options.some(o => o.votes.includes(userId));
                  const votedThisOption = opt.votes.includes(userId);
                  return (
                    <li key={idx} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                      <button
                        onClick={() => handleVote(poll._id, idx)}
                        style={{
                          marginRight: '12px',
                          padding: '6px 18px',
                          background: votedThisOption ? '#388e3c' : '#1976d2',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {hasVoted
                          ? (votedThisOption
                              ? (<span>Voted <span title="Edit Vote" style={{ marginLeft: 8, fontSize: '1.1em', opacity: 0.7 }}>✏️ Edit</span></span>)
                              : 'Change Vote')
                          : 'Vote'}
                      </button>
                      <span style={{ fontSize: '1.08rem', color: '#222' }}>{opt.text}</span>
                      <span style={{ marginLeft: 'auto', color: '#1976d2', fontWeight: 600 }}>
                        {opt.votes.length} votes
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}
      <p style={{ color: '#1976d2', textAlign: 'center', marginTop: '18px' }}>{voteMessage}</p>
      {voteMessage && (
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button
            onClick={fetchPolls}
            style={{
              padding: '8px 16px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Refresh Polls
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewPollsPage;
