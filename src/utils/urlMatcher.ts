/**
 * URL 匹配工具
 * 提供统一的 URL 匹配功能，支持多种匹配模式
 */

/**
 * URL 匹配模式类型
 */
export type UrlMatchMode = 'includes' | 'exact' | 'regex' | 'glob'

/**
 * URL 匹配规则配置
 */
export interface UrlMatchRule {
  /** 匹配模式 */
  mode: UrlMatchMode
  /** 匹配模式字符串 */
  pattern: string
}

/**
 * URL 匹配器接口
 */
export interface IUrlMatcher {
  /**
   * 检查 URL 是否匹配任一规则
   * @param url 要检查的 URL
   * @param rules 匹配规则数组
   */
  matchAny(url: string, rules: UrlMatchRule[]): boolean

  /**
   * 检查 URL 是否匹配所有规则
   * @param url 要检查的 URL
   * @param rules 匹配规则数组
   */
  matchAll(url: string, rules: UrlMatchRule[]): boolean

  /**
   * 检查 URL 是否匹配单个规则
   * @param url 要检查的 URL
   * @param rule 匹配规则
   */
  match(url: string, rule: UrlMatchRule): boolean

  /**
   * 简化版：检查 URL 是否包含任一目标页面（兼容现有配置）
   * @param url 要检查的 URL
   * @param targetPages 目标页面数组（字符串）
   */
  isTargetPage(url: string, targetPages: string[]): boolean
}

/**
 * 将通配符模式转换为正则表达式
 * @param pattern 通配符模式（支持 * 和 ?）
 */
function globToRegex(pattern: string): RegExp {
  // 安全检查：限制模式长度，防止 ReDoS 攻击
  if (pattern.length > 200) {
    throw new Error('URL 匹配模式过长（最大 200 字符）')
  }

  // 安全检查：限制连续通配符数量，防止 ReDoS 攻击
  if (/\*{3,}/.test(pattern)) {
    throw new Error('不允许连续使用 3 个或更多通配符')
  }

  // 转义正则表达式特殊字符，但保留 * 和 ?
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.')

  return new RegExp(`^${escaped}$`)
}

/**
 * 创建 URL 匹配器实例
 */
export function createUrlMatcher(): IUrlMatcher {
  /**
   * 检查 URL 是否匹配单个规则
   */
  const match = (url: string, rule: UrlMatchRule): boolean => {
    switch (rule.mode) {
      case 'includes':
        return url.includes(rule.pattern)

      case 'exact':
        return url === rule.pattern

      case 'regex':
        try {
          const regex = new RegExp(rule.pattern)
          return regex.test(url)
        } catch (error) {
          console.error('无效的正则表达式:', rule.pattern, error)
          return false
        }

      case 'glob':
        try {
          const regex = globToRegex(rule.pattern)
          return regex.test(url)
        } catch (error) {
          console.error('无效的通配符模式:', rule.pattern, error)
          return false
        }

      default:
        console.warn('未知的匹配模式:', rule.mode)
        return false
    }
  }

  /**
   * 检查 URL 是否匹配任一规则
   */
  const matchAny = (url: string, rules: UrlMatchRule[]): boolean => {
    return rules.some((rule) => match(url, rule))
  }

  /**
   * 检查 URL 是否匹配所有规则
   */
  const matchAll = (url: string, rules: UrlMatchRule[]): boolean => {
    return rules.every((rule) => match(url, rule))
  }

  /**
   * 简化版：检查 URL 是否包含任一目标页面（兼容现有配置）
   * 自动检测模式：如果包含 * 则使用 glob 模式，否则使用 includes 模式
   */
  const isTargetPage = (url: string, targetPages: string[]): boolean => {
    return targetPages.some((page) => {
      // 如果包含通配符，使用 glob 模式
      if (page.includes('*')) {
        return match(url, { mode: 'glob', pattern: page })
      }
      // 否则使用 includes 模式（兼容现有逻辑）
      return match(url, { mode: 'includes', pattern: page })
    })
  }

  return {
    match,
    matchAny,
    matchAll,
    isTargetPage,
  }
}

/**
 * 默认导出单例实例
 */
export const urlMatcher = createUrlMatcher()
