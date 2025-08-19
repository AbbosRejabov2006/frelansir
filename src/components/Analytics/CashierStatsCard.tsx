"use client"

import type React from "react"
import { User, DollarSign, ShoppingCart, Calendar, CreditCard, Banknote, Users } from "lucide-react"
import type { Sale } from "../../types"

interface CashierStatsCardProps {
  cashierName: string
  sales: Sale[]
}

const CashierStatsCard: React.FC<CashierStatsCardProps> = ({ cashierName, sales }) => {
  // Calculate statistics
  const totalSales = sales.length
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.finalTotal || sale.total), 0)

  // Payment type breakdown
  const cashSales = sales.filter((sale) => sale.paymentType === "naqd")
  const cardSales = sales.filter((sale) => sale.paymentType === "karta")
  const debtSales = sales.filter((sale) => sale.paymentType === "qarz")

  const cashRevenue = cashSales.reduce((sum, sale) => sum + (sale.finalTotal || sale.total), 0)
  const cardRevenue = cardSales.reduce((sum, sale) => sum + (sale.finalTotal || sale.total), 0)
  const debtRevenue = debtSales.reduce((sum, sale) => sum + (sale.finalTotal || sale.total), 0)

  // Last active day
  const lastSaleDate =
    sales.length > 0 ? new Date(Math.max(...sales.map((sale) => new Date(sale.date).getTime()))) : null

  const formatDate = (date: Date) => {
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Bugun"
    if (diffDays === 2) return "Kecha"
    if (diffDays <= 7) return `${diffDays - 1} kun oldin`
    return date.toLocaleDateString("uz-UZ")
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{cashierName}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Kassir</p>
          </div>
        </div>

        {lastSaleDate && (
          <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(lastSaleDate)}</span>
          </div>
        )}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Savdolar</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSales}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Daromad</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{totalRevenue.toLocaleString()} so'm</p>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">To'lov turlari:</h4>

        {/* Cash */}
        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <Banknote className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Naqd</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-green-800 dark:text-green-200">{cashSales.length} ta</p>
            <p className="text-xs text-green-600 dark:text-green-400">{cashRevenue.toLocaleString()} so'm</p>
          </div>
        </div>

        {/* Card */}
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Karta</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{cardSales.length} ta</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">{cardRevenue.toLocaleString()} so'm</p>
          </div>
        </div>

        {/* Debt */}
        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Qarz</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">{debtSales.length} ta</p>
            <p className="text-xs text-orange-600 dark:text-orange-400">{debtRevenue.toLocaleString()} so'm</p>
          </div>
        </div>
      </div>

      {/* Performance Indicator */}
      {totalSales > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">O'rtacha savdo:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {Math.round(totalRevenue / totalSales).toLocaleString()} so'm
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default CashierStatsCard
