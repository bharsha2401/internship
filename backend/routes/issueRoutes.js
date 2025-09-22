import express from 'express';
import {
  raiseIssue,
  getAllIssues,
  updateIssueStatus,
  addComment,
  exportIssuesExcel,
  exportIssuesPdf
} from '../controllers/issueController.js';
import {
  getUserIssues
} from '../controllers/issueController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/raise', protect, raiseIssue);
router.get('/all', getAllIssues);
router.put('/:id/status', protect, updateIssueStatus);
router.post('/:id/comment', protect, addComment);
router.get('/export/excel', exportIssuesExcel);
router.get('/export/pdf', exportIssuesPdf);
router.get('/user/:userId', protect, getUserIssues);

export default router;
