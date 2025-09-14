import express from 'express';
import Expense from '../models/expenseModel.js';
import Group from '../models/groupModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Add a new expense to a group
// @route   POST /api/expenses
// @access  Private
// @desc    Add a new expense to a group
// @route   POST /api/expenses
// @access  Private
router.post('/', protect, async (req, res) => {
  const { description, amount, group, splitType, splits } = req.body;

  try {
    // --- Basic validation ---
    if (!description || !amount || !group) {
      return res.status(400).json({ message: 'Description, amount, and group are required.' });
    }

    const groupExists = await Group.findById(group);
    if (!groupExists) {
      return res.status(404).json({ message: 'Group not found.' });
    }

    // Ensure the user adding the expense is part of the group
    if (!groupExists.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'User is not a member of this group.' });
    }
    
    // --- Custom Split Validation Logic ---
    if (splitType === 'unequal' || splitType === 'percentage') {
      if (!splits || splits.length === 0) {
        return res.status(400).json({ message: 'Splits data is required for this split type.' });
      }

      const splitsTotal = splits.reduce((sum, split) => sum + split.amount, 0);

      // Using Math.round to handle potential floating point inaccuracies with currency
      if (Math.round(splitsTotal * 100) !== Math.round(amount * 100)) {
        return res.status(400).json({ message: 'The sum of the splits does not match the total expense amount.' });
      }
    }
    // For 'equal' split, the logic to create splits will be handled on the frontend

    const newExpense = new Expense({
      description,
      amount,
      group,
      paidBy: req.user._id,
      splitType,
      splits,
    });

    const savedExpense = await newExpense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// @desc    Get all expenses for a specific group
// @route   GET /api/expenses/:groupId
// @access  Private
router.get('/:groupId', protect, async (req, res) => {
    try {
        const expenses = await Expense.find({ group: req.params.groupId })
            .populate('paidBy', 'name email')
            .populate('splits.user', 'name email');
        
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;

