<template>
  <div class="message-input-container">
    <!-- 이미지 미리보기 -->
    <div v-if="imagePreview" class="image-preview">
      <img :src="imagePreview" alt="미리보기" />
      <button @click="clearImage" class="clear-image-btn" type="button">
        ✕
      </button>
    </div>
    
    <!-- 입력 폼 -->
    <form @submit.prevent="handleSubmit" class="input-form">
      <!-- 이미지 업로드 버튼 -->
      <label class="image-upload-btn" title="이미지 업로드">
        <input 
          type="file" 
          accept="image/*" 
          @change="handleImageUpload"
          ref="fileInput"
          style="display: none;"
        />
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </label>
      
      <!-- 텍스트 입력 -->
      <textarea
        v-model="inputText"
        @keydown.enter.exact.prevent="handleSubmit"
        placeholder="의심스러운 메시지를 입력하거나 이미지를 업로드하세요..."
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
      inputText: '',
      imagePreview: null,
      imageFile: null
    };
  },
  computed: {
    canSend() {
      return this.inputText.trim().length > 0 || this.imageFile !== null;
    }
  },
  methods: {
    handleSubmit() {
      if (!this.canSend) return;
      
      const message = {
        text: this.inputText.trim(),
        image: this.imagePreview,
        imageFile: this.imageFile,
        timestamp: new Date()
      };
      
      this.$emit('send-message', message);
      
      // 입력 초기화
      this.inputText = '';
      this.clearImage();
      this.resetTextareaHeight();
    },
    
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // 이미지 파일 검증
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
      }
      
      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }
      
      this.imageFile = file;
      
      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    
    clearImage() {
      this.imagePreview = null;
      this.imageFile = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
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

.image-preview {
  position: relative;
  margin-bottom: var(--spacing-md);
  display: inline-block;
  border-radius: var(--border-radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  display: block;
}

.clear-image-btn {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all var(--transition-fast);
}

.clear-image-btn:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.input-form {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-sm);
}

.image-upload-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-secondary);
}

.image-upload-btn:hover {
  background: var(--bg-tertiary);
  color: var(--color-primary);
  transform: scale(1.05);
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
  min-height: 44px;
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
  width: 44px;
  height: 44px;
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

/* 반응형 */
@media (max-width: 480px) {
  .message-input-container {
    padding: var(--spacing-sm);
  }
  
  .image-preview img {
    max-width: 150px;
    max-height: 150px;
  }
}
</style>
