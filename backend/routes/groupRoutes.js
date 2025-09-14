import express from 'express';
import crypto from 'crypto'; // Import the crypto library
import Group from '../models/groupModel.js';
import User from '../models/userModel.js';
import Invitation from '../models/invitationModel.js'; // Import the new model
import { protect } from '../middleware/authMiddleware.js';
import { sendInvitationEmail } from '../services/emailService.js'; // Import the email service

const router = express.Router();

// --- (Your existing GET and POST routes for groups remain the same) ---

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, members } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Please provide a name for the group.' });
  }
  try {
    const memberIds = members || [];
    if (!memberIds.includes(req.user._id.toString())) {
      memberIds.push(req.user._id);
    }
    const group = new Group({ name, members: memberIds, createdBy: req.user._id });
    const createdGroup = await group.save();
    res.status(201).json(createdGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all groups for a user
// @route   GET /api/groups
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id }).populate('members', 'name email');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get a single group by ID
// @route   GET /api/groups/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    if (!group.members.some(member => member._id.equals(req.user._id))) {
      return res.status(403).json({ message: 'User not authorized' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});


// --- THIS IS THE NEW ROUTE FOR SENDING INVITATIONS ---
// @desc    Invite a user to a group
// @route   POST /api/groups/:id/invite
// @access  Private
router.post('/:id/invite', protect, async (req, res) => {
  const { email } = req.body;
  const groupId = req.params.id;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    // Check if the person sending the invite is a member of the group
    if (!group.members.includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'You must be a member to invite others.' });
    }

    // SCENARIO 1: The user already exists on FairShare
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (group.members.includes(existingUser._id.toString())) {
        return res.status(400).json({ message: 'User is already a member of this group.' });
      }
      group.members.push(existingUser._id);
      await group.save();
      return res.status(200).json({ message: `${existingUser.name} has been added to the group.` });
    }

    // SCENARIO 2: The user does not exist, send an email invitation
    // Check if an invitation has already been sent recently
    const existingInvite = await Invitation.findOne({ email, group: groupId, status: 'pending' });
    if (existingInvite) {
      return res.status(400).json({ message: 'An invitation has already been sent to this email address.' });
    }

    // Generate a secure token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Token expires in 7 days

    // Save the invitation to the database
    const newInvitation = new Invitation({
      email,
      group: groupId,
      invitedBy: req.user._id,
      token: inviteToken,
      expiresAt,
    });
    await newInvitation.save();

    // Send the invitation email
    const inviteLink = `http://localhost:5173/register?inviteToken=${inviteToken}`;
    await sendInvitationEmail(email, group.name, inviteLink);
    
    res.status(200).json({ message: `Invitation sent to ${email}.` });

  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// NOTE: We are replacing the old `/api/groups/:id/members` route with this more robust `/invite` route.
// If you still need the old route, you can keep it, but this new logic handles both existing and new users.

export default router;