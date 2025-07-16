import express from "express";
const router = express.Router();

// simple test route for analytics
router.get("/", (req, res) => {
  res.json({ message: "✅ Analytics route is working!" });
});

export default router;
