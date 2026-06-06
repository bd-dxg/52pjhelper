<template>
  <div class="config-sync-section">
    <h3 class="section-title">配置同步</h3>
    <p class="section-desc">导出当前配置到论坛帖子，或从帖子导入配置</p>

    <!-- 导出区域 -->
    <div class="sync-card">
      <div class="card-header">
        <span class="card-icon">💾</span>
        <span class="card-title">导出配置</span>
      </div>
      <p class="card-desc">导出为 BBCode 格式，可粘贴到论坛帖子</p>
      <button class="sync-btn export-btn" :disabled="isExporting" @click="handleExport">
        {{ isExporting ? '导出中...' : '导出配置' }}
      </button>
      <div v-if="exportResult" class="result-message" :class="exportResult.success ? 'success' : 'error'">
        {{ exportResult.message }}
      </div>
    </div>

    <!-- 导入区域 -->
    <div class="sync-card">
      <div class="card-header">
        <span class="card-icon">🔗</span>
        <span class="card-title">导入配置</span>
      </div>
      <p class="card-desc">粘贴论坛帖子链接，导入其中的配置</p>
      <div class="import-input-group">
        <input
          v-model="importUrl"
          type="text"
          class="import-input"
          placeholder="粘贴帖子链接..."
          :disabled="isImporting" />
        <button class="sync-btn import-btn" :disabled="isImporting || !importUrl.trim()" @click="handleImport">
          {{ isImporting ? '导入中...' : '导入' }}
        </button>
      </div>
      <div v-if="importResult" class="result-message" :class="importResult.success ? 'success' : 'error'">
        {{ importResult.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { exportConfig, configToBBCode, importConfig, getSavedImportUrl, saveImportUrl } from './configSync'

defineOptions({
  name: 'ConfigSyncToggle',
})

// 导出状态
const isExporting = ref(false)
const exportResult = ref<{ success: boolean; message: string } | null>(null)

// 导入状态
const isImporting = ref(false)
const importUrl = ref('')
const importResult = ref<{ success: boolean; message: string } | null>(null)

// 组件挂载时加载保存的导入地址
onMounted(async () => {
  try {
    importUrl.value = await getSavedImportUrl()
  } catch (error) {
    console.warn('加载导入地址失败:', error instanceof Error ? error.message : error)
  }
})

/**
 * 复制文本到剪贴板
 * 优先使用 Clipboard API，降级使用 execCommand（已废弃但仍广泛支持）
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    // 优先使用现代 Clipboard API
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // 降级方案：使用已废弃的 execCommand（在某些环境 Clipboard API 不可用）
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    } catch {
      return false
    }
  }
}

/**
 * 处理导出配置
 * 导出后自动复制到剪贴板
 */
const handleExport = async () => {
  isExporting.value = true
  exportResult.value = null

  try {
    const result = await exportConfig()

    if (result.success && result.data) {
      const bbCode = configToBBCode(result.data)

      // 自动复制到剪贴板
      const copied = await copyToClipboard(bbCode)
      exportResult.value = {
        success: true,
        message: copied
          ? `已复制 ${Object.keys(result.data).length} 项配置到剪贴板，可粘贴到论坛帖子`
          : `导出失败，请手动复制`,
      }
    } else {
      exportResult.value = {
        success: false,
        message: result.error || '导出失败',
      }
    }
  } catch (error) {
    exportResult.value = {
      success: false,
      message: error instanceof Error ? error.message : '导出失败',
    }
  } finally {
    isExporting.value = false
  }
}

/**
 * 处理导入配置
 */
const handleImport = async () => {
  if (!importUrl.value.trim()) {
    return
  }

  isImporting.value = true
  importResult.value = null

  try {
    const result = await importConfig(importUrl.value.trim())

    if (result.success) {
      // 导入成功后保存地址
      await saveImportUrl(importUrl.value.trim())
      importResult.value = {
        success: true,
        message: `成功导入 ${result.count} 项配置，请刷新页面生效`,
      }
    } else {
      importResult.value = {
        success: false,
        message: result.error || '导入失败',
      }
    }
  } catch (error) {
    importResult.value = {
      success: false,
      message: error instanceof Error ? error.message : '导入失败',
    }
  } finally {
    isImporting.value = false
  }
}
</script>

<style scoped>
.config-sync-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--border-color);
}

.section-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
}

.sync-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.card-icon {
  font-size: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.card-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.sync-btn {
  width: 100%;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.sync-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-btn {
  background: var(--primary-color);
  color: white;
}

.export-btn:hover:not(:disabled) {
  background: var(--primary-hover);
}

.import-btn {
  background-color: var(--success-color);
  color: white;
}

.import-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.import-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.import-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.import-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.import-input::placeholder {
  color: var(--text-secondary);
}

.result-message {
  margin-top: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
}

.result-message.success {
  background: var(--success-bg);
  color: var(--success-color);
  border: 1px solid var(--success-border);
}

.result-message.error {
  background: var(--error-bg);
  color: var(--error-color);
  border: 1px solid var(--error-border);
}
</style>
