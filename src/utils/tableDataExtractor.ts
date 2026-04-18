/**
 * 表格数据提取工具类
 * 功能：在特定页面查找指定表格并提取子表格数据
 */

import tableDataExtractorConfig from '@/configs/tableDataExtractor.json'
import { createFeatureManager, type IFeatureManager } from './featureManager'

/**
 * 表格数据提取管理器接口
 */
export interface ITableDataExtractor extends IFeatureManager {
  /** 强制提取表格数据 */
  forceExtract(): Promise<void>
}

/**
 * 提取的表格数据接口
 */
export interface TableData {
  /** 表格 ID */
  id: string
  /** 表格选择器 */
  selector: string
  /** 行数据 */
  rows: TableRow[]
  /** 提取时间 */
  extractedAt: string
}

/**
 * 表格行数据接口
 */
export interface TableRow {
  /** 行索引 */
  index: number
  /** 单元格数据 */
  cells: TableCell[]
}

/**
 * 表格单元格数据接口
 */
export interface TableCell {
  /** 列索引 */
  index: number
  /** 单元格内容 */
  content: string
  /** 单元格 HTML */
  html: string
}

/**
 * 创建表格数据提取管理器实例
 */
export function createTableDataExtractor(): ITableDataExtractor {
  let observer: MutationObserver | null = null
  let hasExtracted = false

  /**
   * 查找目标表格
   */
  const findTargetTable = (): HTMLTableElement | null => {
    return document.querySelector('table#pid54896942 .t_f') as HTMLTableElement | null
  }

  /**
   * 在表格内查找子表格
   */
  const findSubTables = (table: HTMLTableElement): HTMLTableElement[] => {
    return Array.from(table.querySelectorAll('table')) as HTMLTableElement[]
  }

  /**
   * 提取表格数据
   */
  const extractTableData = (table: HTMLTableElement): TableData => {
    const rows: TableRow[] = []

    // 获取所有行
    const tableRows = table.querySelectorAll('tr')

    tableRows.forEach((row, rowIndex) => {
      const cells: TableCell[] = []
      const rowCells = row.querySelectorAll('td, th')

      rowCells.forEach((cell, cellIndex) => {
        cells.push({
          index: cellIndex,
          content: cell.textContent?.trim() || '',
          html: cell.innerHTML.trim(),
        })
      })

      if (cells.length > 0) {
        rows.push({
          index: rowIndex,
          cells,
        })
      }
    })

    return {
      id: table.id || '',
      selector: 'table' + (table.id ? `#${table.id}` : ''),
      rows,
      extractedAt: new Date().toISOString(),
    }
  }

  /**
   * 处理表格数据提取
   */
  const extractData = async (): Promise<void> => {
    // 防止重复提取
    if (hasExtracted) {
      return
    }

    const targetTable = findTargetTable()
    if (!targetTable) {
      // console.log('未找到目标表格: table#pid54896942')
      return
    }

    // console.log('找到目标表格:', targetTable)

    // 查找子表格
    const subTables = findSubTables(targetTable)
    // console.log(`找到 ${subTables.length} 个子表格`)

    // 提取目标表格数据
    const targetTableData = extractTableData(targetTable)
    // console.log('目标表格数据:', targetTableData)

    // 提取所有子表格数据
    const subTablesData = subTables.map((table, index) => ({
      index,
      data: extractTableData(table),
    }))

    // console.log('子表格数据:', subTablesData)

    // 保存到存储
    const allData = {
      targetTable: targetTableData,
      subTables: subTablesData,
      url: window.location.href,
      extractedAt: new Date().toISOString(),
    }

    // 保存到本地存储
    try {
      await browser.storage.local.set({
        tableDataExtractor_lastExtraction: allData,
      })
      // console.log('表格数据已保存到存储')
    } catch (error) {
      console.error('保存表格数据失败:', error)
    }

    hasExtracted = true
  }

  /**
   * 初始化 DOM 监听
   */
  const initObserver = (): void => {
    // 先尝试立即提取
    void extractData()

    // 如果没找到，设置 MutationObserver 监听 DOM 变化
    if (!hasExtracted) {
      observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            void extractData()
            if (hasExtracted) {
              observer?.disconnect()
              break
            }
          }
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })

      // 设置超时，避免无限监听
      setTimeout(() => {
        if (observer) {
          observer.disconnect()
          observer = null
        }
        if (!hasExtracted) {
          // console.log('超时：未找到目标表格')
        }
      }, 10000) // 10秒超时
    }
  }

  /**
   * 清理已注入的内容
   */
  const cleanup = (): void => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    hasExtracted = false
  }

  /**
   * 强制提取表格数据
   */
  const forceExtract = async (): Promise<void> => {
    // 重置提取状态，允许重新提取
    hasExtracted = false

    // 如果已有观察者，先断开
    if (observer) {
      observer.disconnect()
      observer = null
    }

    // 直接提取数据
    await extractData()
  }

  // 使用 featureManager 创建基础功能管理器
  const baseManager = createFeatureManager({
    config: {
      storageKey: tableDataExtractorConfig.storageKey,
      defaultEnabled: tableDataExtractorConfig.defaultEnabled,
      targetPages: tableDataExtractorConfig.targetPages,
    },
    onEnable: () => {
      initObserver()
    },
    onDisable: () => {
      cleanup()
    },
  })

  // 返回扩展的管理器
  return {
    ...baseManager,
    forceExtract,
  }
}
