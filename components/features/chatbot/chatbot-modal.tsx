'use client'

import { useState, FormEvent } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { getChatbotResponse } from '@/actions/chatbot'

interface ChatbotModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ChatbotModal({ open, onOpenChange }: ChatbotModalProps) {
    const [question, setQuestion] = useState('')
    const [answer, setAnswer] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!question.trim() || isLoading) {
            return
        }

        setIsLoading(true)
        setAnswer('') // 이전 답변 초기화

        try {
            const response = await getChatbotResponse(question.trim())
            setAnswer(response)
        } catch (error) {
            console.error('Chatbot error:', error)
            setAnswer('죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        onOpenChange(false)
        // 모달 닫을 때 상태 초기화
        setQuestion('')
        setAnswer('')
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>💧 물먹는 도우미</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="h-6 w-6"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4">
                    {/* 안내 메시지 */}
                    {!answer && !isLoading && (
                        <div className="text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                            수분 섭취에 관한 질문을 해보세요! 전문적인 지식을 바탕으로 답변해드립니다.
                        </div>
                    )}

                    {/* 질문 표시 */}
                    {question && (answer || isLoading) && (
                        <div className="p-4 bg-primary/10 rounded-lg">
                            <p className="font-medium text-sm text-muted-foreground mb-1">질문</p>
                            <p className="text-sm">{question}</p>
                        </div>
                    )}

                    {/* 로딩 인디케이터 */}
                    {isLoading && (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-muted-foreground">답변 생성 중...</span>
                        </div>
                    )}

                    {/* 답변 표시 */}
                    {answer && !isLoading && (
                        <div className="p-4 bg-secondary/50 rounded-lg">
                            <p className="font-medium text-sm text-muted-foreground mb-2">답변</p>
                            <div className="prose prose-sm max-w-none">
                                {answer.split('\n').map((line, index) => (
                                    <p key={index} className="mb-2 last:mb-0">
                                        {line}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 입력 영역 */}
                <form onSubmit={handleSubmit} className="border-t pt-4 space-y-3">
                    <Textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="예: 하루에 물을 얼마나 마셔야 하나요?"
                        className="min-h-[80px] resize-none"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={!question.trim() || isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                답변 생성 중...
                            </>
                        ) : (
                            <>
                                <Send className="mr-2 h-4 w-4" />
                                질문하기
                            </>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
