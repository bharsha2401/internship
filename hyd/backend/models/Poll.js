import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  option: String
});

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  votes: [voteSchema],
  createdAt: { type: Date, default: Date.now }
});

// Fix: Only define model if not already defined
const Poll = mongoose.models.Poll || mongoose.model("Poll", pollSchema);

export default Poll;
