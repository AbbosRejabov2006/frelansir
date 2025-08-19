"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Wallpaper } from "lucide-react"
import type { Category } from "../../types"
import { StorageUtils } from "../../utils/storage"
import * as LucideIcons from "lucide-react"
import { useAuth } from "../../context/AuthContext" // Import useAuth
import { useToast } from "../../hooks/use-toast" // Import useToast
import CategoryModal from "./CategoryModal" // Ensure this is imported
import { io } from "socket.io-client"


const socket = io("http://192.168.1.5:8000", {
  transports: ["websocket"], // fallbacklarni o'chirish uchun
});

const CategoriesPage: React.FC = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const isAdmin = user?.role === "admin"
  const canAddCategories = isAdmin || user?.permissions?.includes("categories_add")
  const canEditCategories = isAdmin || user?.permissions?.includes("categories_edit")
  const canDeleteCategories = isAdmin || user?.permissions?.includes("categories_delete")

  const [categories, setCategories] = useState<Category[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<any[]>([])
  useEffect(() => {
    socket.emit("data", "test")
    socket.on("data", (msg: any) => {
      console.log(msg);
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
    });
  }, [])


  const handleSaveCategory = (categoryData: Omit<Category, "id">) => {
    if (!canAddCategories && !canEditCategories) {
      toast({
        variant: "destructive",
        title: "❌ Ruxsat yo'q!",
        description: "Sizda kategoriyalarni boshqarish huquqi yo'q.",
      })
      return
    }

    let updatedCategories

    if (editingCategory) {
      if (!canEditCategories) {
        toast({
          variant: "destructive",
          title: "❌ Ruxsat yo'q!",
          description: "Sizda kategoriyalarni tahrirlash huquqi yo'q.",
        })
        return
      }
      updatedCategories = categories.map((c) =>
        c.id === editingCategory.id ? { ...categoryData, id: editingCategory.id } : c,
      )
    } else {
      if (!canAddCategories) {
        toast({
          variant: "destructive",
          title: "❌ Ruxsat yo'q!",
          description: "Sizda yangi kategoriya qo'shish huquqi yo'q.",
        })
        return
      }
      const newCategory: Category = {
        ...categoryData,
        id: Date.now().toString(),
      }
      updatedCategories = [...categories, newCategory]
    }

    // StorageUtils.saveCategories(updatedCategories)
    // setCategories(updatedCategories)
    socket.emit("data", `{"products": ${JSON.stringify(products)}, "categories": ${JSON.stringify(updatedCategories)}}`)
    
    setShowModal(false)
    setEditingCategory(null)
    toast({
      variant: "success",
      title: "✅ Muvaffaqiyat!",
      description: `Kategoriya muvaffaqiyatli ${editingCategory ? "yangilandi" : "qo'shildi"}`,
    })
  }

  const handleEditCategory = (category: Category) => {
    if (!canEditCategories) {
      toast({
        variant: "destructive",
        title: "❌ Ruxsat yo'q!",
        description: "Sizda kategoriyalarni tahrirlash huquqi yo'q.",
      })
      return
    }
    setEditingCategory(category)
    setShowModal(true)
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (!canDeleteCategories) {
      toast({
        variant: "destructive",
        title: "❌ Ruxsat yo'q!",
        description: "Sizda kategoriyalarni o'chirish huquqi yo'q.",
      })
      return
    }

    if (confirm("Bu kategoriyani o'chirishni xohlaysizmi?")) {
      const updatedCategories = categories.filter((c) => c.id !== categoryId)
      socket.emit("data", `{"products": ${JSON.stringify(products)}, "categories": ${JSON.stringify(updatedCategories)}}`)
      
      toast({
        variant: "success",
        title: "✅ Muvaffaqiyat!",
        description: "Kategoriya muvaffaqiyatli o'chirildi",
      })
    }
  }

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    return IconComponent || LucideIcons.Wallpaper
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Kategoriyalar</h1>
          <p className="text-gray-600 dark:text-gray-400">Aboy va aksessuar kategoriyalarini boshqaring</p>
        </div>

        {canAddCategories && (
          <button
            onClick={() => {
              setEditingCategory(null)
              setShowModal(true)
            }}
            className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Plus className="h-5 w-5" />
            <span>Yangi kategoriya</span>
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => {
          const IconComponent = getIcon(category.icon)
          return (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-500 p-3 rounded-lg">
                    <IconComponent className="h-6 w-6 text-gray-900" />
                  </div>
                  <h3 className="text-gray-900 dark:text-white font-semibold">{category.name}</h3>
                </div>
              </div>

              {(canEditCategories || canDeleteCategories) && (
                <div className="flex items-center space-x-2">
                  {canEditCategories && (
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Tahrirlash</span>
                    </button>
                  )}
                  {canDeleteCategories && (
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>O'chirish</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          <Wallpaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Hali kategoriya qo'shilmagan</p>
        </div>
      )}

      {/* Category Modal */}
      {(canAddCategories || canEditCategories) && showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowModal(false)
            setEditingCategory(null)
          }}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  )
}

export default CategoriesPage
