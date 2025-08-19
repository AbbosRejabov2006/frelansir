"use client"

import type React from "react"
import { X, Printer, Calendar, User, CreditCard, Package } from "lucide-react"
import type { Sale } from "../../types"
import { formatDateTimeUzbek } from "../../utils/dateUtils"

interface SaleDetailsModalProps {
  sale: Sale
  onClose: () => void
  onPrint: () => void
}

const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({ sale, onClose, onPrint }) => {
  const getPaymentTypeText = (paymentType: string) => {
    switch (paymentType) {
      case "naqd":
        return "Naqd pul"
      case "karta":
        return "Bank kartasi"
      case "qarz":
        return "Qarzga"
      default:
        return paymentType
    }
  }

  const getPaymentTypeColor = (paymentType: string) => {
    switch (paymentType) {
      case "naqd":
        return "text-green-400 bg-green-900/20"
      case "karta":
        return "text-blue-400 bg-blue-900/20"
      case "qarz":
        return "text-orange-400 bg-orange-900/20"
      default:
        return "text-gray-400 bg-gray-900/20"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Chek tafsilotlari</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={onPrint}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Chop etish</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Receipt Display */}
        <div className="p-6">
          <div className="bg-white text-black rounded-lg p-8 max-w-md mx-auto" style={{ fontFamily: "monospace" }}>
            {/* Receipt Header */}
            <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
              <div className="text-lg font-bold mb-1">🏗️ BUILD POS</div>
              <div className="text-sm mb-2">Qurilish mollari do'koni</div>
              <div className="text-xs">Oqqo'rg'on, Mirzo Ulug'bek ko'chasi</div>
              <div className="text-xs">Tel: +998 99 475 44 44</div>
            </div>

            {/* Receipt Info */}
            <div className="text-xs mb-4 space-y-1">
              <div className="flex justify-between">
                <span>Chek:</span>
                <span className="font-bold">#{sale.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Sana:</span>
                <span>{formatDateTimeUzbek(new Date(sale.date))}</span>
              </div>
              <div className="flex justify-between">
                <span>Kassir:</span>
                <span>{sale.cashierName}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-gray-400 mb-4"></div>

            {/* Items */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span>Mahsulot</span>
                <span>Miqdor</span>
                <span>Summa</span>
              </div>
              <div className="border-b border-dashed border-gray-400 mb-2"></div>

              {sale.items.map((item, index) => (
                <div key={index} className="mb-2">
                  <div className="text-xs">
                    <div className="flex justify-between">
                      <span className="flex-1 pr-2">{item.productName}</span>
                      <span className="w-16 text-center">
                        {item.quantity} {item.unit}
                      </span>
                      <span className="w-20 text-right">{item.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-gray-400 mb-4"></div>

            {/* Totals */}
            <div className="text-xs space-y-1 mb-4">
              <div className="flex justify-between font-bold text-sm">
                <span>JAMI:</span>
                <span>{sale.total.toLocaleString()} so'm</span>
              </div>
              <div className="flex justify-between">
                <span>To'lov:</span>
                <span>{getPaymentTypeText(sale.paymentType)}</span>
              </div>
              {sale.paymentType === "qarz" ? (
                <>
                  <div className="flex justify-between">
                    <span>To'landi:</span>
                    <span>{(sale.paidAmount || 0).toLocaleString()} so'm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Qoldiq:</span>
                    <span>{(sale.remainingDebt || 0).toLocaleString()} so'm</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>To'landi:</span>
                    <span>{sale.total.toLocaleString()} so'm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Qoldiq:</span>
                    <span>0 so'm</span>
                  </div>
                </>
              )}
            </div>

            <div className="border-b border-dashed border-gray-400 mb-4"></div>

            {/* Footer */}
            <div className="text-center text-xs">
              <div className="mb-2">Keyingi xaridingizda sizni kutamiz!</div>
              <div className="text-xs opacity-70">BuildPOS tizimi</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Mahsulotlar tafsiloti
              </h3>
              <div className="space-y-2">
                {sale.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-300">{item.productName}</span>
                    <span className="text-white">
                      {item.quantity} {item.unit} × {item.price.toLocaleString()} = {item.total.toLocaleString()} so'm
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Savdo ma'lumotlari</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Sana
                  </span>
                  <span className="text-white">{formatDateTimeUzbek(new Date(sale.date))}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Kassir
                  </span>
                  <span className="text-white">{sale.cashierName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    To'lov turi
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentTypeColor(sale.paymentType)}`}>
                    {getPaymentTypeText(sale.paymentType)}
                  </span>
                </div>
                {sale.paymentType === "qarz" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Mijoz</span>
                      <span className="text-white">{sale.customerName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Telefon</span>
                      <span className="text-white">{sale.customerPhone}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SaleDetailsModal
