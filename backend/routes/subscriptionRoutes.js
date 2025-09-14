import express from 'express';
import Subscription from '../models/subscriptionModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create a new personal subscription
// @route   POST /api/subscriptions
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, amount, group, billingCycle, nextDueDate } = req.body;

  try {
    const subscription = new Subscription({
      name,
      amount,
      owner: req.user._id,
      group: group || null, // Can be null
      billingCycle,
      nextDueDate,
    });

    const createdSubscription = await subscription.save();
    res.status(201).json(createdSubscription);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all of the logged-in user's subscriptions
// @route   GET /api/subscriptions/mysubscriptions
// @access  Private
router.get('/mysubscriptions', protect, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ owner: req.user._id })
      .populate('group', 'name');
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;