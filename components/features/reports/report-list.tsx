"use client"

import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { AIReport } from "@/actions/report"
import { format, getWeekOfMonth } from "date-fns"
import { ko } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ReportListProps {
  reports: AIReport[];
}

export function ReportList({ reports }: ReportListProps) {
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null)

  if (!reports || reports.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>아직 생성된 리포트가 없어요</p>
          <p className="text-sm mt-1">기록을 쌓고 리포트를 생성해보세요!</p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">최근 리포트</h3>
        {reports.map((report) => (
          <Card
            key={report.id}
            className="p-6 hover:border-water/50 transition-colors cursor-pointer"
            onClick={() => setSelectedReport(report)}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-water/10">
                <FileText className="h-5 w-5 text-water" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-semibold">
                    {format(new Date(report.end_date), "M월", { locale: ko })} {getWeekOfMonth(new Date(report.end_date), { locale: ko })}주차 리포트
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(report.start_date), "yyyy.MM.dd")} ~ {format(new Date(report.end_date), "yyyy.MM.dd")}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">{report.content}</p>
                <p className="text-xs text-muted-foreground">
                  생성일: {format(new Date(report.created_at), "yyyy-MM-dd HH:mm")}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedReport && (
                <>
                  {format(new Date(selectedReport.end_date), "M월", { locale: ko })} {getWeekOfMonth(new Date(selectedReport.end_date), { locale: ko })}주차 리포트
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedReport && (
                <>
                  {format(new Date(selectedReport.start_date), "yyyy.MM.dd")} ~ {format(new Date(selectedReport.end_date), "yyyy.MM.dd")} 분석 결과
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4 mt-4">
            <div className="text-foreground whitespace-pre-wrap leading-relaxed">
              {selectedReport?.content}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}
