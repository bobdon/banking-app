import { useState } from 'react';
import { apiFetch } from '../lib/api';

export default function RequestMoneyForm() {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const data = await apiFetch('/api/belev/request', {
        body: {
          recipientEmail,
          amount: parseFloat(amount),
          memo: memo || undefined,
        },
      });
      setSuccess(data.message);
      setRecipientEmail('');
      setAmount('');
      setMemo('');
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Request from (email)</label>
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
        disabled={submitting}
        className="w-full bg-pink-600 text-white py-2.5 rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Requesting...' : 'Request Money'}
      </button>
    </form>
  );
}
