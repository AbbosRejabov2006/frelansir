"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Settings,
  Sun,
  Moon,
  Save,
  User,
  Shield,
  AlertTriangle,
  Trash2,
  UserPlus,
  Edit,
  Users,
  BarChart3,
} from "lucide-react"
import { useTheme } from "../../context/ThemeContext"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../hooks/use-toast"
import type { StockAlert } from "../../types"
import PermissionsPage from "./PermissionsPage"
import { StorageUtils } from "../../utils/storage"
import type { User as EmployeeType } from "../../types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../components/ui/alert-dialog"
import { Dialog, DialogContent, DialogTrigger } from "../../../components/ui/dialog"
import EmployeeModal from "./EmployeeModal"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"

const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { user, refreshUserPermissions } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"general" | "permissions">("general")
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(true)
  const [cashiers, setCashiers] = useState<EmployeeType[]>([])
  const [admins, setAdmins] = useState<EmployeeType[]>([])
  const [editingEmployee, setEditingEmployee] = useState<EmployeeType | null>(null)
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState<boolean>(false)
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null)
  const [deletingEmployeeRole, setDeletingEmployeeRole] = useState<"admin" | "kassir" | null>(null)

  useEffect(() => {
    ;(async () => {
      loadStockAlerts()
      await loadEmployeesAndAdmins()
    })()
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("analytics_enabled")
      if (raw === null) {
        setAnalyticsEnabled(true)
      } else {
        const val = JSON.parse(raw)
        setAnalyticsEnabled(Boolean(val))
      }
    } catch {
      setAnalyticsEnabled(true)
    }
  }, [])

  useEffect(() => {
    const handler = async (e: any) => {
      const t = e?.detail?.table
      if (t === "users") {
        await loadEmployeesAndAdmins()
      }
    }
    window.addEventListener("data-updated", handler as EventListener)
    return () => {
      window.removeEventListener("data-updated", handler as EventListener)
    }
  }, [])

  const loadStockAlerts = () => {
    try {
      const savedAlerts = localStorage.getItem("stock_alerts")
      if (savedAlerts) {
        setStockAlerts(JSON.parse(savedAlerts))
      } else {
        const defaultAlerts: StockAlert[] = [
          { unit: "dona", threshold: 20 },
          { unit: "rulon", threshold: 10 },
          { unit: "litr", threshold: 50 },
          { unit: "kg", threshold: 5 },
          { unit: "metr", threshold: 100 },
        ]
        setStockAlerts(defaultAlerts)
        localStorage.setItem("stock_alerts", JSON.stringify(defaultAlerts))
      }
    } catch (error) {
      console.error("Error loading stock alerts:", error)
    }
  }

  const loadEmployeesAndAdmins = async () => {
    try {
      const allUsers = await StorageUtils.getUsers()
      const list = Array.isArray(allUsers) ? allUsers : []
      setCashiers(list.filter((u) => u.role === "kassir"))
      setAdmins(list.filter((u) => u.role === "admin"))
    } catch (e) {
      setCashiers([])
      setAdmins([])
    }
  }

  const handleSaveSettings = () => {
    try {
      localStorage.setItem("stock_alerts", JSON.stringify(stockAlerts))
      localStorage.setItem("analytics_enabled", JSON.stringify(analyticsEnabled))
      window.dispatchEvent(
        new CustomEvent("settings-updated", { detail: { key: "analytics_enabled", value: analyticsEnabled } }),
      )
      toast({
        variant: "success",
        title: "✅ Saqlandi!",
        description: "Sozlamalar muvaffaqiyatli saqlandi",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Xatolik!",
        description: "Sozlamalarni saqlashda xatolik yuz berdi",
      })
    }
  }

  const handleStockAlertChange = (unit: string, threshold: number) => {
    const updatedAlerts = stockAlerts.map((alert) => (alert.unit === unit ? { ...alert, threshold } : alert))
    setStockAlerts(updatedAlerts)
  }

  const addNewStockAlert = () => {
    const newUnit = prompt("Yangi o'lchov birligini kiriting:")
    if (newUnit && !stockAlerts.find((alert) => alert.unit === newUnit.trim())) {
      const newAlert: StockAlert = { unit: newUnit.trim(), threshold: 10 }
      setStockAlerts([...stockAlerts, newAlert])
    }
  }

  const removeStockAlert = (unit: string) => {
    if (window.confirm(`"${unit}" o'lchov birligi uchun ogohlantirishni o'chirishni xohlaysizmi?`)) {
      setStockAlerts(stockAlerts.filter((alert) => alert.unit !== unit))
    }
  }

  const handleEditEmployee = (employee: EmployeeType) => {
    setEditingEmployee(employee)
    setIsEmployeeModalOpen(true)
  }

  const handleEmployeeModalClose = () => {
    setIsEmployeeModalOpen(false)
    setEditingEmployee(null)
    loadEmployeesAndAdmins() // Refresh lists
    refreshUserPermissions() // Refresh current user
  }

  const handleDeleteEmployeeTrigger = (employeeId: string, role: "admin" | "kassir") => {
    if (role === "admin" && admins.length <= 1) {
      toast({
        variant: "destructive",
        title: "❌ Xatolik!",
        description: "Tizimda kamida bitta admin qolishi shart.",
      })
      return
    }
    setDeletingEmployeeId(employeeId)
    setDeletingEmployeeRole(role)
  }

  const confirmDeleteEmployee = async () => {
    if (deletingEmployeeId && deletingEmployeeRole) {
      try {
        if (deletingEmployeeRole === "admin" && admins.length <= 1) {
          toast({
            variant: "destructive",
            title: "❌ Xatolik!",
            description: "Tizimda kamida bitta admin qolishi shart.",
          })
          return
        }

        await StorageUtils.deleteUser(deletingEmployeeId)
        toast({
          variant: "success",
          title: "✅ O'chirildi!",
          description: "Hodim muvaffaqiyatli o'chirildi.",
        })
        await loadEmployeesAndAdmins() // Refresh lists
        refreshUserPermissions()
      } catch (error) {
        console.error("Error deleting employee:", error)
        toast({
          variant: "destructive",
          title: "❌ Xatolik!",
          description: "Hodimni o'chirishda xatolik yuz berdi.",
        })
      } finally {
        setDeletingEmployeeId(null)
        setDeletingEmployeeRole(null)
      }
    }
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header with Tabs */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gray-600 dark:bg-gray-500 p-2 rounded-lg">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sozlamalar</h1>
          <p className="text-gray-600 dark:text-gray-400">Tizim sozlamalarini boshqaring</p>
        </div>
      </div>

      {/* Tabs */}
      {user?.role === "admin" && (
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === "general"
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Umumiy sozlamalar</span>
          </button>
          <button
            onClick={() => setActiveTab("permissions")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
              activeTab === "permissions"
                ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span>Hodim huquqlari</span>
          </button>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === "permissions" ? (
        <PermissionsPage />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Info Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <User className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Foydalanuvchi ma'lumotlari</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-500 p-2 rounded-full">
                    <User className="h-4 w-4 text-gray-900" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">@{user?.username}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-green-500 p-2 rounded-full">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{user?.role}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.role === "admin" ? "Barcha huquqlar" : "Kassir huquqlari"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 text-blue-500" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-500" />
                )}
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mavzu sozlamalari</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Qorong'u rejim</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {theme === "dark" ? "Hozir qorong'u rejim yoqilgan" : "Hozir yorug' rejim yoqilgan"}
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      theme === "dark" ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        theme === "dark" ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Statistika sozlamalari</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Statistikani ko&apos;rsatish</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {analyticsEnabled ? "Hozir statistika ko'rsatilmoqda" : "Statistika o'chirilgan"}
                    </p>
                  </div>
                  <button
                    onClick={() => setAnalyticsEnabled((v) => !v)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      analyticsEnabled ? "bg-blue-600" : "bg-gray-300"
                    }`}
                    aria-pressed={analyticsEnabled}
                    aria-label={analyticsEnabled ? "Statistikani o'chirish" : "Statistikani yoqish"}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        analyticsEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Stock Alert Settings */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 col-span-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Kam qolgan mahsulot ogohlantirishi
                  </h2>
                </div>
                <button
                  onClick={addNewStockAlert}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm"
                >
                  + Yangi birlik
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {stockAlerts.map((alert) => (
                  <div
                    key={alert.unit}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{alert.unit}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {alert.threshold} {alert.unit}dan kam qolganda
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={alert.threshold}
                        onChange={(e) => handleStockAlertChange(alert.unit, Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-center text-gray-900 dark:text-white text-sm"
                        min="1"
                        max="1000"
                      />
                      <button
                        onClick={() => removeStockAlert(alert.unit)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400"
                        title="O'chirish"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>Sozlamalarni saqlash</span>
                </button>
              </div>
            </div>

            {/* Employees and Admins Blocks */}
            {user?.role === "admin" && (
              <div className="col-span-full">
                {/* Header with Add Employee Button */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Hodimlar boshqaruvi</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tizim foydalanuvchilarini boshqaring</p>
                  </div>
                  {/* Add Employee button */}
                  <Dialog open={isEmployeeModalOpen} onOpenChange={setIsEmployeeModalOpen}>
                    <DialogTrigger asChild>
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
                        onClick={() => setEditingEmployee(null)}
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Yangi ishchi</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <EmployeeModal
                        isOpen={isEmployeeModalOpen}
                        onClose={handleEmployeeModalClose}
                        employee={editingEmployee}
                        onSave={loadEmployeesAndAdmins}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cashiers */}
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-0 pt-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-3">
                        <Users className="h-5 w-5 text-purple-500" />
                        <span>Hodimlar ro'yxati</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-96 overflow-y-auto px-0 pb-0">
                      {cashiers.length > 0 ? (
                        cashiers.map((employee) => (
                          <div
                            key={employee.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{employee.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">@{employee.username}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditEmployee(employee)}
                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                title="Tahrirlash"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <AlertDialog
                                open={deletingEmployeeId === employee.id}
                                onOpenChange={(open: boolean) => {
                                  if (!open) setDeletingEmployeeId(null)
                                }}
                              >
                                <AlertDialogTrigger asChild>
                                  <button
                                    onClick={() => handleDeleteEmployeeTrigger(employee.id, employee.role)}
                                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400"
                                    title="O'chirish"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Ushbu hodimni o'chirmoqchimisiz?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu amalni bekor qilib bo'lmaydi. Hodim tizimdan butunlay o'chiriladi.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setDeletingEmployeeId(null)}>
                                      Bekor qilish
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={confirmDeleteEmployee}>Ha, o'chirish</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Hodimlar topilmadi</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Admins */}
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 px-0 pt-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-green-500" />
                        <span>Adminlar ro'yxati</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 max-h-96 overflow-y-auto px-0 pb-0">
                      {admins.length > 0 ? (
                        admins.map((employee) => (
                          <div
                            key={employee.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{employee.name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">@{employee.username}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditEmployee(employee)}
                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                title="Tahrirlash"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <AlertDialog
                                open={deletingEmployeeId === employee.id}
                                onOpenChange={(open: boolean) => {
                                  if (!open) setDeletingEmployeeId(null)
                                }}
                              >
                                <AlertDialogTrigger asChild>
                                  <button
                                    onClick={() => handleDeleteEmployeeTrigger(employee.id, employee.role)}
                                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400"
                                    title="O'chirish"
                                    disabled={admins.length <= 1}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Ushbu adminni o'chirmoqchimisiz?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu amalni bekor qilib bo'lmaydi. Admin tizimdan butunlay o'chiriladi.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setDeletingEmployeeId(null)}>
                                      Bekor qilish
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={confirmDeleteEmployee}>Ha, o'chirish</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Adminlar topilmadi</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* Version Info */}
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            <p>GrandWall POS v1.0.0 - 2024</p>
            <p>Barcha huquqlar himoyalangan</p>
          </div>
        </>
      )}
    </div>
  )
}

export default SettingsPage
