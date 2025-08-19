"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Plus, Minus, ShoppingCart, X, Search } from "lucide-react"
import type { Product, SaleItem, Sale, Category } from "../../types"
import { StorageUtils } from "../../utils/storage"
import { useAuth } from "../../context/AuthContext"
import { printReceipt } from "../../utils/print"
import { useToast } from "../../hooks/use-toast"
import ProductGrid from "./ProductGrid"
import CartSummary from "./CartSummary"
import PaymentModal from "./PaymentModal"
import { io } from "socket.io-client"
import { log } from "console"

interface SalesPageProps {
  onCartCountChange?: (count: number) => void
  onCartClick?: () => void
  showCartModal?: boolean
  setShowCartModal?: (open: boolean) => void
}
const socket = io("https://beckend-production-3ce1.up.railway.app", {
  transports: ["websocket"], // fallbacklarni o'chirish uchun
});

const SalesPage: React.FC<SalesPageProps> = ({ onCartCountChange, onCartClick, showCartModal, setShowCartModal }) => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<SaleItem[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isMobile, setIsMobile] = useState(false)

  // Load products & categories asynchronously
  useEffect(() => {
    socket.emit("data", "test")
    socket.on("data", (msg: any) => {
      // console.log(msg);
      const resProducts = JSON.parse(msg || "{}").products || [];
      const resCategories = JSON.parse(msg || "{}").categories || [];
      if (typeof resProducts === "string") {
        setProducts(JSON.parse(resProducts))
      } else {
        setProducts(resProducts)
      }
      if (typeof resCategories === "string") {
        setCategories(JSON.parse(resCategories))
      } else {
        setCategories(resCategories)
      }
      // setFilteredProducts(msg.products || [])
    });

    // console.log(socket);

  }, [])

  // useEffect(() => {
  //   let cancelled = false
  //   const reload = async () => {
  //     try {
  //       const [prods, cats] = await Promise.all([StorageUtils.getProducts(), StorageUtils.getCategories()])
  //       if (cancelled) return
  //       setProducts(Array.isArray(prods) ? prods : [])
  //       setCategories(Array.isArray(cats) ? cats : [])
  //       setFilteredProducts(Array.isArray(prods) ? prods : [])
  //     } catch {
  //       if (!cancelled) {
  //         setProducts([])
  //         setCategories([])
  //         setFilteredProducts([])
  //       }
  //     }
  //   }
  //   const handler = (e: any) => {
  //     const t = e?.detail?.table
  //     if (t === "products" || t === "categories") reload()
  //   }
  //   window.addEventListener("data-updated", handler as EventListener)
  //   return () => {
  //     cancelled = true
  //     window.removeEventListener("data-updated", handler as EventListener)
  //   }
  // }, [])

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768)
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Smart search function with fuzzy matching
  const smartSearch = (list: Product[], rawTerm: string): Product[] => {
    if (!rawTerm?.trim()) return list
    const term = rawTerm.toLowerCase().trim()

    const charMap: { [key: string]: string[] } = {
      g: ["g", "ғ", "г"],
      ғ: ["g", "ғ", "г"],
      г: ["g", "ғ", "г"],
      o: ["o", "о"],
      о: ["o", "о"],
      a: ["a", "а"],
      а: ["a", "а"],
      e: ["e", "е"],
      е: ["e", "е"],
      p: ["p", "р"],
      р: ["p", "р"],
      c: ["c", "с"],
      с: ["c", "с"],
      x: ["x", "х"],
      х: ["x", "х"],
      y: ["y", "у"],
      у: ["y", "у"],
      h: ["h", "ҳ", "х"],
      ҳ: ["h", "ҳ", "х"],
      q: ["q", "қ"],
      қ: ["q", "қ"],
      s: ["s", "с"],
      t: ["t", "т"],
      т: ["t", "т"],
      n: ["n", "н"],
      н: ["n", "н"],
      m: ["m", "м"],
      м: ["m", "м"],
      i: ["i", "и", "ӣ"],
      и: ["i", "и", "ӣ"],
      ӣ: ["i", "и", "ӣ"],
      u: ["u", "у", "ў"],
      ў: ["u", "у", "ў"],
    }

    const createFlexiblePattern = (s: string): RegExp => {
      let pattern = ""
      for (const ch of s) {
        const variations = charMap[ch] || [ch]
        pattern += `[${variations.join("")}]`
      }
      return new RegExp(pattern, "i")
    }

    const isSubsequence = (needle: string, haystack: string): boolean => {
      let i = 0
      for (let j = 0; j < haystack.length && i < needle.length; j++) {
        if (needle[i].toLowerCase() === haystack[j].toLowerCase()) {
          i++
        }
      }
      return i === needle.length
    }

    return list.filter((product) => {
      const productName = product.name?.toLowerCase?.() || ""
      if (!productName) return false

      if (productName.includes(term)) return true

      const flexible = createFlexiblePattern(term)
      if (flexible.test(productName)) return true

      const words = productName.split(/\s+/)
      const searchWords = term.split(/\s+/)

      for (const searchWord of searchWords) {
        for (const word of words) {
          if (word.startsWith(searchWord)) return true
          const wordPattern = createFlexiblePattern(searchWord)
          if (wordPattern.test(word)) return true
          if (isSubsequence(searchWord, word)) return true
        }
      }
      return false
    })
  }

  // Compute filtered products safely
  useEffect(() => {
    const base = Array.isArray(products) ? products : []
    let filtered = base

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory)
    }
    if (searchTerm.trim()) {
      filtered = smartSearch(filtered, searchTerm)
    }
    setFilteredProducts(filtered)
  }, [products, selectedCategory, searchTerm])

  useEffect(() => {
    if (onCartCountChange) onCartCountChange(cart.length)
  }, [cart.length, onCartCountChange])

  // Mobile cart trigger wiring placeholder
  useEffect(() => {
    return () => { }
  }, [onCartClick])

  const handleCartModalClose = () => setShowCartModal && setShowCartModal(false)

  const addToCart = (product: Product, quantity: number) => {
    const stock = Number(product?.stock ?? 0)
    if (stock < quantity) {
      toast({
        variant: "destructive",
        title: "❌ Omborda yetarli mahsulot yo'q",
        description: `Qolgan miqdor: ${stock} ${product?.unit || ""}`,
      })
      return
    }

    const existingItem = cart.find((item) => item.productId === product.id)
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity
      if (stock < newQuantity) {
        toast({
          variant: "destructive",
          title: "❌ Omborda yetarli mahsulot yo'q",
          description: `Qolgan miqdor: ${stock} ${product?.unit || ""}`,
        })
        return
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id ? { ...item, quantity: newQuantity, total: newQuantity * item.price } : item,
        ),
      )
    } else {
      const price = Number(product?.price ?? 0)
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity,
        unit: product.unit,
        price,
        total: price * quantity,
      }
      setCart((prev) => [...prev, newItem])
    }
  }

  const updateCartItem = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId))
      return
    }

    const product = (Array.isArray(products) ? products : []).find((p) => p.id === productId)
    if (product && Number(product.stock ?? 0) < quantity) {
      toast({
        variant: "destructive",
        title: "❌ Omborda yetarli mahsulot yo'q",
        description: `Qolgan miqdor: ${product.stock} ${product.unit}`,
      })
      return
    }

    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity, total: item.price * quantity } : item)),
    )
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }

  const totalAmount = useMemo(() => cart.reduce((sum, item) => sum + item.total, 0), [cart])

  const handlePayment = async (paymentData: any) => {
    const receiptNumber = await StorageUtils.getNextReceiptNumber()
    const cashierName = user?.name || user?.username || "Kassir"

    const sale: Sale = {
      id: Date.now().toString(),
      receiptNumber,
      items: cart,
      total: paymentData.originalTotal || totalAmount,
      paymentType: paymentData.paymentType,
      cashierId: user!.id,
      cashierName,
      date: new Date().toISOString(),
      discount: paymentData.discount || 0,
      discountPercent: paymentData.discountPercent || 0,
      finalTotal: paymentData.finalTotal || totalAmount,
      customerName: paymentData.customerName,
      customerPhone: paymentData.customerPhone,
      paidAmount: paymentData.paidAmount,
      remainingDebt: paymentData.remainingDebt,
      dueDate: paymentData.dueDate,
    }

    // Update product stock
    const base = Array.isArray(products) ? products : []
    const updatedProducts = base.map((product) => {
      const cartItem = cart.find((item) => item.productId === product.id)
      if (cartItem) {
        return { ...product, stock: Number(product.stock ?? 0) - cartItem.quantity }
      }
      return product
    })

    socket.emit("data", `{"products": ${JSON.stringify(updatedProducts)}, "categories": ${JSON.stringify(categories)}}`)

    // setProducts(updatedProducts)

    // Save sale
    await StorageUtils.addSale(sale)

    // If debt, add debtor
    if (paymentData.paymentType === "qarz") {
      const debtor = {
        id: Date.now().toString(),
        customerName: paymentData.customerName,
        customerPhone: paymentData.customerPhone,
        totalDebt: sale.finalTotal || sale.total,
        paidAmount: paymentData.paidAmount || 0,
        remainingDebt: (sale.finalTotal || sale.total) - (paymentData.paidAmount || 0),
        dueDate: paymentData.dueDate,
        status: "active" as const,
        sales: [sale],
        payments: [],
      }
      await StorageUtils.addDebtor(debtor)
    }

    printReceipt(sale)

    toast({
      variant: "success",
      title: "✅ Savdo muvaffaqiyatli yakunlandi!",
    })

    setCart([])
    setShowPaymentModal(false)
  }

  const clearSearch = () => setSearchTerm("")

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Products Section */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Mahsulotlarni qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-white" />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-orange-500">{Array.isArray(filteredProducts) ? filteredProducts.length : 0}</span>{" "}
              ta mahsulot topildi "{searchTerm}" uchun
            </div>
          )}
        </div>

        <ProductGrid
          products={Array.isArray(filteredProducts) ? filteredProducts : []}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onAddToCart={addToCart}
          categories={Array.isArray(categories) ? categories : []}
        />
      </div>

      {/* Cart Section (Desktop only) */}
      {!isMobile && (
        <div className="w-80 md:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Savat ({cart.length})
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Savat bo'sh</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.productId} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-gray-900 dark:text-white font-medium flex-1 mr-2 text-sm md:text-base">
                        {item.productName}
                      </h3>
                      <button
                        onClick={() => setCart((prev) => prev.filter((x) => x.productId !== item.productId))}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                          className="p-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded"
                        >
                          <Minus className="h-3 w-3 text-gray-700 dark:text-white" />
                        </button>
                        <span className="text-gray-900 dark:text-white font-medium text-sm md:text-base">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                          className="p-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded"
                        >
                          <Plus className="h-3 w-3 text-gray-700 dark:text-white" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 dark:text-white font-semibold text-sm md:text-base">
                          {item.total.toLocaleString()} so'm
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                          {item.price.toLocaleString()} so'm/{item.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {cart.length > 0 && <CartSummary total={totalAmount} onCheckout={() => setShowPaymentModal(true)} />}
        </div>
      )}

      {/* Cart Modal (Mobile only) */}
      {isMobile && showCartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-auto p-4 relative animate-[slideDown_0.3s]">
            <button
              className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleCartModalClose}
              aria-label="Yopish"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-4">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Savat ({cart.length})
            </h2>
            <div className="flex-1 overflow-y-auto max-h-80 mb-4">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Savat bo'sh</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.productId} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-gray-900 dark:text-white font-medium flex-1 mr-2 text-sm md:text-base">
                          {item.productName}
                        </h3>
                        <button
                          onClick={() => setCart((prev) => prev.filter((x) => x.productId !== item.productId))}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                            className="p-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded"
                          >
                            <Minus className="h-3 w-3 text-gray-700 dark:text-white" />
                          </button>
                          <span className="text-gray-900 dark:text-white font-medium text-sm md:text-base">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                            className="p-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded"
                          >
                            <Plus className="h-3 w-3 text-gray-700 dark:text-white" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-900 dark:text-white font-semibold text-sm md:text-base">
                            {item.total.toLocaleString()} so'm
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                            {item.price.toLocaleString()} so'm/{item.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <CartSummary
                total={totalAmount}
                onCheckout={() => {
                  setShowCartModal && setShowCartModal(false)
                  setShowPaymentModal(true)
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal total={totalAmount} onClose={() => setShowPaymentModal(false)} onConfirm={handlePayment} />
      )}
    </div>
  )
}

export default SalesPage
