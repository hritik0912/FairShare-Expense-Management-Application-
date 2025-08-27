// pages/GroupPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
import { getGroupDetails, getExpensesForGroup, addExpense } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const GroupPage = () => {
    const { groupId } = useParams();
    const { user } = useAuth();

    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the "Add Expense" form
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const groupRes = await getGroupDetails(groupId);
                setGroup(groupRes.data);

                const expensesRes = await getExpensesForGroup(groupId);
                setExpenses(expensesRes.data);

            } catch (err) {
                setError('Could not fetch group details.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [groupId]);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!description || !amount) {
            alert('Please fill out all fields.');
            return;
        }

        // For an equal split, we calculate each person's share
        const amountPerMember = (parseFloat(amount) / group.members.length).toFixed(2);
        const splits = group.members.map(member => ({
            user: member._id,
            amount: amountPerMember
        }));

        const expenseData = {
            description,
            amount: parseFloat(amount),
            group: groupId,
            splitType: 'equal',
            splits
        };

        try {
            const { data } = await addExpense(expenseData);
             // The backend should return the fully populated expense object
            const newExpense = {
                ...data,
                paidBy: { _id: user._id, name: user.name },
                splits: data.splits.map(split => ({
                    ...split,
                    user: group.members.find(m => m._id === split.user)
                }))
            };
            setExpenses([newExpense, ...expenses]);
            setDescription('');
            setAmount('');
        } catch (err) {
            setError('Failed to add expense.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!group) return <p>Group not found.</p>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Expenses</h3>
                        <Link to={`/balances/${groupId}`} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                            Simplify Debts
                        </Link>
                    </div>
                     {expenses.length === 0 ? (
                        <p>No expenses yet. Add one to get started!</p>
                    ) : (
                        <ul>
                            {expenses.map(expense => (
                                <li key={expense._id} className="py-3 border-b">
                                    <p className="font-medium">{expense.description}</p>
                                    <p className="text-sm text-gray-600">
                                        ${parseFloat(expense.amount).toFixed(2)} paid by {expense.paidBy.name === user.name ? 'you' : expense.paidBy.name}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div>
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Members</h3>
                    <ul>
                        {group.members.map(member => (
                            <li key={member._id} className="py-1">{member.name}</li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Add an Expense</h3>
                    <form onSubmit={handleAddExpense}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button type="submit" className="w-full mt-2 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-300">
                            Add Expense
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GroupPage;
