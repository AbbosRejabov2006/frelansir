"use client"

import type React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"
import type { Sale } from "../../types"

interface SalesChartProps {
  sales?: Sale[]
}

const SalesChart: React.FC<SalesChartProps> = ({ sales = [] }) => {
  const getLast7DaysData = () => {
    const last7Days = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      const dayName = date.toLocaleDateString("uz-UZ", { weekday: "short" })
      const dateStr = date.toDateString()

      const daySales = sales.filter((sale) => new Date(sale.date).toDateString() === dateStr)

      const revenue = daySales.reduce((sum, sale) => sum + sale.total, 0)

      last7Days.push({
        day: dayName,
        revenue: revenue,
        sales: daySales.length,
      })
    }

    return last7Days
  }

  const chartData = getLast7DaysData()
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue))

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2" />
        Oxirgi 7 kunlik savdo
      </h3>

      {maxRevenue > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
                formatter={(value: number, name: string) => [
                  name === "revenue" ? `${value.toLocaleString()} so'm` : value,
                  name === "revenue" ? "Tushum" : "Savdolar",
                ]}
                labelStyle={{ color: "#F9FAFB" }}
              />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Oxirgi 7 kunlik savdo ma'lumotlari yo'q</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesChart
