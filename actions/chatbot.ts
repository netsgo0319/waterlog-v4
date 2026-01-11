'use server'

import { retrieveKnowledge } from '@/lib/dify'
import { generateChatbotResponse } from '@/lib/gemini'

/**
 * 챗봇 응답을 생성합니다.
 * 1. Dify API로 관련 지식 검색
 * 2. 검색 결과를 Gemini API 프롬프트에 포함
 * 3. Gemini API로 답변 생성
 * 
 * @param question 사용자 질문
 * @returns AI 생성 답변
 */
export async function getChatbotResponse(question: string): Promise<string> {
    try {
        // 입력 검증
        if (!question || question.trim().length === 0) {
            throw new Error('질문을 입력해주세요.')
        }

        // 1. Dify RAG로 관련 지식 및 출처 검색
        console.log('Retrieving knowledge from Dify...', question)
        const { context, sources } = await retrieveKnowledge(question)
        console.log('RAG Context:', context.substring(0, 200) + '...')
        console.log('Sources:', sources)

        // 2. Gemini API로 답변 생성 (출처 정보 포함)
        console.log('Generating response with Gemini...')
        const response = await generateChatbotResponse(question, context, sources)
        console.log('Response generated successfully')

        return response
    } catch (error) {
        console.error('Chatbot Error:', error)

        // 사용자 친화적인 에러 메시지 반환
        if (error instanceof Error) {
            if (error.message.includes('Dify')) {
                return '죄송합니다. 지식 기반 검색에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
            } else if (error.message.includes('Gemini') || error.message.includes('챗봇')) {
                return '죄송합니다. 답변 생성에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
            }
            return error.message
        }

        return '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
}
