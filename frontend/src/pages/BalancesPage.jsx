// pages/BalancesPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSimplifiedDebts } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const BalancesPage = () => {
    const { groupId } = useParams();
    const { user } = useAuth();
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBalances = async () => {
            try {
                const { data } = await getSimplifiedDebts(groupId);
                setSettlements(data);
            } catch (err) {
                setError('Could not fetch balances.');
            } finally {
                setLoading(false);
            }
        };
        fetchBalances();
    }, [groupId]);

    if (loading) return <p>Calculating balances...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Simplified Debts</h3>
            {settlements.length === 0 ? (
                <p>All debts are settled in this group!</p>
            ) : (
                <ul>
                    {settlements.map((settlement, index) => (
                        <li key={index} className="py-3 border-b flex items-center space-x-4">
                            <span className="font-medium text-red-600">{settlement.from.name}</span>
                            <span>→</span>
                            <span className="font-medium text-green-600">{settlement.to.name}</span>
                            <span className="ml-auto font-bold text-gray-800">${settlement.amount.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            )}
             <Link to={`/groups/${groupId}`} className="mt-6 inline-block text-indigo-600 hover:underline">
                &larr; Back to Group
            </Link>
        </div>
    );
};

export default BalancesPage;
