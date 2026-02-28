import { useState } from 'react';
import { apiFetch } from '../lib/api';

export default function DepositWithdrawForm({ accountId, onSuccess }) {
  const [mode, setMode] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiFetch(`/api/accounts/${accountId}/${mode}`, {
        body: { amount: parseFloat(amount), description: description || undefined },
      });
      setAmount('');
      setDescription('');
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('deposit')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === 'deposit'
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Deposit
        </button>
        <button
          type="button"
          onClick={() => setMode('withdraw')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            mode === 'withdraw'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Withdraw
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>
      )}

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
          placeholder="What's this for?"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className={`w-full py-2.5 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${
          mode === 'deposit'
            ? 'bg-emerald-600 hover:bg-emerald-700'
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        {submitting ? 'Processing...' : mode === 'deposit' ? 'Deposit' : 'Withdraw'}
      </button>
    </form>
  );
}
