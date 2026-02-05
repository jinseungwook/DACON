// 피싱/스캠 탐지 유틸리티

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

/**
 * 텍스트를 분석하여 피싱/스캠 위험도를 계산합니다
 * @param {string} text - 분석할 텍스트
 * @returns {Object} 분석 결과
 */
export function analyzeText(text) {
  if (!text || text.trim().length === 0) {
    return {
      riskLevel: 'safe',
      riskScore: 0,
      detectedPatterns: [],
      recommendations: ['분석할 텍스트를 입력해주세요.']
    };
  }

  const normalizedText = text.toLowerCase();
  let totalScore = 0;
  const detectedPatterns = [];

  // 각 패턴별로 키워드 검사
  Object.entries(phishingPatterns).forEach(([category, pattern]) => {
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
  });

  // 위험도 레벨 결정
  let riskLevel;
  let riskPercentage;
  
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

  // 권장사항 생성
  const recommendations = generateRecommendations(riskLevel, detectedPatterns);

  return {
    riskLevel,
    riskScore: Math.round(riskPercentage),
    detectedPatterns,
    recommendations,
    analyzedText: text
  };
}

/**
 * 위험도에 따른 권장사항을 생성합니다
 */
function generateRecommendations(riskLevel, patterns) {
  const recommendations = [];

  if (riskLevel === 'safe') {
    return ['의심스러운 패턴이 발견되지 않았습니다. 하지만 항상 주의하세요!'];
  }

  // 공통 권장사항
  recommendations.push('⚠️ 발신자의 신원을 반드시 확인하세요.');

  // 패턴별 권장사항
  const hasPersonalInfo = patterns.some(p => p.category === 'personalInfo');
  const hasMoney = patterns.some(p => p.category === 'money');
  const hasAuthority = patterns.some(p => p.category === 'authority');
  const hasLink = patterns.some(p => p.category === 'link');

  if (hasPersonalInfo) {
    recommendations.push('🚫 절대 개인정보를 제공하지 마세요.');
  }

  if (hasMoney) {
    recommendations.push('💰 금전 요구는 99% 사기입니다. 송금하지 마세요.');
  }

  if (hasAuthority) {
    recommendations.push('📞 공공기관은 문자로 개인정보를 요구하지 않습니다. 공식 번호로 직접 확인하세요.');
  }

  if (hasLink) {
    recommendations.push('🔗 의심스러운 링크는 절대 클릭하지 마세요.');
  }

  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('🚨 즉시 삭제하고, 필요시 경찰청 사이버안전국(182)에 신고하세요.');
  }

  return recommendations;
}

/**
 * 위험도 레벨에 따른 색상을 반환합니다
 */
export function getRiskColor(riskLevel) {
  const colors = {
    safe: '#10b981',      // 초록색
    low: '#3b82f6',       // 파란색
    medium: '#f59e0b',    // 주황색
    high: '#ef4444',      // 빨간색
    critical: '#dc2626'   // 진한 빨간색
  };
  return colors[riskLevel] || colors.safe;
}

/**
 * 위험도 레벨에 따른 한글 라벨을 반환합니다
 */
export function getRiskLabel(riskLevel) {
  const labels = {
    safe: '안전',
    low: '낮음',
    medium: '보통',
    high: '높음',
    critical: '매우 위험'
  };
  return labels[riskLevel] || '알 수 없음';
}

/**
 * 위험도 레벨에 따른 이모지를 반환합니다
 */
export function getRiskEmoji(riskLevel) {
  const emojis = {
    safe: '✅',
    low: '⚡',
    medium: '⚠️',
    high: '🚨',
    critical: '🔴'
  };
  return emojis[riskLevel] || '❓';
}
