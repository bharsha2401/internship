import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tasksCompleted: { type: Number, default: 0 },
  issuesRaised: { type: Number, default: 0 },
  bookings: { type: Number, default: 0 },
  announcementsPosted: { type: Number, default: 0 }
});

export default mongoose.model("Analytics", analyticsSchema);
