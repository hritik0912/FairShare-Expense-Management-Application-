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

// This cron job is scheduled to run once every day at midnight
export const startSubscriptionProcessor = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('Running subscription processor cron job...');
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to the beginning of the day

        try {
            // Find all subscriptions that are due today or are overdue
            const dueSubscriptions = await Subscription.find({ nextDueDate: { $lte: today } });

            for (const sub of dueSubscriptions) {
                const group = await Group.findById(sub.group);
                if (!group) continue;

                // Create an equal split for the new expense
                const amountPerMember = (sub.amount / group.members.length).toFixed(2);
                const splits = group.members.map(memberId => ({
                    user: memberId,
                    amount: amountPerMember,
                }));

                // Create the new expense
                await Expense.create({
                    description: `Recurring: ${sub.name}`,
                    amount: sub.amount,
                    group: sub.group,
                    paidBy: sub.paidBy,
                    splitType: 'equal',
                    splits: splits,
                });

                // Update the subscription with the next due date
                sub.nextDueDate = calculateNextDueDate(sub.nextDueDate, sub.billingCycle);
                await sub.save();
                
                console.log(`Processed subscription: ${sub.name}`);
            }
        } catch (error) {
            console.error('Error processing subscriptions:', error);
        }
    });
};
