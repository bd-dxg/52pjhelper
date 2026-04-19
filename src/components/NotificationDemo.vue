<template>
  <div class="notification-demo">
    <h3>通知系统演示</h3>

    <div class="demo-section">
      <h4>基本通知类型</h4>
      <div class="button-group">
        <button class="btn success" @click="showSuccess">成功通知</button>
        <button class="btn error" @click="showError">错误通知</button>
        <button class="btn warning" @click="showWarning">警告通知</button>
        <button class="btn info" @click="showInfo">信息通知</button>
        <button class="btn update" @click="showUpdate">更新通知</button>
      </div>
    </div>

    <div class="demo-section">
      <h4>带操作的通知</h4>
      <div class="button-group">
        <button class="btn primary" @click="showActionNotification">带操作的通知</button>
        <button class="btn secondary" @click="showConfirmNotification">确认对话框</button>
      </div>
    </div>

    <div class="demo-section">
      <h4>位置演示</h4>
      <div class="button-group">
        <button class="btn" @click="showTopLeft">左上角</button>
        <button class="btn" @click="showTopRight">右上角</button>
        <button class="btn" @click="showBottomLeft">左下角</button>
        <button class="btn" @click="showBottomRight">右下角</button>
        <button class="btn" @click="showCenter">居中</button>
      </div>
    </div>

    <div class="demo-section">
      <h4>持久化通知</h4>
      <div class="button-group">
        <button class="btn" @click="showPersistent">持久通知（10秒）</button>
        <button class="btn" @click="showNoAutoDismiss">手动关闭通知</button>
      </div>
    </div>

    <div class="demo-section">
      <h4>管理通知</h4>
      <div class="button-group">
        <button class="btn" @click="clearAll">清除所有通知</button>
        <span class="notification-count">当前通知数: {{ notificationCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotification } from '@/composables/useNotification'

const {
  success,
  error,
  warning,
  info,
  update,
  show,
  clear,
  notificationCount,
} = useNotification()

const showSuccess = () => {
  success('操作成功完成！', { title: '成功' })
}

const showError = () => {
  error('操作失败，请检查网络连接。', { title: '错误' })
}

const showWarning = () => {
  warning('磁盘空间不足，请及时清理。', { title: '警告' })
}

const showInfo = () => {
  info('新消息已到达，请查收。', { title: '信息' })
}

const showUpdate = () => {
  update('发现新版本 v2.0.0，建议立即更新。', { title: '版本更新' })
}

const showActionNotification = () => {
  show('文件下载完成，是否打开？', {
    title: '下载完成',
    type: 'success',
    actions: [
      {
        label: '打开',
        type: 'primary',
        handler: () => {
          success('文件已打开', { title: '操作成功' })
        },
      },
      {
        label: '取消',
        type: 'secondary',
        handler: () => {
          info('操作已取消', { title: '已取消' })
        },
      },
    ],
  })
}

const showConfirmNotification = () => {
  show('确定要删除这个项目吗？此操作不可撤销。', {
    title: '确认删除',
    type: 'warning',
    actions: [
      {
        label: '删除',
        type: 'danger',
        handler: () => {
          success('项目已删除', { title: '删除成功' })
        },
      },
      {
        label: '取消',
        handler: () => {
          info('删除操作已取消', { title: '已取消' })
        },
      },
    ],
  })
}

const showTopLeft = () => {
  info('左上角通知', { position: 'top-left' })
}

const showTopRight = () => {
  info('右上角通知', { position: 'top-right' })
}

const showBottomLeft = () => {
  info('左下角通知', { position: 'bottom-left' })
}

const showBottomRight = () => {
  info('右下角通知', { position: 'bottom-right' })
}

const showCenter = () => {
  info('居中通知', { position: 'center' })
}

const showPersistent = () => {
  info('这个通知将持续 10 秒', { duration: 10000 })
}

const showNoAutoDismiss = () => {
  show('请手动关闭此通知', {
    title: '手动关闭',
    type: 'info',
    duration: 0,
    dismissible: true,
  })
}

const clearAll = () => {
  clear()
  info('所有通知已清除', { title: '清理完成' })
}
</script>

<style scoped>
.notification-demo {
  padding: 20px;
  background: var(--bg-secondary);
  border-radius: 8px;
  margin: 20px 0;
}

.notification-demo h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--text-primary);
  font-size: 18px;
}

.demo-section {
  margin-bottom: 24px;
}

.demo-section h4 {
  margin: 0 0 12px 0;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.btn.success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
}

.btn.error {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: white;
  border: none;
}

.btn.warning {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
  border: none;
}

.btn.info {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  border: none;
}

.btn.update {
  background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
  color: white;
  border: none;
}

.btn.primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: white;
  border: none;
}

.btn.secondary {
  background: linear-gradient(135deg, #757575 0%, #616161 100%);
  color: white;
  border: none;
}

.notification-count {
  font-size: 13px;
  color: var(--text-secondary);
  margin-left: 12px;
  padding: 4px 8px;
  background: var(--bg-primary);
  border-radius: 4px;
  border: 1px solid var(--border-color);
}
</style>