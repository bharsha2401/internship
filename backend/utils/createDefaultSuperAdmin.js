// server/utils/createDefaultSuperAdmin.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const createDefaultSuperAdmin = async () => {
  // SuperAdmin
  const superAdminEmail = 'superadmin@incorgroup.com';
  let user = await User.findOne({ email: superAdminEmail });
  if (!user) {
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    user = await User.create({
      name: 'Super Admin',
      email: superAdminEmail,
      password: hashedPassword,
      role: 'SuperAdmin',
      isVerified: true
    });
    console.log('✅ Default SuperAdmin created');
  } else {
    console.log('✅ Default SuperAdmin already exists');
  }
  console.log('SuperAdmin:', { email: superAdminEmail, password: 'superadmin123', userId: user._id });

  // Admin
  const adminEmail = 'admin@incorgroup.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    admin = await User.create({
      name: 'Default Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'Admin',
      isVerified: true
    });
    console.log('✅ Default Admin created');
  } else {
    console.log('✅ Default Admin already exists');
  }
  console.log('Admin:', { email: adminEmail, password: 'admin123', userId: admin._id });

  // Employee
  const employeeEmail = 'employee@incorgroup.com';
  let employee = await User.findOne({ email: employeeEmail });
  if (!employee) {
    const hashedPassword = await bcrypt.hash('employee123', 10);
    employee = await User.create({
      name: 'Default Employee',
      email: employeeEmail,
      password: hashedPassword,
      role: 'Employee',
      isVerified: true
    });
    console.log('✅ Default Employee created');
  } else {
    console.log('✅ Default Employee already exists');
  }
  console.log('Employee:', { email: employeeEmail, password: 'employee123', userId: employee._id });
};

export default createDefaultSuperAdmin;
