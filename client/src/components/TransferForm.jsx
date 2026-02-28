import { useState, useEffect } from 'react';
import { apiFetch, formatCurrency } from '../lib/api';

export default function TransferForm() {
  const [accounts, setAccounts] = useState([]);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch('/api/accounts').then(data => {
      setAccounts(data.accounts);
      if (data.accounts.length >= 2) {
        setFromId(String(data.accounts[0].id));
        setToId(String(data.accounts[1].id));
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const data = await apiFetch('/api/accounts/transfer', {
        body: {
          fromAccountId: parseInt(fromId),
          toAccountId: parseInt(toId),
          amount: parseFloat(amount),
          description: description || undefined,
        },
      });
      setSuccess(`Transferred ${formatCurrency(Math.round(parseFloat(amount) * 100))} successfully!`);
      setAmount('');
      setDescription('');
      // Refresh account balances
      const updated = await apiFetch('/api/accounts');
      setAccounts(updated.accounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (accounts.length < 2) {
    return (
      <div className="text-center py-8 text-gray-500">
        You need at least two accounts to make transfers.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm">{success}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">From account</label>
        <select
          value={fromId}
          onChange={e => setFromId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {accounts.map(a => (
            <option key={a.id} value={a.id} disabled={String(a.id) === toId}>
              {a.name} ({formatCurrency(a.balance)})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">To account</label>
        <select
          value={toId}
          onChange={e => setToId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {accounts.map(a => (
            <option key={a.id} value={a.id} disabled={String(a.id) === fromId}>
              {a.name} ({formatCurrency(a.balance)})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          required
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="What's this transfer for?"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || fromId === toId}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Transferring...' : 'Transfer'}
      </button>
    </form>
  );
}
