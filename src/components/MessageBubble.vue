<template>
  <div class="message-bubble" :class="[messageType, `risk-${message.riskLevel}`]">
    <div class="message-content">
      <!-- 텍스트 메시지 -->
      <p v-if="message.text" class="message-text">{{ message.text }}</p>
      
      <!-- 위험도 분석 결과 -->
      <div v-if="message.analysis" class="analysis-result">
        <div class="risk-header">
          <span class="risk-emoji">{{ getRiskEmoji(message.analysis.riskLevel) }}</span>
          <span class="risk-label">위험도: {{ getRiskLabel(message.analysis.riskLevel) }}</span>
          <span class="risk-score">{{ message.analysis.riskScore }}%</span>
        </div>
        
        <!-- 위험도 바 -->
        <div class="risk-bar">
          <div 
            class="risk-bar-fill" 
            :style="{ 
              width: message.analysis.riskScore + '%',
              backgroundColor: getRiskColor(message.analysis.riskLevel)
            }"
          ></div>
        </div>
        
        <!-- 탐지된 패턴 -->
        <div v-if="message.analysis.detectedPatterns.length > 0" class="detected-patterns">
          <h4>🔍 탐지된 의심 패턴:</h4>
          <ul>
            <li v-for="(pattern, index) in message.analysis.detectedPatterns" :key="index">
              <strong>{{ pattern.description }}</strong>
              <span class="keywords">{{ pattern.matchedKeywords.join(', ') }}</span>
            </li>
          </ul>
        </div>
        
        <!-- 권장사항 -->
        <div v-if="message.analysis.recommendations.length > 0" class="recommendations">
          <h4>💡 권장사항:</h4>
          <ul>
            <li v-for="(rec, index) in message.analysis.recommendations" :key="index">
              {{ rec }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="message-time">{{ formatTime(message.timestamp) }}</div>
  </div>
</template>

<script>
import { getRiskColor, getRiskLabel, getRiskEmoji } from '../utils/phishingDetector.js';

export default {
  name: 'MessageBubble',
  props: {
    message: {
      type: Object,
      required: true
    },
    messageType: {
      type: String,
      required: true,
      validator: (value) => ['user', 'bot'].includes(value)
    }
  },
  methods: {
    getRiskColor,
    getRiskLabel,
    getRiskEmoji,
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }
};
</script>

<style scoped>
.message-bubble {
  max-width: 80%;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  word-wrap: break-word;
  position: relative;
}

.message-bubble.user {
  background: var(--color-primary);
  color: var(--text-inverse);
  margin-left: auto;
  border-bottom-right-radius: 4px;
  animation: slideInRight var(--transition-normal) ease-out;
}

.message-bubble.bot {
  background: var(--bg-secondary);
  color: var(--text-primary);
  margin-right: auto;
  border-bottom-left-radius: 4px;
  animation: slideInLeft var(--transition-normal) ease-out;
}

.message-text {
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
  font-size: 1rem;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.6;
  text-align: right;
  margin-top: var(--spacing-sm);
}

.user .message-time {
  color: rgba(255, 255, 255, 0.8);
}

/* 분석 결과 스타일 */
.analysis-result {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(0, 0, 0, 0.05);
  border-radius: var(--border-radius-md);
}

[data-theme="dark"] .analysis-result {
  background: rgba(255, 255, 255, 0.05);
}

.risk-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  font-weight: 700;
}

.risk-emoji {
  font-size: 1.4rem;
}

.risk-score {
  margin-left: auto;
  font-size: 1.1rem;
  color: var(--color-primary-dark);
}

[data-theme="dark"] .risk-score {
  color: var(--color-primary-light);
}

.risk-bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

[data-theme="dark"] .risk-bar {
  background: rgba(255, 255, 255, 0.1);
}

.risk-bar-fill {
  height: 100%;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 4px;
}

.detected-patterns,
.recommendations {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-sm);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

[data-theme="dark"] .detected-patterns,
[data-theme="dark"] .recommendations {
  border-top-color: rgba(255, 255, 255, 0.05);
}

.detected-patterns h4,
.recommendations h4 {
  font-size: 0.85rem;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

.detected-patterns ul,
.recommendations ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detected-patterns li,
.recommendations li {
  margin-bottom: var(--spacing-xs);
  font-size: 0.9rem;
  line-height: 1.4;
}

.keywords {
  display: block;
  font-size: 0.8rem;
  opacity: 0.7;
  margin-top: 2px;
}

/* 위험도별 경계선 */
.message-bubble.bot.risk-critical { border-left: 4px solid var(--color-danger); }
.message-bubble.bot.risk-high { border-left: 4px solid var(--color-danger); opacity: 0.95; }
.message-bubble.bot.risk-medium { border-left: 4px solid var(--color-warning); }
.message-bubble.bot.risk-low { border-left: 4px solid var(--color-info); }
.message-bubble.bot.risk-safe { border-left: 4px solid var(--color-success); }

@media (max-width: 768px) {
  .message-bubble {
    max-width: 90%;
  }
}
</style>
</style>
