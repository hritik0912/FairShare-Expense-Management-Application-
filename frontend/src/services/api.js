// services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add an interceptor to include the auth token in all requests
api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

// --- User Functions ---
export const registerUser = (userData) => {
  return api.post('/users/register', userData);
};

export const loginUser = (userData) => {
  return api.post('/users/login', userData);
};

// --- Group Functions ---
export const getGroups = () => {
    return api.get('/groups');
};

export const createGroup = (groupData) => {
    return api.post('/groups', groupData);
};

export const getGroupDetails = (groupId) => {
    return api.get(`/groups/${groupId}`);
};


// --- Expense Functions ---
export const getExpensesForGroup = (groupId) => {
    return api.get(`/expenses/${groupId}`);
};

export const addExpense = (expenseData) => {
    return api.post('/expenses', expenseData);
};

// --- Balance Functions ---
export const getSimplifiedDebts = (groupId) => {
    return api.get(`/balances/${groupId}`);
};
