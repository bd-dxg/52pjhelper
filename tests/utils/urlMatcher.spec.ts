import { describe, it, expect, beforeEach } from 'vitest'
import { createUrlMatcher, type UrlMatchRule } from '@/utils/urlMatcher'

describe('urlMatcher', () => {
  let urlMatcher: ReturnType<typeof createUrlMatcher>

  beforeEach(() => {
    urlMatcher = createUrlMatcher()
  })

  describe('includes 模式', () => {
    it('应该匹配包含指定字符串的 URL', () => {
      const rule: UrlMatchRule = { mode: 'includes', pattern: '52pojie.cn' }
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php', rule)).toBe(true)
    })

    it('应该不匹配不包含指定字符串的 URL', () => {
      const rule: UrlMatchRule = { mode: 'includes', pattern: '52pojie.cn' }
      expect(urlMatcher.match('https://www.example.com/forum.php', rule)).toBe(false)
    })

    it('应该区分大小写', () => {
      const rule: UrlMatchRule = { mode: 'includes', pattern: 'Forum' }
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php', rule)).toBe(false)
      expect(urlMatcher.match('https://www.52pojie.cn/Forum.php', rule)).toBe(true)
    })

    it('应该匹配 URL 的任意部分', () => {
      const rule: UrlMatchRule = { mode: 'includes', pattern: 'forum' }
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php', rule)).toBe(true)
      expect(urlMatcher.match('https://forum.52pojie.cn/index.php', rule)).toBe(true)
    })
  })

  describe('exact 模式', () => {
    it('应该精确匹配完整 URL', () => {
      const rule: UrlMatchRule = {
        mode: 'exact',
        pattern: 'https://www.52pojie.cn/forum.php',
      }
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php', rule)).toBe(true)
    })

    it('应该不匹配不完全相同的 URL', () => {
      const rule: UrlMatchRule = {
        mode: 'exact',
        pattern: 'https://www.52pojie.cn/forum.php',
      }
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php?mod=guide', rule)).toBe(false)
      expect(urlMatcher.match('https://www.52pojie.cn/thread.php', rule)).toBe(false)
    })

    it('应该区分协议', () => {
      const rule: UrlMatchRule = {
        mode: 'exact',
        pattern: 'https://www.52pojie.cn/forum.php',
      }
      expect(urlMatcher.match('http://www.52pojie.cn/forum.php', rule)).toBe(false)
    })

    it('应该区分尾部斜杠', () => {
      const rule: UrlMatchRule = {
        mode: 'exact',
        pattern: 'https://www.52pojie.cn/forum/',
      }
      expect(urlMatcher.match('https://www.52pojie.cn/forum', rule)).toBe(false)
      expect(urlMatcher.match('https://www.52pojie.cn/forum/', rule)).toBe(true)
    })
  })

  describe('regex 模式', () => {
    it('应该使用正则表达式匹配 URL', () => {
      const rule: UrlMatchRule = {
        mode: 'regex',
        pattern: 'https://www\\.52pojie\\.cn/forum-\\d+\\.html',
      }
      expect(urlMatcher.match('https://www.52pojie.cn/forum-1.html', rule)).toBe(true)
      expect(urlMatcher.match('https://www.52pojie.cn/forum-123.html', rule)).toBe(true)
      expect(urlMatcher.match('https://www.52pojie.cn/forum-abc.html', rule)).toBe(false)
    })

    it('应该支持复杂的正则表达式', () => {
      const rule: UrlMatchRule = {
        mode: 'regex',
        pattern: 'https://www\\.52pojie\\.cn/(forum|thread)-\\d+\\.html',
      }
      expect(urlMatcher.match('https://www.52pojie.cn/forum-1.html', rule)).toBe(true)
      expect(urlMatcher.match('https://www.52pojie.cn/thread-123.html', rule)).toBe(true)
      expect(urlMatcher.match('https://www.52pojie.cn/post-456.html', rule)).toBe(false)
    })

    it('应该处理无效的正则表达式', () => {
      const rule: UrlMatchRule = {
        mode: 'regex',
        pattern: '[invalid(regex',
      }
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php', rule)).toBe(false)
    })

    it('应该支持正则表达式标志', () => {
      const rule: UrlMatchRule = {
        mode: 'regex',
        pattern: 'https://www\\.52pojie\\.cn/FORUM\\.php',
      }
      // 默认区分大小写
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php', rule)).toBe(false)
      expect(urlMatcher.match('https://www.52pojie.cn/FORUM.php', rule)).toBe(true)
    })
  })

  describe('glob 模式', () => {
    it('应该使用通配符 * 匹配任意字符', () => {
      const rule: UrlMatchRule = {
        mode: 'glob',
        pattern: 'https://www.52pojie.cn/forum-*.html',
      }
      expect(urlMatcher.match('https://www.52pojie.cn/forum-1.html', rule)).toBe(true)
      expect(urlMatcher.match('https://www.52pojie.cn/forum-123.html', rule)).toBe(true)
      expect(urlMatcher.match('https://www.52pojie.cn/forum-abc.html', rule)).toBe(true)
      expect(urlMatcher.match('https://www.52pojie.cn/thread-1.html', rule)).toBe(false)
    })

    it('应该使用通配符 ? 匹配单个字符', () => {
      const rule: UrlMatchRule = {
        mode: 'glob',
        pattern: 'https://www.52pojie.cn/forum-?.html',
      }
      expect(urlMatcher.match('https://www.52pojie.cn/forum-1.html', rule)).toBe(true)
      expect(urlMatcher.match('https://www.52pojie.cn/forum-a.html', rule)).toBe(true)
      expect(urlMatcher.match('https://www.52pojie.cn/forum-12.html', rule)).toBe(false)
    })

    it('应该支持多个通配符', () => {
      const rule: UrlMatchRule = {
        mode: 'glob',
        pattern: 'https://*.52pojie.cn/*',
      }
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php', rule)).toBe(true)
      expect(urlMatcher.match('https://bbs.52pojie.cn/thread.php', rule)).toBe(true)
      expect(urlMatcher.match('http://www.52pojie.cn/forum.php', rule)).toBe(false)
    })

    it('应该正确转义正则表达式特殊字符', () => {
      const rule: UrlMatchRule = {
        mode: 'glob',
        pattern: 'https://www.52pojie.cn/forum.php?mod=*',
      }
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php?mod=guide', rule)).toBe(true)
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php?mod=forumdisplay', rule)).toBe(
        true,
      )
    })

    it('应该拒绝过长的模式', () => {
      const longPattern = 'https://www.52pojie.cn/' + 'a'.repeat(200)
      const rule: UrlMatchRule = {
        mode: 'glob',
        pattern: longPattern,
      }
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php', rule)).toBe(false)
    })

    it('应该拒绝连续的通配符', () => {
      const rule: UrlMatchRule = {
        mode: 'glob',
        pattern: 'https://www.52pojie.cn/***',
      }
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php', rule)).toBe(false)
    })
  })

  describe('matchAny 方法', () => {
    it('应该匹配任一规则', () => {
      const rules: UrlMatchRule[] = [
        { mode: 'includes', pattern: 'forum' },
        { mode: 'includes', pattern: 'thread' },
      ]
      expect(urlMatcher.matchAny('https://www.52pojie.cn/forum.php', rules)).toBe(true)
      expect(urlMatcher.matchAny('https://www.52pojie.cn/thread.php', rules)).toBe(true)
      expect(urlMatcher.matchAny('https://www.52pojie.cn/home.php', rules)).toBe(false)
    })

    it('应该处理空规则数组', () => {
      expect(urlMatcher.matchAny('https://www.52pojie.cn/forum.php', [])).toBe(false)
    })

    it('应该支持混合模式', () => {
      const rules: UrlMatchRule[] = [
        { mode: 'exact', pattern: 'https://www.52pojie.cn/forum.php' },
        { mode: 'glob', pattern: 'https://www.52pojie.cn/thread-*.html' },
        { mode: 'includes', pattern: 'home' },
      ]
      expect(urlMatcher.matchAny('https://www.52pojie.cn/forum.php', rules)).toBe(true)
      expect(urlMatcher.matchAny('https://www.52pojie.cn/thread-123.html', rules)).toBe(true)
      expect(urlMatcher.matchAny('https://www.52pojie.cn/home.php', rules)).toBe(true)
      expect(urlMatcher.matchAny('https://www.52pojie.cn/space.php', rules)).toBe(false)
    })
  })

  describe('matchAll 方法', () => {
    it('应该匹配所有规则', () => {
      const rules: UrlMatchRule[] = [
        { mode: 'includes', pattern: '52pojie.cn' },
        { mode: 'includes', pattern: 'forum' },
      ]
      expect(urlMatcher.matchAll('https://www.52pojie.cn/forum.php', rules)).toBe(true)
      expect(urlMatcher.matchAll('https://www.52pojie.cn/thread.php', rules)).toBe(false)
      expect(urlMatcher.matchAll('https://www.example.com/forum.php', rules)).toBe(false)
    })

    it('应该处理空规则数组', () => {
      expect(urlMatcher.matchAll('https://www.52pojie.cn/forum.php', [])).toBe(true)
    })

    it('应该支持混合模式', () => {
      const rules: UrlMatchRule[] = [
        { mode: 'includes', pattern: '52pojie.cn' },
        { mode: 'glob', pattern: 'https://*.52pojie.cn/*' },
        { mode: 'regex', pattern: '.*forum.*' },
      ]
      expect(urlMatcher.matchAll('https://www.52pojie.cn/forum.php', rules)).toBe(true)
      expect(urlMatcher.matchAll('https://www.52pojie.cn/thread.php', rules)).toBe(false)
    })
  })

  describe('isTargetPage 方法', () => {
    it('应该使用 includes 模式匹配普通字符串', () => {
      const targetPages = ['forum.php', 'thread.php']
      expect(urlMatcher.isTargetPage('https://www.52pojie.cn/forum.php', targetPages)).toBe(true)
      expect(urlMatcher.isTargetPage('https://www.52pojie.cn/thread.php', targetPages)).toBe(true)
      expect(urlMatcher.isTargetPage('https://www.52pojie.cn/home.php', targetPages)).toBe(false)
    })

    it('应该自动检测并使用 glob 模式', () => {
      const targetPages = ['https://www.52pojie.cn/forum-*.html']
      expect(urlMatcher.isTargetPage('https://www.52pojie.cn/forum-1.html', targetPages)).toBe(
        true,
      )
      expect(urlMatcher.isTargetPage('https://www.52pojie.cn/forum-123.html', targetPages)).toBe(
        true,
      )
      expect(urlMatcher.isTargetPage('https://www.52pojie.cn/thread-1.html', targetPages)).toBe(
        false,
      )
    })

    it('应该支持混合普通字符串和通配符', () => {
      const targetPages = ['forum.php', 'https://www.52pojie.cn/thread-*.html']
      expect(urlMatcher.isTargetPage('https://www.52pojie.cn/forum.php', targetPages)).toBe(true)
      expect(urlMatcher.isTargetPage('https://www.52pojie.cn/thread-123.html', targetPages)).toBe(
        true,
      )
      expect(urlMatcher.isTargetPage('https://www.52pojie.cn/home.php', targetPages)).toBe(false)
    })

    it('应该处理空数组', () => {
      expect(urlMatcher.isTargetPage('https://www.52pojie.cn/forum.php', [])).toBe(false)
    })

    it('应该匹配实际使用场景', () => {
      // 模拟实际配置
      const targetPages = [
        'https://www.52pojie.cn/forum-*.html',
        'https://www.52pojie.cn/thread-*.html',
        'mod=modcp',
      ]
      expect(urlMatcher.isTargetPage('https://www.52pojie.cn/forum-1.html', targetPages)).toBe(
        true,
      )
      expect(urlMatcher.isTargetPage('https://www.52pojie.cn/thread-123.html', targetPages)).toBe(
        true,
      )
      expect(
        urlMatcher.isTargetPage('https://www.52pojie.cn/forum.php?mod=modcp', targetPages),
      ).toBe(true)
      expect(urlMatcher.isTargetPage('https://www.52pojie.cn/home.php', targetPages)).toBe(false)
    })
  })

  describe('边界情况', () => {
    it('应该处理空 URL', () => {
      const rule: UrlMatchRule = { mode: 'includes', pattern: 'forum' }
      expect(urlMatcher.match('', rule)).toBe(false)
    })

    it('应该处理空模式', () => {
      const rule: UrlMatchRule = { mode: 'includes', pattern: '' }
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php', rule)).toBe(true)
    })

    it('应该处理包含特殊字符的 URL', () => {
      const rule: UrlMatchRule = { mode: 'includes', pattern: 'forum.php?mod=guide&view=my' }
      expect(
        urlMatcher.match('https://www.52pojie.cn/forum.php?mod=guide&view=my', rule),
      ).toBe(true)
    })

    it('应该处理包含中文的 URL', () => {
      const rule: UrlMatchRule = { mode: 'includes', pattern: '论坛' }
      expect(urlMatcher.match('https://www.52pojie.cn/论坛.php', rule)).toBe(true)
    })

    it('应该处理未知的匹配模式', () => {
      const rule = { mode: 'unknown' as any, pattern: 'forum' }
      expect(urlMatcher.match('https://www.52pojie.cn/forum.php', rule)).toBe(false)
    })
  })

  describe('性能测试', () => {
    it('应该快速处理大量规则', () => {
      const rules: UrlMatchRule[] = Array.from({ length: 100 }, (_, i) => ({
        mode: 'includes' as const,
        pattern: `pattern${i}`,
      }))

      const startTime = performance.now()
      urlMatcher.matchAny('https://www.52pojie.cn/pattern50.php', rules)
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(10) // 应该在 10ms 内完成
    })

    it('应该快速处理复杂的正则表达式', () => {
      const rule: UrlMatchRule = {
        mode: 'regex',
        pattern:
          'https://www\\.52pojie\\.cn/(forum|thread|post|home|space|member)-\\d+(-\\d+)?(-\\d+)?\\.html',
      }

      const startTime = performance.now()
      for (let i = 0; i < 1000; i++) {
        urlMatcher.match('https://www.52pojie.cn/forum-123-456-789.html', rule)
      }
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // 1000 次匹配应该在 100ms 内完成
    })
  })
})
