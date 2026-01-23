<template>
  <main class="settings-panel">
    <!-- 选项卡导航 -->
    <nav class="tabs-header" role="tablist">
      <button
        role="tab"
        :aria-selected="activeTab === 'navigation'"
        :tabindex="activeTab === 'navigation' ? 0 : -1"
        class="tab-item"
        :class="{ active: activeTab === 'navigation' }"
        @click="activeTab = 'navigation'">
        导航菜单设置
      </button>
      <button
        role="tab"
        :aria-selected="activeTab === 'quickQuery'"
        :tabindex="activeTab === 'quickQuery' ? 0 : -1"
        class="tab-item"
        :class="{ active: activeTab === 'quickQuery' }"
        @click="activeTab = 'quickQuery'">
        更多设置
      </button>
    </nav>

    <!-- 选项卡内容 -->
    <div class="tabs-content">
      <!-- 导航菜单设置 -->
      <section v-show="activeTab === 'navigation'" role="tabpanel" class="tab-panel" aria-labelledby="navigation-tab">
        <NavigationSettings @show-message="showMessage" />
      </section>

      <!-- 便捷查询设置 -->
      <section v-show="activeTab === 'quickQuery'" role="tabpanel" class="tab-panel" aria-labelledby="quickQuery-tab">
        <QuickQueryToggle @show-message="showMessage" />
        <QuickReplyToggle @show-message="showMessage" />
        <FloorHighlighterToggle @show-message="showMessage" />
      </section>
    </div>

    <!-- 消息提示 -->
    <aside class="message-container" role="status" aria-live="polite">
      <output v-if="message" class="message" :class="messageType">
        {{ message }}
      </output>
    </aside>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import NavigationSettings from '@com/NavigationSettings.vue'
import QuickQueryToggle from '@com/QuickQueryToggle.vue'
import QuickReplyToggle from '@com/QuickReplyToggle.vue'
import FloorHighlighterToggle from '@com/FloorHighlighterToggle.vue'

const message = ref('')
const messageType = ref('')
const activeTab = ref<'navigation' | 'quickQuery'>('navigation')

// 显示消息
const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}
</script>

<style scoped>
.settings-panel {
  min-width: 350px;
  max-width: 400px;
  height: 550px;
  display: flex;
  flex-direction: column;
}

/* 选项卡头部 */
.tabs-header {
  display: flex;
  border-bottom: 2px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.tab-item {
  flex: 1;
  padding: 12px 16px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  user-select: none;
  background-color: var(--bg-secondary);
  border: none;
}

.tab-item:hover {
  color: var(--primary-color);
  background-color: var(--bg-hover);
}

.tab-item.active {
  color: var(--primary-color);
  font-weight: 600;
  border-bottom-color: var(--primary-color);
  background-color: var(--bg-primary);
}

/* 选项卡内容 */
.tabs-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in;
  height: 100%;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-container {
  min-height: 45px;
  padding: 0 20px 15px;
}

.message {
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  animation: slideIn 0.3s ease-in;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.success {
  background-color: var(--success-bg);
  color: var(--success-color);
  border: 1px solid var(--success-border);
}

.message.error {
  background-color: var(--error-bg);
  color: var(--error-color);
  border: 1px solid var(--error-border);
}
</style>
