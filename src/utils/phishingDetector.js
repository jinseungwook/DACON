// GPT 기반 피싱/스캠 탐지 유틸리티
import OpenAI from 'openai';

// 피싱 패턴 정의 (기본 분석용)
export const phishingPatterns = {
  urgency: {
    keywords: ['긴급', '즉시', '24시간', '오늘까지', '마감', '지금', '당장', '빨리'],
    weight: 2.5,
    description: '긴급성을 강조하는 표현'
  },
  money: {
    keywords: ['송금', '계좌', '입금', '환급', '세금', '과태료', '벌금', '당첨', '보상금', '수수료'],
    weight: 3.0,
    description: '금전 관련 요구'
  },
  personalInfo: {
    keywords: ['주민번호', '비밀번호', '카드번호', '계좌번호', '인증번호', 'OTP', '보안카드', '개인정보'],
    weight: 3.5,
    description: '개인정보 요청'
  },
  authority: {
    keywords: ['경찰', '검찰', '법원', '국세청', '금융감독원', '은행', '카드사', '우체국', '택배'],
    weight: 2.0,
    description: '공공기관/기업 사칭'
  },
  threat: {
    keywords: ['법적조치', '고소', '고발', '압류', '체포', '구속', '소송', '처벌', '신용불량'],
    weight: 3.0,
    description: '위협성 문구'
  },
  link: {
    keywords: ['http', 'https', 'bit.ly', 'url', '링크', '클릭', '접속'],
    weight: 2.0,
    description: '의심스러운 링크'
  },
  contact: {
    keywords: ['연락주세요', '회신', '답장', '전화', '문자', '카톡', '텔레그램'],
    weight: 1.5,
    description: '연락 요청'
  }
};

// OpenAI 클라이언트 초기화
let openai = null;
try {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey) {
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // 브라우저에서 직접 호출 (주의: API 키 노출 가능)
    });
  }
} catch (error) {
  console.warn('OpenAI API 초기화 실패. 패턴 기반 분석만 사용됩니다:', error);
}

/**
 * 패턴 분석: 키워드 기반 패턴 매칭
 */
function analyzePatterns(text) {
  if (!text || text.trim() === '') {
    return {
      totalScore: 0,
      detectedPatterns: [],
      analysis: '분석할 텍스트가 없습니다.'
    };
  }

  const normalizedText = text.toLowerCase();
  let totalScore = 0;
  const detectedPatterns = [];

  // 각 패턴별로 키워드 검사
  for (const [category, pattern] of Object.entries(phishingPatterns)) {
    const matchedKeywords = pattern.keywords.filter(keyword =>
      normalizedText.includes(keyword.toLowerCase())
    );

    if (matchedKeywords.length > 0) {
      const categoryScore = matchedKeywords.length * pattern.weight;
      totalScore += categoryScore;

      detectedPatterns.push({
        category,
        description: pattern.description,
        matchedKeywords,
        score: categoryScore
      });
    }
  }

  return {
    totalScore,
    detectedPatterns,
    analysis: `${detectedPatterns.length}개의 의심 패턴 발견 (총점: ${totalScore.toFixed(1)})`
  };
}

/**
 * GPT 기반 언어 분석: 사회공학적 기만 수법 분석
 */
async function analyzeLinguistic(text, patternReport) {
  if (!openai) {
    // GPT 없이 패턴 기반 간단 분석
    const detected = patternReport.detectedPatterns;
    const indicators = [];

    if (detected.some(p => p.category === 'urgency')) indicators.push('긴박감 조성');
    if (detected.some(p => p.category === 'threat')) indicators.push('공포 유도');
    if (detected.some(p => p.category === 'authority')) indicators.push('권위 사칭');

    return {
      indicators,
      analysis: `사회공학 기법 ${indicators.length}개 감지`,
      confidence: 'medium'
    };
  }

  // GPT를 사용한 고급 분석
  const prompt = `다음 문구의 사회공학적 기만 수법을 분석해주세요:

텍스트: ${text}

다음 관점에서 분석하세요:
1. 긴박함/시간 압박 사용 여부
2. 공포/불안 유도 여부
3. 권위/신뢰 사칭 여부
4. 보상/이득 제시 여부

간결하게 한국어로 답변하세요.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    });

    return {
      analysis: response.choices[0].message.content,
      confidence: 'high'
    };
  } catch (error) {
    console.error('GPT 언어 분석 오류:', error);
    return {
      analysis: `분석 중 오류 발생: ${error.message}`,
      confidence: 'low'
    };
  }
}

/**
 * GPT 기반 보안 분석: 링크, 발신 형식의 기술적 위험성 분석
 */
async function analyzeSecurity(text, patternReport) {
  if (!openai) {
    // GPT 없이 패턴 기반 간단 분석
    const detected = patternReport.detectedPatterns;
    const risks = [];

    if (detected.some(p => p.category === 'link')) risks.push('의심스러운 링크 포함');
    if (detected.some(p => p.category === 'personalInfo')) risks.push('개인정보 요청');
    if (detected.some(p => p.category === 'money')) risks.push('금전 거래 유도');

    return {
      risks,
      analysis: `보안 위험 ${risks.length}개 발견`,
      threatLevel: risks.length >= 2 ? 'high' : risks.length > 0 ? 'medium' : 'low'
    };
  }

  // GPT를 사용한 고급 분석
  const prompt = `다음 메시지에 포함된 링크나 발신 형식의 기술적 위험성을 분석해주세요:

텍스트: ${text}

다음 관점에서 분석하세요:
1. URL/링크의 의심스러운 패턴
2. 개인정보 요청 여부
3. 금전 거래 유도 여부
4. 악성 행위 가능성

위험도(낮음/보통/높음/매우높음)와 함께 간결하게 한국어로 답변하세요.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300
    });

    return {
      analysis: response.choices[0].message.content,
      threatLevel: 'high'
    };
  } catch (error) {
    console.error('GPT 보안 분석 오류:', error);
    return {
      analysis: `분석 중 오류 발생: ${error.message}`,
      threatLevel: 'unknown'
    };
  }
}

/**
 * 권장사항 생성
 */
function generateRecommendations(riskLevel, patterns) {
  if (riskLevel === 'safe') {
    return ['의심스러운 패턴이 발견되지 않았습니다. 하지만 항상 주의하세요!'];
  }

  const recommendations = ['⚠️ 발신자의 신원을 반드시 확인하세요.'];

  const hasPersonalInfo = patterns.some(p => p.category === 'personalInfo');
  const hasMoney = patterns.some(p => p.category === 'money');
  const hasAuthority = patterns.some(p => p.category === 'authority');
  const hasLink = patterns.some(p => p.category === 'link');

  if (hasPersonalInfo) recommendations.push('🚫 절대 개인정보를 제공하지 마세요.');
  if (hasMoney) recommendations.push('💰 금전 요구는 99% 사기입니다. 송금하지 마세요.');
  if (hasAuthority) recommendations.push('📞 공공기관은 문자로 개인정보를 요구하지 않습니다. 공식 번호로 직접 확인하세요.');
  if (hasLink) recommendations.push('🔗 의심스러운 링크는 절대 클릭하지 마세요.');

  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('🚨 즉시 삭제하고, 필요시 경찰청 사이버안전국(182)에 신고하세요.');
  }

  return recommendations;
}

/**
 * 종합 분석: 모든 분석 결과를 종합하여 최종 판별
 */
async function synthesize(patternReport, linguisticReport, securityReport) {
  const totalScore = patternReport.totalScore;

  // 위험도 레벨 결정
  let riskLevel, riskPercentage;
  if (totalScore >= 10) {
    riskLevel = 'critical';
    riskPercentage = Math.min(100, 70 + (totalScore - 10) * 2);
  } else if (totalScore >= 6) {
    riskLevel = 'high';
    riskPercentage = 50 + (totalScore - 6) * 5;
  } else if (totalScore >= 3) {
    riskLevel = 'medium';
    riskPercentage = 30 + (totalScore - 3) * 6.67;
  } else if (totalScore > 0) {
    riskLevel = 'low';
    riskPercentage = totalScore * 10;
  } else {
    riskLevel = 'safe';
    riskPercentage = 0;
  }

  const recommendations = generateRecommendations(riskLevel, patternReport.detectedPatterns);

  if (!openai) {
    // GPT 없이 기본 종합 분석
    return {
      riskLevel,
      riskScore: Math.round(riskPercentage),
      detectedPatterns: patternReport.detectedPatterns,
      recommendations,
      summary: `${riskLevel.toUpperCase()} 위험도 - ${patternReport.detectedPatterns.length}개 패턴 감지`
    };
  }

  // GPT를 사용한 고급 종합 분석
  const prompt = `아래 세 가지 분석 결과를 종합하여 최종 판별 리포트를 작성하세요.

패턴 분석: ${patternReport.analysis}
언어 분석: ${linguisticReport.analysis}
보안 분석: ${securityReport.analysis}

판정 등급: ${riskLevel} (위험도: ${Math.round(riskPercentage)}%)
사용자가 취해야 할 행동 요령을 포함하여 간결하게 한국어로 작성하세요.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 400
    });

    return {
      riskLevel,
      riskScore: Math.round(riskPercentage),
      detectedPatterns: patternReport.detectedPatterns,
      recommendations,
      summary: response.choices[0].message.content,
      detailedAnalysis: {
        pattern: patternReport,
        linguistic: linguisticReport,
        security: securityReport
      }
    };
  } catch (error) {
    console.error('GPT 종합 분석 오류:', error);
    return {
      riskLevel,
      riskScore: Math.round(riskPercentage),
      detectedPatterns: patternReport.detectedPatterns,
      recommendations,
      summary: `${riskLevel.toUpperCase()} 위험도 - 종합 분석 완료`,
      error: error.message
    };
  }
}

/**
 * 메인 분석 함수: 텍스트를 분석하여 피싱/스캠 위험도를 계산
 */
export async function analyzeText(text) {
  if (!text || text.trim() === '') {
    return {
      riskLevel: 'safe',
      riskScore: 0,
      detectedPatterns: [],
      recommendations: ['분석할 텍스트를 입력해주세요.'],
      analyzedText: text
    };
  }

  try {
    // 1단계: 패턴 분석
    const patternReport = analyzePatterns(text);

    // 2단계: 언어 분석 (GPT 사용)
    const linguisticReport = await analyzeLinguistic(text, patternReport);

    // 3단계: 보안 분석 (GPT 사용)
    const securityReport = await analyzeSecurity(text, patternReport);

    // 4단계: 종합 분석 (GPT 사용)
    const finalDiagnosis = await synthesize(patternReport, linguisticReport, securityReport);

    finalDiagnosis.analyzedText = text;
    return finalDiagnosis;
  } catch (error) {
    console.error('분석 중 오류 발생:', error);
    return {
      riskLevel: 'unknown',
      riskScore: 0,
      detectedPatterns: [],
      recommendations: ['분석 중 오류가 발생했습니다. 다시 시도해주세요.'],
      error: error.message,
      analyzedText: text
    };
  }
}

/**
 * 위험도 레벨에 따른 색상 반환
 */
export function getRiskColor(riskLevel) {
  const colors = {
    safe: '#10b981',      // 초록색
    low: '#3b82f6',       // 파란색
    medium: '#f59e0b',    // 주황색
    high: '#ef4444',      // 빨간색
    critical: '#dc2626',  // 진한 빨간색
    unknown: '#6b7280'    // 회색
  };
  return colors[riskLevel] || colors.safe;
}

/**
 * 위험도 레벨에 따른 한글 라벨 반환
 */
export function getRiskLabel(riskLevel) {
  const labels = {
    safe: '안전',
    low: '낮음',
    medium: '보통',
    high: '높음',
    critical: '매우 위험',
    unknown: '알 수 없음'
  };
  return labels[riskLevel] || '알 수 없음';
}

/**
 * 위험도 레벨에 따른 이모지 반환
 */
export function getRiskEmoji(riskLevel) {
  const emojis = {
    safe: '✅',
    low: '⚡',
    medium: '⚠️',
    high: '🚨',
    critical: '🔴',
    unknown: '❓'
  };
  return emojis[riskLevel] || '❓';
}
