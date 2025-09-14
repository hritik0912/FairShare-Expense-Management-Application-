import express from 'express';
import Expense from '../models/expenseModel.js';
import Group from '../models/groupModel.js';
import User from '../models/userModel.js';
import { protect } from '../middleware/authMiddleware.js';
import { simplifyDebts } from '../helpers/debtSimplification.js';

const router = express.Router();


// --- THIS IS THE NEW ROUTE ---
// @desc    Get an overall summary of the user's balances across all groups
// @route   GET /api/balances/summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Find all groups the user is a member of
        const userGroups = await Group.find({ members: userId });
        const groupIds = userGroups.map(group => group._id);

        // 2. Find all expenses within those groups
        const allExpenses = await Expense.find({ group: { $in: groupIds } });
        
        // 3. Simplify debts across all expenses
        const simplified = simplifyDebts(allExpenses);

        // 4. Calculate user's total owed and total is_owed amounts
        let youOwe = 0;
        let youAreOwed = 0;
        const userIdString = userId.toString();

        simplified.forEach(settlement => {
            if (settlement.from === userIdString) {
                youOwe += settlement.amount;
            }
            if (settlement.to === userIdString) {
                youAreOwed += settlement.amount;
            }
        });

        const totalBalance = youAreOwed - youOwe;
        
        res.json({
            youOwe,
            youAreOwed,
            totalBalance,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error calculating summary.' });
    }
});


// --- This is your existing route for group-specific balances ---
// @desc    Get simplified balances for a specific group
// @route   GET /api/balances/:groupId
// @access  Private
router.get('/:groupId', protect, async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }
        if (!group.members.includes(req.user._id.toString())) {
            return res.status(403).json({ message: 'Not authorized for this group' });
        }
        const expenses = await Expense.find({ group: groupId });
        const simplified = simplifyDebts(expenses);
        const populatedSettlements = await Promise.all(
            simplified.map(async (settlement) => {
                const fromUser = await User.findById(settlement.from).select('name email');
                const toUser = await User.findById(settlement.to).select('name email upiId');
                return { from: fromUser, to: toUser, amount: settlement.amount };
            })
        );
        res.json(populatedSettlements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;