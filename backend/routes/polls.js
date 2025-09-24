import express from "express";
import Poll from "../models/Polls.js";
import authMiddleware, { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin/SuperAdmin create poll
router.post(
  "/create",
  protect,
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
  protect,
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
  protect,
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

// Vote or change vote (single consolidated route)
router.post(
  "/vote/:pollId/:optionIndex",
  protect,
  authMiddleware(['Employee', 'Admin', 'SuperAdmin']),
  async (req, res) => {
    const { pollId, optionIndex } = req.params;
    // Prefer authenticated user id; fallback to provided body userId for legacy clients
    const userId = req.user?._id?.toString() || req.body.userId;

    try {
      const poll = await Poll.findById(pollId);
      if (!poll) return res.status(404).json({ error: "Poll not found" });

      if (!poll.options[optionIndex]) {
        return res.status(400).json({ error: "Invalid option index" });
      }

      // Remove user from any previous votes
      poll.options.forEach(opt => {
        opt.votes = opt.votes.filter(v => v.toString() !== userId);
      });

      // Add new vote
      poll.options[optionIndex].votes.push(userId);

      await poll.save();
      res.json(poll);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;