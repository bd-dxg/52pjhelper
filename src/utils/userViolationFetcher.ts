/**
 * 用户违规信息获取工具
 * 提供公共的用户违规记录查询功能
 */

/** 请求超时时间（毫秒） */
const FETCH_TIMEOUT = 10000

/**
 * 带超时控制的 fetch 请求
 * @param url 请求地址
 * @param timeout 超时时间（毫秒）
 * @returns Response 对象
 */
async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * 从用户 UID 获取违规信息
 * @param uid 用户 UID
 * @returns 违规信息 DOM 元素，如果没有违规记录或请求失败则返回 null
 */
export async function fetchUserViolation(uid: string): Promise<Element | null> {
  const userInfoUrl = `https://www.52pojie.cn/home.php?mod=space&uid=${uid}&do=profile&from=space`

  try {
    const response = await fetchWithTimeout(userInfoUrl, FETCH_TIMEOUT)

    if (!response.ok) {
      // 服务器返回错误状态码，静默返回 null
      return null
    }

    const blob = await response.blob()

    // 使用 FileReader 将 blob 转换为 GBK 编码的文本
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsText(blob, 'gbk')

      reader.onload = () => {
        try {
          const parser = new DOMParser()
          const pageHtml = parser.parseFromString(reader.result as string, 'text/html')
          const violationInfo = pageHtml.querySelector('#pcr')
          resolve(violationInfo)
        } catch {
          // 解析失败，静默返回 null
          resolve(null)
        }
      }

      reader.onerror = () => {
        // 读取失败，静默返回 null
        resolve(null)
      }
    })
  } catch {
    // 网络错误（包括超时、请求被取消等），静默返回 null
    return null
  }
}

/**
 * 从链接 href 中提取 UID
 * @param href 链接地址
 * @returns UID 字符串，如果未找到则返回 null
 */
export function extractUidFromHref(href: string): string | null {
  const uidMatch = href.match(/uid=(\d+)/)
  return uidMatch ? uidMatch[1] : null
}
