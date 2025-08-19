"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AlertTriangle, Package, TrendingDown, RefreshCw } from "lucide-react"

import type { Product, Category, StockAlert } from "../../types"
import * as LucideIcons from "lucide-react"
import { io } from "socket.io-client"

const DEFAULT_ALERTS: StockAlert[] = [
  { unit: "dona", threshold: 20 },
  { unit: "rulon", threshold: 10 },
  { unit: "litr", threshold: 50 },
  { unit: "kg", threshold: 5 },
  { unit: "metr", threshold: 100 },
]

function toArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}
const socket = io("http://192.168.1.5:8000", {
  transports: ["websocket"], // fallbacklarni o'chirish uchun
});

const LowStockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [criticalStockProducts, setCriticalStockProducts] = useState<Product[]>([])
  const [outOfStockProducts, setOutOfStockProducts] = useState<Product[]>([])
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Load alerts then data
    loadStockAlerts()
    // Kick off initial data load
    // We don't depend on alerts being set because we use a local snapshot with defaults.
    void loadData()
  }, [])

  const loadStockAlerts = () => {
    try {
      const saved = localStorage.getItem("stock_alerts")
      if (saved) {
        const parsed = JSON.parse(saved)
        setStockAlerts(Array.isArray(parsed) ? parsed : DEFAULT_ALERTS)
      } else {
        setStockAlerts(DEFAULT_ALERTS)
      }
    } catch (err) {
      console.error("Error loading stock alerts:", err)
      setStockAlerts(DEFAULT_ALERTS)
    }
  }

  const getThresholdForUnit = (unit: string): number => {
    const alert = stockAlerts.find((a) => a.unit === unit)
    return alert ? alert.threshold : 10
  }

  const loadData = async () => {
    try {
      setIsRefreshing(true)

      socket.emit("data", "test")
      socket.on("data", (msg: any) => {
        const resProducts = JSON.parse(msg || "{}").products || [];
        const resCategories = JSON.parse(msg || "{}").categories || [];
        if (typeof resProducts === "string") {
          setProducts(JSON.parse(resProducts))
        } else {
          setProducts(resProducts)
        }
        if (typeof resCategories === "string") {
          setCategories(JSON.parse(resCategories))
        } else {
          setCategories(resCategories)
        }
      })
      // small delay for spinner

      // Awaiting here supports both sync and async StorageUtils implementations.


      // Use a local snapshot of alerts to avoid race conditions on first render
      const alertsSnapshot = Array.isArray(stockAlerts) && stockAlerts.length > 0 ? stockAlerts : DEFAULT_ALERTS
      const getThresholdForUnitLocal = (unit: string): number => {
        const found = alertsSnapshot.find((a) => a.unit === unit)
        return found ? found.threshold : 10
      }

      const outOfStock = products.filter((p) => typeof p?.stock === "number" && p.stock <= 0)
      const criticalStock = products.filter((p) => {
        if (typeof p?.stock !== "number") return false
        const threshold = getThresholdForUnitLocal(p.unit)
        const criticalThreshold = Math.ceil(threshold * 0.25)
        return p.stock > 0 && p.stock <= criticalThreshold
      })
      const lowStock = products.filter((p) => {
        if (typeof p?.stock !== "number") return false
        const threshold = getThresholdForUnitLocal(p.unit)
        const criticalThreshold = Math.ceil(threshold * 0.25)
        return p.stock > criticalThreshold && p.stock <= threshold
      })

      setOutOfStockProducts(outOfStock)
      setCriticalStockProducts(criticalStock)
      setLowStockProducts(lowStock)
    } catch (err) {
      console.error("Error loading low stock data:", err)
      // On error, fall back to empty groups to prevent crashes
      setProducts([])
      setCategories([])
      setOutOfStockProducts([])
      setCriticalStockProducts([])
      setLowStockProducts([])
    } finally {
      setIsRefreshing(false)
    }
  }

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)?.[iconName]
    return IconComponent || LucideIcons.Package
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || "Noma'lum"
  }

  const getStockStatus = (stock: number, unit: string) => {
    const threshold = getThresholdForUnit(unit)
    const criticalThreshold = Math.ceil(threshold * 0.25)

    if (stock <= 0) return { text: "Tugagan", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" }
    if (stock <= criticalThreshold) return { text: "Kritik", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" }
    if (stock <= threshold)
      return { text: "Kam qolgan", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" }
    return { text: "Yetarli", color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" }
  }

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const IconComponent = getIcon(product.icon)
    const status = getStockStatus(Number(product.stock ?? 0), product.unit)
    const threshold = getThresholdForUnit(product.unit)

    return (
      <div
        className={`p-4 rounded-xl border transition-all hover:shadow-lg ${status.bg} border-gray-200 dark:border-gray-700`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            <div
              className={`p-2 rounded-lg ${Number(product.stock ?? 0) <= 0
                  ? "bg-red-500"
                  : Number(product.stock ?? 0) <= Math.ceil(threshold * 0.25)
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
            >
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{getCategoryName(product.categoryId)}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
              {status.text}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Qolgan:</span>
            <span className={`font-semibold ${status.color}`}>
              {Number(product.stock ?? 0)} {product.unit}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Chegarasi:</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {threshold} {product.unit}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Narx:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {typeof (product as any).price === "number"
                ? (product as any).price.toLocaleString()
                : Number((product as any).price ?? 0).toLocaleString()}{" "}
              {"so'm"}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const totalIssues = outOfStockProducts.length + criticalStockProducts.length + lowStockProducts.length

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-red-500 p-2 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kam qolgan mahsulotlar</h1>
            <p className="text-gray-600 dark:text-gray-400">Jami {totalIssues} ta mahsulot e'tibor talab qiladi</p>
          </div>
        </div>

        <button
          onClick={() => void loadData()}
          disabled={isRefreshing}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Yangilanmoqda..." : "Yangilash"}</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500 p-2 rounded-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Tugagan</h3>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{outOfStockProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-500 p-2 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Kritik</h3>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{criticalStockProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">Kam qolgan</h3>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {totalIssues === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">Hammasi yaxshi!</h3>
          <p className="text-gray-600 dark:text-gray-400">Hozircha kam qolgan mahsulotlar yo'q</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Out of Stock Products */}
          {outOfStockProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                {"Tugagan mahsulotlar (" + outOfStockProducts.length + ")"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {outOfStockProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* Critical Stock Products */}
          {criticalStockProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                {"Kritik holat (" + criticalStockProducts.length + ")"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criticalStockProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Products */}
          {lowStockProducts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-yellow-600 dark:text-yellow-400 mb-4 flex items-center">
                <TrendingDown className="h-5 w-5 mr-2" />
                {"Kam qolgan (" + lowStockProducts.length + ")"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LowStockPage
