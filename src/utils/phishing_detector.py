"""
피싱/스캠 탐지 유틸리티 - LangGraph 기반 다중 에이전트 시스템
model_idea.md의 아키텍처를 기반으로 구현
"""

import operator
import os
from dotenv import load_dotenv
from pathlib import Path    
from typing import Annotated, TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI


# 1. 상태 정의 (에이전트들이 공유할 메모리)
class PhishingDetectionState(TypedDict):
    input_text: str
    linguistic_report: Dict[str, Any]
    security_report: Dict[str, Any]
    pattern_report: Dict[str, Any]
    final_diagnosis: Dict[str, Any]


# 피싱 패턴 정의
PHISHING_PATTERNS = {
    'urgency': {
        'keywords': ['긴급', '즉시', '24시간', '오늘까지', '마감', '지금', '당장', '빨리'],
        'weight': 2.5,
        'description': '긴급성을 강조하는 표현'
    },
    'money': {
        'keywords': ['송금', '계좌', '입금', '환급', '세금', '과태료', '벌금', '당첨', '보상금', '수수료'],
        'weight': 3.0,
        'description': '금전 관련 요구'
    },
    'personal_info': {
        'keywords': ['주민번호', '비밀번호', '카드번호', '계좌번호', '인증번호', 'OTP', '보안카드', '개인정보'],
        'weight': 3.5,
        'description': '개인정보 요청'
    },
    'authority': {
        'keywords': ['경찰', '검찰', '법원', '국세청', '금융감독원', '은행', '카드사', '우체국', '택배'],
        'weight': 2.0,
        'description': '공공기관/기업 사칭'
    },
    'threat': {
        'keywords': ['법적조치', '고소', '고발', '압류', '체포', '구속', '소송', '처벌', '신용불량'],
        'weight': 3.0,
        'description': '위협성 문구'
    },
    'link': {
        'keywords': ['http', 'https', 'bit.ly', 'url', '링크', '클릭', '접속'],
        'weight': 2.0,
        'description': '의심스러운 링크'
    },
    'contact': {
        'keywords': ['연락주세요', '회신', '답장', '전화', '문자', '카톡', '텔레그램'],
        'weight': 1.5,
        'description': '연락 요청'
    }
}

BASE_DIR = Path(__file__).resolve().parents[4]
load_dotenv(BASE_DIR / ".env")

# OpenAI API 설정
try:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
    
    llm = ChatOpenAI(
        model="gpt-4o-mini",  # 또는 "gpt-4", "gpt-3.5-turbo" 등
        temperature=0.3,
        api_key=api_key
    )
except Exception as e:
    print(f"Warning: OpenAI API 초기화 실패. 패턴 기반 분석만 사용됩니다: {e}")
    llm = None


# 2. 노드 정의 (각 에이전트의 역할)

def pattern_analyzer(state: PhishingDetectionState) -> Dict[str, Any]:
    """
    패턴 분석 에이전트: 키워드 기반 패턴 매칭
    """
    text = state['input_text']
    
    if not text or text.strip() == '':
        return {
            'pattern_report': {
                'total_score': 0,
                'detected_patterns': [],
                'analysis': '분석할 텍스트가 없습니다.'
            }
        }
    
    normalized_text = text.lower()
    total_score = 0
    detected_patterns = []
    
    # 각 패턴별로 키워드 검사
    for category, pattern in PHISHING_PATTERNS.items():
        matched_keywords = [
            keyword for keyword in pattern['keywords']
            if keyword.lower() in normalized_text
        ]
        
        if matched_keywords:
            category_score = len(matched_keywords) * pattern['weight']
            total_score += category_score
            
            detected_patterns.append({
                'category': category,
                'description': pattern['description'],
                'matched_keywords': matched_keywords,
                'score': category_score
            })
    
    return {
        'pattern_report': {
            'total_score': total_score,
            'detected_patterns': detected_patterns,
            'analysis': f'{len(detected_patterns)}개의 의심 패턴 발견 (총점: {total_score:.1f})'
        }
    }


def linguistic_expert(state: PhishingDetectionState) -> Dict[str, Any]:
    """
    언어 분석 에이전트: 사회공학적 기만 수법 분석
    """
    text = state['input_text']
    
    if llm is None:
        # LLM이 없을 경우 패턴 기반 간단 분석
        pattern_report = state.get('pattern_report', {})
        detected = pattern_report.get('detected_patterns', [])
        
        linguistic_indicators = []
        if any(p['category'] == 'urgency' for p in detected):
            linguistic_indicators.append('긴박감 조성')
        if any(p['category'] == 'threat' for p in detected):
            linguistic_indicators.append('공포 유도')
        if any(p['category'] == 'authority' for p in detected):
            linguistic_indicators.append('권위 사칭')
        
        return {
            'linguistic_report': {
                'indicators': linguistic_indicators,
                'analysis': f'사회공학 기법 {len(linguistic_indicators)}개 감지',
                'confidence': 'medium'
            }
        }
    
    # LLM을 사용한 고급 분석
    prompt = f"""다음 문구의 사회공학적 기만 수법을 분석해주세요:
    
텍스트: {text}

다음 관점에서 분석하세요:
1. 긴박함/시간 압박 사용 여부
2. 공포/불안 유도 여부
3. 권위/신뢰 사칭 여부
4. 보상/이득 제시 여부

JSON 형식으로 간결하게 답변하세요."""
    
    try:
        response = llm.invoke(prompt)
        return {
            'linguistic_report': {
                'analysis': response,
                'confidence': 'high'
            }
        }
    except Exception as e:
        return {
            'linguistic_report': {
                'analysis': f'분석 중 오류 발생: {str(e)}',
                'confidence': 'low'
            }
        }


def security_expert(state: PhishingDetectionState) -> Dict[str, Any]:
    """
    보안 분석 에이전트: 링크, 발신 형식의 기술적 위험성 분석
    """
    text = state['input_text']
    
    if llm is None:
        # LLM이 없을 경우 패턴 기반 간단 분석
        pattern_report = state.get('pattern_report', {})
        detected = pattern_report.get('detected_patterns', [])
        
        security_risks = []
        if any(p['category'] == 'link' for p in detected):
            security_risks.append('의심스러운 링크 포함')
        if any(p['category'] == 'personal_info' for p in detected):
            security_risks.append('개인정보 요청')
        if any(p['category'] == 'money' for p in detected):
            security_risks.append('금전 거래 유도')
        
        return {
            'security_report': {
                'risks': security_risks,
                'analysis': f'보안 위험 {len(security_risks)}개 발견',
                'threat_level': 'high' if len(security_risks) >= 2 else 'medium' if security_risks else 'low'
            }
        }
    
    # LLM을 사용한 고급 분석
    prompt = f"""다음 메시지에 포함된 링크나 발신 형식의 기술적 위험성을 분석해주세요:

텍스트: {text}

다음 관점에서 분석하세요:
1. URL/링크의 의심스러운 패턴
2. 개인정보 요청 여부
3. 금전 거래 유도 여부
4. 악성 행위 가능성

위험도(낮음/보통/높음/매우높음)와 함께 간결하게 답변하세요."""
    
    try:
        response = llm.invoke(prompt)
        return {
            'security_report': {
                'analysis': response,
                'threat_level': 'high'
            }
        }
    except Exception as e:
        return {
            'security_report': {
                'analysis': f'분석 중 오류 발생: {str(e)}',
                'threat_level': 'unknown'
            }
        }


def synthesizer(state: PhishingDetectionState) -> Dict[str, Any]:
    """
    종합 분석 에이전트: 모든 분석 결과를 종합하여 최종 판별
    """
    pattern_report = state.get('pattern_report', {})
    linguistic_report = state.get('linguistic_report', {})
    security_report = state.get('security_report', {})
    
    total_score = pattern_report.get('total_score', 0)
    
    # 위험도 레벨 결정
    if total_score >= 10:
        risk_level = 'critical'
        risk_percentage = min(100, 70 + (total_score - 10) * 2)
    elif total_score >= 6:
        risk_level = 'high'
        risk_percentage = 50 + (total_score - 6) * 5
    elif total_score >= 3:
        risk_level = 'medium'
        risk_percentage = 30 + (total_score - 3) * 6.67
    elif total_score > 0:
        risk_level = 'low'
        risk_percentage = total_score * 10
    else:
        risk_level = 'safe'
        risk_percentage = 0
    
    # 권장사항 생성
    recommendations = generate_recommendations(
        risk_level, 
        pattern_report.get('detected_patterns', [])
    )
    
    if llm is None:
        # LLM 없이 기본 종합 분석
        final_diagnosis = {
            'risk_level': risk_level,
            'risk_score': round(risk_percentage),
            'detected_patterns': pattern_report.get('detected_patterns', []),
            'recommendations': recommendations,
            'summary': f'{risk_level.upper()} 위험도 - {len(pattern_report.get("detected_patterns", []))}개 패턴 감지'
        }
    else:
        # LLM을 사용한 고급 종합 분석
        prompt = f"""아래 세 가지 분석 결과를 종합하여 최종 판별 리포트를 작성하세요.

패턴 분석: {pattern_report.get('analysis', 'N/A')}
언어 분석: {linguistic_report.get('analysis', 'N/A')}
보안 분석: {security_report.get('analysis', 'N/A')}

판정 등급: {risk_level} (위험도: {round(risk_percentage)}%)
사용자가 취해야 할 행동 요령을 포함하여 간결하게 작성하세요."""
        
        try:
            llm_summary = llm.invoke(prompt)
            final_diagnosis = {
                'risk_level': risk_level,
                'risk_score': round(risk_percentage),
                'detected_patterns': pattern_report.get('detected_patterns', []),
                'recommendations': recommendations,
                'summary': llm_summary,
                'detailed_analysis': {
                    'pattern': pattern_report,
                    'linguistic': linguistic_report,
                    'security': security_report
                }
            }
        except Exception as e:
            final_diagnosis = {
                'risk_level': risk_level,
                'risk_score': round(risk_percentage),
                'detected_patterns': pattern_report.get('detected_patterns', []),
                'recommendations': recommendations,
                'summary': f'{risk_level.upper()} 위험도 - 종합 분석 완료',
                'error': str(e)
            }
    
    return {'final_diagnosis': final_diagnosis}


def generate_recommendations(risk_level: str, patterns: List[Dict]) -> List[str]:
    """위험도에 따른 권장사항 생성"""
    recommendations = []
    
    if risk_level == 'safe':
        return ['의심스러운 패턴이 발견되지 않았습니다. 하지만 항상 주의하세요!']
    
    # 공통 권장사항
    recommendations.append('⚠️ 발신자의 신원을 반드시 확인하세요.')
    
    # 패턴별 권장사항
    has_personal_info = any(p['category'] == 'personal_info' for p in patterns)
    has_money = any(p['category'] == 'money' for p in patterns)
    has_authority = any(p['category'] == 'authority' for p in patterns)
    has_link = any(p['category'] == 'link' for p in patterns)
    
    if has_personal_info:
        recommendations.append('🚫 절대 개인정보를 제공하지 마세요.')
    
    if has_money:
        recommendations.append('💰 금전 요구는 99% 사기입니다. 송금하지 마세요.')
    
    if has_authority:
        recommendations.append('📞 공공기관은 문자로 개인정보를 요구하지 않습니다. 공식 번호로 직접 확인하세요.')
    
    if has_link:
        recommendations.append('🔗 의심스러운 링크는 절대 클릭하지 마세요.')
    
    if risk_level in ['critical', 'high']:
        recommendations.append('🚨 즉시 삭제하고, 필요시 경찰청 사이버안전국(182)에 신고하세요.')
    
    return recommendations


# 3. 그래프 구성 (워크플로우 설계)
def create_phishing_detection_graph():
    """피싱 탐지 워크플로우 그래프 생성"""
    workflow = StateGraph(PhishingDetectionState)
    
    # 노드 추가
    workflow.add_node("pattern_analyzer", pattern_analyzer)
    workflow.add_node("linguistic_expert", linguistic_expert)
    workflow.add_node("security_expert", security_expert)
    workflow.add_node("synthesizer", synthesizer)
    
    # 워크플로우 설계
    workflow.set_entry_point("pattern_analyzer")
    workflow.add_edge("pattern_analyzer", "linguistic_expert")
    workflow.add_edge("linguistic_expert", "security_expert")
    workflow.add_edge("security_expert", "synthesizer")
    workflow.add_edge("synthesizer", END)
    
    return workflow.compile()


# 전역 앱 인스턴스
phishing_detection_app = create_phishing_detection_graph()


# 4. 유틸리티 함수들

def analyze_text(text: str) -> Dict[str, Any]:
    """
    텍스트를 분석하여 피싱/스캠 위험도를 계산합니다
    
    Args:
        text: 분석할 텍스트
        
    Returns:
        분석 결과 딕셔너리
    """
    if not text or text.strip() == '':
        return {
            'risk_level': 'safe',
            'risk_score': 0,
            'detected_patterns': [],
            'recommendations': ['분석할 텍스트를 입력해주세요.']
        }
    
    # LangGraph 워크플로우 실행
    result = phishing_detection_app.invoke({
        'input_text': text,
        'linguistic_report': {},
        'security_report': {},
        'pattern_report': {},
        'final_diagnosis': {}
    })
    
    final_diagnosis = result.get('final_diagnosis', {})
    final_diagnosis['analyzed_text'] = text
    
    return final_diagnosis


def get_risk_color(risk_level: str) -> str:
    """위험도 레벨에 따른 색상 반환"""
    colors = {
        'safe': '#10b981',      # 초록색
        'low': '#3b82f6',       # 파란색
        'medium': '#f59e0b',    # 주황색
        'high': '#ef4444',      # 빨간색
        'critical': '#dc2626'   # 진한 빨간색
    }
    return colors.get(risk_level, colors['safe'])


def get_risk_label(risk_level: str) -> str:
    """위험도 레벨에 따른 한글 라벨 반환"""
    labels = {
        'safe': '안전',
        'low': '낮음',
        'medium': '보통',
        'high': '높음',
        'critical': '매우 위험'
    }
    return labels.get(risk_level, '알 수 없음')


def get_risk_emoji(risk_level: str) -> str:
    """위험도 레벨에 따른 이모지 반환"""
    emojis = {
        'safe': '✅',
        'low': '⚡',
        'medium': '⚠️',
        'high': '🚨',
        'critical': '🔴'
    }
    return emojis.get(risk_level, '❓')


# 5. 메인 실행 (테스트용)
if __name__ == "__main__":
    # 테스트 케이스
    test_cases = [
        "sdlkfjaslfjewjf;lasjfwpsdf",
        "긴급! 국세청입니다. 세금 환급을 위해 계좌번호를 회신해주세요.",
        "당첨되셨습니다! 지금 즉시 링크를 클릭하여 상금을 수령하세요."
    ]
    
    print("=== 피싱 탐지 시스템 테스트 ===\n")
    
    for i, text in enumerate(test_cases, 1):
        print(f"[테스트 {i}] {text}")
        result = analyze_text(text)
        print(f"위험도: {get_risk_emoji(result['risk_level'])} {get_risk_label(result['risk_level'])} ({result['risk_score']}%)")
        print(f"권장사항: {result['recommendations'][0]}")
        print("-" * 80)
        print()
