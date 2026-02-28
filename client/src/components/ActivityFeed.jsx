import { useState, useEffect } from 'react';
import { apiFetch, formatCurrency, formatDate } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ActivityFeed() {
  const { user } = useAuth();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [acceptingId, setAcceptingId] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [processing, setProcessing] = useState(false);

  async function loadActivity() {
    try {
      const [actData, accData] = await Promise.all([
        apiFetch('/api/belev/activity'),
        apiFetch('/api/accounts'),
      ]);
      setActivity(actData.activity);
      setAccounts(accData.accounts);
      if (accData.accounts.length > 0) {
        setSelectedAccountId(String(accData.accounts[0].id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadActivity(); }, []);

  async function handleAccept(transferId) {
    setProcessing(true);
    setActionMsg('');
    try {
      const data = await apiFetch(`/api/belev/${transferId}/accept`, {
        body: { fromAccountId: parseInt(selectedAccountId) },
      });
      setActionMsg(data.message);
      setAcceptingId(null);
      await loadActivity();
    } catch (err) {
      setActionMsg(err.message);
    } finally {
      setProcessing(false);
    }
  }

  async function handleDecline(transferId) {
    setProcessing(true);
    setActionMsg('');
    try {
      const data = await apiFetch(`/api/belev/${transferId}/decline`, {
        body: {},
      });
      setActionMsg(data.message);
      await loadActivity();
    } catch (err) {
      setActionMsg(err.message);
    } finally {
      setProcessing(false);
    }
  }

  function getStatusBadge(status) {
    const styles = {
      completed: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      declined: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-500',
    };
    return (
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status] || styles.cancelled}`}>
        {status}
      </span>
    );
  }

  function getDescription(item) {
    const isSender = item.sender_id === user.id;

    if (item.type === 'send') {
      if (isSender) {
        return `Sent to ${item.recipient_first_name} ${item.recipient_last_name}`;
      }
      return `Received from ${item.sender_first_name} ${item.sender_last_name}`;
    }

    // type === 'request'
    if (isSender) {
      return `Requested from ${item.recipient_first_name} ${item.recipient_last_name}`;
    }
    return `${item.sender_first_name} ${item.sender_last_name} requested`;
  }

  function getAmountColor(item) {
    const isSender = item.sender_id === user.id;
    if (item.type === 'send') {
      return isSender ? 'text-red-600' : 'text-emerald-600';
    }
    // For requests, show color only if completed
    if (item.status === 'completed') {
      return isSender ? 'text-emerald-600' : 'text-red-600';
    }
    return 'text-gray-600';
  }

  function getAmountPrefix(item) {
    const isSender = item.sender_id === user.id;
    if (item.type === 'send') {
      return isSender ? '- ' : '+ ';
    }
    if (item.status === 'completed') {
      return isSender ? '+ ' : '- ';
    }
    return '';
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actionMsg && (
        <div className="bg-violet-50 text-violet-700 p-3 rounded-lg text-sm">{actionMsg}</div>
      )}

      {activity.length === 0 ? (
        <p className="text-center py-8 text-gray-500">No BeLev activity yet. Send or request money to get started!</p>
      ) : (
        activity.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm truncate">
                    {getDescription(item)}
                  </span>
                  {getStatusBadge(item.status)}
                </div>
                {item.memo && (
                  <p className="text-xs text-gray-500 truncate">"{item.memo}"</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{formatDate(item.created_at)}</p>
              </div>
              <div className={`text-right font-semibold ${getAmountColor(item)}`}>
                {getAmountPrefix(item)}{formatCurrency(item.amount)}
              </div>
            </div>

            {/* Accept/Decline actions for incoming pending requests */}
            {item.type === 'request' &&
             item.status === 'pending' &&
             item.recipient_id === user.id && (
              <div className="border-t border-gray-100 pt-3">
                {acceptingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedAccountId}
                      onChange={e => setSelectedAccountId(e.target.value)}
                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({formatCurrency(a.balance)})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAccept(item.id)}
                      disabled={processing}
                      className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      {processing ? '...' : 'Pay'}
                    </button>
                    <button
                      onClick={() => setAcceptingId(null)}
                      className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAcceptingId(item.id)}
                      className="flex-1 px-3 py-1.5 text-sm bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                    >
                      Accept & Pay
                    </button>
                    <button
                      onClick={() => handleDecline(item.id)}
                      disabled={processing}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pending outgoing request indicator */}
            {item.type === 'request' &&
             item.status === 'pending' &&
             item.sender_id === user.id && (
              <div className="border-t border-gray-100 pt-2">
                <span className="text-xs text-amber-600 font-medium">Waiting for response...</span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
