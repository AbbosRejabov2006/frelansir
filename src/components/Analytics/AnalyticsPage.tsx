"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { BarChart3, Calendar, DollarSign, TrendingUp, Filter, Trash2 } from "lucide-react"
import { StorageUtils } from "../../utils/storage"
import WeeklySalesChart from "./WeeklySalesChart"
import TopProductsChart from "./TopProductsChart"
import CashierStatsCard from "./CashierStatsCard"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../hooks/use-toast"
import type { Sale } from "../../types"

const AnalyticsPage: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("today")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [showCustomRange, setShowCustomRange] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)

  // Load feature toggle
  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem("analytics_enabled")
        if (raw === null) setAnalyticsEnabled(true)
        else setAnalyticsEnabled(Boolean(JSON.parse(raw)))
      } catch {
        setAnalyticsEnabled(true)
      }
    }
    read()
    const handler = (e: any) => {
      if (e?.detail?.key === "analytics_enabled") {
        setAnalyticsEnabled(Boolean(e.detail.value))
      }
    }
    window.addEventListener("settings-updated", handler as EventListener)
    return () => window.removeEventListener("settings-updated", handler as EventListener)
  }, [])

  // Load sales asynchronously and always keep it as an array
  const [sales, setSales] = useState<Sale[]>([])
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await StorageUtils.getSales()
        if (!cancelled) {
          setSales(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("[analytics] Failed to load sales:", err)
          setSales([])
          toast({
            variant: "destructive",
            title: "Ma'lumotlarni yuklashda xatolik",
            description: "Savdolarni olishda muammo yuz berdi. Keyinroq urinib ko'ring.",
          })
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [toast])

  // Re-sync when other tabs/devices update data
  useEffect(() => {
    const handler = async (e: any) => {
      const t = e?.detail?.table
      if (t === "sales") {
        try {
          const data = await StorageUtils.getSales()
          setSales(Array.isArray(data) ? data : [])
        } catch {
          setSales([])
        }
      }
    }
    window.addEventListener("data-updated", handler as EventListener)
    return () => {
      window.removeEventListener("data-updated", handler as EventListener)
    }
  }, [])

  // Helper to compute totals robustly
  function getSaleTotal(sale: any): number {
    if (typeof sale?.totalAmount === "number" && Number.isFinite(sale.totalAmount)) {
      return sale.totalAmount
    }
    const legacy = Number(sale?.finalTotal ?? sale?.total ?? 0)
    return Number.isFinite(legacy) ? legacy : 0
  }

  // Filter sales based on selected period; memoized and always an array
  const filteredSales: Sale[] = useMemo(() => {
    const list: Sale[] = Array.isArray(sales) ? sales : []
    if (list.length === 0) return []

    const now = new Date()
    let startDate: Date | null = null
    let endDate: Date = now

    if (showCustomRange && customStartDate && customEndDate) {
      startDate = new Date(customStartDate)
      endDate = new Date(customEndDate)
      endDate.setHours(23, 59, 59, 999)
    } else {
      switch (dateFilter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case "all":
        default:
          return list
      }
    }

    if (!startDate) return list
    return list.filter((sale) => {
      const saleDate = new Date((sale as any).date)
      return saleDate >= startDate! && saleDate <= endDate
    })
  }, [sales, dateFilter, showCustomRange, customStartDate, customEndDate])

  // Calculate total statistics safely
  const { totalRevenue, totalSales, averageSale, totalDiscount } = useMemo(() => {
    const safeList = Array.isArray(filteredSales) ? filteredSales : []
    const revenue = safeList.reduce((sum, sale) => sum + getSaleTotal(sale), 0)
    const total = safeList.length
    const avg = total > 0 ? revenue / total : 0
    const discount = safeList.reduce((sum, sale: any) => sum + Number(sale?.discount ?? 0), 0)
    return {
      totalRevenue: revenue,
      totalSales: total,
      averageSale: avg,
      totalDiscount: discount,
    }
  }, [filteredSales])

  // Get unique cashiers and their filtered sales
  const cashierStats = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string
        name: string
        sales: Sale[]
      }
    >()
    for (const sale of filteredSales) {
      const cashierId = (sale as any).cashierId ?? "unknown"
      const cashierName = (sale as any).cashierName ?? "Noma'lum kassir"
      if (!map.has(cashierId)) {
        map.set(cashierId, { id: cashierId, name: cashierName, sales: [] })
      }
      map.get(cashierId)!.sales.push(sale)
    }
    return Array.from(map.values())
  }, [filteredSales])

  const getPeriodLabel = () => {
    if (showCustomRange && customStartDate && customEndDate) {
      return `${new Date(customStartDate).toLocaleDateString("uz-UZ")} - ${new Date(customEndDate).toLocaleDateString("uz-UZ")}`
    }
    switch (dateFilter) {
      case "today":
        return "Bugun"
      case "week":
        return "Bu hafta"
      case "month":
        return "Bu oy"
      case "all":
        return "Barcha vaqt"
      default:
        return "Barcha vaqt"
    }
  }

  const handleCustomRangeToggle = () => {
    setShowCustomRange(!showCustomRange)
    if (!showCustomRange) {
      const today = new Date()
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      setCustomStartDate(weekAgo.toISOString().split("T")[0])
      setCustomEndDate(today.toISOString().split("T")[0])
    }
  }

  const handleClearStatistics = async () => {
    try {
      await StorageUtils.saveSales([])
      toast({
        variant: "success",
        title: "✅ Statistika tozalandi",
        description: "Barcha savdo ma'lumotlari muvaffaqiyatli o'chirildi",
      })
      setShowClearModal(false)
      setSales([])
      window.dispatchEvent(new CustomEvent("data-updated", { detail: { table: "sales" } }))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Xatolik!",
        description: "Statistikani tozalashda xatolik yuz berdi",
      })
    }
  }

  if (!analyticsEnabled) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            Statistika o&apos;chirilgan. Sozlamalar sahifasidan yoqishingiz mumkin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Statistika</h1>
          <p className="text-gray-600 dark:text-gray-400">Savdo va kassirlar statistikasi</p>
        </div>

        {/* Clear Statistics Button - Admin Only */}
        {user?.role === "admin" && (
          <button
            onClick={() => setShowClearModal(true)}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Trash2 className="h-5 w-5" />
            <span>📉 Statistikani tozalash</span>
          </button>
        )}
      </div>

      {/* Clear Statistics Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">⚠️ Diqqat!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Statistikani tozalashni xohlaysizmi? Ushbu amalni bekor qilib bo'lmaydi.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleClearStatistics}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  Ha, tozalash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: "today", label: "Bugun" },
            { key: "week", label: "Hafta" },
            { key: "month", label: "Oy" },
            { key: "all", label: "Barchasi" },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => {
                setDateFilter(filter.key as "today" | "week" | "month" | "all")
                setShowCustomRange(false)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                dateFilter === filter.key && !showCustomRange
                  ? "bg-orange-600 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {filter.label}
            </button>
          ))}

          <button
            onClick={handleCustomRangeToggle}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              showCustomRange
                ? "bg-orange-600 text-white shadow-lg"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Sana oralig'i</span>
          </button>
        </div>

        {/* Custom Date Range */}
        {showCustomRange && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Boshlanish sanasi
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tugash sanasi</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">{getPeriodLabel()}</p>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {totalRevenue.toLocaleString()} so'm
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Jami tushum</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">{getPeriodLabel()}</p>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{totalSales}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Jami savdolar</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">{getPeriodLabel()}</p>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{averageSale.toLocaleString()} so'm</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">O'rtacha savdo</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
              <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">{getPeriodLabel()}</p>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {totalDiscount.toLocaleString()} so'm
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Jami chegirmalar</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <WeeklySalesChart sales={filteredSales} />
        <TopProductsChart sales={filteredSales} />
      </div>

      {/* Cashier Statistics */}
      {(user?.role === "admin" || user?.permissions?.includes("analytics_view_cashier_stats")) && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Kassirlar statistikasi ({getPeriodLabel()})
          </h2>

          {cashierStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cashierStats.map((cashier) => (
                <CashierStatsCard key={cashier.id} cashierName={cashier.name} sales={cashier.sales} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tanlangan vaqt oralig'ida savdo topilmadi</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AnalyticsPage
