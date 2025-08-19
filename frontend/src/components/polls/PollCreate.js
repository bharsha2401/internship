import React, { useState } from "react";
import axios from "axios";

const PollCreate = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const addOption = () => setOptions([...options, ""]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const createdBy = localStorage.getItem("userId");
    try {
      await axios.post("http://localhost:5000/api/polls/create", {
        question,
        options,
        createdBy
      }, {
        headers: { role: localStorage.getItem("role") }
      });
      alert("Poll created!");
      setQuestion("");
      setOptions(["", ""]);
    } catch (err) {
      alert(err.response?.data?.error || "Error creating poll");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Create a Poll</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
        />
        {options.map((opt, idx) => (
          <input
            key={idx}
            placeholder={`Option ${idx + 1}`}
            value={opt}
            onChange={(e) => handleOptionChange(idx, e.target.value)}
            required
            style={{ width: "100%", marginBottom: "10px", padding: "10px" }}
          />
        ))}
        <button type="button" onClick={addOption} style={{ marginRight: "10px" }}>Add Option</button>
        <button type="submit">Create Poll</button>
      </form>
    </div>
  );
};

export default PollCreate;
