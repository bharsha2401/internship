import Issue from '../models/Issue.js';
import XLSX from 'xlsx';
import pdf from 'html-pdf';

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

    const issue = await Issue.findById(id);
    issue.comments.push({ text, createdBy });
    await issue.save();

    res.status(200).json(issue);
  } catch (err) {
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
    pdf.create(html).toStream((err, stream) => {
      if (err) return res.status(500).send('PDF generation failed');
      res.setHeader('Content-Disposition', 'attachment; filename=issues.pdf');
      res.setHeader('Content-Type', 'application/pdf');
      stream.pipe(res);
    });
  } catch (err) {
    res.status(500).json({ message: 'PDF export failed', error: err.message });
  }
};
