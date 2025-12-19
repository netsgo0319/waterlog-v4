"use client"

import { Card } from "@/components/ui/card"
import { Droplets, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IntakeLog, deleteIntakeLog } from "@/actions/intake"
import { toast } from "sonner"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface TodayIntakeListProps {
  logs: IntakeLog[];
}

const getLabel = (level: string) => {
  switch (level) {
    case 'high': return '마셨음';
    case 'medium': return '조금 마셨음';
    case 'low': return '거의 안 마셨음';
    default: return level;
  }
}

export function TodayIntakeList({ logs }: TodayIntakeListProps) {
  const handleDelete = async (id: string) => {
    try {
      const result = await deleteIntakeLog(id);
      if (!result.success) {
        toast("기록 삭제에 실패했습니다.");
        console.error(result.error);
      } else {
        toast("기록을 삭제했습니다.");
      }
    } catch (e) {
      toast("오류가 발생했습니다.");
      console.error(e);
    }
  }

  if (!logs || logs.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground py-8">
          <Droplets className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>아직 기록이 없어요</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">오늘의 기록</h3>
      <div className="space-y-3">
        {logs.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Droplets
                className={`h-5 w-5 ${record.level === "high" ? "text-water" : record.level === "medium" ? "text-water/60" : "text-water/30"
                  }`}
              />
              <div>
                <div className="font-medium">{getLabel(record.level)}</div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(record.recorded_at), "HH:mm", { locale: ko })}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(record.id)}
              className="hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
