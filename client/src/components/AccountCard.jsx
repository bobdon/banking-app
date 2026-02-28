import { Link } from 'react-router-dom';
import { formatCurrency } from '../lib/api';

export default function AccountCard({ account }) {
  const masked = '****' + account.account_number.slice(-4);

  return (
    <Link
      to={`/accounts/${account.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{account.name}</h3>
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
      <p className="text-2xl font-bold text-gray-900">{formatCurrency(account.balance)}</p>
      <p className="text-xs text-gray-400 mt-1">Available balance</p>
    </Link>
  );
}
