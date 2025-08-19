import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  text: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

const Issue = mongoose.model('Issue', issueSchema);
export default Issue;
