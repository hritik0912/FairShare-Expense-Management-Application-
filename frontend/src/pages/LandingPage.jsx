// pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4">
        <h1 className="text-6xl md:text-7xl font-extrabold mb-4 animate-fade-in-down">Welcome to <span className="text-yellow-200">FairShare</span></h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-10 tracking-wide animate-fade-in-up">The smartest way to manage shared expenses, effortlessly.</p>
        <div className="flex space-x-6 animate-fade-in-up">
            <Link to="/login" className="px-8 py-4 bg-white text-blue-700 font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 ease-in-out border border-transparent">Login</Link>
            <Link to="/register" className="px-8 py-4 bg-blue-700 text-white font-bold rounded-full shadow-lg hover:bg-blue-800 transform hover:scale-105 transition-all duration-300 ease-in-out border border-white">Register</Link>
        </div>
        {/* The <style jsx> block has been removed! */}
    </div>
);

export default LandingPage;
