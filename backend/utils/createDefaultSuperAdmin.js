// server/utils/createDefaultSuperAdmin.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const ensureAccount = async ({ email, name, role, plainPassword }) => {
  let user = await User.findOne({ email });
  if (!user) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isVerified: true
    });
    console.log(`✅ Created default ${role}: ${email}`);
  } else {
    // Verify password hash matches expected plain password
    const ok = await bcrypt.compare(plainPassword, user.password || '');
    if (!ok) {
      user.password = await bcrypt.hash(plainPassword, 10);
      await user.save();
      console.log(`🛠️ Repaired password for ${email} (reset to default)`);
    } else {
      console.log(`✅ ${role} already exists & password OK: ${email}`);
    }
    // Ensure verified flag true
    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
      console.log(`🔓 Marked ${email} as verified.`);
    }
  }
  return user;
};

const createDefaultSuperAdmin = async () => {
  const defaults = [
    { email: 'superadmin@incorgroup.com', name: 'Super Admin', role: 'SuperAdmin', plainPassword: 'superadmin123' },
    { email: 'admin@incorgroup.com', name: 'Default Admin', role: 'Admin', plainPassword: 'admin123' },
    { email: 'employee@incorgroup.com', name: 'Default Employee', role: 'Employee', plainPassword: 'employee123' }
  ];

  for (const def of defaults) {
    const user = await ensureAccount(def);
    console.log(`${def.role}:`, { email: def.email, password: def.plainPassword, userId: user._id });
  }
};

export default createDefaultSuperAdmin;
