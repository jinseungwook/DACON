<script setup>
import { ref } from 'vue';
import ChatInterface from './components/ChatInterface.vue';
import EducationalLanding from './components/EducationalLanding.vue';

const isDarkMode = ref(false);
const currentPage = ref('chat');
const scenarioId = ref('');

// URL 파라미터 체크 (모의 피싱 링크 클릭 시)
const params = new URLSearchParams(window.location.search);
if (params.has('id')) {
  currentPage.value = 'gotcha';
  scenarioId.value = params.get('id');
}

function returnToChat() {
  currentPage.value = 'chat';
  window.history.replaceState({}, '', window.location.pathname);
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.setAttribute(
    'data-theme', 
    isDarkMode.value ? 'dark' : 'light'
  );
}
</script>

<template>
  <div id="app">
    <!-- 다크 모드 토글 (채팅 페이지에서만 표시) -->
    <button 
      v-if="currentPage === 'chat'"
      @click="toggleDarkMode" 
      class="theme-toggle"
      :title="isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'"
    >
      <span v-if="isDarkMode">☀️</span>
      <span v-else>🌙</span>
    </button>
    
    <!-- 메인 챗봇 인터페이스 -->
    <ChatInterface v-if="currentPage === 'chat'" />
    
    <!-- 교육용 랜딩 페이지 -->
    <EducationalLanding 
      v-if="currentPage === 'gotcha'" 
      :scenario-id="scenarioId"
      @return="returnToChat"
    />
  </div>
</template>

<style scoped>
#app {
  position: relative;
  width: 100%;
  height: 100vh;
}

.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: var(--bg-primary);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  z-index: 1000;
}

.theme-toggle:hover {
  transform: scale(1.1) rotate(20deg);
  box-shadow: var(--shadow-xl);
}

.theme-toggle:active {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .theme-toggle {
    width: 44px;
    height: 44px;
    top: 15px;
    right: 15px;
    font-size: 1.3rem;
  }
}
</style>
