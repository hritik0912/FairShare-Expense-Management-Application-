import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  Navigate, 
  useParams, 
  useSearchParams 
} from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';

// --- API Service Configuration ---
const API_URL = '/api';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

// --- API Functions ---
const registerUser = (userData) => api.post('/users/register', userData);
const loginUser = (userData) => api.post('/users/login', userData);
const getGroups = () => api.get('/groups');
const createGroup = (groupData) => api.post('/groups', groupData);
const getGroupDetails = (groupId) => api.get(`/groups/${groupId}`);
const getExpensesForGroup = (groupId) => api.get(`/expenses/${groupId}`);
const addExpense = (expenseData) => api.post('/expenses', expenseData);
const getSimplifiedDebts = (groupId) => api.get(`/balances/${groupId}`);
const getMySubscriptions = () => api.get('/subscriptions/mysubscriptions');
const createSubscription = (subscriptionData) => api.post('/subscriptions', subscriptionData);
const uploadReceipt = (formData) => api.post('/receipts/scan', formData, { 
  headers: { 'Content-Type': 'multipart/form-data' } 
});
const getUserProfile = () => api.get('/users/profile');
const updateUserProfile = (userData) => api.put('/users/profile', userData);
const inviteUserToGroup = (groupId, email) => api.post(`/groups/${groupId}/invite`, { email });
const getBalanceSummary = () => api.get('/balances/summary');

// --- Authentication Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// --- Reusable UI Components ---
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans antialiased">
      <aside className="w-64 bg-white border-r hidden sm:block">
        <div className="p-6">
          <Link to="/dashboard" className="text-3xl font-extrabold text-blue-600">
            FairShare
          </Link>
        </div>
        <nav className="mt-6">
          <Link 
            to="/dashboard" 
            className="block px-6 py-3 text-gray-700 hover:bg-blue-50"
          >
            Dashboard
          </Link>
          <Link 
            to="/groups" 
            className="block px-6 py-3 text-gray-700 hover:bg-blue-50"
          >
            Groups
          </Link>
          <Link 
            to="/subscriptions" 
            className="block px-6 py-3 text-gray-700 hover:bg-blue-50"
          >
            Subscriptions
          </Link>
          <Link 
            to="/profile" 
            className="block px-6 py-3 text-gray-700 hover:bg-blue-50"
          >
            My Profile
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 hidden md:block">
              Welcome, <span className="font-semibold">{user?.name}</span>!
            </span>
            <button 
              onClick={handleLogout} 
              className="px-5 py-2 text-sm text-white bg-red-500 rounded-full hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const AuthFormContainer = ({ title, children, error, info }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-3xl font-extrabold text-center text-gray-800">{title}</h2>
      {info && (
        <p className="text-blue-600 text-center bg-blue-50 p-3 rounded-lg">{info}</p>
      )}
      {error && (
        <p className="text-red-600 text-center bg-red-50 p-3 rounded-lg">{error}</p>
      )}
      {children}
    </div>
  </div>
);

const FormInput = ({ label, type, value, onChange, required = true, placeholder = '' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={onChange} 
      required={required} 
      placeholder={placeholder} 
      className="w-full px-4 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
    />
  </div>
);

const SubmitButton = ({ children, onClick, disabled = false }) => (
  <button 
    type="submit" 
    onClick={onClick} 
    disabled={disabled} 
    className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
  >
    {children}
  </button>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg border border-gray-100 ${className}`}>
    {children}
  </div>
);

// --- Pages ---
const LandingPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4">
    <h1 className="text-6xl md:text-7xl font-extrabold mb-4">
      Welcome to <span className="text-yellow-200">FairShare</span>
    </h1>
    <p className="text-xl md:text-2xl text-blue-100 mb-10">
      The smartest way to manage shared expenses, effortlessly.
    </p>
    <div className="flex space-x-6">
      <Link 
        to="/login" 
        className="px-8 py-4 bg-white text-blue-700 font-bold rounded-full shadow-lg hover:bg-gray-100"
      >
        Login
      </Link>
      <Link 
        to="/register" 
        className="px-8 py-4 bg-blue-700 text-white font-bold rounded-full shadow-lg hover:bg-blue-800"
      >
        Register
      </Link>
    </div>
  </div>
);

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginUser({ email, password });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    }
  };

  return (
    <AuthFormContainer title="Login" error={error}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <FormInput 
          label="Email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <FormInput 
          label="Password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <SubmitButton>Login</SubmitButton>
        <p className="text-sm text-center">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </AuthFormContainer>
  );
};

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await registerUser({ name, email, password, inviteToken });
      login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <AuthFormContainer 
      title="Create Account" 
      error={error} 
      info={inviteToken ? "You've been invited to a group! Complete registration to join." : null}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <FormInput 
          label="Full Name" 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <FormInput 
          label="Email" 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <FormInput 
          label="Password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <SubmitButton>Create Account</SubmitButton>
        <p className="text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </AuthFormContainer>
  );
};

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await getBalanceSummary();
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
        // Optionally set an error state here
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (!summary) {
    return <p>Could not load dashboard summary.</p>;
  }

  const totalBalanceColor = summary.totalBalance >= 0 ? 'text-green-600' : 'text-red-600';
  const totalBalanceText = summary.totalBalance >= 0 ? 'You are owed' : 'You owe in total';
  const totalBalanceSign = summary.totalBalance >= 0 ? '' : '-';

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Balance</h3>
          <p className={`text-4xl font-extrabold ${totalBalanceColor} mt-2`}>
            {totalBalanceSign}${Math.abs(summary.totalBalance).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">{totalBalanceText}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">You Owe</h3>
          <p className="text-4xl font-extrabold text-red-600 mt-2">
            ${summary.youOwe.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Across all groups</p>
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">You Are Owed</h3>
          <p className="text-4xl font-extrabold text-green-600 mt-2">
            ${summary.youAreOwed.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Across all groups</p>
        </Card>
      </div>
      {/* You could add a "Recent Activity" section here later */}
    </div>
  );
};

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGroups()
      .then(res => setGroups(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createGroup({ name: groupName });
      setGroups([data, ...groups]);
      setGroupName('');
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  if (loading) return <p className="text-center">Loading groups...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <h3 className="text-xl font-bold mb-4">Your Groups</h3>
          {groups.length === 0 ? (
            <p className="text-gray-500">No groups yet.</p>
          ) : (
            <ul className="divide-y">
              {groups.map(group => (
                <li key={group._id}>
                  <Link 
                    to={`/groups/${group._id}`} 
                    className="flex justify-between items-center py-4 px-3 hover:bg-blue-50 rounded-lg"
                  >
                    <span className="font-semibold text-blue-700 text-lg">
                      {group.name}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {group.members.length} members
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <div>
        <Card>
          <h3 className="text-xl font-bold mb-4">Create New Group</h3>
          <form onSubmit={handleCreateGroup} className="space-y-4 mt-4">
            <FormInput 
              label="Group Name" 
              type="text" 
              value={groupName} 
              onChange={(e) => setGroupName(e.target.value)} 
            />
            <SubmitButton>Create Group</SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
};

const GroupPage = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [customSplits, setCustomSplits] = useState([]);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [expenseError, setExpenseError] = useState('');

  useEffect(() => {
    if (group?.members) {
      const initialSplits = group.members.map(m => ({ 
        user: m._id, 
        name: m.name, 
        amount: 0 
      }));
      setCustomSplits(initialSplits);
    }
  }, [group]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupResponse, expensesResponse] = await Promise.all([
          getGroupDetails(groupId), 
          getExpensesForGroup(groupId)
        ]);
        setGroup(groupResponse.data);
        setExpenses(expensesResponse.data);
      } catch (err) {
        setExpenseError('Failed to load group details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const handleCustomSplitChange = (userId, value) => {
    const numericValue = parseFloat(value) || 0;
    setCustomSplits(customSplits.map(split => 
      split.user === userId ? { ...split, amount: numericValue } : split
    ));
  };

  const customSplitTotal = customSplits.reduce((sum, split) => sum + split.amount, 0);
  const amountFloat = parseFloat(amount) || 0;
  const remainingAmount = amountFloat - customSplitTotal;
  const isCustomSplitValid = Math.abs(remainingAmount) < 0.01;

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setExpenseError('');

    if (!amountFloat || amountFloat <= 0) {
      setExpenseError('Please enter a valid amount.');
      return;
    }

    if (!description.trim()) {
      setExpenseError('Please enter a description.');
      return;
    }

    let expenseData;
    if (splitType === 'equal') {
      const splitAmount = (amountFloat / group.members.length).toFixed(2);
      const splits = group.members.map(m => ({ 
        user: m._id, 
        amount: splitAmount 
      }));
      expenseData = {
        description,
        amount: amountFloat,
        group: groupId,
        splitType: 'equal',
        splits
      };
    } else {
      if (!isCustomSplitValid) {
        setExpenseError('Total does not match amount.');
        return;
      }
      const splits = customSplits.map(({ user, amount }) => ({ user, amount }));
      expenseData = {
        description,
        amount: amountFloat,
        group: groupId,
        splitType,
        splits
      };
    }

    try {
      const { data } = await addExpense(expenseData);
      const newExpense = { 
        ...data, 
        paidBy: data.paidBy || { _id: user._id, name: user.name } 
      };
      setExpenses([newExpense, ...expenses]);
      setDescription('');
      setAmount('');
      setSplitType('equal');
    } catch (err) {
      setExpenseError(err.response?.data?.message || 'Failed to add expense.');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');

    if (!memberEmail.trim()) {
      setInviteError('Please enter an email.');
      return;
    }

    try {
      const { data } = await inviteUserToGroup(groupId, memberEmail);
      setInviteSuccess(data.message);
      setMemberEmail('');
      const groupResponse = await getGroupDetails(groupId);
      setGroup(groupResponse.data);
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to send invite.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!group) return <p>Group not found.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">{group.name} Expenses</h3>
            <div className="flex space-x-3">
              <Link 
                to={`/scan-receipt/${groupId}`} 
                className="px-4 py-2 text-sm text-white bg-green-500 rounded-full hover:bg-green-600"
              >
                Scan Receipt
              </Link>
              <Link 
                to={`/balances/${groupId}`} 
                className="px-4 py-2 text-sm text-white bg-purple-500 rounded-full hover:bg-purple-600"
              >
                Simplify Debts
              </Link>
            </div>
          </div>
          {expenseError && <p className="text-red-600 mb-4">{expenseError}</p>}
          {expenses.length === 0 ? (
            <p className="text-gray-500">No expenses yet.</p>
          ) : (
            <ul className="divide-y">
              {expenses.map(expense => (
                <li key={expense._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-500">
                      Paid by {expense.paidBy?.name}
                    </p>
                  </div>
                  <span className="font-bold">
                    ${parseFloat(expense.amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Members</h3>
          <ul className="space-y-3 mt-4">
            {group.members.map(member => (
              <li key={member._id}>{member.name}</li>
            ))}
          </ul>
          <form onSubmit={handleInviteMember} className="space-y-2 mt-4 pt-4 border-t">
            <FormInput 
              label="Add or Invite Member by Email" 
              type="email" 
              value={memberEmail} 
              onChange={(e) => setMemberEmail(e.target.value)} 
            />
            <p className="text-green-600 text-sm">{inviteSuccess}</p>
            <p className="text-red-600 text-sm">{inviteError}</p>
            <SubmitButton>Add / Invite</SubmitButton>
          </form>
        </Card>
        
        <Card>
          <h3 className="text-xl font-bold mb-4">Add Expense</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <FormInput 
              label="Description" 
              type="text" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
            <FormInput 
              label="Amount" 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium">Split Method</label>
              <div className="flex items-center space-x-4">
                <div>
                  <input 
                    type="radio" 
                    id="equal" 
                    value="equal" 
                    checked={splitType === 'equal'} 
                    onChange={() => setSplitType('equal')} 
                  />
                  <label htmlFor="equal" className="ml-2">Equal</label>
                </div>
                <div>
                  <input 
                    type="radio" 
                    id="unequal" 
                    value="unequal" 
                    checked={splitType === 'unequal'} 
                    onChange={() => setSplitType('unequal')} 
                  />
                  <label htmlFor="unequal" className="ml-2">Unequal</label>
                </div>
              </div>
            </div>
            
            {splitType === 'unequal' && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3 border">
                <h4 className="font-semibold">Enter exact amounts:</h4>
                {customSplits.map((split) => (
                  <div key={split.user} className="flex items-center justify-between">
                    <label htmlFor={`split-${split.user}`}>{split.name}</label>
                    <input 
                      id={`split-${split.user}`}
                      type="number" 
                      placeholder="0.00" 
                      value={split.amount === 0 ? '' : split.amount} 
                      onChange={(e) => handleCustomSplitChange(split.user, e.target.value)} 
                      className="w-24 px-2 py-1 border rounded-md text-right" 
                    />
                  </div>
                ))}
                <div className={`text-sm font-medium text-right ${
                  isCustomSplitValid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {remainingAmount.toFixed(2)} remaining
                </div>
              </div>
            )}
            
            <SubmitButton disabled={splitType !== 'equal' && !isCustomSplitValid}>
              Add Expense
            </SubmitButton>
          </form>
        </Card>
      </div>
    </div>
  );
};

const BalancesPage = () => {
  const { groupId } = useParams();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    getSimplifiedDebts(groupId)
      .then(res => setSettlements(res.data))
      .catch(() => setError('Failed to load balances.'))
      .finally(() => setLoading(false));
  }, [groupId]);

  const generateUpiString = (settlement) => {
    const payeeName = encodeURIComponent(settlement.to.name);
    const amount = settlement.amount.toFixed(2);
    return `upi://pay?pa=${settlement.to.upiId}&pn=${payeeName}&am=${amount}&cu=INR`;
  };

  if (loading) return <p>Calculating...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <Card className="max-w-2xl mx-auto p-8">
        <h3 className="text-2xl font-bold mb-6">Simplified Debts</h3>
        {settlements.length === 0 ? (
          <p className="text-gray-500 text-center py-4">All debts are settled! 🎉</p>
        ) : (
          <ul className="divide-y">
            {settlements.map((settlement, index) => (
              <li key={index} className="py-4 flex items-center justify-between space-x-4">
                <div>
                  <span className="font-semibold text-red-600">{settlement.from.name}</span>
                  <span className="text-gray-500 text-sm mx-2">pays</span>
                  <span className="font-semibold text-green-600">{settlement.to.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-extrabold text-xl">
                    ${settlement.amount.toFixed(2)}
                  </span>
                  {settlement.to.upiId && (
                    <button 
                      onClick={() => setModalData(settlement)} 
                      className="px-3 py-1 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700"
                    >
                      Pay
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link 
          to={`/groups/${groupId}`} 
          className="mt-8 inline-block text-blue-600 hover:underline"
        >
          &larr; Back to Group
        </Link>
      </Card>
      
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl text-center max-w-sm w-full">
            <h3 className="text-xl font-bold">Pay with UPI</h3>
            <p className="mt-2 text-gray-600">
              Scan to pay <span className="font-semibold">${modalData.amount.toFixed(2)}</span> to{' '}
              <span className="font-semibold">{modalData.to.name}</span>.
            </p>
            <div className="p-4 my-6 inline-block">
              <QRCode value={generateUpiString(modalData)} size={200} />
            </div>
            <p className="text-sm text-gray-500 break-all">UPI ID: {modalData.to.upiId}</p>
            <button 
              onClick={() => setModalData(null)} 
              className="mt-6 w-full py-2 font-semibold text-white bg-gray-500 rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [nextDueDate, setNextDueDate] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(''); // Optional group to link

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subsData, groupsData] = await Promise.all([
                    getMySubscriptions(),
                    getGroups()
                ]);
                setSubscriptions(subsData.data);
                setGroups(groupsData.data);
            } catch (error) {
                console.error("Failed to fetch subscriptions or groups", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddSubscription = async (e) => {
        e.preventDefault();
        const subData = { 
            name, 
            amount: parseFloat(amount), 
            group: selectedGroup || null, 
            billingCycle, 
            nextDueDate 
        };
        try {
            const { data } = await createSubscription(subData);
            // Manually add group name to the new subscription for immediate UI update
            const newSubWithOwnerData = { ...data, group: groups.find(g => g._id === selectedGroup) };
            setSubscriptions([...subscriptions, newSubWithOwnerData]);
            // Reset form
            setName(''); setAmount(''); setNextDueDate(''); setSelectedGroup('');
        } catch (error) {
            console.error("Failed to create subscription", error);
        }
    };

    if (loading) return <p>Loading subscriptions...</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <h3 className="text-xl font-bold mb-4">My Subscriptions</h3>
                    {subscriptions.length === 0 ? (
                        <p className="text-gray-500">You haven't added any subscriptions yet.</p>
                    ) : (
                        <ul className="divide-y">
                            {subscriptions.map(sub => (
                                <li key={sub._id} className="py-3">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium">{sub.name} - ${sub.amount.toFixed(2)}</p>
                                        <span className={`px-2 py-1 text-xs rounded-full ${sub.group ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {sub.group ? `Splitting with ${sub.group.name}` : 'Personal'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Next payment on: {new Date(sub.nextDueDate).toLocaleDateString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
            <div>
                <Card>
                    <h3 className="text-xl font-bold mb-4">Add Subscription</h3>
                    <form onSubmit={handleAddSubscription} className="space-y-4">
                        <FormInput label="Name (e.g., Netflix)" type="text" value={name} onChange={e => setName(e.target.value)} />
                        <FormInput label="Amount ($)" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
                            <select value={billingCycle} onChange={e => setBillingCycle(e.target.value)} className="w-full p-2 border rounded-lg">
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                                <option value="weekly">Weekly</option>
                                <option value="daily">Daily</option>
                            </select>
                        </div>
                        <FormInput label="Next Due Date" type="date" value={nextDueDate} onChange={e => setNextDueDate(e.target.value)} />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Split with Group (Optional)</label>
                            <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="w-full p-2 border rounded-lg">
                                <option value="">Don't split (Personal)</option>
                                {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                            </select>
                        </div>
                        <SubmitButton>Add Subscription</SubmitButton>
                    </form>
                </Card>
            </div>
        </div>
    );
};

const ScanReceiptPage = () => {
  const { groupId } = useParams();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [scannedItems, setScannedItems] = useState([]);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleScan = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('receipt', file);
    try {
      const { data } = await uploadReceipt(formData);
      setScannedItems(data.items || []);
    } catch (err) {
      setError('Failed to scan receipt.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateExpense = async () => {
    if (scannedItems.length === 0) return;
    const total = scannedItems.reduce((sum, item) => sum + item.price, 0);
    const description = `Scanned: ${scannedItems.map(i => i.description).join(', ')}`;
    try {
      const { data: groupData } = await getGroupDetails(groupId);
      const splitAmount = (total / groupData.members.length).toFixed(2);
      const splits = groupData.members.map(m => ({ 
        user: m._id, 
        amount: splitAmount 
      }));
      const expenseData = {
        description,
        amount: total,
        group: groupId,
        splitType: 'equal',
        splits
      };
      await addExpense(expenseData);
      navigate(`/groups/${groupId}`);
    } catch (err) {
      setError('Failed to create expense from items.');
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold mb-6">Scan a Receipt</h3>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange} 
        className="mb-4" 
      />
      {preview && (
        <img src={preview} alt="Preview" className="max-h-80 mb-4" />
      )}
      <SubmitButton 
        onClick={handleScan} 
        disabled={isUploading || !file}
      >
        {isUploading ? 'Scanning...' : 'Scan'}
      </SubmitButton>
      {scannedItems.length > 0 && (
        <div className="mt-6">
          <h4 className="text-xl font-bold mb-4">Scanned Items:</h4>
          <ul className="divide-y">
            {scannedItems.map((item, index) => (
              <li key={index} className="py-2 flex justify-between">
                <span>{item.description}</span>
                <span>${item.price.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <SubmitButton onClick={handleCreateExpense} className="mt-4">
            Create Expense
          </SubmitButton>
        </div>
      )}
    </Card>
  );
};

const ProfilePage = () => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getUserProfile();
        setName(data.name);
        setUpiId(data.upiId || '');
      } catch (err) {
        setError('Could not fetch profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const { data } = await updateUserProfile({ name, upiId });
      login(data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <Card className="max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold mb-6">My Profile</h3>
      {error && (
        <p className="p-3 bg-red-100 text-red-700 rounded-md mb-4">{error}</p>
      )}
      {success && (
        <p className="p-3 bg-green-100 text-green-700 rounded-md mb-4">{success}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput 
          label="Full Name" 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <FormInput 
          label="UPI ID" 
          type="text" 
          value={upiId} 
          onChange={(e) => setUpiId(e.target.value)} 
          required={false} 
          placeholder="yourname@bank" 
        />
        <p className="text-sm text-gray-500">
          This UPI ID generates a QR code for others to pay you.
        </p>
        <SubmitButton>Save Changes</SubmitButton>
      </form>
    </Card>
  );
};

// --- Main App Component ---
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout title="Dashboard">
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/groups" 
            element={
              <ProtectedRoute>
                <DashboardLayout title="Groups">
                  <Groups />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/groups/:groupId" 
            element={
              <ProtectedRoute>
                <DashboardLayout title="Group Details">
                  <GroupPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/balances/:groupId" 
            element={
              <ProtectedRoute>
                <DashboardLayout title="Simplified Balances">
                  <BalancesPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/subscriptions" 
            element={
              <ProtectedRoute>
                <DashboardLayout title="Subscriptions">
                  <Subscriptions />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/scan-receipt/:groupId" 
            element={
              <ProtectedRoute>
                <DashboardLayout title="Scan Receipt">
                  <ScanReceiptPage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <DashboardLayout title="My Profile">
                  <ProfilePage />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;