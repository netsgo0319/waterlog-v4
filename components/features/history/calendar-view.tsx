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
} from "date-fns"
import { ko } from "date-fns/locale"
import { getIntakeLogsByDateRange, IntakeLog } from "@/actions/intake"
import { toast } from "sonner"

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [intakeLogs, setIntakeLogs] = useState<IntakeLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDayOfWeek = getDay(monthStart)
  const emptyDays = Array.from({ length: startDayOfWeek }, (_, i) => i)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)

      try {
        const result = await getIntakeLogsByDateRange(start, end)
        if (result.success && result.data) {
          setIntakeLogs(result.data)
        } else {
          toast("데이터를 불러오는데 실패했습니다.")
        }
      } catch (error) {
        console.error(error)
        toast("오류가 발생했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentDate])

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  const getDayLogs = (date: Date) => {
    return intakeLogs.filter(log => isSameDay(new Date(log.recorded_at), date))
  }

  const getIntakeLevel = (date: Date) => {
    const count = getDayLogs(date).length
    if (count >= 3) return "high"
    if (count >= 1) return "medium"
    return "none"
  }

  const selectedDayLogs = selectedDate ? getDayLogs(selectedDate) : []

  return (
    <div className="space-y-6">
      <Card className="p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{format(currentDate, "yyyy년 M월", { locale: ko })}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
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
          <div className="space-y-3">
            {selectedDayLogs.length === 0 ? (
              <p className="text-muted-foreground">기록이 없습니다.</p>
            ) : (
              selectedDayLogs
                .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
                .map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <Droplets
                      className={`h-5 w-5 ${log.level === "high" ? "text-water" : log.level === "medium" ? "text-water/60" : "text-water/30"
                        }`}
                    />
                    <div>
                      <div className="font-medium">
                        {log.level === 'high' ? '마셨음' : log.level === 'medium' ? '조금 마셨음' : '거의 안 마셨음'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(log.recorded_at), "a h:mm", { locale: ko })}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
