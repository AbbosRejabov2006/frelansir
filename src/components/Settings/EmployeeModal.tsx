"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Button } from "../../../components/ui/button"
import { Save } from "lucide-react"
import { StorageUtils } from "../../utils/storage"
import { useToast } from "../../hooks/use-toast"
import type { User } from "../../types"
import { v4 as uuidv4 } from "uuid"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"

interface EmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  employee: User | null // Null for new employee, User object for editing
  onSave: () => void // Callback to refresh employee list in parent
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, employee, onSave }) => {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"admin" | "kassir">("kassir") // Default role for new employee
  const [isNewEmployee, setIsNewEmployee] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (employee) {
      setName(employee.name)
      setUsername(employee.username)
      setPassword(employee.password || "") // Pre-fill password if available, or empty string
      setRole(employee.role)
      setIsNewEmployee(false)
    } else {
      // For new employee
      setName("")
      setUsername("")
      setPassword("")
      setRole("kassir") // Default for new
      setIsNewEmployee(true)
    }
  }, [employee, isOpen]) // Re-run when modal opens or employee changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !username || (isNewEmployee && !password)) {
      toast({
        variant: "destructive",
        title: "❌ Xatolik!",
        description: "Iltimos, barcha maydonlarni to'ldiring.",
      })
      return
    }

    try {
      const existingUsers = await StorageUtils.getUsers()
      const usernameExists = existingUsers.some((u: User) => u.username === username && u.id !== employee?.id)

      if (usernameExists) {
        toast({
          variant: "destructive",
          title: "❌ Xatolik!",
          description: "Bu foydalanuvchi nomi allaqachon mavjud.",
        })
        return
      }

      if (isNewEmployee) {
        const newUser: User = {
          id: uuidv4(),
          name,
          username,
          password,
          role, // Use selected role
          permissions: [], // Permissions will be managed in PermissionsPage
        }
        await StorageUtils.addUser(newUser)
        toast({
          variant: "success",
          title: "✅ Qo'shildi!",
          description: "Yangi ishchi muvaffaqiyatli qo'shildi.",
        })
      } else if (employee) {
        // Check if changing the role of the last admin
        if (employee.role === "admin" && role === "kassir") {
          const admins = existingUsers.filter((u: User) => u.role === "admin" && u.id !== employee.id)
          if (admins.length === 0) {
            toast({
              variant: "destructive",
              title: "❌ Xatolik!",
              description: "Tizimda kamida bitta admin qolishi shart. Bu adminni kassirga o'zgartira olmaysiz.",
            })
            return
          }
        }

        const updatedEmployee: User = {
          ...employee,
          name,
          username,
          password, // Always update password with the current input value
          role, // Allow changing role for existing employees
        }
        StorageUtils.updateUser(updatedEmployee)
        toast({
          variant: "success",
          title: "✅ Yangilandi!",
          description: "Ishchi ma'lumotlari yangilandi.",
        })
      }
      onSave() // Trigger refresh in parent
      onClose() // Close the modal
    } catch (error) {
      console.error("Error saving employee:", error)
      toast({
        variant: "destructive",
        title: "❌ Xatolik!",
        description: "Ishchi ma'lumotlarini saqlashda xatolik yuz berdi.",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isNewEmployee ? "Yangi ishchi qo'shish" : "Ishchini tahrirlash"}</DialogTitle>
          <DialogDescription>
            {isNewEmployee
              ? "Yangi ishchi ma'lumotlarini kiriting va rolini tanlang."
              : "Ishchi ma'lumotlarini tahrirlang. Parolni o'zgartirish uchun yangi parolni kiriting."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Ism
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Login
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Parol
            </Label>
            <Input
              id="password"
              type="text" // Password is always visible as requested
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              placeholder={isNewEmployee ? "Parol kiriting" : "Yangi parol"}
              required={isNewEmployee}
            />
          </div>
          {/* Role selection is now always visible for both new and existing employees */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Roli
            </Label>
            <Select value={role} onValueChange={(value: "admin" | "kassir") => setRole(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Rolni tanlang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kassir">Hodim (Kassir)</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Saqlash
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EmployeeModal
