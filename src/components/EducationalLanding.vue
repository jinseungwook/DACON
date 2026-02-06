<template>
  <div class="educational-landing">
    <div class="gotcha-card">
      <div class="warning-icon">⚠️</div>
      <h1>앗! 피싱 메일에 낚이셨습니다!</h1>
      <p class="subtitle">이것은 다행히 <b>모의 훈련 대기 페이지</b>입니다.</p>
      
      <div class="scenario-details" v-if="scenario">
        <h3>방금 클릭하신 이메일은 이런 점이 위험했습니다:</h3>
        <div class="explanation-box">
          <p>{{ scenario.explanation }}</p>
        </div>
      </div>

      <div class="educational-tips">
        <h2>🛡️ 피싱 피해 예방 수칙</h2>
        <ul>
          <li><strong>보낸 사람의 주소를 확인하세요:</strong> navver.com, nts-go-kr.com 처럼 미세하게 틀린 주소는 100% 사기입니다.</li>
          <li><strong>출처가 불분명한 링크는 클릭 금지:</strong> 특히 긴급하게 행동을 요구하는 링크는 더욱 주의해야 합니다.</li>
          <li><strong>공식 채널을 이용하세요:</strong> 앱이나 공식 홈페이지를 직접 검색해서 접속하는 것이 가장 안전합니다.</li>
          <li><strong>개인정보 요구 시 의심하세요:</strong> 공공기관이나 은행은 절대로 문자로 비밀번호나 인증번호를 요구하지 않습니다.</li>
        </ul>
      </div>

      <button class="return-button" @click="$emit('return')">
        다시 훈련하러 가기
      </button>
    </div>
  </div>
</template>

<script>
import { simulationScenarios } from '../utils/simulationManager';

export default {
  name: 'EducationalLanding',
  props: {
    scenarioId: String
  },
  computed: {
    scenario() {
      return simulationScenarios.find(s => s.id === this.scenarioId);
    }
  }
};
</script>

<style scoped>
.educational-landing {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fcebeb 0%, #ffffff 100%);
  padding: 20px;
}

.gotcha-card {
  background: white;
  max-width: 600px;
  width: 100%;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(220, 38, 38, 0.1);
  text-align: center;
  border-top: 8px solid #dc2626;
}

.warning-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

h1 {
  color: #dc2626;
  font-size: 2rem;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  color: #4b5563;
  margin-bottom: 30px;
}

.scenario-details {
  background: #fef2f2;
  padding: 20px;
  border-radius: 12px;
  text-align: left;
  margin-bottom: 30px;
}

.scenario-details h3 {
  color: #991b1b;
  margin-top: 0;
  font-size: 1rem;
}

.explanation-box {
  color: #b91c1c;
  line-height: 1.6;
}

.educational-tips {
  text-align: left;
  margin-bottom: 40px;
}

.educational-tips h2 {
  font-size: 1.25rem;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 12px;
  color: #374151;
  line-height: 1.5;
}

.return-button {
  background: #1f2937;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.return-button:hover {
  background: #111827;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style>
