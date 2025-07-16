import React, { useState, useEffect } from "react";
import axios from "axios";

const PollResults = () => {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/polls/all")
      .then((res) => setPolls(res.data));
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}>
      <h2>Poll Results</h2>
      {polls.map((poll) => {
        const totalVotes = poll.options.reduce(
          (sum, o) => sum + o.votes.length,
          0
        );
        return (
          <div
            key={poll._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "10px",
              marginBottom: "20px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3>{poll.question}</h3>
            {poll.options.map((opt, idx) => {
              const votes = opt.votes.length;
              const percent =
                totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                  }}
                >
                  <span>{opt.text}</span>
                  <span>
                    {votes} votes ({percent}%)
                  </span>
                </div>
              );
            })}
            <p style={{ fontStyle: "italic", marginTop: "5px" }}>
              Total votes: {totalVotes}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default PollResults;
