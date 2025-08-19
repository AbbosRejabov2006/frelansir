"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import type { Category } from "../../types"
import * as LucideIcons from "lucide-react"

interface CategoryModalProps {
  category: Category | null
  onClose: () => void
  onSave: (category: Omit<Category, "id">) => void
}

const CategoryModal: React.FC<CategoryModalProps> = ({ category, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    icon: "Wallpaper",
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon,
      })
    }
  }, [category])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert("Kategoriya nomini kiriting!")
      return
    }

    onSave(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const availableIcons = [
    "Wallpaper",
    "Droplets",
    "Wrench",
    "Brush",
    "PaintBrush",
    "Scissors",
    "Ruler",
    "Package",
    "Tape",
    "Table",
    "Hammer",
    "Screwdriver",
    "Settings",
    "Palette",
    "Layers",
  ]

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName]
    return IconComponent || LucideIcons.Wallpaper
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {category ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kategoriya nomi</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Kategoriya nomini kiriting"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Ikonka tanlang</label>
            <div className="grid grid-cols-5 gap-2">
              {availableIcons.map((iconName) => {
                const IconComponent = getIcon(iconName)
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, icon: iconName }))}
                    className={`p-3 rounded-lg border transition-colors ${
                      formData.icon === iconName
                        ? "border-yellow-500 bg-yellow-900/20 text-yellow-400"
                        : "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mx-auto" />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-medium rounded-lg transition-colors"
            >
              Saqlash
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CategoryModal
