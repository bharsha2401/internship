import Issue from '../models/Issue.js';
import XLSX from 'xlsx';
import puppeteer from 'puppeteer';
import mongoose from 'mongoose';
// Get issues raised by a specific user
export const getUserIssues = async (req, res) => {
  try {
    const userId = req.params.userId;
    const issues = await Issue.find({ raisedBy: userId })
      .populate('raisedBy', 'name')
      .populate('comments.createdBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user issues', error: err.message });
  }
};

export const raiseIssue = async (req, res) => {
  try {
    const { title, description, priority, raisedBy } = req.body;
    const issue = new Issue({ title, description, priority, raisedBy });
    await issue.save();
    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Failed to raise issue', error: err.message });
  }
};

export const getAllIssues = async (req, res) => {
  try {
    const { status, priority } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const issues = await Issue.find(filter)
      .populate('raisedBy', 'name')
      .populate('comments.createdBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch issues', error: err.message });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Issue.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, createdBy } = req.body;

    // Validate input
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    if (!createdBy) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Validate issue ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid issue ID format' });
    }

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Find the issue
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Add comment
    issue.comments.push({ 
      text: text.trim(), 
      createdBy: createdBy 
    });
    
    // Save the issue
    await issue.save();

    // Populate the updated issue with user data
    const updatedIssue = await Issue.findById(id)
      .populate('raisedBy', 'name')
      .populate('comments.createdBy', 'name');

    res.status(200).json(updatedIssue);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
};

export const exportIssuesExcel = async (req, res) => {
  try {
    const issues = await Issue.find();
    const data = issues.map(i => ({
      Title: i.title,
      Description: i.description,
      Priority: i.priority,
      Status: i.status,
      RaisedBy: i.raisedBy,
      CreatedAt: i.createdAt
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Issues");

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="issues.xlsx"');
    res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: 'Excel export failed', error: err.message });
  }
};


export const exportIssuesPdf = async (req, res) => {
  try {
    const issues = await Issue.find();
    const html = `
      <h1>Issue Report</h1>
      <ul>
        ${issues.map(i => `
          <li><strong>${i.title}</strong> - ${i.description} [${i.status}]</li>
        `).join('')}
      </ul>
    `;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();
    res.setHeader('Content-Disposition', 'attachment; filename=issues.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: 'PDF export failed', error: err.message });
  }
};
