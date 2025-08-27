import express from 'express';
import Expense from '../models/expenseModel.js';
import Group from '../models/groupModel.js';
import User from '../models/userModel.js';
import { protect } from '../middleware/authMiddleware.js';
import { simplifyDebts } from '../helpers/debtSimplification.js';

const router = express.Router();

// @desc    Get simplified balances for a group
// @route   GET /api/balances/:groupId
// @access  Private
router.get('/:groupId', protect, async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Ensure the user is a member of the group
        if (!group.members.includes(req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized to view this group' });
        }

        const expenses = await Expense.find({ group: groupId });

        const simplified = simplifyDebts(expenses);
        
        // Populate user details for the response
        const populatedSettlements = await Promise.all(
            simplified.map(async (settlement) => {
                const fromUser = await User.findById(settlement.from).select('name email');
                const toUser = await User.findById(settlement.to).select('name email');
                return {
                    from: fromUser,
                    to: toUser,
                    amount: settlement.amount
                };
            })
        );

        res.json(populatedSettlements);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
