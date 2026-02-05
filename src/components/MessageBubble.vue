<template>
  <div class="message-bubble" :class="[messageType, `risk-${message.riskLevel}`]">
    <div class="message-content">
      <!-- 텍스트 메시지 -->
      <p v-if="message.text" class="message-text">{{ message.text }}</p>
      
      <!-- 이미지 -->
      <div v-if="message.image" class="message-image">
        <img :src="message.image" :alt="message.imageAlt || '업로드된 이미지'" />
      </div>
      
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
  max-width: 70%;
  padding: var(--spacing-md);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  word-wrap: break-word;
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

.message-content {
  margin-bottom: var(--spacing-sm);
}

.message-text {
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-image {
  margin-top: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.message-image img {
  width: 100%;
  max-width: 300px;
  height: auto;
  display: block;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
  text-align: right;
  margin-top: var(--spacing-xs);
}

/* 분석 결과 스타일 */
.analysis-result {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-md);
}

.message-bubble.bot .analysis-result {
  background: var(--bg-tertiary);
}

.risk-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.risk-emoji {
  font-size: 1.5rem;
}

.risk-label {
  flex: 1;
}

.risk-score {
  font-size: 1.25rem;
  font-weight: 700;
}

.risk-bar {
  height: 12px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

.risk-bar-fill {
  height: 100%;
  transition: width 0.8s ease-out;
  border-radius: 6px;
}

.detected-patterns,
.recommendations {
  margin-top: var(--spacing-md);
}

.detected-patterns h4,
.recommendations h4 {
  font-size: 0.9rem;
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
}

.detected-patterns ul,
.recommendations ul {
  list-style: none;
  padding-left: 0;
}

.detected-patterns li,
.recommendations li {
  padding: var(--spacing-xs) 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.detected-patterns li {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.keywords {
  font-size: 0.85rem;
  opacity: 0.8;
  font-style: italic;
}

/* 위험도별 색상 */
.message-bubble.bot.risk-critical {
  border-left: 4px solid #dc2626;
}

.message-bubble.bot.risk-high {
  border-left: 4px solid #ef4444;
}

.message-bubble.bot.risk-medium {
  border-left: 4px solid #f59e0b;
}

.message-bubble.bot.risk-low {
  border-left: 4px solid #3b82f6;
}

.message-bubble.bot.risk-safe {
  border-left: 4px solid #10b981;
}

/* 반응형 */
@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }
  
  .message-image img {
    max-width: 100%;
  }
}
</style>
