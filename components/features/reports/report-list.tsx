import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { getReports } from "@/actions/report"
import { ReportItem } from "./report-item"

export async function ReportList() {
  let reports: any[] = []

  try {
    reports = await getReports() || []
  } catch (error) {
    console.error("Failed to fetch reports:", error)
    // Handle error UI if needed
  }

  if (reports.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>아직 생성된 리포트가 없어요</p>
          <p className="text-sm mt-1">최소 3일의 기록이 있으면 리포트를 생성할 수 있어요</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">최근 리포트</h3>
      {reports.map((report) => (
        <ReportItem key={report.id} report={report} />
      ))}
    </div>
  )
}
