"use client"

import type React from "react"
import type { Sale } from "../../types"

interface TopProductsChartProps {
  sales: Sale[]
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ sales }) => {
  // Calculate top products
  const getTopProducts = () => {
    const productMap = new Map()

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = productMap.get(item.productId) || {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        }

        existing.quantity += item.quantity
        existing.revenue += item.quantity * item.price

        productMap.set(item.productId, existing)
      })
    })

    return Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4)
  }

  const topProducts = getTopProducts()
  const maxQuantity = Math.max(...topProducts.map((p) => p.quantity), 1)

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
        Eng ko'p sotilgan mahsulotlar
      </h3>

      <div className="space-y-6">
        {topProducts.length > 0 ? (
          topProducts.map((product, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400 flex-1">{product.name}</div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{product.quantity} rulon</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {product.revenue.toLocaleString()} so'm
                  </div>
                </div>
              </div>

              <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                <div
                  className="absolute top-0 left-0 h-6 bg-orange-500 rounded-full"
                  style={{
                    width: `${Math.max((product.quantity / maxQuantity) * 100, 5)}%`,
                  }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>Hali mahsulot sotilmagan</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TopProductsChart
