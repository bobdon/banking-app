import { useState, useEffect } from 'react';
import { apiFetch, formatCurrency } from '../lib/api';

export default function SendMoneyForm() {
  const [accounts, setAccounts] = useState([]);
  const [fromId, setFromId] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch('/api/accounts').then(data => {
      setAccounts(data.accounts);
      if (data.accounts.length > 0) {
        setFromId(String(data.accounts[0].id));
      }
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const data = await apiFetch('/api/belev/send', {
        body: {
          recipientEmail,
          fromAccountId: parseInt(fromId),
          amount: parseFloat(amount),
          memo: memo || undefined,
        },
      });
      setSuccess(data.message);
      setRecipientEmail('');
      setAmount('');
      setMemo('');
      // Refresh balances
      const updated = await apiFetch('/api/accounts');
      setAccounts(updated.accounts);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm">{success}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Recipient email</label>
        <input
          type="email"
          required
          value={recipientEmail}
          onChange={e => setRecipientEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="friend@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">From account</label>
        <select
          value={fromId}
          onChange={e => setFromId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          {accounts.map(a => (
            <option key={a.id} value={a.id}>
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Memo (optional)</label>
        <input
          type="text"
          value={memo}
          onChange={e => setMemo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="What's this for?"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !fromId}
        className="w-full bg-violet-600 text-white py-2.5 rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Sending...' : 'Send Money'}
      </button>
    </form>
  );
}
