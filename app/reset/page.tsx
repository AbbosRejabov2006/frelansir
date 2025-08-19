"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StorageUtils } from "../../src/utils/storage"

export default function ResetStatsPage() {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await StorageUtils.resetStatistics()
        if (mounted) setDone(true)
      } catch (e: any) {
        if (mounted) setError(String(e?.message ?? e))
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <main className="min-h-[60vh] w-full flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="text-red-600">Xatolik: {error}</div>
          ) : done ? (
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>Statistika 0 qilindi. Barcha savdo va to‘lov yozuvlari tozalandi.</span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-gray-600">
              <RotateCcw className="h-5 w-5 animate-spin" />
              <span>Statistikani 0 qilinyapti...</span>
            </div>
          )}

          <div className="pt-2">
            <Button asChild>
              <Link href="/">Bosh sahifaga qaytish</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
