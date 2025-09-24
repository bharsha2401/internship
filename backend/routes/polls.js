import express from "express";
import Poll from "../models/Polls.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin/SuperAdmin create poll
router.post(
  "/create",
  authMiddleware(['Admin', 'SuperAdmin']),
  async (req, res) => {
    const { question, options, createdBy } = req.body;
    try {
      const poll = new Poll({
        question,
        options: options.map(text => ({ text, votes: [] })),
        createdBy
      });
      await poll.save();
      res.json(poll);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Everyone can get polls
router.get("/all", async (req, res) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update poll (Admin/SuperAdmin)
router.put(
  "/:id",
  authMiddleware(['Admin', 'SuperAdmin']),
  async (req, res) => {
    const { question, options } = req.body;
    try {
      const poll = await Poll.findById(req.params.id);
      if (!poll) return res.status(404).json({ error: "Poll not found" });
      poll.question = question;
      poll.options = options.map(text => ({ text, votes: [] })); // Reset votes on edit
      await poll.save();
      res.json(poll);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete poll (Admin/SuperAdmin)
router.delete(
  "/:id",
  authMiddleware(['Admin', 'SuperAdmin']),
  async (req, res) => {
    try {
      await Poll.findByIdAndDelete(req.params.id);
      res.json({ message: "Poll deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Vote on a poll (allows editing vote)
router.post(
  "/vote/:pollId/:optionIndex",
  authMiddleware(['Employee', 'Admin', 'SuperAdmin']),
  async (req, res) => {
    const { pollId, optionIndex } = req.params;
    const userId = req.user?._id?.toString() || req.body.userId;

    try {
      const poll = await Poll.findById(pollId);
      if (!poll) return res.status(404).json({ error: "Poll not found" });

      // Remove user's previous vote from all options
      poll.options.forEach(opt => {
        opt.votes = opt.votes.filter(voteId => voteId.toString() !== userId);
      });

      // Add user's vote to the selected option
      poll.options[optionIndex].votes.push(userId);

      await poll.save();
      res.json(poll);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// vote or change vote
router.post(
  "/vote/:pollId/:optionIndex",
  authMiddleware(['Employee', 'Admin', 'SuperAdmin']),
  async (req, res) => {
    const { pollId, optionIndex } = req.params;
    const { userId } = req.body;

    try {
      const poll = await Poll.findById(pollId);
      if (!poll) return res.status(404).json({ error: "Poll not found" });

      // first remove the user from all previous votes
      poll.options.forEach((opt) => {
        opt.votes = opt.votes.filter((voterId) => voterId.toString() !== userId);
      });

      // add their new vote
      poll.options[optionIndex].votes.push(userId);

      await poll.save();
      res.json(poll);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;