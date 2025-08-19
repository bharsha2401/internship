import mongoose from 'mongoose';

const roleRequestSchema = new mongoose.Schema({
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentRole: {
    type: String,
    enum: ['Employee', 'Admin', 'SuperAdmin'],
    required: true
  },
  requestedRole: {
    type: String,
    enum: ['Employee', 'Admin', 'SuperAdmin'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNote: {
    type: String
  }
}, {
  timestamps: true
});

// Prevent duplicate pending requests
roleRequestSchema.index({ requestedBy: 1, status: 1 }, { 
  unique: true,
  partialFilterExpression: { status: 'Pending' }
});

export default mongoose.model('RoleRequest', roleRequestSchema);