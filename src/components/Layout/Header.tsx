"use client"

import type React from "react"
import { useState } from "react"
import { User, LogOut, ChevronDown, Package, Sun, Moon } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { useToast } from "../../hooks/use-toast"

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { toast } = useToast()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    toast({
      variant: "success",
      title: "🔒 Tizimdan chiqdingiz",
      description: "Xavfsiz ravishda tizimdan chiqdingiz",
    })
    setShowUserMenu(false)
  }

  const handleThemeToggle = () => {
    toggleTheme()
    toast({
      variant: "success",
      title: theme === "light" ? "🌙 Tungi rejim yoqildi" : "☀️ Kunduzgi rejim yoqildi",
      description: theme === "light" ? "Interfeys qorong'u rejimga o'tkazildi" : "Interfeys yorug' rejimga o'tkazildi",
    })
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 fixed top-0 left-0 right-0 z-30 ml-64">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-500 p-2 rounded-lg">
            <Package className="h-6 w-6 text-gray-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Grand Wall</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">Aboy va aksessuarlar</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <button
            onClick={handleThemeToggle}
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
            title={theme === "light" ? "Tungi rejimga o'tish" : "Kunduzgi rejimga o'tish"}
          >
            <div className="relative w-6 h-6">
              {/* Sun Icon */}
              <Sun
                className={`absolute inset-0 h-6 w-6 transition-all duration-500 transform ${
                  theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
                }`}
              />
              {/* Moon Icon */}
              <Moon
                className={`absolute inset-0 h-6 w-6 transition-all duration-500 transform ${
                  theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                }`}
              />
            </div>
            {/* Hover effect background */}
            <div className="absolute inset-0 rounded-lg bg-yellow-500/10 scale-0 group-hover:scale-100 transition-transform duration-200" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="bg-yellow-500 p-2 rounded-full">
                <User className="h-4 w-4 text-gray-900" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-gray-900 dark:text-white font-medium text-sm">{user?.name}</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs capitalize">{user?.role}</p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-gray-900 dark:text-white font-medium">{user?.name}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm capitalize">@{user?.username}</p>
                </div>

                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Chiqish</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />}
    </header>
  )
}

export default Header
