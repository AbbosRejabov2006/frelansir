import React, { useState } from 'react';
import { X, CreditCard, Banknote, DollarSign } from 'lucide-react';
import { Debtor } from '../../types';

interface PaymentModalProps {
  debtor: Debtor;
  onClose: () => void;
  onConfirm: (debtorId: string, amount: number, paymentType: 'naqd' | 'karta') => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ debtor, onClose, onConfirm }) => {
  const [amount, setAmount] = useState(debtor.remainingDebt);
  const [paymentType, setPaymentType] = useState<'naqd' | 'karta'>('naqd');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount <= 0) {
      alert('To\'lov miqdorini kiriting!');
      return;
    }
    
    if (amount > debtor.remainingDebt) {
      alert('To\'lov miqdori qolgan qarzdan ko\'p bo\'lishi mumkin emas!');
      return;
    }

    onConfirm(debtor.id, amount, paymentType);
  };

  const setPresetAmount = (preset: number) => {
    setAmount(Math.min(preset, debtor.remainingDebt));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">To'lov qilish</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Debtor Info */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-white font-medium mb-2">{debtor.customerName}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Telefon:</span>
              <span className="text-white">{debtor.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Jami qarz:</span>
              <span className="text-white">{debtor.totalDebt.toLocaleString()} so'm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">To'langan:</span>
              <span className="text-green-400">{debtor.paidAmount.toLocaleString()} so'm</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-gray-400">Qolgan:</span>
              <span className="text-red-400">{debtor.remainingDebt.toLocaleString()} so'm</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Payment Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              To'lov miqdori
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="1"
                max={debtor.remainingDebt}
                required
              />
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Preset Amounts */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tez to'lov:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPresetAmount(debtor.remainingDebt / 2)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                Yarmi ({Math.floor(debtor.remainingDebt / 2).toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => setPresetAmount(debtor.remainingDebt)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                To'liq to'lash
              </button>
            </div>
          </div>

          {/* Payment Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              To'lov turi:
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPaymentType('naqd')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  paymentType === 'naqd'
                    ? 'border-green-500 bg-green-900/20 text-green-400'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Banknote className="h-5 w-5" />
                <span>Naqd pul</span>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentType('karta')}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  paymentType === 'karta'
                    ? 'border-blue-500 bg-blue-900/20 text-blue-400'
                    : 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <span>Bank kartasi</span>
              </button>
            </div>
          </div>

          {/* Remaining After Payment */}
          <div className="mb-6 p-3 bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">To'lovdan keyin qoladi:</span>
              <span className={`font-semibold ${
                (debtor.remainingDebt - amount) === 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {(debtor.remainingDebt - amount).toLocaleString()} so'm
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              To'lash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
