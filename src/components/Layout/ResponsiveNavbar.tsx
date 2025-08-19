"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  User,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useTheme } from "../../context/ThemeContext"
import { useToast } from "../../hooks/use-toast"

interface ResponsiveNavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  cartCount?: number
  onCartClick?: () => void
}

const ResponsiveNavbar: React.FC<ResponsiveNavbarProps> = ({ activeTab, onTabChange, cartCount = 0, onCartClick }) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { toast } = useToast()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container') && !target.closest('.hamburger-button')) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  const handleLogout = () => {
    logout()
    toast({
      variant: "success",
      title: "🔒 Tizimdan chiqdingiz",
      description: "Xavfsiz ravishda tizimdan chiqdingiz",
    })
    setShowUserMenu(false)
    setIsMobileMenuOpen(false)
  }

  const handleThemeToggle = () => {
    toggleTheme()
    toast({
      variant: "success",
      title: theme === "light" ? "🌙 Tungi rejim yoqildi" : "☀️ Kunduzgi rejim yoqildi",
      description: theme === "light" ? "Interfeys qorong'u rejimga o'tkazildi" : "Interfeys yorug' rejimga o'tkazildi",
    })
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

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

  const handleMenuItemClick = (tabId: string) => {
    onTabChange(tabId)
    // Close mobile menu after selecting an item
    setTimeout(() => {
      setIsMobileMenuOpen(false)
    }, 100)
  }

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 navbar-transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Hamburger + Logo */}
          <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
            {/* Hamburger menu button */}
            <button
              onClick={toggleMobileMenu}
              className={`hamburger-button p-2 mr-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${isMobileMenuOpen ? 'hamburger-open' : ''}`}
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <div className={`hamburger-line w-6 h-0.5 bg-current mb-1.5 transition-all duration-300 ${isMobileMenuOpen ? 'transform rotate-45 translate-y-2' : ''}`}></div>
                <div className={`hamburger-line w-6 h-0.5 bg-current mb-1.5 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`hamburger-line w-6 h-0.5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''}`}></div>
              </div>
            </button>
            {/* Logo */}
            <div className="flex items-center space-x-2 min-w-0">
              <div className="bg-yellow-500 p-2 rounded-lg flex-shrink-0">
                <Scroll className="h-6 w-6 text-gray-900" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">Grand Wall</h1>
            </div>
          </div>
          {/* Right: Cart, Theme/User */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Cart Icon (mobile) */}
            <button
              onClick={onCartClick}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-yellow-400 transition-colors rounded-lg focus:outline-none"
              aria-label="Savat"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow-lg animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
            {/* Theme Toggle Button */}
            <button
              onClick={handleThemeToggle}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
              title={theme === "light" ? "Tungi rejimga o'tish" : "Kunduzgi rejimga o'tish"}
            >
              <div className="relative w-6 h-6">
                <Sun
                  className={`absolute inset-0 h-6 w-6 transition-all duration-500 transform ${
                    theme === "light" ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
                  }`}
                />
                <Moon
                  className={`absolute inset-0 h-6 w-6 transition-all duration-500 transform ${
                    theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
                  }`}
                />
              </div>
            </button>
            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="bg-yellow-500 p-2 rounded-full">
                  <User className="h-4 w-4 text-gray-900" />
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 mobile-menu-enter">
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
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-container mobile-menu-enter">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
            {filteredItems.map((item, index) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 text-base font-medium rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-yellow-500 text-gray-900 shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: "slideDown 0.3s ease-out forwards",
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
      {/* Click outside to close dropdowns */}
      {(showUserMenu || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserMenu(false)
            setIsMobileMenuOpen(false)
          }} 
        />
      )}
    </nav>
  )
}

export default ResponsiveNavbar
