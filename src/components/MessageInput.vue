<template>
  <div class="message-input-container">
    <!-- 입력 폼 -->
    <form @submit.prevent="handleSubmit" class="input-form">
      <!-- 텍스트 입력 -->
      <textarea
        v-model="inputText"
        @keydown.enter.exact.prevent="handleSubmit"
        placeholder="의심스러운 메시지를 입력하세요..."
        class="text-input"
        rows="1"
        ref="textarea"
      ></textarea>
      
      <!-- 전송 버튼 -->
      <button 
        type="submit" 
        class="send-btn"
        :disabled="!canSend"
        title="전송"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'MessageInput',
  data() {
    return {
      inputText: ''
    };
  },
  computed: {
    canSend() {
      return this.inputText.trim().length > 0;
    }
  },
  methods: {
    handleSubmit() {
      if (!this.canSend) return;
      
      const message = {
        text: this.inputText.trim(),
        timestamp: new Date()
      };
      
      this.$emit('send-message', message);
      
      // 입력 초기화
      this.inputText = '';
      this.resetTextareaHeight();
    },
    
    resetTextareaHeight() {
      if (this.$refs.textarea) {
        this.$refs.textarea.style.height = 'auto';
      }
    }
  },
  watch: {
    inputText() {
      // 자동 높이 조절
      this.$nextTick(() => {
        const textarea = this.$refs.textarea;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
      });
    }
  }
};
</script>

<style scoped>
.message-input-container {
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-md);
}

.input-form {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-sm);
  max-width: 900px;
  margin: 0 auto;
}

.text-input {
  flex: 1;
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  resize: none;
  min-height: 48px;
  max-height: 120px;
  transition: all var(--transition-fast);
  line-height: 1.5;
}

.text-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.text-input::placeholder {
  color: var(--text-tertiary);
}

.send-btn {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.send-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: scale(1.05);
}

.send-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .message-input-container {
    padding: var(--spacing-sm);
  }
}
</style>
</style>
