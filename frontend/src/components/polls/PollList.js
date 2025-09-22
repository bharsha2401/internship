import React, { useState, useEffect } from "react";
import apiClient from '../../apiClient';
import { jwtDecode } from 'jwt-decode';

const PollList = () => {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
  apiClient.get('/api/polls/all').then(res => setPolls(res.data));
  }, []);

  const handleVote = async (pollId, optionIndex) => {
    try {
      await apiClient.post(`/api/polls/vote/${pollId}/${optionIndex}`);
      alert("Vote recorded!");
      const res = await apiClient.get('/api/polls/all');
      setPolls(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Error voting");
    }
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Polls</h2>
      {polls.map((poll) => (
        <div key={poll._id} style={{ border: "1px solid #ddd", borderRadius: "8px", margin: "10px 0", padding: "10px" }}>
          <h3>{poll.question}</h3>
          {poll.options.map((opt, idx) => {
            const votes = opt.votes.length;
            const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
            const percent = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
            const userId = getUserIdFromToken();
            const hasVoted = poll.options.some(o => o.votes.includes(userId));
            const votedThisOption = opt.votes.includes(userId);

            return (
              <div key={idx} style={{ marginBottom: "5px" }}>
                <button
                  onClick={() => handleVote(poll._id, idx)}
                  style={{ marginRight: "10px", background: votedThisOption ? '#388e3c' : '#1976d2', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {hasVoted
                    ? (votedThisOption
                        ? (<span>Voted <span title="Edit Vote" style={{ marginLeft: 8, fontSize: '1.1em', opacity: 0.7 }}>✏️ Edit</span></span>)
                        : 'Change Vote')
                    : 'Vote'}
                </button>
                {opt.text} — {votes} votes ({percent}%)
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default PollList;
