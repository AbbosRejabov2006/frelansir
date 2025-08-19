export interface User {
  id: string
  name: string
  username: string
  password?: string // Optional for security, not sent to client
  role: "admin" | "kassir"
  permissions?: string[] // Added permissions field
}

export interface Product {
  id: string
  name: string
  price: number
  stock: number
  categoryId: string
  barcode: string
  unit: string
  minStock: number
}

export interface Category {
  id: string
  name: string
  description?: string
  icon: string
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unit: string
  price: number
  total: number
}

export interface Sale {
  id: string
  receiptNumber: string
  cashierId: string
  cashierName: string
  date: string
  items: SaleItem[]
  total: number
  paymentType: "cash" | "card" | "qarz"
  discount?: number
  discountPercent?: number
  finalTotal?: number
  customerName?: string
  customerPhone?: string
  paidAmount?: number
  remainingDebt?: number
  dueDate?: string
}

export interface Debtor {
  id: string
  customerName: string
  customerPhone: string
  totalDebt: number
  paidAmount: number
  remainingDebt: number
  dueDate: string
  status: "active" | "paid"
  sales: Sale[]
  payments: { date: string; amount: number }[]
}

export interface StockAlert {
  unit: string
  threshold: number
}

export interface TelegramConfig {
  chatId: string
  botToken: string
}
