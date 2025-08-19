"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Plus, Package, Minus } from "lucide-react"
import type { Product, Category } from "../../types"
import * as LucideIcons from "lucide-react"

interface ProductGridProps {
  products: Product[] | unknown
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onAddToCart: (product: Product, quantity: number) => void
  categories: Category[] | unknown
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  selectedCategory,
  onCategoryChange,
  onAddToCart,
  categories,
}) => {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [isMobile, setIsMobile] = useState(false)

  const safeProducts = useMemo<Product[]>(() => (Array.isArray(products) ? (products as Product[]) : []), [products])
  const safeCategories = useMemo<Category[]>(
    () => (Array.isArray(categories) ? (categories as Category[]) : []),
    [categories],
  )

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768)
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  const getIcon = (iconName?: string) => {
    if (!iconName) return LucideIcons.Package
    const IconComponent = (LucideIcons as any)[iconName]
    return IconComponent || LucideIcons.Package
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, Number.isFinite(quantity) ? quantity : 1),
    }))
  }

  const getQuantity = (productId: string) => {
    return quantities[productId] || 1
  }

  const handleAddToCart = (product: Product) => {
    const quantity = getQuantity(product.id)
    onAddToCart(product, quantity)
    setQuantities((prev) => ({
      ...prev,
      [product.id]: 1,
    }))
  }

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-6">
        {isMobile ? (
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          >
            <option value="all">Barchasi ({safeProducts.length})</option>
            {safeCategories.map((category) => {
              const count = safeProducts.filter((p) => p.categoryId === category.id).length
              return (
                <option key={category.id} value={category.id}>
                  {category.name} ({count})
                </option>
              )
            })}
          </select>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryChange("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-orange-600 text-white"
                  : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
              }`}
            >
              Barchasi ({safeProducts.length})
            </button>
            {safeCategories.map((category) => {
              const IconComponent = getIcon(category.icon)
              const count = safeProducts.filter((p) => p.categoryId === category.id).length
              return (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? "bg-orange-600 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{category.name}</span>
                  <span>({count})</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {safeProducts.map((product) => {
          const IconComponent = getIcon(product.icon)
          const stock = Number(product?.stock ?? 0)
          const isOutOfStock = stock <= 0
          const isLowStock = stock < 10 && stock > 0
          const price = Number(product?.price ?? 0)

          return (
            <div
              key={product.id}
              className={`bg-white dark:bg-gray-800 border rounded-xl p-4 transition-all hover:shadow-lg h-full flex flex-col ${
                isOutOfStock
                  ? "border-red-300 dark:border-red-800 opacity-60"
                  : isLowStock
                    ? "border-yellow-300 dark:border-yellow-800"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div
                  className={`p-3 rounded-lg ${
                    isOutOfStock
                      ? "bg-red-100 dark:bg-red-900/20"
                      : isLowStock
                        ? "bg-yellow-100 dark:bg-yellow-900/20"
                        : "bg-orange-600"
                  }`}
                >
                  <IconComponent
                    className={`h-6 w-6 ${
                      isOutOfStock
                        ? "text-red-600 dark:text-red-400"
                        : isLowStock
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-white"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 dark:text-white font-semibold text-sm">{product.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    {price.toLocaleString()} so'm/{product.unit}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Omborda:</span>
                  <span
                    className={`font-medium ${
                      isOutOfStock
                        ? "text-red-600 dark:text-red-400"
                        : isLowStock
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {stock} {product.unit}
                  </span>
                </div>
              </div>

              <div className="flex-1"></div>

              {!isOutOfStock && (
                <div className="space-y-3 mt-auto">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(product.id, getQuantity(product.id) - 1)}
                      className="p-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-gray-700 dark:text-white"
                      disabled={getQuantity(product.id) <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={stock}
                      value={getQuantity(product.id)}
                      onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value) || 1)}
                      className="flex-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white text-center text-sm"
                    />
                    <button
                      onClick={() => handleQuantityChange(product.id, getQuantity(product.id) + 1)}
                      className="p-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-gray-700 dark:text-white"
                      disabled={getQuantity(product.id) >= stock}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Savatga qo'shish</span>
                  </button>
                </div>
              )}

              {isOutOfStock && (
                <div className="text-center py-2 mt-auto">
                  <span className="text-red-600 dark:text-red-400 text-sm font-medium">Tugagan</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {safeProducts.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Bu kategoriyada mahsulot topilmadi</p>
        </div>
      )}
    </div>
  )
}

export default ProductGrid
