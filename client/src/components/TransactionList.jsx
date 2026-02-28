import { useState, useEffect } from 'react';
import { apiFetch, formatCurrency, formatDate } from '../lib/api';

export default function TransactionList({ accountId }) {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    apiFetch(`/api/accounts/${accountId}/transactions?page=${page}&limit=${limit}`)
      .then(data => {
        setTransactions(data.transactions);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [accountId, page]);

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading transactions...</div>;
  }

  if (!transactions.length) {
    return <div className="text-center py-8 text-gray-400">No transactions yet</div>;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Balance</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(txn => {
              const isCredit = txn.type === 'deposit' || txn.type === 'transfer_in';
              return (
                <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-500">{formatDate(txn.created_at)}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{txn.description}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isCredit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {txn.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`py-3 px-4 text-sm text-right font-medium ${
                    isCredit ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-500">
                    {formatCurrency(txn.balance_after)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-30 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-30 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
