import { GoogleGenerativeAI } from '@google/generative-ai';
import { IntakeLog } from '@/actions/intake';
import { ConditionLog } from '@/actions/condition';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('GEMINI_API_KEY is missing in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');
// 사용자 요청에 따라 gemini-2.5-pro 모델 사용
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

export async function generateReportContent(
    startDate: Date,
    endDate: Date,
    intakeLogs: IntakeLog[],
    conditionLogs: ConditionLog[]
) {
    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.startsWith('your_')) {
        throw new Error('Gemini API 설정이 필요합니다. .env.local 파일을 확인해주세요.');
    }

    const prompt = `
당신은 사용자의 물 섭취 패턴과 컨디션을 분석하여 공감적이고 부드러운 어조로 인사이트를 제공하는 "워터로그 AI 코치"입니다.

**분석 기간**: ${startDate.toLocaleDateString()} ~ ${endDate.toLocaleDateString()}

**사용자 데이터**:
1. **물 섭취 기록 (${intakeLogs.length}건)**:
${JSON.stringify(intakeLogs.map(log => ({
        time: log.recorded_at,
        level: log.level
    })), null, 2)}

2. **컨디션 기록 (${conditionLogs.length}건)**:
${JSON.stringify(conditionLogs.map(log => ({
        date: log.log_date,
        condition: log.condition_type,
        note: log.note
    })), null, 2)}

**작성 가이드라인**:
1. **톤앤매너**: 평가하거나 가르치려 들지 마세요. 친구처럼 공감하고 격려하는 부드러운 말투를 사용하세요. ("~했어요", "~인 것 같아요" 등)
2. **부정적 표현 금지**: "실패", "부족", "안 마셨다", "못했다" 같은 단어 대신 "아쉬움이 남지만", "잠시 쉬어갔지만" 등으로 순화하세요.
3. **구조**:
   - **관찰**: 팩트 기반으로 패턴을 발견해주세요. (예: "오후 3시쯤 되면 물을 자주 드시는군요!")
   - **연결**: 물 섭취와 컨디션 사이의 관계가 보이면 언급해주세요. (관계가 없으면 억지로 연결하지 마세요)
   - **제안**: 부담스럽지 않은 작은 팁을 하나만 주세요.
4. **길이**: 전체 내용은 300자 내외로 간결하게 작성하세요. 핵심만 전달하세요.

**출력 예시**:
"이번 주는 꾸준히 물을 마시려는 노력이 돋보였어요! 특히 월요일과 수요일 오후에 집중적으로 수분을 보충해 주셨네요. 컨디션 기록을 보니 물을 잘 드신 날에는 '좋음' 상태가 많았던 것 같아요. 주말에는 조금 바쁘셨는지 기록이 뜸했지만, 다음 주에는 책상 위에 물컵을 미리 올려두는 건 어떨까요? 충분히 잘하고 계세요!"
`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API Error:', error);
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        throw new Error(`리포트 생성 중 오류가 발생했습니다: ${errorMessage}`);
    }
}
