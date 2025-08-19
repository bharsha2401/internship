import RoleRequest from '../models/RoleRequest.js';
import User from '../models/User.js';

// Create a role upgrade request
export const createRoleRequest = async (req, res) => {
  try {
    console.log('Creating role request...');
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);
    
    const { requestedRole, reason } = req.body;
    const userId = req.user._id;
    const currentRole = req.user.role;

    console.log('User ID:', userId);
    console.log('Current Role:', currentRole);
    console.log('Requested Role:', requestedRole);

    // Validation: Can't request current role
    if (currentRole === requestedRole) {
      return res.status(400).json({ message: 'You already have this role' });
    }

    // Validation: Role hierarchy (Employee -> Admin -> SuperAdmin)
    const roleHierarchy = { 'Employee': 0, 'Admin': 1, 'SuperAdmin': 2 };
    if (roleHierarchy[requestedRole] <= roleHierarchy[currentRole]) {
      return res.status(400).json({ message: 'You can only request higher roles' });
    }

    // Check for existing pending request
    const existingRequest = await RoleRequest.findOne({
      requestedBy: userId,
      status: 'Pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending role request' });
    }

    // Create new request
    const roleRequest = new RoleRequest({
      requestedBy: userId,
      currentRole,
      requestedRole,
      reason
    });

    console.log('Saving role request:', roleRequest);
    await roleRequest.save();

    res.status(201).json({
      message: 'Role upgrade request submitted successfully',
      request: roleRequest
    });

  } catch (error) {
    console.error('Role request creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's role requests
export const getUserRoleRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await RoleRequest.find({ requestedBy: userId })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);

  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all role requests (SuperAdmin only)
export const getAllRoleRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await RoleRequest.find(filter)
      .populate('requestedBy', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(requests);

  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Review role request (SuperAdmin only)
export const reviewRoleRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNote } = req.body;
    const reviewerId = req.user._id;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const roleRequest = await RoleRequest.findById(id).populate('requestedBy');
    if (!roleRequest) {
      return res.status(404).json({ message: 'Role request not found' });
    }

    if (roleRequest.status !== 'Pending') {
      return res.status(400).json({ message: 'This request has already been reviewed' });
    }

    // Update request status
    roleRequest.status = status;
    roleRequest.reviewedBy = reviewerId;
    roleRequest.reviewedAt = new Date();
    roleRequest.reviewNote = reviewNote;

    await roleRequest.save();

    // If approved, update user's role
    if (status === 'Approved') {
      await User.findByIdAndUpdate(roleRequest.requestedBy._id, {
        role: roleRequest.requestedRole
      });
    }

    res.status(200).json({
      message: `Role request ${status.toLowerCase()} successfully`,
      request: roleRequest
    });

  } catch (error) {
    console.error('Review request error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending role requests count (for dashboard stats)
export const getPendingRequestsCount = async (req, res) => {
  try {
    const count = await RoleRequest.countDocuments({ status: 'Pending' });
    res.status(200).json({ count });
  } catch (error) {
    console.error('Get pending count error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};