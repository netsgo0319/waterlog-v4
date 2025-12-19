"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import { useState } from "react"
import { generateAIReport } from "@/actions/report"
import { toast } from "sonner"
import { subDays } from "date-fns"

export function ReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const endDate = new Date()
      const startDate = subDays(endDate, 7) // 최근 7일

      const result = await generateAIReport(startDate, endDate)

      if (!result.success) {
        toast(result.error || "리포트 생성에 실패했습니다.")
        console.error(result.error)
      } else {
        toast("AI 리포트가 생성되었습니다!")
      }
    } catch (e) {
      console.error(e)
      toast("알 수 없는 오류가 발생했습니다.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-water/10 to-background border-water/20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-water" />
            <h2 className="text-xl font-semibold">새 리포트 생성</h2>
          </div>
          <p className="text-muted-foreground">최근 7일간의 물 섭취 패턴을 AI가 분석해드립니다</p>
        </div>
        <Button
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-water hover:bg-water/90 text-white"
        >
          {isGenerating ? (
            <>
              <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
              생성 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              리포트 생성
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}
