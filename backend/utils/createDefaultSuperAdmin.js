// server/utils/createDefaultSuperAdmin.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const createDefaultSuperAdmin = async () => {
  try {
    const existing = await User.findOne({ email: 'superadmin@incorgroup.com' });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      await User.create({
        name: 'Super Admin',
        email: 'superadmin@incorgroup.com',
        password: hashedPassword,
        role: 'SuperAdmin',
        isVerified: true // <-- Ensure SuperAdmin is always verified
      });
      console.log('✅ Default SuperAdmin created');
    } else {
      console.log('✅ Default SuperAdmin already exists');
    }
  } catch (err) {
    console.error('❌ Error creating default SuperAdmin', err.message);
  }
};

export default createDefaultSuperAdmin;
