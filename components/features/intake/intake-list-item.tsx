"use client"

import { Button } from "@/components/ui/button"
import { Droplets, Trash2 } from "lucide-react"
import { deleteIntakeLog } from "@/actions/intake"
import { toast } from "sonner"
import { format } from "date-fns"

interface IntakeLog {
    id: string
    amount_level: string
    recorded_at: string
}

interface IntakeListItemProps {
    record: IntakeLog
}

export function IntakeListItem({ record }: IntakeListItemProps) {
    const handleDelete = async () => {
        try {
            await deleteIntakeLog(record.id)
            toast.success("기록이 삭제되었습니다")
        } catch (error) {
            console.error("Failed to delete:", error)
            toast.error("삭제에 실패했습니다")
        }
    }

    const getLabel = (level: string) => {
        switch (level) {
            case "high":
                return "마셨음"
            case "medium":
                return "조금 마셨음"
            case "low":
                return "거의 안 마셨음"
            default:
                return "알 수 없음"
        }
    }

    const time = format(new Date(record.recorded_at), "HH:mm")

    return (
        <div
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
            <div className="flex items-center gap-3">
                <Droplets
                    className={`h-5 w-5 ${record.amount_level === "high"
                            ? "text-water"
                            : record.amount_level === "medium"
                                ? "text-water/60"
                                : "text-water/30"
                        }`}
                />
                <div>
                    <div className="font-medium">{getLabel(record.amount_level)}</div>
                    <div className="text-sm text-muted-foreground">{time}</div>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="hover:text-destructive"
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    )
}
