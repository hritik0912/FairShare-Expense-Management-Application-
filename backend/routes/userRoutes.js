import express from 'express';
import User from '../models/userModel.js';
import Group from '../models/groupModel.js'; // Import Group model
import Invitation from '../models/invitationModel.js'; // Import Invitation model
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Helper function to generate JWT (no changes) ---
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post('/register', async (req, res) => {
  // Now accepting an optional inviteToken
  const { name, email, password, inviteToken } = req.body;

  try {
    // --- INVITATION VALIDATION LOGIC ---
    let invitation = null;
    if (inviteToken) {
      invitation = await Invitation.findOne({ token: inviteToken });

      // Validate the token
      if (!invitation || invitation.status !== 'pending' || invitation.expiresAt < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired invitation token.' });
      }
      // Ensure the email used for registration matches the invited email
      if (invitation.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).json({ message: 'Email does not match the invitation.' });
      }
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      // --- ADD USER TO GROUP IF INVITED ---
      if (invitation) {
        const group = await Group.findById(invitation.group);
        if (group) {
          group.members.push(user._id);
          await group.save();
        }
        // Mark the invitation as accepted
        invitation.status = 'accepted';
        await invitation.save();
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        upiId: user.upiId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// ... (The rest of your userRoutes.js file (/login, /profile GET and PUT) remains the same) ...

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        upiId: user.upiId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      upiId: user.upiId,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.upiId = req.body.upiId !== undefined ? req.body.upiId : user.upiId;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      upiId: updatedUser.upiId,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});


export default router;