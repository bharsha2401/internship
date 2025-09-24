import User from '../models/User.js';

// ✅ GET all users (excluding password)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      msg: 'Error fetching users',
      error: err.message
    });
  }
};

// ✅ PUT: Update user role by SuperAdmin
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  console.log('Updating role for user:', id, 'to role:', role);

  const validRoles = ['Employee', 'Admin', 'SuperAdmin'];

  // 🔒 Validate role
  if (!validRoles.includes(role)) {
    return res.status(400).json({
      msg: `Invalid role. Must be one of: ${validRoles.join(', ')}`
    });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      msg: `User role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({
      msg: 'Error updating role',
      error: err.message
    });
  }
};

// Get users whose birthday is today
export const getTodaysBirthdays = async (req, res) => {
  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const users = await User.find({
      dob: { $exists: true, $ne: null }
    });

    const birthdays = users.filter(u => {
      if (!u.dob) return false;
      const dob = new Date(u.dob);
      return dob.getDate() === day && (dob.getMonth() + 1) === month;
    }).map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role
    }));

    res.json(birthdays);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch birthdays', error: err.message });
  }
};
