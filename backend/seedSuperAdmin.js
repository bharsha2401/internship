const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // <-- fix path if needed

// Connect to MongoDB (adjust URI if needed)
mongoose.connect('mongodb+srv://bhvreddy24:yziwSW0WvWJMKVAF@cluster0.t5rhyl6.mongodb.net', {
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

  const hashedPassword = await bcrypt.hash('superadmin123', 10);
  const newUser = new User({
    name: 'Super Admin',
    email,
    password: hashedPassword,
    role: 'SuperAdmin',
    isVerified: true // <-- Ensure verified
  });

  await newUser.save();
  console.log('✅ Super Admin created with email: superadmin@incorgroup.com and password: superadmin123');
  process.exit();
}