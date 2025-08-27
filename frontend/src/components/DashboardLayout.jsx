// components/DashboardLayout.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-white shadow-md hidden sm:block">
        <div className="p-6">
          <Link to="/dashboard" className="text-2xl font-bold text-indigo-600">FairShare</Link>
        </div>
        <nav className="mt-6">
          <Link to="/dashboard" className="block px-6 py-3 text-gray-700 hover:bg-gray-200">Dashboard</Link>
          <Link to="/groups" className="block px-6 py-3 text-gray-700 hover:bg-gray-200">Groups</Link>
          <Link to="/subscriptions" className="block px-6 py-3 text-gray-700 hover:bg-gray-200">Subscriptions</Link>
          <Link to="/activity" className="block px-6 py-3 text-gray-700 hover:bg-gray-200">Activity</Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b">
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 hidden md:block">Welcome, {user?.name}!</span>
            <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">Logout</button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
