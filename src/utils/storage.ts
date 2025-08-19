import type { Product, Category, Sale, Debtor, User } from "../types"

type TableName = "products" | "categories" | "sales" | "debtors" | "users" | "payments"

const HAS_WINDOW = typeof window !== "undefined"

const LOCAL_KEYS = {
  products: "local_products",
  categories: "local_categories",
  sales: "local_sales",
  debtors: "local_debtors",
  users: "local_users",
  payments: "local_payments",
} as const



function upsertById<T extends { id: string }>(arr: T[], item: T): T[] {
  console.log("product update qilidi");

  const idx = arr.findIndex((x) => String(x.id) === String(item.id))
  if (idx >= 0) {
    const copy = [...arr]
    copy[idx] = item
    return copy
  }
  return [...arr, item]
}





export class StorageUtils {

  // Products
  static async getProducts(): Promise<Product[]> {
    const response = await fetch("http://192.168.1.5:8000/products")
    const data = await response.json()
    return data
  }

  static async saveProducts(products: Product[]): Promise<void> {
    const arr = Array.isArray(products) ? products : []
    const response = await fetch("http://192.168.1.5:8000/products", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(arr),
    })
    const data = await response.json()
    return data
  }

  // Categories
  static async getCategories(): Promise<Category[]> {
    const response = await fetch("http://192.168.1.5:8000/categories")
    const data = await response.json()
    return data
  }

  static async saveCategories(categories: Category[]): Promise<void> {
    const arr = Array.isArray(categories) ? categories : []
    const response = await fetch("http://192.168.1.5:8000/categories", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(arr),
    })
    const data = await response.json()
    return data
  }








  // Sales
  static async getSales(): Promise<Sale[]> {
    const response = await fetch("http://192.168.1.5:8000/sales")
    const data = await response.json()
    return data
  }

  static async saveSales(sales: Sale[]): Promise<any> {
    try {
      const arr = Array.isArray(sales) ? sales : []
      const response = await fetch("http://192.168.1.5:8000/sales", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(arr),
      })

      // Response JSON bo‘lmasa ham xato chiqmasligi uchun
      let data: any = null
      const text = await response.text()
      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = text
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      return data
    } catch (error) {
      console.error("Save sales failed:", error)
      throw error
    }
  }


  static async addSale(sale: Sale): Promise<void> {
    const res = await fetch("http://192.168.1.5:8000/sales")
    const dataAll = await res.json()
    const next = [...dataAll, sale]
    const response = await fetch("http://192.168.1.5:8000/sales", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(next),
    })
    const data = await response.json()
    return data
  }

  static async getNextReceiptNumber(): Promise<string> {
    const res = await fetch("http://192.168.1.5:8000/sales")
    const data = await res.json()
    return String(data.length + 1)
  }

  // Debtors
  static async getDebtors(): Promise<Debtor[]> {
    const response = await fetch("http://192.168.1.5:8000/debtors")
    const data = await response.json()
    return data
  }

  static async saveDebtors(debtors: Debtor[]): Promise<void> {
    const arr = Array.isArray(debtors) ? debtors : []
    const response = await fetch("http://192.168.1.5:8000/debtors", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(arr),
    })
    const data = await response.json()
    return data
  }

  static async addDebtor(debtor: Debtor): Promise<void> {
    const res = await fetch("http://192.168.1.5:8000/debtors")
    const dataAll = await res.json()
    const next = [...dataAll, debtor]
    const response = await fetch("http://192.168.1.5:8000/debtors", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(next),
    })
    const data = await response.json()
    return data
  }

  static async updateDebtor(debtorId: string, updatedDebtor: Debtor): Promise<void> {
    const res = await fetch(`http://192.168.1.5:8000/debtors`)
    const dataAll = await res.json()
    const next = dataAll.map((d: Debtor) => (String(d.id) === String(debtorId) ? updatedDebtor : d))
    const response1 = await fetch(`http://192.168.1.5:8000/debtors`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(next),
    })
    const data = await response1.json()
    return data
  }

  static async addPayment(payment: any): Promise<void> {
    const res = await fetch("http://192.168.43.240:8000/payments")
    const dataAll = await res.json()
    const next = upsertById(dataAll, payment)
    const response = await fetch("http://192.168.1.5:8000/payments", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(next),
    })
    const data = await response.json()
    return data
  }

  // Users
  static async getUsers(): Promise<User[]> {
    const response = await fetch("http://192.168.1.5:8000/users")
    const data = await response.json()
    return data
  }

  static async saveUsers(users: User[]): Promise<void> {
    const arr = Array.isArray(users) ? users : []
    const response = await fetch("http://192.168.1.5:8000/users", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(arr),
    })
    const data = await response.json()
    return data
  }

  static async addUser(user: User): Promise<void> {
    const res = await fetch("http://192.168.1.5:8000/users")
    const dataAll = await res.json()
    const next = upsertById(dataAll, user)
    const response = await fetch("http://192.168.1.5:8000/users", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(next),
    })
    const data = await response.json()
    return data
  }

  static async updateUser(updatedUser: User): Promise<void> {
    const res = await fetch("http://192.168.1.5:8000/users")
    const dataAll = await res.json()
    const next = upsertById(dataAll, updatedUser)
    const response = await fetch("http://192.168.1.5:8000/users", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(next),
    })
    const data = await response.json()
    return data
  }

  static async deleteUser(userId: string): Promise<void> {
    const res = await fetch("http://192.168.1.5:8000/users")
    const dataAll = await res.json()
    const next = dataAll.filter((u: User) => String(u.id) !== String(userId))
    const response = await fetch("http://192.168.1.5:8000/users", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(next),
    })
    const data = await response.json()
    return data
  }


}
