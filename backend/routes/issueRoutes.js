import express from 'express';
import {
  raiseIssue,
  getAllIssues,
  updateIssueStatus,
  addComment,
  exportIssuesExcel,
  exportIssuesPdf
} from '../controllers/issueController.js';

const router = express.Router();

router.post('/raise', raiseIssue);
router.get('/all', getAllIssues);
router.put('/:id/status', updateIssueStatus);
router.post('/:id/comment', addComment);
router.get('/export/excel', exportIssuesExcel);
router.get('/export/pdf', exportIssuesPdf);

export default router;
