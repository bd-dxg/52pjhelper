import quickReplyConfig from '@/configs/quickReply.json'
import { urlMatcher } from './urlMatcher'
import { storageHelper } from './storageHelper'

interface ReplyOption {
  value: string
  title: string
  text: string
  selected?: string
}

const REPLY_OPTIONS: ReplyOption[] = quickReplyConfig.options
const QUICK_REPLY_STORAGE_KEY = quickReplyConfig.storageKey

// 加载快捷回复配置
export async function loadQuickReplyConfig(): Promise<boolean> {
  return await storageHelper.loadBoolean(QUICK_REPLY_STORAGE_KEY, quickReplyConfig.defaultEnabled)
}

// 保存快捷回复配置
export async function saveQuickReplyConfig(enabled: boolean): Promise<void> {
  await storageHelper.saveBoolean(QUICK_REPLY_STORAGE_KEY, enabled)
}

// 创建下拉框HTML
function createSelectHtml(): string {
  const options = REPLY_OPTIONS.map(
    item => `<option value="${item.value}" title="${item.title}" ${item.selected ?? ''}>${item.text}</option>`,
  ).join('')
  return `<select class="quick-reply-select" style="width:20px;height:23px; display: inline-block; vertical-align: middle;">${options}</select>`
}

// 初始化快捷回复功能
export function initQuickReply(): void {
  const isTargetPage = urlMatcher.isTargetPage(window.location.href, quickReplyConfig.targetPages)
  if (!isTargetPage) return

  // 添加样式
  const style = document.createElement('style')
  style.textContent = `
    @media screen and (max-width: 768px) {
      #list_modcp_logs tbody tr td:nth-child(2) {width:300px}
    }
    @media screen and (min-width: 768px) and (max-width:1100px) {
      #list_modcp_logs tbody tr td:nth-child(2) {width:500px}
    }
    @media screen and (min-width: 1100px) {
      #list_modcp_logs tbody tr td:nth-child(2) {width:600px}
    }
    .quick-reply-select option {
      max-width: 200px !important;
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
    #list_modcp_logs tbody tr td:nth-child(4) input {
      display: inline-block !important;
      vertical-align: middle !important;
    }
    #list_modcp_logs tbody tr td:nth-child(4) {
      white-space: nowrap !important;
    }
  `
  document.head.appendChild(style)

  // 获取所有输入框
  const inputs = document.querySelectorAll<HTMLInputElement>('#list_modcp_logs tbody tr td:nth-child(4) input')
  if (inputs.length === 0) return

  // 为每个输入框添加下拉框（检查是否已存在）
  inputs.forEach(input => {
    // 检查该输入框后面是否已经有下拉框
    const nextElement = input.nextElementSibling
    if (nextElement?.classList.contains('quick-reply-select')) {
      return // 已存在，跳过
    }
    input.insertAdjacentHTML('afterend', createSelectHtml())
  })

  // 添加事件监听
  document.addEventListener('change', event => {
    const target = event.target as HTMLSelectElement
    if (!target.classList.contains('quick-reply-select')) return

    const selectedOption = target.options[target.selectedIndex]
    const tr = target.closest('tr')
    const input = target.parentElement?.querySelector('input') as HTMLInputElement
    if (!input) return

    if (selectedOption.textContent === '去举报区') {
      const reportUrl = 'https://www.52pojie.cn/' + tr?.querySelector('td a')?.getAttribute('href') || ''
      input.value = `举报地址: ${reportUrl} ${selectedOption.title}`
    } else {
      input.value = selectedOption.title
    }
  })
}

// 清理快捷回复功能
export function cleanupQuickReply(): void {
  document.querySelectorAll('.quick-reply-select').forEach(el => el.remove())
}
