// App.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate, useParams } from 'react-router-dom';
import axios from 'axios';

// --- API Service Configuration ---
const API_URL = 'http://localhost:5000/api';
const api = axios.create({
  baseURL: API_URL,
});

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
const addMemberToGroup = (groupId, email) => api.put(`/groups/${groupId}/members`, { email });
const getExpensesForGroup = (groupId) => api.get(`/expenses/${groupId}`);
const addExpense = (expenseData) => api.post('/expenses', expenseData);
const getSimplifiedDebts = (groupId) => api.get(`/balances/${groupId}`);
const getSubscriptionsForGroup = (groupId) => api.get(`/subscriptions/${groupId}`);
const createSubscription = (subscriptionData) => api.post('/subscriptions', subscriptionData);
const uploadReceipt = (formData) => api.post('/receipts/scan', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});


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
      <aside className="w-64 bg-white border-r border-gray-100 hidden sm:block shadow-md">
        <div className="p-6">
          <Link to="/dashboard" className="text-3xl font-extrabold text-blue-600 tracking-tight">FairShare</Link>
        </div>
        <nav className="mt-6">
          <Link to="/dashboard" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ease-in-out font-medium rounded-r-full">Dashboard</Link>
          <Link to="/groups" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ease-in-out font-medium rounded-r-full">Groups</Link>
          <Link to="/subscriptions" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 ease-in-out font-medium rounded-r-full">Subscriptions</Link>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white border-b border-gray-100 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 hidden md:block text-sm">Welcome, <span className="font-semibold">{user?.name}</span>!</span>
            <button onClick={handleLogout} className="px-5 py-2 text-sm font-medium text-white bg-red-500 rounded-full hover:bg-red-600 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg">Logout</button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const AuthFormContainer = ({ title, children, error }) => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-3xl font-extrabold text-center text-gray-800">{title}</h2>
            {error && <p className="text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-200 font-medium">{error}</p>}
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
            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
    </div>
);

const SubmitButton = ({ children, onClick, disabled = false }) => (
    <button
        type="submit"
        onClick={onClick}
        disabled={disabled}
        className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
        <h1 className="text-6xl md:text-7xl font-extrabold mb-4 animate-fade-in-down">Welcome to <span className="text-yellow-200">FairShare</span></h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-10 tracking-wide animate-fade-in-up">The smartest way to manage shared expenses, effortlessly.</p>
        <div className="flex space-x-6 animate-fade-in-up">
            <Link to="/login" className="px-8 py-4 bg-white text-blue-700 font-bold rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 ease-in-out border border-transparent">Login</Link>
            <Link to="/register" className="px-8 py-4 bg-blue-700 text-white font-bold rounded-full shadow-lg hover:bg-blue-800 transform hover:scale-105 transition-all duration-300 ease-in-out border border-white">Register</Link>
        </div>
        {/* Note: Tailwind animations need to be configured in tailwind.config.js for this to work */}
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
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };
    return (
        <AuthFormContainer title="Login" error={error}>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <FormInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <SubmitButton>Login</SubmitButton>
                <p className="text-sm text-center text-gray-600">Don't have an account? <Link to="/register" className="font-semibold text-blue-600 hover:underline">Register</Link></p>
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await registerUser({ name, email, password });
            login(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };
    return (
        <AuthFormContainer title="Create Account" error={error}>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <FormInput label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <FormInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <SubmitButton>Register</SubmitButton>
                <p className="text-sm text-center text-gray-600">Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:underline">Login</Link></p>
            </form>
        </AuthFormContainer>
    );
};

const Dashboard = () => (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Balance</h3>
                <p className="text-4xl font-extrabold text-green-600 mt-2">$0.00</p>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">You Owe</h3>
                <p className="text-4xl font-extrabold text-red-600 mt-2">$0.00</p>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">You Are Owed</h3>
                <p className="text-4xl font-extrabold text-green-600 mt-2">$0.00</p>
            </Card>
        </div>
    </div>
);

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getGroups().then(res => setGroups(res.data)).finally(() => setLoading(false));
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

    if (loading) return <p className="text-center text-gray-600 py-8">Loading groups...</p>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Your Groups</h3>
                    {groups.length === 0 ? (
                        <p className="text-gray-500 italic">No groups yet. Create one to get started!</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {groups.map(group => (
                                <li key={group._id}>
                                    <Link to={`/groups/${group._id}`} className="flex justify-between items-center py-4 px-3 hover:bg-blue-50 rounded-lg transition-all duration-200">
                                        <span className="font-semibold text-blue-700 text-lg">{group.name}</span>
                                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{group.members.length} members</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
            <div>
                <Card>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Group</h3>
                    <form onSubmit={handleCreateGroup} className="space-y-4 mt-4">
                        <FormInput label="Group Name" type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                        <SubmitButton>Create Group</SubmitButton>
                    </form>
                </Card>
            </div>
        </div>
    );
};

const GroupPage = () => {
    const { groupId } = useParams();
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const { user } = useAuth();
    const [error, setError] = useState('');
    const [memberEmail, setMemberEmail] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [groupData, expensesData] = await Promise.all([getGroupDetails(groupId), getExpensesForGroup(groupId)]);
                setGroup(groupData.data);
                setExpenses(expensesData.data);
            } catch (err) {
                setError('Failed to load group details.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [groupId]);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        setError('');
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) { setError('Please enter a valid amount.'); return; }
        if (!description.trim()) { setError('Please enter a description.'); return; }
        if (!group) { setError('Group not loaded.'); return; }

        try {
            const amountFloat = parseFloat(amount);
            const amountPerMember = (amountFloat / group.members.length).toFixed(2);
            const splits = group.members.map(member => ({ user: member._id, amount: amountPerMember }));
            const expenseData = { description, amount: amountFloat, group: groupId, splitType: 'equal', splits };
            const { data } = await addExpense(expenseData);
            
            const newExpense = { ...data, paidBy: data.paidBy || { _id: user._id, name: user.name } };
            setExpenses([newExpense, ...expenses]);
            setDescription('');
            setAmount('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add expense.');
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setError('');
        if (!memberEmail.trim()) {
            setError('Please enter an email address.');
            return;
        }
        try {
            const { data } = await addMemberToGroup(groupId, memberEmail);
            setGroup(data);
            setMemberEmail('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add member.');
        }
    };

    if (loading) return <p className="text-center text-gray-600 py-8">Loading group details...</p>;
    if (error && !group) return <p className="text-red-600 text-center py-8">{error}</p>;
    if (!group) return <p className="text-center text-gray-600 py-8">Group not found.</p>;


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-bold text-gray-800">{group.name} Expenses</h3>
                        <div className="flex space-x-3">
                            <Link to={`/scan-receipt/${groupId}`} className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-full hover:bg-green-600 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg">Scan Receipt</Link>
                            <Link to={`/balances/${groupId}`} className="px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-full hover:bg-purple-600 transition-all duration-200 ease-in-out shadow-md hover:shadow-lg">Simplify Debts</Link>
                        </div>
                    </div>
                    {error && <p className="text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-200 font-medium mb-4">{error}</p>}
                    {expenses.length === 0 ? (
                        <p className="text-gray-500 italic">No expenses yet. Add one to get started!</p>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {expenses.map(expense => (
                                <li key={expense._id} className="py-3 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-800 text-lg">{expense.description}</p>
                                        <p className="text-sm text-gray-500">Paid by <span className="font-medium">{expense.paidBy?.name || 'Unknown'}</span></p>
                                    </div>
                                    <span className="font-bold text-lg text-red-600">${parseFloat(expense.amount).toFixed(2)}</span>
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
                            <li key={member._id} className="text-gray-700 flex items-center">
                                <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full mr-3 font-semibold text-sm">{member.name.charAt(0).toUpperCase()}</span>
                                {member.name}
                            </li>
                        ))}
                    </ul>
                    <form onSubmit={handleAddMember} className="space-y-2 mt-4 pt-4 border-t">
                        <FormInput label="Add Member by Email" type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="member@example.com" />
                        <SubmitButton>Add Member</SubmitButton>
                    </form>
                </Card>
                <Card>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Add Expense</h3>
                    <form onSubmit={handleAddExpense} className="space-y-4 mt-4">
                        <FormInput label="Description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                        <FormInput label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        <SubmitButton>Add Expense</SubmitButton>
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

    useEffect(() => {
        getSimplifiedDebts(groupId).then(res => setSettlements(res.data)).catch(() => setError('Failed to load balance details.')).finally(() => setLoading(false));
    }, [groupId]);

    if (loading) return <p className="text-center text-gray-600 py-8">Calculating balances...</p>;
    if (error) return <p className="text-red-600 text-center py-8">{error}</p>;

    return (
        <Card className="max-w-2xl mx-auto p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Simplified Debts</h3>
            {settlements.length === 0 ? (
                <p className="text-gray-500 italic text-center py-4">All debts are settled! 🎉</p>
            ) : (
                <ul className="divide-y divide-gray-200">
                    {settlements.map((s, i) => (
                        <li key={i} className="py-4 flex items-center justify-between space-x-4">
                            <span className="font-semibold text-red-600">{s.from.name}</span>
                            <span className="text-gray-500 text-sm">pays</span>
                            <span className="font-semibold text-green-600">{s.to.name}</span>
                            <span className="ml-auto font-extrabold text-gray-800 text-xl">${s.amount.toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
            )}
            <Link to={`/groups/${groupId}`} className="mt-8 inline-block text-blue-600 hover:underline font-medium text-lg">&larr; Back to Group</Link>
        </Card>
    );
};

const Subscriptions = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [nextDueDate, setNextDueDate] = useState('');

    useEffect(() => {
        getGroups().then(res => setGroups(res.data)).catch(() => setError('Failed to load groups.'));
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            setLoading(true);
            setError('');
            getSubscriptionsForGroup(selectedGroup).then(res => setSubscriptions(res.data)).catch(() => setError('Failed to load subscriptions.')).finally(() => setLoading(false));
        } else {
            setSubscriptions([]);
        }
    }, [selectedGroup]);

    const handleAddSubscription = async (e) => {
        e.preventDefault();
        const subData = { name, amount, group: selectedGroup, billingCycle, nextDueDate };
        const { data } = await createSubscription(subData);
        setSubscriptions([...subscriptions, data]);
        setName(''); setAmount(''); setNextDueDate('');
    };

    return (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><div className="lg:col-span-2"><Card><h3 className="text-xl font-bold text-gray-800 mb-4">Recurring Subscriptions</h3><select onChange={(e) => setSelectedGroup(e.target.value)} value={selectedGroup} className="w-full p-3 border rounded-lg mb-4"><option value="">Select a group</option>{groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}</select>{loading && <p>Loading...</p>}{!loading && subscriptions.length === 0 && selectedGroup && <p>No subscriptions for this group.</p>}<ul className="divide-y divide-gray-200">{subscriptions.map(sub => (<li key={sub._id} className="py-3"><p className="font-medium">{sub.name} - ${sub.amount}</p><p className="text-sm text-gray-500">Next due: {new Date(sub.nextDueDate).toLocaleDateString()}</p></li>))}</ul></Card></div><div><Card><h3 className="text-xl font-bold text-gray-800 mb-4">Add Subscription</h3><form onSubmit={handleAddSubscription} className="space-y-4 mt-4"><div className="mb-4"><label>Group</label><select onChange={(e) => setSelectedGroup(e.target.value)} value={selectedGroup} required className="w-full p-2 mt-2 border rounded-lg"><option value="">Select a group</option>{groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}</select></div><FormInput label="Name" type="text" value={name} onChange={e => setName(e.target.value)} /><FormInput label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} /><div className="mb-4"><label>Billing Cycle</label><select value={billingCycle} onChange={e => setBillingCycle(e.target.value)} className="w-full p-2 mt-2 border rounded-lg"><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div><FormInput label="Next Due Date" type="date" value={nextDueDate} onChange={e => setNextDueDate(e.target.value)} /><SubmitButton>Add Subscription</SubmitButton></form></Card></div></div>
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
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setScannedItems([]);
            setError('');
        }
    };

    const handleScan = async () => {
        if (!file) { setError('Please select a receipt image to scan.'); return; }
        setIsUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('receipt', file);
        formData.append('groupId', groupId);
        try {
            const { data } = await uploadReceipt(formData);
            setScannedItems(data.items || []);
            alert('Receipt scanned successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to scan receipt. Please try again with a clear image.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreateExpenseFromItems = async () => {
        if (scannedItems.length === 0) { setError('No items to create an expense from.'); return; }
        setIsUploading(true);
        setError('');

        const totalAmount = scannedItems.reduce((sum, item) => sum + item.price, 0);
        const description = `Scanned Receipt Items: ${scannedItems.map(item => item.description).join(', ').substring(0, 100)}...`;

        try {
            const { data: groupData } = await getGroupDetails(groupId);
            if (!groupData || !groupData.members || groupData.members.length === 0) {
                setError('Cannot create expense: group members not found.');
                setIsUploading(false);
                return;
            }

            const amountPerMember = (totalAmount / groupData.members.length).toFixed(2);
            const splits = groupData.members.map(member => ({ user: member._id, amount: amountPerMember }));
            
            const expenseData = { description, amount: totalAmount, group: groupId, splitType: 'equal', splits };
            await addExpense(expenseData);
            
            alert('Expense created successfully from scanned items!');
            navigate(`/groups/${groupId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create expense from items.');
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <Card className="max-w-2xl mx-auto p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Scan a Receipt</h3>
            {error && <p className="text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-200 font-medium mb-4">{error}</p>}
            <div className="mb-6">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
            </div>
            {preview && (
                <div className="mb-6 border border-gray-200 rounded-lg p-3 bg-gray-50 flex justify-center">
                    <img src={preview} alt="Receipt preview" className="max-h-80 object-contain rounded-md shadow-inner" />
                </div>
            )}
            <button
                onClick={handleScan}
                disabled={isUploading || !file}
                className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isUploading ? 'Scanning...' : 'Scan Receipt'}
            </button>

            {scannedItems.length > 0 && (
                <div className="mt-8 bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-inner">
                    <h4 className="text-xl font-bold text-gray-800 mb-4">Scanned Items:</h4>
                    <ul className="divide-y divide-gray-200">
                        {scannedItems.map((item, index) => (
                            <li key={index} className="py-3 flex justify-between items-center text-gray-700">
                                <span className="font-medium">{item.description}</span>
                                <span className="font-bold text-blue-700">${item.price.toFixed(2)}</span>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={handleCreateExpenseFromItems}
                        className="w-full mt-6 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md"
                        disabled={isUploading}
                    >
                        {isUploading ? 'Creating Expense...' : 'Create Expense from Items'}
                    </button>
                </div>
            )}
            <Link to={`/groups/${groupId}`} className="mt-8 inline-block text-blue-600 hover:underline font-medium text-lg">&larr; Back to Group</Link>
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
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout title="Dashboard"><Dashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><DashboardLayout title="Groups"><Groups /></DashboardLayout></ProtectedRoute>} />
          <Route path="/groups/:groupId" element={<ProtectedRoute><DashboardLayout title="Group Details"><GroupPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/balances/:groupId" element={<ProtectedRoute><DashboardLayout title="Simplified Balances"><BalancesPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/subscriptions" element={<ProtectedRoute><DashboardLayout title="Subscriptions"><Subscriptions /></DashboardLayout></ProtectedRoute>} />
          <Route path="/scan-receipt/:groupId" element={<ProtectedRoute><DashboardLayout title="Scan Receipt"><ScanReceiptPage /></DashboardLayout></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
