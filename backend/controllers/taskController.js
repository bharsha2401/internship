import Task from "../models/Task.js";
import User from "../models/User.js";

// GET my tasks
export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// GET all tasks (for admin/superadmin)
export const getAllTasks = async (req, res) => {
  try {
    // only allow admins and superadmins
    if (req.user.role === "employee") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const tasks = await Task.find()
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// POST assign a task
export const assignTask = async (req, res) => {
  try {
    const { title, description, assigneeEmail, dueDate } = req.body;

    const assignee = await User.findOne({ email: assigneeEmail });
    if (!assignee) {
      return res.status(404).json({ message: "Assignee not found" });
    }

    // only admin or superadmin can assign
    if (req.user.role === "employee") {
      return res.status(403).json({ message: "Employees cannot assign tasks" });
    }

    const task = new Task({
      title,
      description,
      assignedTo: assignee._id,
      assignedBy: req.user._id,
      dueDate
    });

    await task.save();
    res.status(201).json({ message: "Task assigned successfully", task });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};

// PATCH update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // only the assignee can mark their task complete
    if (req.user._id.toString() !== task.assignedTo.toString()) {
      return res.status(403).json({ message: "You can only update your own tasks" });
    }

    task.status = status;
    await task.save();
    res.json({ message: "Task status updated", task });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
