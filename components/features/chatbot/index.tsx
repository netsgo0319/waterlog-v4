'use client'

import { useState } from 'react'
import { FloatingButton } from './floating-button'
import { ChatbotModal } from './chatbot-modal'

/**
 * 플로팅 버튼과 챗봇 모달을 통합한 컴포넌트
 */
export function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <FloatingButton onClick={() => setIsOpen(true)} />
            <ChatbotModal open={isOpen} onOpenChange={setIsOpen} />
        </>
    )
}
