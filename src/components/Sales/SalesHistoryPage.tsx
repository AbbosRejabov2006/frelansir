"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Calendar, Eye, Filter, ChevronDown, Download } from "lucide-react"
import type { Sale } from "../../types"
import { StorageUtils } from "../../utils/storage"
import { formatDateUzbek, formatTimeUzbek } from "../../utils/dateUtils"
import { exportToWord } from "../../utils/export"
import { useAuth } from "../../context/AuthContext"
import SaleDetailsModal from "./SaleDetailsModal"

const SalesHistoryPage: React.FC = () => {
  const { user } = useAuth()
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>("all")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    let canceled = false

    async function loadSales() {
      try {
        const raw = await StorageUtils.getSales?.()

        // Coerce to array regardless of what comes back
        let list: unknown = raw
        if (!Array.isArray(list)) {
          if (list && typeof list === "object") {
            // In case data is stored as an object map
            list = Object.values(list as Record<string, unknown>)
          } else {
            list = []
          }
        }

        // Ensure items are truthy and have a date before sorting
        const arr = (list as any[])
          .filter(Boolean)
          .sort((a, b) => new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime())

        if (!canceled) {
          setSales(arr as Sale[])
          setFilteredSales(arr as Sale[])
        }
      } catch (err) {
        console.error("Error loading sales:", err)
        if (!canceled) {
          setSales([])
          setFilteredSales([])
        }
      }
    }

    loadSales()
    return () => {
      canceled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const reload = async () => {
      try {
        const raw = await StorageUtils.getSales?.()
        const list = Array.isArray(raw) ? raw : []
        const arr = list
          .filter(Boolean)
          .sort((a: any, b: any) => new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime())
        if (!cancelled) {
          setSales(arr as any)
          setFilteredSales(arr as any)
        }
      } catch {
        if (!cancelled) {
          setSales([])
          setFilteredSales([])
        }
      }
    }
    const handler = (e: any) => {
      const t = e?.detail?.table
      if (t === "sales") reload()
    }
    window.addEventListener("data-updated", handler as EventListener)
    return () => {
      cancelled = true
      window.removeEventListener("data-updated", handler as EventListener)
    }
  }, [])

  useEffect(() => {
    let filtered = sales

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          sale.receiptNumber.toString().includes(searchTerm) ||
          sale.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Date filter
    if (selectedDate) {
      filtered = filtered.filter((sale) => new Date(sale.date).toDateString() === new Date(selectedDate).toDateString())
    }

    // Payment type filter
    if (paymentTypeFilter !== "all") {
      filtered = filtered.filter((sale) => sale.paymentType === paymentTypeFilter)
    }

    setFilteredSales(filtered)
  }, [sales, searchTerm, selectedDate, paymentTypeFilter])

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale)
    setShowDetailsModal(true)
  }

  const getTotalRevenue = () => {
    return filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "naqd":
        return "Naqd"
      case "karta":
        return "Karta"
      case "qarz":
        return "Qarz"
      default:
        return type
    }
  }

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case "naqd":
        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      case "karta":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      case "qarz":
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
    }
  }

  const handleDownloadReport = () => {
    const filters = {
      dateFrom: selectedDate,
      dateTo: selectedDate,
      cashier: "",
      paymentType: paymentTypeFilter !== "all" ? paymentTypeFilter : "",
    }
    exportToWord(filteredSales, filters)
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Savdo tarixi</h1>
        {user?.role === "admin" && (
          <button
            onClick={handleDownloadReport}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            <Download className="h-5 w-5" />
            <span>Hisobotni yuklab olish</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Chek raqami, kassir yoki mijoz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={paymentTypeFilter}
              onChange={(e) => setPaymentTypeFilter(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg pl-10 pr-8 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Barcha to'lovlar</option>
              <option value="naqd">Naqd</option>
              <option value="karta">Karta</option>
              <option value="qarz">Qarz</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Summary - Only 2 cards now */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Jami savdolar</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredSales.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm">Umumiy summa</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {getTotalRevenue().toLocaleString()} so'm
          </p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Chek
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  To'lov
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Sana/Vaqt
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Kassir
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Mahsulotlar
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Summa
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Harakat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900 dark:text-white font-medium">#{sale.receiptNumber}</div>
                    {sale.customerName && (
                      <div className="text-gray-500 dark:text-gray-400 text-sm">{sale.customerName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPaymentTypeColor(sale.paymentType)}`}
                    >
                      {getPaymentTypeLabel(sale.paymentType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    <div>{formatDateUzbek(new Date(sale.date))}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      {formatTimeUzbek(new Date(sale.date))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{sale.cashierName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {sale.items.length} ta mahsulot
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900 dark:text-white font-semibold">
                      {sale.total.toLocaleString()} so'm
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(sale)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Ko'rish</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Savdo topilmadi</p>
          </div>
        )}
      </div>

      {/* Sale Details Modal */}
      {showDetailsModal && selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedSale(null)
          }}
          onPrint={() => {
            console.log("print")
          }}
        />
      )}
    </div>
  )
}

export default SalesHistoryPage
