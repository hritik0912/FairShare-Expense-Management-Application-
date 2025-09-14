import cron from 'node-cron';
import Subscription from '../models/subscriptionModel.js';
import Expense from '../models/expenseModel.js';
import Group from '../models/groupModel.js';

// This function calculates the next due date based on the billing cycle
const calculateNextDueDate = (currentDueDate, cycle) => {
    const date = new Date(currentDueDate);
    if (cycle === 'monthly') {
        date.setMonth(date.getMonth() + 1);
    } else if (cycle === 'yearly') {
        date.setFullYear(date.getFullYear() + 1);
    } else if (cycle === 'weekly') {
        date.setDate(date.getDate() + 7);
    } else if (cycle === 'daily') {
        date.setDate(date.getDate() + 1);
    }
    return date;
};

// --- THIS WRAPPER IS THE FIX ---
// We are re-adding the export for the function that index.js calls.
export const startSubscriptionProcessor = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running subscription processor cron job...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        try {
            const dueSubscriptions = await Subscription.find({ nextDueDate: { $lte: today } });

            for (const sub of dueSubscriptions) {
                // Only create an expense if the subscription is linked to a group
                if (sub.group) {
                    const group = await Group.findById(sub.group);
                    if (!group) continue;

                    const amountPerMember = (sub.amount / group.members.length).toFixed(2);
                    const splits = group.members.map(memberId => ({
                        user: memberId,
                        amount: amountPerMember,
                    }));
                    
                    await Expense.create({
                        description: `Subscription: ${sub.name}`,
                        amount: sub.amount,
                        group: sub.group,
                        paidBy: sub.owner,
                        splitType: 'equal',
                        splits: splits,
                    });
                    
                    console.log(`Processed subscription expense for: ${sub.name}`);
                }

                // Always update the next due date for every subscription
                sub.nextDueDate = calculateNextDueDate(sub.nextDueDate, sub.billingCycle);
                await sub.save();
            }
        } catch (error) {
            console.error('Error processing subscriptions:', error);
        }
    });
};