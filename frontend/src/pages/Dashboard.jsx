// pages/Dashboard.jsx
import React from 'react';

const Dashboard = () => (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">Total Balance</h3>
                <p className="text-3xl font-bold text-green-500 mt-2">$125.50</p>
                <p className="text-sm text-gray-500">You are owed</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">You Owe</h3>
                <p className="text-3xl font-bold text-red-500 mt-2">$30.00</p>
                <p className="text-sm text-gray-500">Across 2 groups</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700">You Are Owed</h3>
                <p className="text-3xl font-bold text-green-500 mt-2">$155.50</p>
                <p className="text-sm text-gray-500">Across 3 groups</p>
            </div>
        </div>
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <ul>
                <li className="py-3 border-b">You paid $50 for "Groceries" in "Apartment"</li>
                <li className="py-3 border-b">Jane paid you $20 for "Dinner"</li>
                <li className="py-3">You added "Netflix Subscription" to "Family Subs"</li>
            </ul>
        </div>
    </div>
);

export default Dashboard;
