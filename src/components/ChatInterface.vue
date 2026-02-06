<template>
  <div class="chat-interface">
    <!-- 헤더 -->
    <div class="chat-header">
      <div class="header-content">
        <h1>🛡️ 피싱 가드</h1>
        <div class="mode-tabs">
          <button 
            :class="{ active: activeMode === 'detection' }" 
            @click="activeMode = 'detection'"
          >
            🔍 피싱 탐지
          </button>
          <button 
            :class="{ active: activeMode === 'simulation' }" 
            @click="activeMode = 'simulation'"
          >
            🎯 모의 훈련
          </button>
        </div>
      </div>
    </div>
    
    <!-- 메시지 영역 (피싱 탐지 모드) -->
    <div v-if="activeMode === 'detection'" class="messages-container" ref="messagesContainer">
      <div class="messages-wrapper">
        <!-- 환영 메시지 -->
        <div v-if="messages.length === 0" class="welcome-message">
          <div class="welcome-icon">🤖</div>
          <h2>안녕하세요!</h2>
          <p>피싱/스캠 메시지 탐지를 도와드립니다.</p>
          <div class="features">
            <div class="feature">
              <span class="feature-icon">📝</span>
              <span>정밀 문장 분석</span>
            </div>
            <div class="feature">
              <span class="feature-icon">⚖️</span>
              <span>위험도 평가</span>
            </div>
            <div class="feature">
              <span class="feature-icon">🛡️</span>
              <span>대응방법 가이드</span>
            </div>
          </div>
          <p class="welcome-hint">의심스러운 문자 내용이나 카톡 메시지를 입력해 보세요!</p>
        </div>
        
        <!-- 메시지 목록 -->
        <MessageBubble
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
          :message-type="msg.type"
        />
        
        <!-- 타이핑 인디케이터 -->
        <div v-if="isTyping" class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>

    <!-- 모의 훈련 영역 (모의 훈련 모드) -->
    <div v-if="activeMode === 'simulation'" class="simulation-container">
      <div class="simulation-card">
        <div class="simulation-header">
          <h2>🎯 실전 모의 피싱 훈련</h2>
          <p>실제 이메일을 발송하여 피싱 위험을 직접 체험해보세요.</p>
        </div>

        <div class="simulation-form">
          <div class="form-group">
            <label>받는 이메일 주소</label>
            <input 
              type="email" 
              v-model="targetEmail" 
              placeholder="예: example@gmail.com"
              class="email-input"
            />
            <small>훈련 메일이 실제로 발송됩니다. 본인의 이메일을 입력하세요.</small>
          </div>

          <div class="form-group">
            <label>훈련 시나리오 선택</label>
            <div class="scenario-grid">
              <div 
                v-for="scenario in scenarios" 
                :key="scenario.id"
                class="scenario-item"
                :class="{ selected: selectedScenarioId === scenario.id }"
                @click="selectedScenarioId = scenario.id"
              >
                <div class="scenario-title">{{ scenario.title }}</div>
                <div class="scenario-sender">{{ scenario.sender_name }}</div>
              </div>
            </div>
          </div>

          <button 
            @click="handleSendSimulation" 
            :disabled="isSending || !targetEmail"
            class="send-btn"
          >
            <span v-if="isSending">📤 전송 중...</span>
            <span v-else>🚀 훈련 메일 발송하기</span>
          </button>
        </div>

        <div v-if="simulationStatus" :class="['status-msg', simulationStatus.type]">
          {{ simulationStatus.message }}
        </div>
      </div>
    </div>
    
    <!-- 입력 영역 (탐지 모드에서만 표시) -->
    <MessageInput v-if="activeMode === 'detection'" @send-message="handleSendMessage" />
  </div>
</template>

<script>
import MessageBubble from './MessageBubble.vue';
import MessageInput from './MessageInput.vue';
import { analyzeText } from '../utils/phishingDetector.js';
import { simulationScenarios, sendPhishingEmail } from '../utils/simulationManager.js';

export default {
  name: 'ChatInterface',
  components: {
    MessageBubble,
    MessageInput
  },
  data() {
    return {
      activeMode: 'detection', // 'detection' or 'simulation'
      messages: [],
      isTyping: false,
      messageIdCounter: 0,
      
      // simulation state
      targetEmail: '',
      selectedScenarioId: simulationScenarios[0].id,
      isSending: false,
      simulationStatus: null,
      scenarios: simulationScenarios
    };
  },
  methods: {
    async handleSendMessage(messageData) {
      // 사용자 메시지 추가
      const userMessage = {
        id: this.messageIdCounter++,
        type: 'user',
        text: messageData.text,
        timestamp: messageData.timestamp
      };
      
      this.messages.push(userMessage);
      this.scrollToBottom();
      
      // 봇 응답 생성
      this.isTyping = true;
      
      // 분석 수행
      const analysis = analyzeText(messageData.text);
      
      // 응답 지연 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const botResponse = {
        id: this.messageIdCounter++,
        type: 'bot',
        text: this.generateResponseText(analysis),
        analysis: analysis,
        riskLevel: analysis.riskLevel,
        timestamp: new Date()
      };
      
      this.isTyping = false;
      this.messages.push(botResponse);
      this.scrollToBottom();
    },

    async handleSendSimulation() {
      if (!this.targetEmail) return;

      this.isSending = true;
      this.simulationStatus = { type: 'info', message: '훈련 메일을 발송하고 있습니다...' };

      try {
        await sendPhishingEmail(this.targetEmail, this.selectedScenarioId);
        this.simulationStatus = { 
          type: 'success', 
          message: '✅ 훈련 메일이 발송되었습니다! 수신함을 확인하고 링크를 클릭해보세요.' 
        };
      } catch (error) {
        this.simulationStatus = { 
          type: 'error', 
          message: `❌ 발송 실패: ${error.message || '설정을 확인해주세요.'}` 
        };
      } finally {
        this.isSending = false;
      }
    },
    
    generateResponseText(analysis) {
      const { riskLevel, riskScore } = analysis;
      
      if (riskLevel === 'safe') {
        return '분석 결과, 정상적인 메시지로 판단됩니다. 하지만 모르는 번호의 연락은 언제나 주의하세요!';
      } else if (riskLevel === 'low') {
        return `분석 결과 위험도가 낮지만, 일부 의심스러운 표현이 포함되어 있습니다. (위험도: ${riskScore}%)`;
      } else if (riskLevel === 'medium') {
        return `⚠️ 주의가 필요합니다. 전형적인 스캠 패턴이 일부 발견되었습니다. (위험도: ${riskScore}%)`;
      } else if (riskLevel === 'high') {
        return `🚨 위험합니다! 피싱 메시지일 확률이 매우 높습니다. (위험도: ${riskScore}%)`;
      } else {
        return `🔴 절대 대응하지 마세요! 매우 치명적인 피싱/스캠 메시지입니다. (위험도: ${riskScore}%)`;
      }
    },
    
    scrollToBottom() {
      if (this.activeMode !== 'detection') return;
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  },
  mounted() {
    this.scrollToBottom();
  }
};
</script>

<style scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  background: var(--bg-primary);
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: var(--spacing-lg) var(--spacing-xl);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.mode-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

.mode-tabs button {
  background: transparent;
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  opacity: 0.7;
}

.mode-tabs button.active {
  background: white;
  color: #764ba2;
  opacity: 1;
}

.simulation-container {
  flex: 1;
  padding: 40px 20px;
  overflow-y: auto;
  background: var(--bg-chat);
  display: flex;
  justify-content: center;
}

.simulation-card {
  background: white;
  width: 100%;
  max-width: 600px;
  padding: 40px;
  border-radius: 24px;
  box-shadow: var(--shadow-lg);
  height: fit-content;
}

[data-theme='dark'] .simulation-card {
  background: #1e1e1e;
}

.simulation-header h2 {
  margin-top: 0;
  font-size: 1.5rem;
}

.simulation-form {
  margin-top: 30px;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: var(--text-secondary);
}

.email-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  background: transparent;
}

.form-group small {
  display: block;
  margin-top: 6px;
  color: var(--text-tertiary);
}

.scenario-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.scenario-item {
  border: 2px solid #e5e7eb;
  padding: 15px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.scenario-item.selected {
  border-color: #764ba2;
  background: rgba(118, 75, 162, 0.05);
}

.scenario-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.scenario-sender {
  font-size: 0.85rem;
  color: var(--text-tertiary);
}

.send-btn {
  width: 100%;
  padding: 16px;
  background: #764ba2;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-msg {
  margin-top: 20px;
  padding: 15px;
  border-radius: 12px;
  font-size: 0.95rem;
}

.status-msg.info { background: #f3f4f6; }
.status-msg.success { background: #ecfdf5; color: #065f46; }
.status-msg.error { background: #fef2f2; color: #991b1b; }

.messages-container {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-chat);
  padding: var(--spacing-lg);
}

.messages-wrapper {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

/* 환영 메시지 */
.welcome-message {
  text-align: center;
  padding: var(--spacing-2xl) var(--spacing-lg);
  animation: fadeIn 0.6s ease-out;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
  animation: bounce 2s infinite;
}

.welcome-message h2 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  font-size: 2rem;
}

.welcome-message p {
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin-bottom: var(--spacing-xl);
}

.features {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin: var(--spacing-xl) 0;
  flex-wrap: wrap;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--bg-primary);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  min-width: 100px;
}

.feature-icon {
  font-size: 2rem;
}

.feature span:last-child {
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.welcome-hint {
  color: var(--text-tertiary);
  font-size: 0.9rem;
  margin-top: var(--spacing-xl);
}

/* 타이핑 인디케이터 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  width: fit-content;
  margin-right: auto;
  margin-bottom: var(--spacing-md);
  border-bottom-left-radius: 4px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: var(--text-tertiary);
  border-radius: 50%;
  animation: pulse 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* 반응형 */
@media (max-width: 768px) {
  .chat-header {
    padding: var(--spacing-md) var(--spacing-lg);
  }
  
  .header-content h1 {
    font-size: 1.5rem;
  }
  
  .messages-container {
    padding: var(--spacing-md);
  }
  
  .welcome-message {
    padding: var(--spacing-xl) var(--spacing-md);
  }
  
  .welcome-icon {
    font-size: 3rem;
  }
  
  .welcome-message h2 {
    font-size: 1.5rem;
  }
  
  .features {
    gap: var(--spacing-md);
  }
}
</style>
