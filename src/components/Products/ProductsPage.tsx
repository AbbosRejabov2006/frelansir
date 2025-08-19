"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Plus, Search, Package, Edit, Trash2, Grid3X3, List } from "lucide-react"
import type { Product, Category } from "../../types"
// import { StorageUtils } from "../../utils/storage"
import ProductModal from "./ProductModal"
import ProductCard from "./ProductCard"
import { useToast } from "../../hooks/use-toast"
import { useAuth } from "../../context/AuthContext"
import { io } from "socket.io-client"

// Productni tipga mos normalizatsiya (categoryId asosiy)
function normalizeProduct(p: any): Product | null {
  if (!p || typeof p !== "object") return null
  return {
    id: String(p.id ?? Date.now().toString()),
    name: String(p.name ?? ""),
    price: Number.isFinite(p.price) ? Number(p.price) : 0,
    stock: Number.isFinite(p.stock) ? Number(p.stock) : 0,
    unit: String(p.unit ?? "dona"),
    categoryId: String(p.categoryId ?? ""),
    barcode: String(p.barcode ?? ""),
    minStock: Number.isFinite(p.minStock) ? Number(p.minStock) : 5,
  }
}

const socket = io("https://beckend-production-3ce1.up.railway.app", {
  transports: ["websocket"], // fallbacklarni o'chirish uchun
});
const ProductsPage: React.FC = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const canAddProducts = isAdmin || user?.permissions?.includes("products_add")
  const canEditProducts = isAdmin || user?.permissions?.includes("products_edit")
  const canDeleteProducts = isAdmin // faqat admin o‘chiradi

  const [products, setProducts] = useState<Product[] | null>(null)
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const { toast } = useToast()


  // Kategoriyalar uchun tezkor lookup
  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>()
      ; (Array.isArray(categories) ? categories : []).forEach((c) => {
        map.set(String(c.id), String(c.name ?? ""))
      })
    return map
  }, [categories])
  // const [count, setCount] = useState(0)
  // useEffect(() => {
  //   setCount(count + 1)
  // }, [products])

  // Ma'lumotlarni yuklash (asinxron)
  useEffect(() => {

    socket.emit("data", "test")
    socket.on("data", (msg: any) => {
      const resProducts = JSON.parse(msg || "{}").products || [];
      const resCategories = JSON.parse(msg || "{}").categories || [];
      localStorage.setItem("products", JSON.stringify(resProducts))
      localStorage.setItem("categories", JSON.stringify(resCategories))
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

      // console.log(resCategories);

      // setProducts()
      // setCategories(resCategories)

      console.log("time outlar quyildi");
      // setFilteredProducts(msg.products || [])
    });


  }, [])


  // useEffect(() => {
  //   let cancelled = false
  //   const reload = async () => {
  //     try {
  //       const [loadedProductsRaw, loadedCategoriesRaw] = await Promise.all([
  //         StorageUtils.getProducts(),
  //         StorageUtils.getCategories(),
  //       ])
  //       if (cancelled) return

  //       const normalizedProducts = (Array.isArray(loadedProductsRaw) ? loadedProductsRaw : [])
  //         .map((p: any) => ({
  //           id: String(p.id ?? Date.now().toString()),
  //           name: String(p.name ?? ""),
  //           price: Number.isFinite(p.price) ? Number(p.price) : 0,
  //           stock: Number.isFinite(p.stock) ? Number(p.stock) : 0,
  //           unit: String(p.unit ?? ""),
  //           categoryId: String(p.categoryId ?? p.category ?? ""), // tolerate both shapes
  //           barcode: p.barcode ? String(p.barcode) : "",
  //           minStock: Number.isFinite(p.minStock) ? Number(p.minStock) : 5,
  //         }))
  //         .filter((p: any) => Boolean(p?.id))

  //       const normalizedCategories = Array.isArray(loadedCategoriesRaw) ? loadedCategoriesRaw : []
  //       setProducts(normalizedProducts as any)
  //       setCategories(normalizedCategories as any)
  //     } catch {
  //       if (cancelled) return
  //       // keep state
  //     }
  //   }

  //   const handler = (e: any) => {
  //     const t = e?.detail?.table
  //     if (t === "products" || t === "categories") {
  //       reload()
  //     }
  //   }
  //   window.addEventListener("data-updated", handler as EventListener)
  //   return () => {
  //     cancelled = true
  //     window.removeEventListener("data-updated", handler as EventListener)
  //   }
  // }, [])

  // Filter
  const filterProducts = useCallback(() => {
    const base = Array.isArray(products) ? products : []
    let filtered = base

    const term = searchTerm.trim().toLowerCase()
    if (term) {
      filtered = filtered.filter((product) => {
        const name = product.name?.toLowerCase() ?? ""
        const barcode = product.barcode?.toLowerCase() ?? ""
        const categoryName = (categoryNameById.get(product.categoryId) ?? "").toLowerCase()
        return name.includes(term) || barcode.includes(term) || categoryName.includes(term)
      })
    }

    if (stockFilter !== "all") {
      switch (stockFilter) {
        case "in-stock":
          filtered = filtered.filter((product) => Number(product.stock) > 10)
          break
        case "low-stock":
          filtered = filtered.filter((product) => Number(product.stock) > 0 && Number(product.stock) <= 10)
          break
        case "out-of-stock":
          filtered = filtered.filter((product) => Number(product.stock) === 0)
          break
      }
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, stockFilter, categoryNameById])

  useEffect(() => {
    filterProducts()
  }, [filterProducts])

  console.log(products?.length);


  const handleSaveProduct = async (productData: Omit<Product, "id">) => {
    // console.log(products?.length);



    if (!canAddProducts && !canEditProducts) {
      toast({
        variant: "destructive",
        title: "❌ Ruxsat yo'q!",
        description: "Sizda mahsulotlarni boshqarish huquqi yo'q.",
      })
      return
    }

    try {
      if (editingProduct) {
        if (!canEditProducts) {
          toast({
            variant: "destructive",
            title: "❌ Ruxsat yo'q!",
            description: "Sizda mahsulotlarni tahrirlash huquqi yo'q.",
          })
          return
        }
        const updatedProduct = [...products || [], productData]
        socket.emit("data", `{"products": ${JSON.stringify(updatedProduct)}, "categories": ${JSON.stringify(categories)}}`)

        toast({
          variant: "success",
          title: "✅ Muvaffaqiyat!",
          description: "Mahsulot muvaffaqiyatli yangilandi",
        })

      } else {
        if (!canAddProducts) {
          toast({
            variant: "destructive",
            title: "❌ Ruxsat yo'q!",
            description: "Sizda mahsulot qo'shish huquqi yo'q.",
          })
          return
        }
        const newProduct: Product = {
          id: Date.now().toString(),
          ...productData,
        }
        // await StorageUtils.addProduct(newProduct)
        socket.emit("data", `{"products": ${JSON.stringify([newProduct, ...(products || [])])}, "categories": ${JSON.stringify(categories)}}`)

        toast({
          variant: "success",
          title: "✅ Muvaffaqiyat!",
          description: "Mahsulot muvaffaqiyatli qo'shildi",
        })
      }

      // Refresh from storage
      // const refreshedRaw = await StorageUtils.getProducts()
      // const refreshed = (Array.isArray(refreshedRaw) ? refreshedRaw : [])
      //   .map(normalizeProduct)
      //   .filter((p): p is Product => Boolean(p))
      // setProducts(refreshed)
      setIsModalOpen(false)
      setEditingProduct(undefined)
    } catch {
      toast({
        variant: "destructive",
        title: "❌ Xatolik!",
        description: "Mahsulotni saqlashda xatolik yuz berdi",
      })
    }
  }

  const handleEditProduct = (product: Product) => {
    if (!canEditProducts) {
      toast({
        variant: "destructive",
        title: "❌ Ruxsat yo'q!",
        description: "Sizda mahsulotlarni tahrirlash huquqi yo'q.",
      })
      return
    }
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!canDeleteProducts) {
      toast({
        variant: "destructive",
        title: "❌ Ruxsat yo'q!",
        description: "Faqat admin mahsulotlarni o'chirishi mumkin",
      })
      return
    }

    if (window.confirm("Bu mahsulotni o'chirishni xohlaysizmi?")) {
      try {
        // const refreshedRaw = await StorageUtils.getProducts()
        socket.emit("data", `{"products": ${JSON.stringify(products?.filter((p) => p.id !== productId))}, "categories": ${JSON.stringify(categories)}}`)

        // const refreshed = (Array.isArray(refreshedRaw) ? refreshedRaw : [])
        //   .map(normalizeProduct)
        //   .filter((p): p is Product => Boolean(p))
        // setProducts(refreshed)
        toast({
          variant: "success",
          title: "✅ Muvaffaqiyat!",
          description: "Mahsulot muvaffaqiyatli o'chirildi",
        })
      } catch {
        toast({
          variant: "destructive",
          title: "❌ Xatolik!",
          description: "Mahsulotni o'chirishda xatolik yuz berdi",
        })
      }
    }
  }

  const getStockStatus = useCallback((stock: number) => {
    const s = Number(stock) || 0
    if (s === 0) return { label: "Tugagan", color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/20" }
    if (s <= 5) return { label: "Kritik", color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/20" }
    if (s <= 10) return { label: "Kam", color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-900/20" }
    return { label: "Yetarli", color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/20" }
  }, [])

  const safeFilteredProducts = useMemo(() => {
    return Array.isArray(filteredProducts) ? filteredProducts : []
  }, [filteredProducts])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mahsulotlar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Jami {safeFilteredProducts.length} ta mahsulot</p>
        </div>
        {canAddProducts && (
          <button
            onClick={() => {
              setEditingProduct(undefined)
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-5 w-5" />
            <span>Mahsulot qo'shish</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Mahsulot yoki shtrix kod qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
            />
          </div>

          {/* Stock Filter */}
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg pl-10 pr-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
            >
              <option value="all">Barcha mahsulotlar</option>
              <option value="in-stock">Zaxirada yetarli</option>
              <option value="low-stock">Kam qolgan</option>
              <option value="out-of-stock">Tugagan</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${viewMode === "grid"
                ? "bg-orange-600 text-white"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Katak</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${viewMode === "table"
                ? "bg-orange-600 text-white"
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
            >
              <List className="h-4 w-4" />
              <span>Jadval</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {safeFilteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={canEditProducts ? () => handleEditProduct(product) : () => { }}
              onDelete={canDeleteProducts ? () => handleDeleteProduct(product.id) : () => { }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mahsulot
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Shtrix kod
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kategoriya
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Narx
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Zaxira
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Holat
                  </th>
                  {(canEditProducts || canDeleteProducts) && (
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amallar
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {safeFilteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock)
                  const categoryName = categoryNameById.get(product.categoryId) || "—"
                  return (
                    <tr key={product.id} className="transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                          {product.barcode || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {categoryName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {Number(product.price || 0).toLocaleString()} {"so'm"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {Number(product.stock || 0)} {product.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bgColor} ${stockStatus.color}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>
                      {(canEditProducts || canDeleteProducts) && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            {canEditProducts && (
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 transition-colors"
                                title="Tahrirlash"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {canDeleteProducts && (
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="O'chirish"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {safeFilteredProducts.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Mahsulot topilmadi</p>
          <p className="text-sm">Qidiruv shartlarini o'zgartiring yoki yangi mahsulot qo'shing</p>
        </div>
      )}

      {(canAddProducts || canEditProducts) && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingProduct(undefined)
          }}
          onSave={handleSaveProduct}
          product={editingProduct}
          categories={categories || []}
        />
      )}
    </div>
  )
}

export default ProductsPage
