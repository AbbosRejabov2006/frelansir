"use client"

import type React from "react"
import {
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Home,
  Receipt,
  Grid3X3,
  AlertTriangle,
  Scroll,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext" // Import useTheme

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth()
  const { theme } = useTheme() // Get current theme

  const menuItems = [
    { id: "dashboard", label: "Bosh sahifa", icon: Home, check: () => true },
    { id: "sales", label: "Savdo qilish", icon: ShoppingCart, check: () => true },
    {
      id: "sales-history",
      label: "Savdo tarixi",
      icon: Receipt,
      check: () =>
        user?.role === "admin" ||
        user?.permissions?.includes("analytics_view_all") ||
        user?.permissions?.includes("analytics_view_own"),
    },
    { id: "products", label: "Mahsulotlar", icon: Package, check: () => true },
    { id: "low-stock", label: "Kam qolgan", icon: AlertTriangle, check: () => true },
    {
      id: "categories",
      label: "Kategoriyalar",
      icon: Grid3X3,
      check: () =>
        user?.role === "admin" ||
        user?.permissions?.includes("categories_add") ||
        user?.permissions?.includes("categories_edit") ||
        user?.permissions?.includes("categories_delete"),
    },
    { id: "debtors", label: "Qarzdorlar", icon: Users, check: () => true },
    {
      id: "analytics",
      label: "Statistika",
      icon: BarChart3,
      check: () => user?.role === "admin" || user?.permissions?.includes("analytics_view_dashboard"),
    },
    { id: "settings", label: "Sozlamalar", icon: Settings, check: () => user?.role === "admin" },
  ]

  const filteredItems = menuItems.filter((item) => item.check())

  return (
    <aside
      className={`w-64 min-h-screen fixed left-0 top-0 z-40 shadow-2xl ${
        theme === "dark"
          ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700"
          : "bg-white border-r border-gray-200"
      }`}
    >
      {/* Logo Section */}
      <div
        className={`p-6 border-b ${
          theme === "dark"
            ? "border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center space-y-4">
          {/* GrandWall Logo */}
          <div className="w-full h-24 flex items-center justify-center group">
            <div className="text-center transform transition-all duration-500 hover:scale-105">
              <div className="flex items-center justify-center space-x-4 mb-2">
                <div className="relative">
                  <Scroll className="h-16 w-16 text-amber-400 transform transition-all duration-700 hover:rotate-12 hover:scale-110 drop-shadow-lg animate-pulse" />
                  <div className="absolute inset-0 h-16 w-16 bg-amber-400 rounded-full opacity-20 animate-ping"></div>
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent animate-pulse">
                    Grand
                  </h1>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 bg-clip-text text-transparent animate-pulse">
                    Wall
                  </h1>
                </div>
              </div>
              <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full mx-auto transform transition-all duration-500 group-hover:w-32"></div>
            </div>
          </div>
        </div>
      </div>

      <nav className="mt-8">
        <div className="space-y-2 px-3">
          {filteredItems.map((item, index) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:translate-x-1 group ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 shadow-xl shadow-amber-500/25 scale-105"
                    : theme === "dark"
                      ? "text-slate-300 hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600 hover:text-white hover:shadow-lg"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "slideInLeft 0.5s ease-out forwards",
                }}
              >
                <Icon
                  className={`h-5 w-5 mr-3 transition-all duration-300 ${
                    isActive
                      ? "text-slate-900 animate-bounce"
                      : theme === "dark"
                        ? "group-hover:scale-110 group-hover:rotate-3"
                        : "text-gray-600 group-hover:scale-110 group-hover:rotate-3"
                  }`}
                />
                <span className="transition-all duration-300">{item.label}</span>
                {isActive && (
                  <div
                    className={`ml-auto w-2 h-2 rounded-full animate-pulse ${
                      theme === "dark" ? "bg-slate-900" : "bg-gray-900"
                    }`}
                  ></div>
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 animate-pulse"></div>

      <style jsx>{`
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `}</style>
    </aside>
  )
}

export default Sidebar
