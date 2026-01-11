import { Card } from "@/components/ui/card"
import { Droplets } from "lucide-react"
import { getTodayIntakeLogs } from "@/actions/intake"
import { IntakeListItem } from "./intake-list-item"

export async function TodayIntakeList() {
  let records: any[] = []

  try {
    records = await getTodayIntakeLogs()
  } catch (error) {
    console.error("Failed to fetch today's logs:", error)
    // Fallback to empty list or handle error UI if needed
  }

  if (!records || records.length === 0) {
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
        {records.map((record) => (
          <IntakeListItem key={record.id} record={record} />
        ))}
      </div>
    </Card>
  )
}

