<script setup>
import { ref } from 'vue';
import ChatInterface from './components/ChatInterface.vue';

const isDarkMode = ref(false);

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
    <!-- 다크 모드 토글 -->
    <button 
      @click="toggleDarkMode" 
      class="theme-toggle"
      :title="isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'"
    >
      <span v-if="isDarkMode">☀️</span>
      <span v-else>🌙</span>
    </button>
    
    <!-- 메인 챗봇 인터페이스 -->
    <ChatInterface />
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
