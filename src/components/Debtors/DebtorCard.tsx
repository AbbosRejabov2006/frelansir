import React from 'react';
import { Phone, Calendar, DollarSign, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react';
import { Debtor } from '../../types';

interface DebtorCardProps {
  debtor: Debtor;
  onPayment: () => void;
}

const DebtorCard: React.FC<DebtorCardProps> = ({ debtor, onPayment }) => {
  const isDueSoon = () => {
    const dueDate = new Date(debtor.dueDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return debtor.status === 'active' && dueDate <= tomorrow;
  };

  const isPastDue = () => {
    const dueDate = new Date(debtor.dueDate);
    const today = new Date();
    return debtor.status === 'active' && dueDate < today;
  };

  const dueSoon = isDueSoon();
  const pastDue = isPastDue();

  return (
    <div className={`bg-gray-800 border rounded-xl p-4 transition-all hover:bg-gray-750 ${
      pastDue ? 'border-red-600' : 
      dueSoon ? 'border-yellow-600' : 
      debtor.status === 'paid' ? 'border-green-600' : 'border-gray-700'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">{debtor.customerName}</h3>
          <div className="flex items-center space-x-1 text-gray-400 text-sm mt-1">
            <Phone className="h-3 w-3" />
            <span>{debtor.customerPhone}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {debtor.status === 'paid' && (
            <CheckCircle className="h-5 w-5 text-green-400" />
          )}
          {(dueSoon || pastDue) && (
            <AlertTriangle className={`h-5 w-5 ${pastDue ? 'text-red-400' : 'text-yellow-400'}`} />
          )}
        </div>
      </div>

      {/* Debt Info */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Jami qarz:</span>
          <span className="text-white font-medium">
            {debtor.totalDebt.toLocaleString()} so'm
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">To'langan:</span>
          <span className="text-green-400 font-medium">
            {debtor.paidAmount.toLocaleString()} so'm
          </span>
        </div>
        
        {debtor.status === 'active' && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Qolgan:</span>
            <span className="text-red-400 font-semibold">
              {debtor.remainingDebt.toLocaleString()} so'm
            </span>
          </div>
        )}
      </div>

      {/* Due Date */}
      <div className={`flex items-center space-x-2 p-2 rounded-lg mb-4 ${
        pastDue ? 'bg-red-900/20' :
        dueSoon ? 'bg-yellow-900/20' :
        debtor.status === 'paid' ? 'bg-green-900/20' : 'bg-gray-700'
      }`}>
        <Calendar className={`h-4 w-4 ${
          pastDue ? 'text-red-400' :
          dueSoon ? 'text-yellow-400' :
          debtor.status === 'paid' ? 'text-green-400' : 'text-gray-400'
        }`} />
        <span className={`text-sm ${
          pastDue ? 'text-red-400' :
          dueSoon ? 'text-yellow-400' :
          debtor.status === 'paid' ? 'text-green-400' : 'text-gray-300'
        }`}>
          {debtor.status === 'paid' ? 'Yopilgan' : 
           pastDue ? 'Muddati o\'tgan' :
           dueSoon ? 'Ertaga muddat tugaydi' :
           `Muddat: ${new Date(debtor.dueDate).toLocaleDateString('uz-UZ')}`}
        </span>
      </div>

      {/* Payment Button */}
      {debtor.status === 'active' && (
        <button
          onClick={onPayment}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <CreditCard className="h-4 w-4" />
          <span>To'lov qilish</span>
        </button>
      )}

      {debtor.status === 'paid' && (
        <div className="w-full text-center py-2 px-4 bg-green-900/20 text-green-400 font-medium rounded-lg">
          ✅ To'liq to'langan
        </div>
      )}
    </div>
  );
};

export default DebtorCard;
