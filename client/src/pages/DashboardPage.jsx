import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch, formatCurrency } from '../lib/api';
import AccountCard from '../components/AccountCard';

export default function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('checking');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    apiFetch('/api/accounts')
      .then(data => setAccounts(data.accounts))
      .finally(() => setLoading(false));
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  async function handleCreateAccount(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const data = await apiFetch('/api/accounts', {
        body: { name: newName, type: newType },
      });
      setAccounts(prev => [...prev, data.account]);
      setShowCreate(false);
      setNewName('');
      setNewType('checking');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-gray-500 mt-1">
          Total balance: <span className="font-semibold text-gray-900">{formatCurrency(totalBalance)}</span>
        </p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Accounts</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-sm text-indigo-600 font-medium hover:text-indigo-500"
        >
          {showCreate ? 'Cancel' : '+ New Account'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreateAccount} className="bg-white rounded-xl border border-gray-200 p-6 mb-4 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Account name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g., Emergency Fund"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={newType}
              onChange={e => setNewType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            Create
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map(account => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          No accounts yet. Create one to get started.
        </div>
      )}
    </div>
  );
}
