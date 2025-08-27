import express from 'express';
import Group from '../models/groupModel.js';
import User from '../models/userModel.js'; // <-- Import User model
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

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

    const group = new Group({
      name,
      members: memberIds,
      createdBy: req.user._id,
    });

    const createdGroup = await group.save();
    const populatedGroup = await Group.findById(createdGroup._id).populate('members', 'name email');
    res.status(201).json(populatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all groups for a user
// @route   GET /api/groups
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
        .populate('members', 'name email')
        .populate('createdBy', 'name');
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
            return res.status(403).json({ message: 'User not authorized to access this group' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Add a member to a group
// @route   PUT /api/groups/:id/members
// @access  Private
router.put('/:id/members', protect, async (req, res) => {
    try {
        const { email } = req.body;
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const userToAdd = await User.findOne({ email });

        if (!userToAdd) {
            return res.status(404).json({ message: 'User with that email not found.' });
        }

        if (group.members.includes(userToAdd._id)) {
            return res.status(400).json({ message: 'User is already a member of this group.' });
        }

        group.members.push(userToAdd._id);
        await group.save();

        const populatedGroup = await Group.findById(req.params.id).populate('members', 'name email');

        res.json(populatedGroup);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


export default router;
