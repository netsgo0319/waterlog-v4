"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Droplets } from "lucide-react"
import { useState, useEffect } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns"
import { ko } from "date-fns/locale"
import { getIntakeLogsByMonth } from "@/actions/history"

interface IntakeLog {
  id: string
  amount_level: string
  recorded_at: string
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [logs, setLogs] = useState<IntakeLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true)
      try {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth() + 1
        const data = await getIntakeLogsByMonth(year, month)
        setLogs(data)
      } catch (error) {
        console.error("Failed to fetch logs:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLogs()
  }, [currentDate])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDayOfWeek = getDay(monthStart)
  const emptyDays = Array.from({ length: startDayOfWeek }, (_, i) => i)

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const getDailyLogs = (date: Date) => {
    return logs.filter((log) => isSameDay(parseISO(log.recorded_at), date))
  }

  const getIntakeLevel = (date: Date) => {
    const dailyLogs = getDailyLogs(date)
    const count = dailyLogs.length
    if (count >= 3) return "high"
    if (count >= 1) return "medium"
    return "none"
  }

  const selectedDateLogs = selectedDate ? getDailyLogs(selectedDate) : []

  const getLabel = (level: string) => {
    switch (level) {
      case "high": return "마셨음"
      case "medium": return "조금 마셨음"
      case "low": return "거의 안 마셨음"
      default: return "알 수 없음"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{format(currentDate, "yyyy년 M월", { locale: ko })}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth} disabled={isLoading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} disabled={isLoading}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day labels */}
          {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for days before month starts */}
          {emptyDays.map((i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Calendar days */}
          {daysInMonth.map((date) => {
            const intakeLevel = getIntakeLevel(date)
            const isSelected = selectedDate && isSameDay(date, selectedDate)
            const isCurrentDay = isToday(date)

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`
                  aspect-square p-2 rounded-lg border transition-all relative
                  ${isSelected ? "border-water bg-water/10" : "border-border hover:border-water/50"}
                  ${isCurrentDay ? "ring-2 ring-water/30" : ""}
                  ${!isSameMonth(date, currentDate) ? "opacity-30" : ""}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-sm mb-1">{format(date, "d")}</span>
                  {intakeLevel !== "none" && (
                    <div className="flex gap-0.5">
                      <Droplets className={`h-3 w-3 ${intakeLevel === "high" ? "text-water" : "text-water/40"}`} />
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">{format(selectedDate, "M월 d일", { locale: ko })} 상세 기록</h3>
          {selectedDateLogs.length > 0 ? (
            <div className="space-y-3">
              {selectedDateLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <Droplets
                      className={`h-5 w-5 ${log.amount_level === "high"
                        ? "text-water"
                        : log.amount_level === "medium"
                          ? "text-water/60"
                          : "text-water/30"
                        }`}
                    />
                    <div>
                      <div className="font-medium">{getLabel(log.amount_level)}</div>
                      <div className="text-sm text-muted-foreground">{format(parseISO(log.recorded_at), "a h:mm", { locale: ko })}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">기록이 없습니다.</p>
          )}
        </Card>
      )}
    </div>
  )
}
