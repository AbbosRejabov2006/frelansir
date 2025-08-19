"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import LoginPage from "./components/Login/LoginPage"
import Header from "./components/Layout/Header"
import Sidebar from "./components/Layout/Sidebar"
import ResponsiveNavbar from "./components/Layout/ResponsiveNavbar"
import DashboardPage from "./components/Dashboard/DashboardPage"
import SalesPage from "./components/Sales/SalesPage"
import SalesHistoryPage from "./components/Sales/SalesHistoryPage"
import ProductsPage from "./components/Products/ProductsPage"
import LowStockPage from "./components/Products/LowStockPage"
import CategoriesPage from "./components/Categories/CategoriesPage"
import DebtorsPage from "./components/Debtors/DebtorsPage"
import AnalyticsPage from "./components/Analytics/AnalyticsPage"
import SettingsPage from "./components/Settings/SettingsPage"
import { Toaster } from "./components/ui/toaster"

const AppContent: React.FC = () => {
  const { user } = useAuth()
  // Har doim bosh sahifa default bo'lishi uchun 'dashboard' ga o'rnatamiz
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isMobile, setIsMobile] = useState(false)
  // For mobile cart badge
  const [cartCount, setCartCount] = useState(0)
  const [showCartModal, setShowCartModal] = useState(false)

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Foydalanuvchi tizimga kirganda yoki chiqganda, activeTab ni 'dashboard' ga qaytaramiz
  useEffect(() => {
    if (user) {
      setActiveTab("dashboard")
    }
  }, [user]) // user o'zgarganda ishga tushadi

  if (!user) {
    return <LoginPage />
  }

  // Handler for mobile cart click (optional, can be used to scroll to cart section)
  const handleCartClick = () => {
    setShowCartModal(true)
    if (activeTab !== "sales") setActiveTab("sales")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage onTabChange={setActiveTab} />
      case "sales":
        return <SalesPage onCartCountChange={setCartCount} onCartClick={handleCartClick} showCartModal={showCartModal} setShowCartModal={setShowCartModal} />
      case "sales-history":
        return <SalesHistoryPage />
      case "products":
        return <ProductsPage />
      case "low-stock":
        return <LowStockPage />
      case "categories":
        return <CategoriesPage />
      case "debtors":
        return <DebtorsPage />
      case "analytics":
        return <AnalyticsPage />
      case "settings":
        return <SettingsPage />
      default:
        return <DashboardPage onTabChange={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Mobile Layout */}
      {isMobile ? (
        <>
          <ResponsiveNavbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            cartCount={cartCount}
            onCartClick={handleCartClick}
          />
          <main className="pt-16 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {renderContent()}
            </div>
          </main>
        </>
      ) : (
        <>
          {/* Desktop Layout */}
          <Header />
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <main className="pt-20 pl-64 transition-colors duration-300">
            {renderContent()}
          </main>
        </>
      )}
      <Toaster />
    </div>
  )
}

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
