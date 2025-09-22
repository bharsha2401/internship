import User from '../models/User.js';

// ✅ GET all users (excluding password)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    console.log('Total users found in database:', users.length);
    
    // Log some sample user data for debugging
    if (users.length > 0) {
      console.log('Sample users:');
      users.slice(0, 5).forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
      });
    }
    
    // Check for potential duplicates
    const emailCounts = {};
    users.forEach(user => {
      emailCounts[user.email] = (emailCounts[user.email] || 0) + 1;
    });
    
    const duplicates = Object.entries(emailCounts).filter(([email, count]) => count > 1);
    if (duplicates.length > 0) {
      console.warn('Found duplicate emails:', duplicates);
    }
    
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      msg: 'Error fetching users',
      error: err.message
    });
  }
};

// ✅ GET unique users count (for dashboard)
export const getUsersCount = async (req, res) => {
  try {
    // Get unique users by email to avoid counting duplicates
    const uniqueUsers = await User.aggregate([
      {
        $group: {
          _id: "$email",
          user: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$user" }
      },
      {
        $project: { password: 0 }
      }
    ]);
    
    console.log('Unique users count:', uniqueUsers.length);
    res.status(200).json({ count: uniqueUsers.length, users: uniqueUsers });
  } catch (err) {
    console.error('Error fetching users count:', err);
    res.status(500).json({
      msg: 'Error fetching users count',
      error: err.message
    });
  }
};

// ✅ Clean up duplicate users (SuperAdmin only)
export const cleanupDuplicateUsers = async (req, res) => {
  try {
    // Find duplicate emails
    const duplicates = await User.aggregate([
      {
        $group: {
          _id: "$email",
          count: { $sum: 1 },
          users: { $push: "$$ROOT" }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    let deletedCount = 0;
    const cleanupResults = [];

    for (const duplicate of duplicates) {
      // Keep the first user (usually the oldest one) and delete the rest
      const [keepUser, ...deleteUsers] = duplicate.users;
      
      for (const userToDelete of deleteUsers) {
        await User.findByIdAndDelete(userToDelete._id);
        deletedCount++;
        cleanupResults.push({
          deleted: userToDelete.name,
          email: userToDelete.email,
          kept: keepUser.name
        });
      }
    }

    console.log('Cleaned up duplicate users:', deletedCount);
    res.status(200).json({ 
      message: `Cleaned up ${deletedCount} duplicate users`,
      deletedCount,
      details: cleanupResults
    });
  } catch (err) {
    console.error('Error cleaning up duplicates:', err);
    res.status(500).json({
      msg: 'Error cleaning up duplicates',
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
