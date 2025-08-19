"use client"

import type React from "react"
import { useState } from "react"
import { X, CreditCard, DollarSign, Users, Calendar, Percent } from "lucide-react"

interface PaymentModalProps {
  total: number
  onClose: () => void
  onConfirm: (paymentData: any) => void
}

const PaymentModal: React.FC<PaymentModalProps> = ({ total, onClose, onConfirm }) => {
  const [paymentType, setPaymentType] = useState<"naqd" | "karta" | "qarz">("naqd")
  const [discount, setDiscount] = useState(0)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paidAmount, setPaidAmount] = useState(0)
  const [dueDate, setDueDate] = useState("")

  const finalTotal = total - discount
  const remainingDebt = paymentType === "qarz" ? finalTotal - paidAmount : 0

  const handleDiscountPercentChange = (percent: number) => {
    setDiscountPercent(percent)
    setDiscount(Math.round((total * percent) / 100))
  }

  const handleDiscountAmountChange = (amount: number) => {
    setDiscount(amount)
    setDiscountPercent(Math.round((amount / total) * 100))
  }

  const handleConfirm = () => {
    if (paymentType === "qarz" && (!customerName || !customerPhone || !dueDate)) {
      alert("Qarzga sotish uchun mijoz ma'lumotlari to'ldirilishi shart!")
      return
    }

    const paymentData = {
      paymentType,
      originalTotal: total,
      discount,
      discountPercent,
      finalTotal,
      customerName: paymentType === "qarz" ? customerName : undefined,
      customerPhone: paymentType === "qarz" ? customerPhone : undefined,
      paidAmount: paymentType === "qarz" ? paidAmount : finalTotal,
      remainingDebt: paymentType === "qarz" ? remainingDebt : 0,
      dueDate: paymentType === "qarz" ? dueDate : undefined,
    }

    onConfirm(paymentData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg">
                <CreditCard className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">To'lov</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">To'lov turini tanlang</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Payment Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">To'lov turi</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentType("naqd")}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  paymentType === "naqd"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
                }`}
              >
                <DollarSign className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm font-medium">Naqd</span>
              </button>
              <button
                onClick={() => setPaymentType("karta")}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  paymentType === "karta"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
                }`}
              >
                <CreditCard className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm font-medium">Karta</span>
              </button>
              <button
                onClick={() => setPaymentType("qarz")}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  paymentType === "qarz"
                    ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Users className="h-6 w-6 mx-auto mb-1" />
                <span className="text-sm font-medium">Qarz</span>
              </button>
            </div>
          </div>

          {/* Discount Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Chegirma</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Foiz (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={discountPercent}
                    onChange={(e) => handleDiscountPercentChange(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Miqdor (so'm)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => handleDiscountAmountChange(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="0"
                  min="0"
                  max={total}
                />
              </div>
            </div>
          </div>

          {/* Customer Info for Debt */}
          {paymentType === "qarz" && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-3">Mijoz ma'lumotlari</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Mijoz ismi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Telefon raqami"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">To'langan miqdor</label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0"
                      min="0"
                      max={finalTotal}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">To'lov muddati</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                {remainingDebt > 0 && (
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    Qolgan qarz: <span className="font-semibold">{remainingDebt.toLocaleString()} so'm</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Jami:</span>
                <span className="text-gray-900 dark:text-white">{total.toLocaleString()} so'm</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Chegirma:</span>
                  <span className="text-red-600 dark:text-red-400">-{discount.toLocaleString()} so'm</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t border-gray-200 dark:border-gray-600 pt-2">
                <span className="text-gray-900 dark:text-white">To'lov:</span>
                <span className="text-orange-600">{finalTotal.toLocaleString()} so'm</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Tasdiqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
