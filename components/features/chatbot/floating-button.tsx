'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FloatingButtonProps {
    onClick: () => void
}

export function FloatingButton({ onClick }: FloatingButtonProps) {
    return (
        <Button
            onClick={onClick}
            size="lg"
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-110"
            aria-label="물먹는 도우미 열기"
        >
            <MessageCircle className="h-6 w-6" />
        </Button>
    )
}
