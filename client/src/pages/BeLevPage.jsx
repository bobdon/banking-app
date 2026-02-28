import { useState } from 'react';
import BeLevLogo from '../components/BeLevLogo';
import SendMoneyForm from '../components/SendMoneyForm';
import RequestMoneyForm from '../components/RequestMoneyForm';
import ActivityFeed from '../components/ActivityFeed';

const tabs = [
  { id: 'send', label: 'Send' },
  { id: 'request', label: 'Request' },
  { id: 'activity', label: 'Activity' },
];

export default function BeLevPage() {
  const [activeTab, setActiveTab] = useState('send');

  return (
    <div className="max-w-lg mx-auto">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <BeLevLogo size="lg" />
        </div>
        <p className="text-gray-500 text-sm">Send money. BeLev it.</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-violet-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'send' && <SendMoneyForm />}
        {activeTab === 'request' && <RequestMoneyForm />}
        {activeTab === 'activity' && <ActivityFeed />}
      </div>

      {/* Demo hint */}
      <div className="mt-6 bg-violet-50 rounded-lg p-4 text-sm text-violet-700">
        <p className="font-medium mb-1">Demo accounts</p>
        <p>jane@example.com &bull; bob@example.com</p>
        <p className="text-violet-500 text-xs mt-1">Password: password123</p>
      </div>
    </div>
  );
}
