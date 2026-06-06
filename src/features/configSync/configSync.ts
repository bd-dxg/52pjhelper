/**
 * 配置同步工具函数
 * 提供插件配置的导出和导入功能
 */

import popupQuickReplyConfig from '@features/popupQuickReply/config.json'

/**
 * 导入地址存储键
 * 用于保存用户填写的导入地址，避免重复输入
 */
const IMPORT_URL_STORAGE_KEY = 'configSyncImportUrl'

/**
 * 获取保存的导入地址
 */
export const getSavedImportUrl = async (): Promise<string> => {
  try {
    const result = await browser.storage.local.get(IMPORT_URL_STORAGE_KEY)
    const url = result[IMPORT_URL_STORAGE_KEY]
    return typeof url === 'string' ? url : ''
  } catch {
    return ''
  }
}

/**
 * 保存导入地址
 */
export const saveImportUrl = async (url: string): Promise<void> => {
  try {
    await browser.storage.local.set({ [IMPORT_URL_STORAGE_KEY]: url })
  } catch (error) {
    // 保存失败时记录警告，但不影响主功能
    console.warn('保存导入地址失败:', error instanceof Error ? error.message : error)
  }
}

/**
 * 允许导入的域名白名单
 * 防止 SSRF 攻击
 */
const ALLOWED_HOSTNAMES = ['www.52pojie.cn', '52pojie.cn']

/**
 * 允许导入的配置键白名单
 * 只允许导入预期的配置项，防止恶意数据注入
 * 注意：不包含 userInfoCache（用户个人信息，不应跨设备同步）
 * 当前只支持弹窗快捷回复配置，后续可扩展
 */
const ALLOWED_IMPORT_KEYS = new Set([
  // 弹窗快捷回复开关
  'popupQuickReplyEnabled',
  // 弹窗快捷回复预设（用户自定义）
  'popupQuickReplyPresets',
])

/**
 * 需要导出的存储键列表
 * 包含所有功能开关和用户配置
 */
const EXPORT_KEYS = Array.from(ALLOWED_IMPORT_KEYS)

/**
 * 导出配置结果
 */
export interface ExportResult {
  /** 是否成功 */
  success: boolean
  /** 导出的配置数据 */
  data?: Record<string, unknown>
  /** 错误信息 */
  error?: string
}

/**
 * 导入配置结果
 */
export interface ImportResult {
  /** 是否成功 */
  success: boolean
  /** 导入的配置数量 */
  count?: number
  /** 错误信息 */
  error?: string
}

/**
 * 获取默认的弹窗快捷回复预设
 */
const getDefaultPopupQuickReplyPresets = (): Record<string, unknown> => {
  return {
    mods: popupQuickReplyConfig.presets.mods,
    rate: popupQuickReplyConfig.presets.rate,
  }
}

/**
 * 导出当前插件配置
 * 读取 browser.storage.local 中的配置，如果 storage 中没有则使用默认值
 */
export const exportConfig = async (): Promise<ExportResult> => {
  try {
    // 获取所有需要导出的配置
    const result = await browser.storage.local.get(EXPORT_KEYS)

    // 构建导出配置，storage 中没有的使用默认值
    const config: Record<string, unknown> = {}

    // 弹窗快捷回复预设：优先使用 storage 中的值，否则使用默认配置
    if (result.popupQuickReplyPresets !== undefined) {
      config.popupQuickReplyPresets = result.popupQuickReplyPresets
    } else {
      config.popupQuickReplyPresets = getDefaultPopupQuickReplyPresets()
    }

    // 弹窗快捷回复开关
    if (result.popupQuickReplyEnabled !== undefined) {
      config.popupQuickReplyEnabled = result.popupQuickReplyEnabled
    }

    return {
      success: true,
      data: config,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '导出配置失败',
    }
  }
}

/**
 * 将配置转换为论坛 Markdown 代码块格式
 * 用于粘贴到论坛帖子
 */
export const configToBBCode = (config: Record<string, unknown>): string => {
  const jsonStr = JSON.stringify(config, null, 2)
  return `[md]\`\`\`json\n${jsonStr}\n\`\`\`[/md]`
}

/**
 * 从剪贴板内容解析配置
 * 支持格式：
 * - 纯 JSON
 * - [md]```json...```[/md] 格式
 * - [code]...[/code] 格式
 */
export const parseConfigFromText = (text: string): Record<string, unknown> | null => {
  try {
    // 尝试直接解析 JSON
    return JSON.parse(text)
  } catch {
    // 不是纯 JSON，尝试提取内容
  }

  // 格式1：[md]```json...```[/md]
  const mdMatch = text.match(/\[md\]\s*```(?:json)?\s*([\s\S]*?)```\s*\[\/md\]/)
  if (mdMatch) {
    try {
      return JSON.parse(mdMatch[1].trim())
    } catch {
      // 解析失败，继续尝试其他格式
    }
  }

  // 格式2：[code]...[/code]
  const codeMatch = text.match(/\[code\]([\s\S]*?)\[\/code\]/)
  if (codeMatch) {
    try {
      return JSON.parse(codeMatch[1].trim())
    } catch {
      // 解析失败
    }
  }

  return null
}

/**
 * 校验 URL 是否为允许的域名
 * 防止 SSRF 攻击
 */
export const isAllowedUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return ALLOWED_HOSTNAMES.includes(urlObj.hostname)
  } catch {
    return false
  }
}

/**
 * 从论坛帖子 URL 解析帖子 ID 和楼层 ID
 * 支持格式：
 * - https://www.52pojie.cn/thread-2111497-1-1.html（主楼）
 * - https://www.52pojie.cn/forum.php?mod=redirect&goto=findpost&ptid=2111497&pid=55364568（指定楼层）
 */
export const parsePostUrl = (url: string): { threadId: string; postId: string | null } | null => {
  // 格式1：thread-{tid}-1-1.html
  const threadMatch = url.match(/thread-(\d+)-\d+-\d+/)
  if (threadMatch) {
    return { threadId: threadMatch[1], postId: null }
  }

  // 格式2：findpost&ptid={tid}&pid={pid}（注意顺序可能不同）
  const findPostMatch = url.match(/ptid=(\d+).*?pid=(\d+)/)
  if (findPostMatch) {
    return { threadId: findPostMatch[1], postId: findPostMatch[2] }
  }

  return null
}

/**
 * 生成帖子链接
 * @param threadId 帖子 ID
 */
export const generatePostUrl = (threadId: string): string => {
  return `https://www.52pojie.cn/thread-${threadId}-1-1.html`
}

/**
 * 从论坛帖子页面 HTML 中提取指定楼层的 [code] 块内容
 * @param html 页面 HTML
 * @param postId 楼层 ID（pid），如果为 null 则查找 1 楼（主楼）
 */
export const extractCodeFromHtml = (html: string, postId: string | null): string | null => {
  let targetHtml: string

  if (postId) {
    // 查找指定楼层的内容区域
    // 论坛 HTML 结构：<td class="t_f" id="postmessage_{pid}">内容</td>
    const postMatch = html.match(new RegExp(
      `<td[^>]*class="t_f"[^>]*id="postmessage_${postId}"[^>]*>([\\s\\S]*?)<\\/td>`,
      'i',
    ))
    if (postMatch) {
      targetHtml = postMatch[1]
    } else {
      // 备用模式：id 在前，class 在后
      const altMatch = html.match(new RegExp(
        `id="postmessage_${postId}"[\\s\\S]*?<td[^>]*class="t_f"[^>]*>([\\s\\S]*?)<\\/td>`,
        'i',
      ))
      targetHtml = altMatch ? altMatch[1] : ''
    }
  } else {
    // 未指定楼层时，只查找 1 楼（主楼）的内容
    // 1 楼的特征：class="plhin res-postfirst" 或第一个 postmessage
    const firstPostMatch = html.match(/<td[^>]*class="t_f"[^>]*id="postmessage_\d+"[^>]*>([\s\S]*?)<\/td>/i)
    targetHtml = firstPostMatch ? firstPostMatch[1] : ''
  }

  // [code] 块会被转换为 <pre class="bbcode_code"> 或类似标签
  const codePatterns = [
    // 论坛 Markdown 代码块：[md]```json...```[/md] 渲染后
    /<pre[^>]*><code[^>]*class="[^"]*language-json[^"]*"[^>]*>([\s\S]*?)<\/code><\/pre>/,
    // BBCode code 标签转换后的 HTML
    /<pre[^>]*class="[^"]*bbcode_code[^"]*"[^>]*>([\s\S]*?)<\/pre>/,
    // 通用 code 标签
    /<code[^>]*>([\s\S]*?)<\/code>/,
    // 原始 BBCode（可能未转换）
    /\[code\]([\s\S]*?)\[\/code\]/,
    // 原始 Markdown 代码块
    /```(?:json)?\s*([\s\S]*?)```/,
  ]

  for (const pattern of codePatterns) {
    const match = targetHtml.match(pattern)
    if (match) {
      // 解码 HTML 实体
      const decoded = match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<[^>]*>/g, '') // 移除残留的 HTML 标签
        .trim()

      // 验证是否为有效 JSON
      try {
        JSON.parse(decoded)
        return decoded
      } catch {
        // 不是有效 JSON，继续尝试下一个模式
      }
    }
  }

  return null
}

/**
 * 过滤配置，只保留允许的键
 */
const filterConfig = (config: Record<string, unknown>): Record<string, unknown> => {
  const filtered: Record<string, unknown> = {}
  for (const key of Object.keys(config)) {
    if (ALLOWED_IMPORT_KEYS.has(key)) {
      filtered[key] = config[key]
    }
  }
  return filtered
}

/**
 * 导入配置
 * 从论坛帖子 URL 获取配置
 */
export const importConfig = async (url: string): Promise<ImportResult> => {
  try {
    // 校验 URL 域名
    if (!isAllowedUrl(url)) {
      return {
        success: false,
        error: '仅支持吾爱破解论坛链接',
      }
    }

    // 解析帖子 URL，获取帖子 ID 和楼层 ID
    const parsed = parsePostUrl(url)
    if (!parsed) {
      return {
        success: false,
        error: '无法识别帖子链接格式',
      }
    }

    const { threadId, postId } = parsed

    // 获取帖子页面
    const postUrl = generatePostUrl(threadId)
    const response = await fetch(postUrl, {
      credentials: 'include',
    })

    if (!response.ok) {
      return {
        success: false,
        error: `获取帖子失败: ${response.status}`,
      }
    }

    // 获取响应的 ArrayBuffer 并用 GBK 解码（论坛使用 GBK 编码）
    const buffer = await response.arrayBuffer()
    const decoder = new TextDecoder('gbk')
    const html = decoder.decode(buffer)

    // 提取配置（指定楼层或 1 楼）
    const configStr = extractCodeFromHtml(html, postId)
    if (!configStr) {
      return {
        success: false,
        error: '帖子中未找到有效的配置数据',
      }
    }

    // 解析配置
    const rawConfig = parseConfigFromText(configStr)
    if (!rawConfig) {
      return {
        success: false,
        error: '配置数据格式无效',
      }
    }

    // 过滤配置，只保留允许的键
    const config = filterConfig(rawConfig)

    // 写入 storage
    await browser.storage.local.set(config)

    return {
      success: true,
      count: Object.keys(config).length,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '导入配置失败',
    }
  }
}
