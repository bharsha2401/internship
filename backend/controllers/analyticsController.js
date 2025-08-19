import Analytics from "../models/Analytics.js";
import User from "../models/User.js";

export const getEmployeeAnalytics = async (req, res) => {
  try {
    const analytics = await Analytics.findOne({ user: req.user._id }).populate("user", "name email role");
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: "Error fetching employee analytics" });
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    const myAnalytics = await Analytics.findOne({ user: req.user._id }).populate("user", "name email role");
    const employees = await User.find({ role: "employee" });
    const employeeAnalytics = await Analytics.find({ user: { $in: employees.map(e => e._id) } }).populate("user", "name email role");
    res.json({ myAnalytics, employeeAnalytics });
  } catch (err) {
    res.status(500).json({ message: "Error fetching admin analytics" });
  }
};

export const getSuperAdminAnalytics = async (req, res) => {
  try {
    const myAnalytics = await Analytics.findOne({ user: req.user._id }).populate("user", "name email role");
    const admins = await User.find({ role: "admin" });
    const employees = await User.find({ role: "employee" });
    const adminAnalytics = await Analytics.find({ user: { $in: admins.map(a => a._id) } }).populate("user", "name email role");
    const employeeAnalytics = await Analytics.find({ user: { $in: employees.map(e => e._id) } }).populate("user", "name email role");
    res.json({ myAnalytics, adminAnalytics, employeeAnalytics });
  } catch (err) {
    res.status(500).json({ message: "Error fetching superadmin analytics" });
  }
};
