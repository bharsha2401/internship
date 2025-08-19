import express from "express";
import User from "../models/User.js";
const router = express.Router();

// get current user settings
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json(user.settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// update user settings
router.put("/:userId", async (req, res) => {
  try {
    const { settings } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { settings },
      { new: true }
    );
    res.json(user.settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
