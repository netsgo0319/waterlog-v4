/**
 * Dify RAG API Client
 * 수분 섭취 관련 지식 기반에서 관련 정보를 검색합니다.
 */

interface DifyDocument {
    id: string
    name: string
    data_source_type: string
}

interface DifySegment {
    id: string
    position: number
    content: string
    document: DifyDocument
}

interface DifyRetrievalResponse {
    query: {
        content: string
    }
    records: {
        segment: DifySegment
        score: number
    }[]
}

export interface KnowledgeWithSource {
    context: string
    sources: {
        documentName: string
        position: number
    }[]
}

/**
 * Dify Knowledge Base에서 관련 정보를 검색합니다.
 * @param query 사용자 질문
 * @returns 검색된 지식 컨텍스트와 출처 정보
 */
export async function retrieveKnowledge(query: string): Promise<KnowledgeWithSource> {
    const apiKey = process.env.DIFY_API_KEY
    const datasetId = process.env.DIFY_DATASET_ID

    if (!apiKey) {
        throw new Error('DIFY_API_KEY가 설정되지 않았습니다.')
    }

    if (!datasetId) {
        throw new Error('DIFY_DATASET_ID가 설정되지 않았습니다.')
    }

    try {
        const response = await fetch(
            `https://api.dify.ai/v1/datasets/${datasetId}/retrieve`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                }),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Dify API Error:', response.status, errorText)
            throw new Error(`Dify API 호출 실패: ${response.status}`)
        }

        const data: DifyRetrievalResponse = await response.json()

        // 검색된 세그먼트들을 결합하여 컨텍스트 생성
        if (!data.records || data.records.length === 0) {
            return {
                context: '관련된 정보를 찾을 수 없습니다.',
                sources: []
            }
        }

        // 상위 3개 결과만 사용 (score 순으로 이미 정렬되어 있음)
        const topRecords = data.records.slice(0, 3)

        const context = topRecords
            .map((record) => record.segment.content)
            .join('\n\n---\n\n')

        const sources = topRecords.map((record) => ({
            documentName: record.segment.document.name,
            position: record.segment.position
        }))

        return { context, sources }
    } catch (error) {
        console.error('Dify API Error:', error)
        throw new Error('지식 기반 검색에 실패했습니다.')
    }
}
