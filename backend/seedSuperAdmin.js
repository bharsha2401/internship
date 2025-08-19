const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // <-- fix path if needed

// Connect to MongoDB (adjust URI if needed)
mongoose.connect('mongodb://localhost:27017/employeePortal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  seedSuperAdmin();
}).catch((err) => {
  console.error('Connection error', err);
});

async function seedSuperAdmin() {
  const email = 'superadmin@incorgroup.com';
  const user = await User.findOne({ email });
  if (user) return res.status(400).json({ msg: 'User already exists' });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const newUser = new User({
    name: 'Super Admin',
    email,
    password: hashedPassword,
    role: 'superadmin'
  });

  await newUser.save();
  console.log('✅ Super Admin created with email: superadmin@incorgroup.com and password: admin123');
  process.exit();
}
