import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateAIReport(data: {
    intakeLogs: any[]
    conditionLogs?: any[]
    startDate: Date
    endDate: Date
}): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    const prompt = `
당신은 물 섭취 패턴을 분석하는 친절하고 공감적인 AI 어시스턴트입니다.

## 분석 기간
- 시작일: ${data.startDate.toLocaleDateString('ko-KR')}
- 종료일: ${data.endDate.toLocaleDateString('ko-KR')}

## 물 섭취 기록
${JSON.stringify(data.intakeLogs, null, 2)}

${data.conditionLogs && data.conditionLogs.length > 0 ? `
## 컨디션 기록
${JSON.stringify(data.conditionLogs, null, 2)}
` : ''}

## 리포트 작성 원칙
1. **공감적 톤**: "완벽하진 않았지만...", "조금씩 나아지고 있어요" 등
2. **비판 금지**: "목표 미달", "부족", "실패" 등의 표현 사용 금지
3. **구조**: 관찰 → 해석 → 가벼운 제안
4. **구체적 패턴 언급**: 요일별, 시간대별 패턴 분석
5. **컨디션 연계**: 물 섭취와 컨디션의 상관관계 찾기 (데이터가 있는 경우)

한글로 3-5문단의 리포트를 작성해주세요.
  `.trim()

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('Gemini API Error:', error)
        throw new Error('AI 리포트 생성에 실패했습니다.')
    }
}

/**
 * RAG 컨텍스트를 포함한 챗봇 응답을 생성합니다.
 * @param question 사용자 질문
 * @param ragContext Dify에서 검색된 지식 컨텍스트
 * @param sources 출처 정보 배열
 * @returns AI 생성 답변
 */
export async function generateChatbotResponse(
    question: string,
    ragContext: string,
    sources: { documentName: string; position: number }[]
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

    // 출처 정보 포맷팅
    const sourcesText = sources.length > 0
        ? sources.map((src, idx) => `[${idx + 1}] ${src.documentName} (위치: ${src.position})`).join('\n')
        : ''

    const prompt = `
당신은 수분 섭취 전문가입니다. 아래 관련 지식을 바탕으로 사용자의 질문에 친절하고 정확하게 답변해주세요.

## 관련 지식
${ragContext}

${sourcesText ? `## 참고 문헌\n${sourcesText}\n` : ''}

## 사용자 질문
${question}

## 답변 가이드라인
1. 위 관련 지식을 우선적으로 참고하여 답변하세요
2. 전문적이지만 친근한 톤으로 작성하세요
3. 실용적이고 구체적인 조언을 제공하세요
4. 답변은 한국어로 작성하세요
5. 지식에 없는 내용은 무리하게 답변하지 말고, "관련 정보를 찾을 수 없습니다"라고 안내하세요
6. 답변은 3-5문단 이내로 간결하게 작성하세요
7. 답변 마지막에 **참고 문헌** 섹션을 추가하여 출처를 명시하세요
`.trim()

    try {
        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()
    } catch (error) {
        console.error('Gemini API Error:', error)
        throw new Error('챗봇 응답 생성에 실패했습니다.')
    }
}
