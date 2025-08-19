"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Users, AlertTriangle } from "lucide-react"
import type { Debtor } from "../../types"
import { StorageUtils } from "../../utils/storage"
import DebtorCard from "./DebtorCard"
import PaymentModal from "./PaymentModal"

const DebtorsPage: React.FC = () => {
  const [debtors, setDebtors] = useState<Debtor[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null)
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "closed">("active")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await StorageUtils.getDebtors()
        if (mounted) setDebtors(Array.isArray(data) ? data : [])
      } catch (e) {
        if (mounted) setDebtors([])
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const reload = async () => {
      try {
        const data = await StorageUtils.getDebtors()
        if (!cancelled) setDebtors(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setDebtors([])
      }
    }
    const handler = (e: any) => {
      const t = e?.detail?.table
      if (t === "debtors" || t === "payments") reload()
    }
    window.addEventListener("data-updated", handler as EventListener)
    return () => {
      cancelled = true
      window.removeEventListener("data-updated", handler as EventListener)
    }
  }, [])

  const filteredDebtors = (Array.isArray(debtors) ? debtors : []).filter((debtor) => {
    if (filterStatus === "all") return true
    return debtor.status === filterStatus
  })

  // Get debtors with due dates soon
  const getDueSoonDebtors = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 59, 999)

    return (Array.isArray(debtors) ? debtors : []).filter((debtor) => {
      if (debtor.status !== "active") return false
      const dueDate = new Date(debtor.dueDate)
      return dueDate <= tomorrow
    })
  }

  const dueSoonDebtors = getDueSoonDebtors()

  const totalActiveDebt = (Array.isArray(debtors) ? debtors : [])
    .filter((d) => d.status === "active")
    .reduce((sum, d) => sum + (Number(d.remainingDebt) || 0), 0)

  const handlePayment = async (debtorId: string, amount: number, paymentType: "naqd" | "karta") => {
    const debtor = (Array.isArray(debtors) ? debtors : []).find((d) => d.id === debtorId)
    if (!debtor) return

    const newRemainingDebt = debtor.remainingDebt - amount
    const newPaidAmount = debtor.paidAmount + amount
    const newStatus = newRemainingDebt <= 0 ? "closed" : "active"

    const payment = {
      id: Date.now().toString(),
      debtorId,
      amount,
      paymentType,
      date: new Date().toISOString(),
      cashierId: "current-user", // Should be actual user ID
    }

    const updatedDebtor:Debtor = {
      ...debtor,
      paidAmount: newPaidAmount,
      remainingDebt: Math.max(0, newRemainingDebt),
      status: newStatus as "active" | "paid",
      payments: [...debtor.payments, payment],
    }

    try {
      await StorageUtils.updateDebtor(debtorId, updatedDebtor)
      await StorageUtils.addPayment(payment)
      setDebtors((prev) => prev.map((d) => (d.id === debtorId ? updatedDebtor : d)))
    } finally {
      setShowPaymentModal(false)
      setSelectedDebtor(null)
    }

    if (newStatus === "closed") {
      alert("Qarz to'liq to'landi!")
    } else {
      alert("To'lov muvaffaqiyatli amalga oshirildi!")
    }
  }

  const handlePaymentClick = (debtor: Debtor) => {
    setSelectedDebtor(debtor)
    setShowPaymentModal(true)
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Qarzdorlar</h1>
        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <span>
            Faol qarzdorlar: {(Array.isArray(debtors) ? debtors : []).filter((d) => d.status === "active").length}
          </span>
          <span>Yopilgan: {(Array.isArray(debtors) ? debtors : []).filter((d) => d.status === "paid").length}</span>
          <span>Jami qarz: {totalActiveDebt.toLocaleString()} so'm</span>
        </div>
      </div>

      {/* Warnings */}
      {dueSoonDebtors.length > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
            <h3 className="text-red-700 dark:text-red-400 font-medium">
              Muddati tugash arafasida ({dueSoonDebtors.length})
            </h3>
          </div>
          <div className="text-gray-700 dark:text-gray-300 text-sm">
            {dueSoonDebtors
              .slice(0, 3)
              .map((d) => d.customerName)
              .join(", ")}
            {dueSoonDebtors.length > 3 && ` va yana ${dueSoonDebtors.length - 3} kishi`}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg w-fit">
          <button
            onClick={() => setFilterStatus("active")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterStatus === "active"
                ? "bg-orange-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Faol{" "}
            {(Array.isArray(debtors) ? debtors : []).filter((d) => d.status === "active").length > 0
              ? `(${(Array.isArray(debtors) ? debtors : []).filter((d) => d.status === "active").length})`
              : ""}
          </button>
          <button
            onClick={() => setFilterStatus("closed")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterStatus === "closed"
                ? "bg-orange-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Yopilgan{" "}
            {(Array.isArray(debtors) ? debtors : []).filter((d) => d.status === "paid").length > 0
              ? `(${(Array.isArray(debtors) ? debtors : []).filter((d) => d.status === "paid").length})`
              : ""}
          </button>
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-orange-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Barchasi{" "}
            {(Array.isArray(debtors) ? debtors : []).length > 0
              ? `(${(Array.isArray(debtors) ? debtors : []).length})`
              : ""}
          </button>
        </div>
      </div>

      {/* Debtors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDebtors.map((debtor) => (
          <DebtorCard key={debtor.id} debtor={debtor} onPayment={() => handlePaymentClick(debtor)} />
        ))}
      </div>

      {filteredDebtors.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>
            {filterStatus === "active"
              ? "Faol qarzdorlar yo'q"
              : filterStatus === "closed"
                ? "Yopilgan qarzdorlar yo'q"
                : "Qarzdorlar yo'q"}
          </p>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedDebtor && (
        <PaymentModal
          debtor={selectedDebtor}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedDebtor(null)
          }}
          onConfirm={handlePayment}
        />
      )}
    </div>
  )
}

export default DebtorsPage
