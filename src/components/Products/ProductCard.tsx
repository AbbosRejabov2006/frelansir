"use client"

import type React from "react"
import { Edit, Trash2, Package, AlertTriangle } from "lucide-react"
import type { Product } from "../../types"
import { useAuth } from "../../context/AuthContext"

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  const getStockStatus = () => {
    if (product.stock === 0) {
      return {
        label: "Tugagan",
        color: "text-red-500",
        bgColor: "bg-red-100 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800",
        progressColor: "bg-red-500",
        percentage: 0,
      }
    }
    if (product.stock <= 5) {
      return {
        label: "Kritik",
        color: "text-red-500",
        bgColor: "bg-red-100 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800",
        progressColor: "bg-red-500",
        percentage: (product.stock / 20) * 100,
      }
    }
    if (product.stock <= 10) {
      return {
        label: "Kam",
        color: "text-yellow-500",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
        borderColor: "border-yellow-200 dark:border-yellow-800",
        progressColor: "bg-yellow-500",
        percentage: (product.stock / 20) * 100,
      }
    }
    return {
      label: "Yetarli",
      color: "text-green-500",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      progressColor: "bg-green-500",
      percentage: Math.min((product.stock / 20) * 100, 100),
    }
  }

  const stockStatus = getStockStatus()

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group">
      {/* Status Indicator */}
      <div
        className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold ${stockStatus.bgColor} ${stockStatus.color}`}
      >
        {stockStatus.label}
      </div>

      {/* Product Icon/Image */}
      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl mb-4 mx-auto">
        <Package className="h-8 w-8 text-white" />
      </div>

      {/* Product Info */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{product.name}</h3>

        {product.barcode && (
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-2 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
            {product.barcode}
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{product.categoryId}</div>

        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {product.price.toLocaleString()} so'm
        </div>
      </div>

      {/* Stock Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Zaxira</span>
          <span className={`font-medium ${stockStatus.color}`}>
            {product.stock} {product.unit}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${stockStatus.progressColor}`}
            style={{ width: `${stockStatus.percentage}%` }}
          />
        </div>
      </div>

      {/* Warning for Low Stock */}
      {product.stock <= 10 && product.stock > 0 && (
        <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400 text-sm mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
          <AlertTriangle className="h-4 w-4" />
          <span>Zaxira kam qoldi!</span>
        </div>
      )}

      {/* Out of Stock Warning */}
      {product.stock === 0 && (
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm mb-4 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
          <AlertTriangle className="h-4 w-4" />
          <span>Zaxira tugagan!</span>
        </div>
      )}

      {/* Description */}
      {/* {product && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{product.description}</p>
      )} */}

      {/* Action Buttons - Only for Admin */}
      {isAdmin && (
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
            title="Tahrirlash"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm"
            title="O'chirish"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Read-only indicator for non-admin users */}
      {!isAdmin && <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">Faqat ko'rish uchun</div>}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-orange-500/5 pointer-events-none" />
    </div>
  )
}

export default ProductCard
