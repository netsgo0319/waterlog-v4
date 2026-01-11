"use client"

import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Report {
    id: string
    content: string
    start_date: string
    end_date: string
    created_at: string
}

export function ReportItem({ report }: { report: Report }) {
    const preview = report.content.slice(0, 100) + (report.content.length > 100 ? "..." : "")
    const period = `${report.start_date} ~ ${report.end_date}`
    const title = `${report.start_date} 주간 리포트` // 간단히 시작일 기준 주간 리포트로 명명

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="p-6 hover:border-water/50 transition-colors cursor-pointer text-left w-full">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-water/10 shrink-0">
                            <FileText className="h-5 w-5 text-water" />
                        </div>
                        <div className="flex-1 space-y-2 min-w-0">
                            <div>
                                <h4 className="font-semibold truncate">{title}</h4>
                                <p className="text-sm text-muted-foreground">{period}</p>
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                                {preview}
                            </p>
                            <p className="text-xs text-muted-foreground pt-2">
                                생성일: {format(new Date(report.created_at), "yyyy. MM. dd.", { locale: ko })}
                            </p>
                        </div>
                    </div>
                </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{period}</p>
                </DialogHeader>
                <ScrollArea className="h-full max-h-[60vh] pr-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {report.content}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
