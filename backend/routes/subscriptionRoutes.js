import express from 'express';
import Subscription from '../models/subscriptionModel.js';
import Group from '../models/groupModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create a new subscription for a group
// @route   POST /api/subscriptions
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, amount, group, billingCycle, nextDueDate } = req.body;

  try {
    const groupExists = await Group.findById(group);
    if (!groupExists) {
      return res.status(404).json({ message: 'Group not found' });
    }
    if (!groupExists.members.includes(req.user._id.toString())) {
      return res.status(403).json({ message: 'User is not a member of this group' });
    }

    const subscription = new Subscription({
      name,
      amount,
      group,
      paidBy: req.user._id, // By default, the creator pays
      billingCycle,
      nextDueDate,
    });

    const createdSubscription = await subscription.save();
    res.status(201).json(createdSubscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all subscriptions for a group
// @route   GET /api/subscriptions/:groupId
// @access  Private
router.get('/:groupId', protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ group: req.params.groupId })
      .populate('paidBy', 'name');
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
