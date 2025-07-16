import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["Employee", "Admin", "SuperAdmin", "employee", "admin", "superadmin"],
    required: true
  },
  password: { type: String, required: true },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  
  // Add these new OTP fields
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },

  // existing fields
  gender: { type: String, enum: ["Male", "Female", "Other"], default: null },
  dob: { type: Date, default: null },
  picture: { type: String, default: "" }
});

export default mongoose.model("User", userSchema);


