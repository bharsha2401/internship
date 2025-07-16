import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: String,
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [optionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

const Poll = mongoose.model("Poll", pollSchema);

export default Poll;
