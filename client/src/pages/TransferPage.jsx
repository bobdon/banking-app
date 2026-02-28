import TransferForm from '../components/TransferForm';

export default function TransferPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transfer Funds</h1>
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <TransferForm />
        </div>
      </div>
    </div>
  );
}
