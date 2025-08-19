"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, User, Lock } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useToast } from "../../hooks/use-toast"

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(username, password)
      if (success) {
        toast({
          variant: "success",
          title: "✅ Xush kelibsiz!",
          description: `Tizimga muvaffaqiyatli kirdingiz, ${username}!`,
        })
      } else {
        toast({
          variant: "destructive",
          title: "❌ Login yoki parol noto'g'ri kiritildi",
          description: "Iltimos, login va parolni tekshirib qayta urinib ko'ring",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "❌ Xatolik!",
        description: "Kirish jarayonida xatolik yuz berdi!",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "#0D1B2A" }}
    >
      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Brand Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 drop-shadow-lg" style={{ color: "#FCA311" }}>
            GRANDWALL POS
          </h1>
          <p className="text-white/80 text-lg font-medium">Aboy va aksessuarlar savdo tizimi</p>
        </div>

        {/* Glassmorphism Login Card */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/90">Foydalanuvchi nomi</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                  style={{ focusRingColor: "#FCA311" }}
                  placeholder="Foydalanuvchi nomini kiriting"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white/90">Parol</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-14 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                  style={{ focusRingColor: "#FCA311" }}
                  placeholder="Parolni kiriting"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              style={{
                backgroundColor: "#FCA311",
                color: "#0D1B2A",
              }}
            >
              {isLoading ? (
                <>
                  <div
                    className="animate-spin rounded-full h-6 w-6 border-b-2"
                    style={{ borderColor: "#0D1B2A" }}
                  ></div>
                  <span>Kirish...</span>
                </>
              ) : (
                <span>TIZIMGA KIRISH</span>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-sm">
          <p>&copy; 2024 GrandWall POS. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
