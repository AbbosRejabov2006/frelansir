"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, User, ChevronDown } from "lucide-react"

interface CashierSelectionModalProps {
  onClose: () => void
  onConfirm: (cashierName: string) => void
}

const CashierSelectionModal: React.FC<CashierSelectionModalProps> = ({ onClose, onConfirm }) => {
  const [selectedCashier, setSelectedCashier] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const cashiers = ["Otabek", "Bahriddin"]

  useEffect(() => {
    const savedCashier = localStorage.getItem("buildpos_selected_cashier")
    if (savedCashier && cashiers.includes(savedCashier)) {
      setSelectedCashier(savedCashier)
    }
  }, [])

  const handleConfirm = () => {
    if (!selectedCashier) {
      alert("Iltimos, kassirni tanlang.")
      return
    }

    localStorage.setItem("buildpos_selected_cashier", selectedCashier)
    onConfirm(selectedCashier)
  }

  const handleCashierSelect = (cashier: string) => {
    setSelectedCashier(cashier)
    setIsDropdownOpen(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <User className="h-5 w-5 mr-2" />
            Kassirni tanlang
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Kassir</label>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-left flex items-center justify-between hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
              >
                <span className={selectedCashier ? "text-white" : "text-gray-400"}>
                  {selectedCashier || "Kassirni tanlang"}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    isDropdownOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
                  {cashiers.map((cashier) => (
                    <button
                      key={cashier}
                      onClick={() => handleCashierSelect(cashier)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-600 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        selectedCashier === cashier ? "bg-orange-600 text-white" : "text-gray-300 hover:text-white"
                      }`}
                    >
                      {cashier}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors font-medium"
            >
              ❌ Bekor qilish
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium ${
                selectedCashier
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
              disabled={!selectedCashier}
            >
              ✅ Tasdiqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CashierSelectionModal
