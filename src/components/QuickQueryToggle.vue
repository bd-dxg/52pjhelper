<template>
  <div class="toggle-container">
    <p class="description">鼠标移动到用户头像时，自动显示该用户的违规记录。</p>
    <label class="toggle-label">
      <span>启用便捷查询</span>
      <div class="toggle-switch" @click.stop="toggleQuickQuery">
        <input type="checkbox" :checked="quickQueryEnabled" disabled aria-label="启用便捷查询" />
        <span class="slider"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const quickQueryEnabled = ref(false)
const emit = defineEmits(['show-message'])

// 切换便捷查询功能
const toggleQuickQuery = async () => {
  console.log('toggleQuickQuery 被调用，当前状态:', quickQueryEnabled.value)
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      const response = await browser.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_QUICK_QUERY',
      })

      if (response.success) {
        quickQueryEnabled.value = response.enabled
        emit('show-message', quickQueryEnabled.value ? '便捷查询已启用' : '便捷查询已禁用', 'success')
      } else {
        emit('show-message', '切换便捷查询失败', 'error')
      }
    }
  } catch (error) {
    emit('show-message', '切换便捷查询失败', 'error')
  }
}

// 加载用户配置
onMounted(async () => {
  try {
    // 获取便捷查询状态
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    if (tab.id) {
      try {
        const quickQueryResponse = await browser.tabs.sendMessage(tab.id, {
          type: 'GET_QUICK_QUERY_STATUS',
        })

        if (quickQueryResponse && quickQueryResponse.success) {
          quickQueryEnabled.value = quickQueryResponse.enabled
        }
      } catch (error) {
        console.error('Failed to get quick query status from content script:', error)
      }
    }
  } catch (error) {
    console.error('Failed to load quick query settings:', error)
    emit('show-message', '加载配置失败', 'error')
  }
})
</script>

<style scoped>
.toggle-container {
  margin-bottom: 20px;
}

.description {
  margin: 0 0 20px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.toggle-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 12px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  transition: background-color 0.2s;
}

.toggle-label:hover {
  background-color: var(--bg-hover);
}

.toggle-label span {
  font-size: 14px;
  color: var(--text-primary);
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--toggle-bg);
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(26px);
}
</style>
