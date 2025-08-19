"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "../types"
import { users as seedUsers } from "../data/users"

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
  refreshUserPermissions: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Local authentication only
    const localUser = seedUsers.find((u) => u.username === username && u.password === password)
    if (localUser) {
      setUser(localUser)
      return true
    }
    return false
  }

  const logout = async (): Promise<void> => {
    setUser(null)
  }

  const refreshUserPermissions = async () => {
    // No-op since we're using local data only
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refreshUserPermissions }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth AuthProvider ichida ishlatilishi kerak")
  }
  return context
}
