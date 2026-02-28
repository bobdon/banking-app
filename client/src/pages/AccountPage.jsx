import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch, formatCurrency } from '../lib/api';
import TransactionList from '../components/TransactionList';
import DepositWithdrawForm from '../components/DepositWithdrawForm';

export default function AccountPage() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAccount = useCallback(() => {
    apiFetch(`/api/accounts/${id}`)
      .then(data => setAccount(data.account))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { loadAccount(); }, [loadAccount]);

  function handleTransactionSuccess() {
    loadAccount();
    setRefreshKey(k => k + 1);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!account) {
    return <div className="text-center py-16 text-gray-400">Account not found</div>;
  }

  const masked = '****' + account.account_number.slice(-4);

  return (
    <div>
      <Link to="/dashboard" className="text-sm text-indigo-600 hover:text-indigo-500 mb-4 inline-block">
        &larr; Back to Dashboard
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{account.name}</h1>
            <p className="text-sm text-gray-400">{masked}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            account.type === 'checking'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-emerald-50 text-emerald-700'
          }`}>
            {account.type}
          </span>
        </div>
        <p className="text-3xl font-bold text-gray-900 mt-4">{formatCurrency(account.balance)}</p>
        <p className="text-sm text-gray-400">Available balance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h2>
            <TransactionList key={refreshKey} accountId={id} />
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <DepositWithdrawForm accountId={id} onSuccess={handleTransactionSuccess} />
          </div>
        </div>
      </div>
    </div>
  );
}
