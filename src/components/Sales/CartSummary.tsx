"use client"

import type React from "react"
import { CreditCard } from "lucide-react"

interface CartSummaryProps {
  total: number
  onCheckout: () => void
}

const CartSummary: React.FC<CartSummaryProps> = ({ total, onCheckout }) => {
  return (
    <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Jami:</span>
          <span className="text-xl font-bold text-orange-600">{total.toLocaleString()} so'm</span>
        </div>

        <button
          onClick={onCheckout}
          disabled={total === 0}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <CreditCard className="h-5 w-5" />
          <span>To'lov qilish</span>
        </button>
      </div>
    </div>
  )
}

export default CartSummary
