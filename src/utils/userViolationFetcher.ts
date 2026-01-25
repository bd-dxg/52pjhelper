/**
 * 用户违规信息获取工具
 * 提供公共的用户违规记录查询功能
 */

/**
 * 从用户 UID 获取违规信息
 * @param uid 用户 UID
 * @returns 违规信息 DOM 元素，如果没有违规记录则返回 null
 */
export async function fetchUserViolation(uid: string): Promise<Element | null> {
  const userInfoUrl = `https://www.52pojie.cn/home.php?mod=space&uid=${uid}&do=profile&from=space`

  try {
    const response = await fetch(userInfoUrl)
    const blob = await response.blob()

    // 使用 FileReader 将 blob 转换为 GBK 编码的文本
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsText(blob, 'gbk')

      reader.onload = () => {
        try {
          const parser = new DOMParser()
          const pageHtml = parser.parseFromString(reader.result as string, 'text/html')
          const violationInfo = pageHtml.querySelector('#pcr')
          resolve(violationInfo)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => {
        reject(new Error('读取用户信息失败'))
      }
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    throw error
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
