<template>
  <div class="chat-interface">
    <!-- 헤더 -->
    <div class="chat-header">
      <div class="header-content">
        <h1>🛡️ 피싱 탐지 챗봇</h1>
        <p>텍스트를 분석하여 피싱/스캠 위험을 알려드립니다</p>
      </div>
    </div>
    
    <!-- 메시지 영역 -->
    <div class="messages-container" ref="messagesContainer">
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
    
    <!-- 입력 영역 -->
    <MessageInput @send-message="handleSendMessage" />
  </div>
</template>

<script>
import MessageBubble from './MessageBubble.vue';
import MessageInput from './MessageInput.vue';
import { analyzeText } from '../utils/phishingDetector.js';

export default {
  name: 'ChatInterface',
  components: {
    MessageBubble,
    MessageInput
  },
  data() {
    return {
      messages: [],
      isTyping: false,
      messageIdCounter: 0
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

.header-content h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
}

.header-content p {
  margin: var(--spacing-xs) 0 0 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

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
