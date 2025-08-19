"use client"

import { useEffect, useMemo, useState } from "react"
import { Shield, Save } from "lucide-react"
import { StorageUtils } from "../../utils/storage"
import type { User as EmployeeType } from "../../types"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { Switch } from "../../../components/ui/switch"
import { Label } from "../../../components/ui/label"
import { Button } from "../../../components/ui/button"

type PermissionsMap = Record<string, string[]>

const KNOWN_PERMISSIONS: { key: string; label: string; description?: string }[] = [
  {
    key: "analytics_view_cashier_stats",
    label: "Kassir statistikasi",
    description: "Statistika bo'limida kassirlar kesimini ko'rish",
  },
  { key: "sales_discount_apply", label: "Chegirma qo'llash", description: "Savdo vaqtida chegirma kiritish huquqi" },
  { key: "products_manage", label: "Mahsulotlar boshqaruvi", description: "Mahsulot qo'shish/tahrirlash/o'chirish" },
  {
    key: "categories_manage",
    label: "Kategoriyalar boshqaruvi",
    description: "Kategoriya qo'shish/tahrirlash/o'chirish",
  },
  { key: "debtors_manage", label: "Qarzdorlar moduli", description: "Qarzdorlar va to'lovlarni boshqarish" },
]

function loadPermissionsFromStorage(): PermissionsMap {
  try {
    const raw = localStorage.getItem("user_permissions")
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function savePermissionsToStorage(perms: PermissionsMap) {
  try {
    localStorage.setItem("user_permissions", JSON.stringify(perms))
    // Notify the rest of the app
    window.dispatchEvent(new CustomEvent("data-updated", { detail: { table: "permissions" } }))
  } catch {
    // ignore
  }
}

export default function PermissionsPage() {
  const [users, setUsers] = useState<EmployeeType[]>([])
  const [permissions, setPermissions] = useState<PermissionsMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const allUsers = await StorageUtils.getUsers()
        const list: EmployeeType[] = Array.isArray(allUsers) ? allUsers : []
        if (!cancelled) {
          setUsers(list)
          // Initialize permissions map ensuring each user id has an array
          const stored = loadPermissionsFromStorage()
          const next: PermissionsMap = { ...stored }
          for (const u of list) {
            if (!next[u.id]) next[u.id] = Array.isArray(stored[u.id]) ? stored[u.id] : []
          }
          setPermissions(next)
        }
      } catch (e) {
        if (!cancelled) {
          setUsers([])
          setPermissions(loadPermissionsFromStorage())
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const admins = useMemo(() => {
    return Array.isArray(users) ? users.filter((u) => u.role === "admin") : []
  }, [users])

  const cashiers = useMemo(() => {
    return Array.isArray(users) ? users.filter((u) => u.role === "kassir") : []
  }, [users])

  const togglePermission = (userId: string, permKey: string) => {
    setPermissions((prev) => {
      const current = new Set<string>(Array.isArray(prev[userId]) ? prev[userId] : [])
      if (current.has(permKey)) current.delete(permKey)
      else current.add(permKey)
      return { ...prev, [userId]: Array.from(current) }
    })
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      savePermissionsToStorage(permissions)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-gray-600 dark:bg-gray-500 p-2 rounded-lg">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hodim huquqlari</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Rollar va ruxsatlar boshqaruvi</p>
        </div>
      </div>

      {/* Adminlar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Adminlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {admins.length > 0 ? (
            admins.map((u) => (
              <div key={u.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">@{u.username}</p>
                  </div>
                  <span className="text-xs rounded px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Adminlarga barcha huquqlar avtomatik beriladi. Quyidagi moslamalar faqat ko‘rsatma uchun.
                </p>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {KNOWN_PERMISSIONS.map((perm) => (
                    <div
                      key={perm.key}
                      className="flex items-center justify-between rounded bg-gray-50 dark:bg-gray-800 p-2"
                    >
                      <div className="mr-4">
                        <Label className="text-sm font-medium">{perm.label}</Label>
                        {perm.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{perm.description}</p>
                        )}
                      </div>
                      <Switch checked={true} disabled aria-readonly />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Adminlar topilmadi</p>
          )}
        </CardContent>
      </Card>

      {/* Kassirlar */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Hodimlar (kassir)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cashiers.length > 0 ? (
            cashiers.map((u) => {
              const userPerms = Array.isArray(permissions[u.id]) ? permissions[u.id] : []
              return (
                <div key={u.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">@{u.username}</p>
                    </div>
                    <span className="text-xs rounded px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      Kassir
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {KNOWN_PERMISSIONS.map((perm) => {
                      const checked = userPerms.includes(perm.key)
                      return (
                        <div
                          key={perm.key}
                          className="flex items-center justify-between rounded bg-gray-50 dark:bg-gray-800 p-2"
                        >
                          <div className="mr-4">
                            <Label className="text-sm font-medium">{perm.label}</Label>
                            {perm.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">{perm.description}</p>
                            )}
                          </div>
                          <Switch
                            checked={checked}
                            onCheckedChange={() => togglePermission(u.id, perm.key)}
                            aria-label={perm.label}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">Kassirlar topilmadi</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveAll} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saqlanmoqda..." : "Barchasini saqlash"}
        </Button>
      </div>
    </div>
  )
}
