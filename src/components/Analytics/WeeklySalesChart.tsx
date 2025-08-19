"use client"

import type React from "react"
import type { Sale } from "../../types"

interface WeeklySalesChartProps {
  sales: Sale[]
}

const WeeklySalesChart: React.FC<WeeklySalesChartProps> = ({ sales }) => {
  // Generate data for the last 7 days
  const generateWeeklyData = () => {
    const data = []
    const today = new Date()
    const dayNames = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"]

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const dayName = dayNames[date.getDay()]
      const dateStr = date.toDateString()

      const daySales = sales.filter((sale) => new Date(sale.date).toDateString() === dateStr)
      const revenue = daySales.reduce((sum, sale) => sum + (sale.finalTotal || sale.total), 0)

      data.push({
        day: dayName,
        revenue: revenue,
        sales: daySales.length,
      })
    }

    return data
  }

  const weeklyData = generateWeeklyData()
  const maxRevenue = Math.max(...weeklyData.map((d) => d.revenue), 1)

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
        Haftalik savdo diagrammasi
      </h3>

      <div className="space-y-4">
        {weeklyData.map((day, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="w-20 text-sm text-gray-600 dark:text-gray-400">{day.day}</div>

            <div className="flex-1 mx-4">
              <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                <div
                  className={`absolute top-0 left-0 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    day.sales > 0 ? "bg-blue-500" : "bg-gray-400 dark:bg-gray-600"
                  }`}
                  style={{
                    width: day.revenue > 0 ? `${Math.max((day.revenue / maxRevenue) * 100, 15)}%` : "15%",
                  }}
                >
                  {day.sales} ta
                </div>
              </div>
            </div>

            <div className="w-20 text-right text-sm text-gray-900 dark:text-white font-medium">
              {day.revenue > 0 ? `${(day.revenue / 1000).toFixed(0)} 000` : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeeklySalesChart
