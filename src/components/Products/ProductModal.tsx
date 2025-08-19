"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Package, Save } from "lucide-react"
import type { Product, Category } from "../../types"
import { StorageUtils } from "../../utils/storage"

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Omit<Product, "id">) => void
  product?: Product
  categories: any[] // parentdan keladi (asinxron bo‘lishi mumkin)
}

const UNIT_OPTIONS = ["dona", "rulon", "litr", "kg", "qop", "metr", "m2", "m3", "to'plam", "quti", "paket", "gramm"]

type FormData = {
  name: string
  price: number
  stock: number
  unit: string
  categoryId: string
  barcode: string
  description: string // UI uchun saqlab turamiz, lekin Product tipiga yubormaymiz
  icon: string
  minStock: number
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, product, categories }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    price: 0,
    stock: 0,
    unit: "dona",
    categoryId: "",
    barcode: "",
    description: "",
    icon: "Package",
    minStock: 5,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  // Kategoriyalar uchun lokal holat (parentdan kelgan bo‘sh bo‘lsa ham yuklab olamiz)
  const [localCategories, setLocalCategories] = useState<Category[]>([])

  // Parentdan kelgan kategoriyalarni xavfsiz qo'llash
  useEffect(() => {
    const safeIncoming = Array.isArray(categories) ? categories : []
    console.log(categories);

    setLocalCategories(safeIncoming)
  }, [categories])

  // Agar parentdan bo‘sh kelsa, StorageUtils orqali zaxira yuklash
 

  // Tahrirlash rejimi yoki yangi mahsulot uchun formani to‘ldirish
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name ?? "",
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        unit: product.unit ?? "dona",
        categoryId: product.categoryId ?? "",
        barcode: product.barcode ?? "",
        description: "", // mavjud bo‘lmasa bo‘sh
        icon: "Package",
        minStock: Number.isFinite(product.minStock) ? Number(product.minStock) : 5,
      })
    } else {
      setFormData({
        name: "",
        price: 0,
        stock: 0,
        unit: "dona",
        categoryId: "",
        barcode: "",
        description: "",
        icon: "Package",
        minStock: 5,
      })
    }
    setErrors({})
  }, [product, isOpen])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) {
      newErrors.name = "Mahsulot nomi kiritilishi shart"
    }

    if (formData.price <= 0) {
      newErrors.price = "Narx 0 dan katta bo'lishi kerak"
    }

    if (formData.stock < 0) {
      newErrors.stock = "Zaxira manfiy bo'lishi mumkin emas"
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Kategoriya tanlanishi shart"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const payload: Omit<Product, "id"> = {
      name: formData.name,
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0,
      unit: formData.unit,
      categoryId: formData.categoryId,
      barcode: formData.barcode || `${Date.now()}${Math.floor(Math.random() * 1000)}`,
      minStock: Number.isFinite(formData.minStock) ? Number(formData.minStock) : 5,
    }
    console.log(payload);
    

    onSave(payload)
  }

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value as any }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (!isOpen) return null

  const safeCategories = Array.isArray(localCategories) ? localCategories : []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg">
                <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {product ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mahsulot ma'lumotlarini kiriting</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Yopish"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mahsulot nomi *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  placeholder="Mahsulot nomini kiriting"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Narx (so'm) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", Number(e.target.value))}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${errors.price ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  placeholder="0"
                  min="0"
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zaxira miqdori *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", Number(e.target.value))}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${errors.stock ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  placeholder="0"
                  min="0"
                />
                {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  O'lchov birligi *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors appearance-none"
                >
                  {UNIT_OPTIONS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Kategoriya *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange("categoryId", e.target.value)}
                  className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors appearance-none ${errors.categoryId ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                >
                  <option value="">Kategoriya tanlang</option>
                  {safeCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
                {safeCategories.length === 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Kategoriyalar topilmadi. Iltimos, avval kategoriya yarating yoki sahifani qayta yuklang.
                  </p>
                )}
              </div>

              {/* Barcode */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shtrix kod</label>
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange("barcode", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                  placeholder="Shtrix kodni kiriting (ixtiyoriy)"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Bo'sh qoldirilsa avtomatik yaratiladi</p>
              </div>

              {/* Description (UI-da ko‘rinadi, lekin hozircha saqlamaymiz) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors resize-none"
                  placeholder="Mahsulot haqida qo'shimcha ma'lumot"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Save className="h-5 w-5" />
                <span>{product ? "Yangilash" : "Saqlash"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductModal
