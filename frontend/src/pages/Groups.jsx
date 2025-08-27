// pages/Groups.jsx
import React, { useState, useEffect } from 'react';
import { getGroups, createGroup } from '../services/api';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const { data } = await getGroups();
                setGroups(data);
            } catch (err) {
                setError('Could not fetch groups.');
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!groupName) {
            setError('Group name is required.');
            return;
        }
        try {
            const { data } = await createGroup({ name: groupName, members: [] });
            setGroups([data, ...groups]);
            setGroupName('');
            setError('');
        } catch (err) {
            setError('Could not create group.');
        }
    };

    if (loading) {
        return <div>Loading groups...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Groups</h3>
                    {groups.length === 0 ? (
                        <p>You are not a part of any groups yet.</p>
                    ) : (
                        <ul>
                            {groups.map(group => (
                                <li key={group._id} className="py-3 border-b flex justify-between items-center">
                                    <span>{group.name}</span>
                                    <span className="text-sm text-gray-500">{group.members.length} members</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Create a New Group</h3>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <form onSubmit={handleCreateGroup}>
                        <label className="block text-sm font-medium text-gray-700">Group Name</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="e.g., Apartment Roomies"
                            className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button type="submit" className="w-full mt-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-300">
                            Create Group
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Groups;
