"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Calendar,
  ChevronDown,
  ShoppingCart,
  BarChart3,
  History,
  Wallpaper,
} from "lucide-react"
import { StorageUtils } from "../../utils/storage"
import { useAuth } from "../../context/AuthContext"
import { formatDateUzbek, formatTimeUzbek } from "../../utils/dateUtils"
import { io } from "socket.io-client"

const socket = io("http://192.168.1.5:8000", {
  transports: ["websocket"], // fallbacklarni o'chirish uchun
});
interface DashboardPageProps {
  onTabChange?: (tab: string) => void
}

type TopProductsPeriod = "1day" | "1week" | "1month"

const DashboardPage: React.FC<DashboardPageProps> = ({ onTabChange }) => {
  const { user } = useAuth()
  const [topProductsPeriod, setTopProductsPeriod] = useState<TopProductsPeriod>("1day")

  // Load data asynchronously (fixes: sales.filter is not a function)
  const [sales, setSales] = useState<any[]>([])
  const [debtors, setDebtors] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    socket.emit("data", "ass")
    socket.on("data", (msg: any) => {
      const resProducts = JSON.parse(msg || "{}").products || [];
      const resCategories = JSON.parse(msg || "{}").categories || [];
      localStorage.setItem("products", JSON.stringify(resProducts))
      localStorage.setItem("categories", JSON.stringify(resCategories))
      if (typeof resProducts === "string") {
        setProducts(JSON.parse(resProducts))
      } else {
        setProducts(resProducts)
      }


      console.log("time outlar quyildi");
      // setFilteredProducts(msg.products || [])
    });
    let active = true
      ; (async () => {
        try {
          const [s, d] = await Promise.all([StorageUtils.getSales(), StorageUtils.getDebtors()])
          if (!active) return
          setSales(Array.isArray(s) ? s : [])
          setDebtors(Array.isArray(d) ? d : [])
        } catch (e) {
          console.error("Dashboard data load failed:", e)
          if (!active) return
          setSales([])
          setDebtors([])
        }
      })()
    return () => {
      active = false
    }
  }, [])

  // Calculate today's sales
  const today = new Date().toDateString()
  const todaySales = sales.filter((sale) => new Date(sale.date).toDateString() === today)
  const todayRevenue = todaySales.reduce((sum, sale) => sum + (sale.total ?? 0), 0)

  // Calculate this month's sales
  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const monthSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date)
    return saleDate.getMonth() === thisMonth && saleDate.getFullYear() === thisYear
  })
  const monthRevenue = monthSales.reduce((sum, sale) => sum + (sale.total ?? 0), 0)

  // Calculate total debt
  const totalDebt = debtors
    .filter((debtor) => debtor.status === "active")
    .reduce((sum, debtor) => sum + (debtor.remainingDebt ?? 0), 0)

  // Calculate low stock products (less than 5 for wallpaper business)
  const lowStockProducts = products.filter((product) => (product.stock ?? 0) < 5).length

  // Get due soon debtors
  const dueSoonDebtors = debtors.filter((debtor) => {
    if (debtor.status !== "active") return false
    const dueDate = new Date(debtor.dueDate)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return dueDate <= tomorrow
  })

  // Calculate top products based on selected period
  const getTopProducts = () => {
    const now = new Date()
    let startDate: Date

    switch (topProductsPeriod) {
      case "1day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "1week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "1month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }

    const filteredSales = sales.filter((sale) => new Date(sale.date) >= startDate)

    // Count product quantities
    const productCounts: { [key: string]: { name: string; quantity: number; revenue: number; unit: string } } = {}

    filteredSales.forEach((sale) => {
      ; (sale.items ?? []).forEach((item: any) => {
        const product = products.find((p) => p.id === item.productId)
        const unit = product?.unit || item.unit || "dona"

        if (productCounts[item.productId]) {
          productCounts[item.productId].quantity += item.quantity ?? 0
          productCounts[item.productId].revenue += item.total ?? 0
        } else {
          productCounts[item.productId] = {
            name: item.productName ?? item.name ?? "Nomaʼlum mahsulot",
            quantity: item.quantity ?? 0,
            revenue: item.total ?? 0,
            unit: unit,
          }
        }
      })
    })

    // Sort by quantity and get top 4
    return Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4)
  }

  const topProducts = getTopProducts()

  const getPeriodLabel = () => {
    switch (topProductsPeriod) {
      case "1day":
        return "Bugun"
      case "1week":
        return "Bu hafta"
      case "1month":
        return "Bu oy"
      default:
        return "Bugun"
    }
  }

  const handleQuickAction = (action: string) => {
    if (onTabChange) {
      onTabChange(action)
    }
  }

  const stats = [
    {
      title: "Bugungi savdo",
      value: `${todayRevenue.toLocaleString()} so'm`,
      subtitle: `${todaySales.length} ta savdo`,
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-900/20 dark:bg-green-900/20",
    },
    {
      title: "Oylik savdo",
      value: `${monthRevenue.toLocaleString()} so'm`,
      subtitle: `${monthSales.length} ta savdo`,
      icon: TrendingUp,
      color: "text-yellow-400",
      bgColor: "bg-yellow-900/20 dark:bg-yellow-900/20",
    },
    {
      title: "Faol qarzdorlar",
      value: debtors.filter((d) => d.status === "active").length.toString(),
      subtitle: `${totalDebt.toLocaleString()} so'm`,
      icon: Users,
      color: "text-orange-400",
      bgColor: "bg-orange-900/20 dark:bg-orange-900/20",
    },
    {
      title: "Kam qolgan mahsulotlar",
      value: lowStockProducts.toString(),
      subtitle: "Omborda kam qolgan",
      icon: Package,
      color: lowStockProducts > 0 ? "text-red-400" : "text-green-400",
      bgColor: lowStockProducts > 0 ? "bg-red-900/20 dark:bg-red-900/20" : "bg-green-900/20 dark:bg-green-900/20",
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Xush kelibsiz, {user?.name}!</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bugun: {formatDateUzbek(new Date())}, {formatTimeUzbek(new Date())}
        </p>
        <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">🖼️ GrandWall - Aboy va aksessuarlar do'koni</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">{stat.value}</h3>
              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">{stat.subtitle}</p>
            </div>
          )
        })}
      </div>

      {/* Warnings - Only show debt warnings */}
      {dueSoonDebtors.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
            <Users className="mr-2 h-5 w-5 text-yellow-500 dark:text-yellow-400" />
            Ogohlantirishlar
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <h3 className="mb-2 font-medium text-red-600 dark:text-red-400">
                ⏰ Qarz muddati tugash arafasida ({dueSoonDebtors.length} kishi)
              </h3>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {dueSoonDebtors
                  .slice(0, 3)
                  .map((d) => d.customerName)
                  .join(", ")}
                {dueSoonDebtors.length > 3 && ` va yana ${dueSoonDebtors.length - 3} kishi`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="flex h-[450px] flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 flex items-center text-xl font-semibold text-gray-900 dark:text-white">
            <Calendar className="mr-2 h-5 w-5" />
            Tezkor harakatlar
          </h2>
          <div className="flex flex-1 flex-col justify-center space-y-4">
            {[
              {
                id: "sales",
                title: "Savdo qilish",
                description: "Aboy va aksessuar sotish",
                icon: ShoppingCart,
                color: "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
              },
              {
                id: "products",
                title: "Mahsulotlar",
                description: "Aboy va aksessuarlarni boshqarish",
                icon: Wallpaper,
                color: "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-500 dark:hover:bg-yellow-600",
              },
              {
                id: "debtors",
                title: "Qarzdorlar",
                description: "Qarzdorlarni boshqarish",
                icon: Users,
                color: "bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700",
              },
              {
                id: "analytics",
                title: "Statistika",
                description: "Hisobotlar va tahlil",
                icon: BarChart3,
                color: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
              },
              {
                id: "sales-history",
                title: "Savdo tarixi",
                description: "Savdolar tarixini ko'rish",
                icon: History,
                color: "bg-slate-700 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-800",
              },
            ].map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={() => onTabChange?.(action.id)}
                  className={`${action.color} transform rounded-lg p-4 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-6 w-6" />
                    <div className="text-left">
                      <h3 className="text-lg font-semibold">{action.title}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="flex h-[450px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 flex flex-shrink-0 items-center justify-between">
            <h2 className="flex items-center text-xl font-semibold text-gray-900 dark:text-white">
              <Wallpaper className="mr-2 h-5 w-5" />
              Eng ko'p sotilgan mahsulotlar
            </h2>
            <div className="relative">
              <select
                value={topProductsPeriod}
                onChange={(e) => setTopProductsPeriod(e.target.value as TopProductsPeriod)}
                className="appearance-none rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 pr-8 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="1day">1 kunlik</option>
                <option value="1week">1 haftalik</option>
                <option value="1month">1 oylik</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-650"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 flex-1 items-center space-x-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500 text-sm font-bold text-gray-900">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-base font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {product.quantity} {product.unit} sotilgan
                          </div>
                        </div>
                      </div>
                      <div className="ml-3 flex-shrink-0 text-right">
                        <div className="text-base font-semibold text-yellow-600 dark:text-yellow-400">
                          {product.revenue.toLocaleString()} so'm
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-1 items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <Wallpaper className="mx-auto mb-4 h-16 w-16 opacity-50" />
                  <p className="text-lg">
                    {(() => {
                      switch (topProductsPeriod) {
                        case "1day":
                          return "Bugun hali savdo bo'lmagan"
                        case "1week":
                          return "Bu hafta hali savdo bo'lmagan"
                        case "1month":
                          return "Bu oy hali savdo bo'lmagan"
                        default:
                          return "Hali savdo bo'lmagan"
                      }
                    })()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
