import { storageHelper } from '@utils/storageHelper'
import type { TableExtractionData, UserCloudDiskListData, UserCloudDiskListItem } from './types'
import { DATA_STORAGE_KEY, DEFAULT_CloudDiskList_DATA, LAST_UPDATE_KEY, AUTO_UPDATE_INTERVAL } from './config'

/**
 * 从表格行数组解析黑名单数据（通用解析逻辑）
 */
const parseRowsToCloudDiskListItems = (rows: Array<{ content: string }[]>): UserCloudDiskListData => {
  const CloudDiskListItems: UserCloudDiskListItem[] = []
  let currentForumId = ''
  let currentNote = ''

  rows.forEach(cells => {
    if (cells.length >= 7) {
      const serialNumber = cells[0]?.content?.trim() || ''
      const forumId = cells[1]?.content?.trim() || ''
      const provider = cells[2]?.content?.trim() || ''
      const cloudId = cells[3]?.content?.trim() || ''
      const postLink = cells[4]?.content?.trim() || ''
      const recorder = cells[5]?.content?.trim() || ''
      const note = cells[6]?.content?.trim() || ''

      // 跳过表头行、模板行和无效行
      const isHeaderOrTemplateRow =
        serialNumber.includes('序号') ||
        serialNumber.includes('编号') ||
        forumId.includes('论坛id') ||
        forumId.includes('论坛ID') ||
        forumId.includes('72主题') ||
        (serialNumber === '0' && forumId === '示例用户') ||
        forumId === '示例用户' ||
        serialNumber.includes('主题') ||
        forumId.includes('主题') ||
        (!serialNumber && !forumId && !provider && !cloudId)

      if (isHeaderOrTemplateRow) {
        return
      }

      // 如果序号不是"-"，说明是新用户
      if (serialNumber !== '-' && forumId && forumId !== '-') {
        currentForumId = forumId
        currentNote = note || ''

        // 查找是否已存在该用户的记录
        let existingItem = CloudDiskListItems.find(item => item.forumId === currentForumId)

        if (!existingItem) {
          existingItem = {
            forumId: currentForumId,
            cloudStorages: [],
            note: currentNote,
          }
          CloudDiskListItems.push(existingItem)
        }
      }

      // 如果有当前用户且网盘厂商有值，添加网盘记录
      if (currentForumId && provider && provider.trim() !== '') {
        const existingItem = CloudDiskListItems.find(item => item.forumId === currentForumId)
        if (existingItem) {
          // 检查是否已存在相同的网盘记录
          const existingStorage = existingItem.cloudStorages.find(
            storage => storage.provider === provider && storage.id === cloudId,
          )

          if (!existingStorage) {
            // 处理帖子链接：如果是"-"则保持为空
            const processedPostLink = postLink === '-' ? '' : postLink || ''

            existingItem.cloudStorages.push({
              provider: provider || '未知',
              id: cloudId || '',
              postLink: processedPostLink,
              recorder: recorder || '',
            })
          }
        }
      }
    }
  })

  return CloudDiskListItems
}

/**
 * 从 DOM 直接解析表格数据（备用方案，解决异步时序问题）
 */
const parseTableFromDOM = (): UserCloudDiskListData | null => {
  // 查找目标表格
  const targetTable = document.querySelector('table#pid54896942 .t_f') as HTMLTableElement | null
  if (!targetTable) {
    return null
  }

  // console.log('[网盘黑名单] 从 DOM 直接解析表格数据')

  const rows: Array<{ content: string }[]> = []
  const tableRows = targetTable.querySelectorAll('tr')

  tableRows.forEach(row => {
    const cells: { content: string }[] = []
    const rowCells = row.querySelectorAll('td, th')
    rowCells.forEach(cell => {
      cells.push({ content: cell.textContent?.trim() || '' })
    })
    if (cells.length > 0) {
      rows.push(cells)
    }
  })

  return parseRowsToCloudDiskListItems(rows)
}

/**
 * 从表格数据提取器加载黑名单数据
 */
export const loadCloudDiskListDataFromTableExtractor = async (): Promise<UserCloudDiskListData> => {
  try {
    // console.log('[网盘黑名单] 尝试从表格数据提取器加载数据')

    // 优先从存储中读取表格数据提取器的结果
    const result = await browser.storage.local.get('tableDataExtractor_lastExtraction')
    const extractionData = result.tableDataExtractor_lastExtraction

    if (extractionData) {
      // console.log('[网盘黑名单] 找到表格数据提取器数据，结构:', Object.keys(extractionData))

      const extractionDataTyped = extractionData as TableExtractionData

      if (extractionDataTyped.targetTable && extractionDataTyped.targetTable.rows) {
        // console.log('[网盘黑名单] 目标表格行数:', extractionDataTyped.targetTable.rows.length)

        // 从提取器数据解析
        const rows = extractionDataTyped.targetTable.rows.map(row => row.cells)
        const parsedData = parseRowsToCloudDiskListItems(rows)

        if (parsedData.length > 0) {
          // console.log(`[网盘黑名单] 从表格提取器解析出 ${parsedData.length} 个用户`)
          return parsedData
        }
      }
    }

    // 如果提取器数据不可用或解析失败，从 DOM 直接解析（备用方案）
    console.log('[网盘黑名单] 表格提取器数据不可用，尝试从 DOM 直接解析')
    const domParsedData = parseTableFromDOM()

    if (domParsedData && domParsedData.length > 0) {
      // console.log(`[网盘黑名单] 从 DOM 解析出 ${domParsedData.length} 个用户`)
      return domParsedData
    }

    // 如果都失败，使用默认数据
    // console.log('[网盘黑名单] 无法解析表格数据，使用默认数据')
    return DEFAULT_CloudDiskList_DATA
  } catch (error) {
    // console.error('[网盘黑名单] 从表格数据提取器加载数据失败:', error)
    return DEFAULT_CloudDiskList_DATA
  }
}

/**
 * 加载黑名单数据
 */
export const loadCloudDiskListData = async (): Promise<UserCloudDiskListData> => {
  // 检查当前页面是否是目标页面（黑名单数据源页面）
  const isTargetPage = window.location.href.includes('thread-2094795-1-1.html')

  // 如果是目标页面，优先从表格数据提取器重新加载最新数据
  if (isTargetPage) {
    // console.log('[网盘黑名单] 当前是目标页面，从表格数据提取器重新加载数据')
    const extractedData = await loadCloudDiskListDataFromTableExtractor()
    if (extractedData.length > 0) {
      await saveCloudDiskListData(extractedData)
      return extractedData
    }
    // 如果表格提取失败，继续从本地存储加载
  }

  // 从本地存储加载数据
  const storedData = await storageHelper.loadArray<UserCloudDiskListItem>(DATA_STORAGE_KEY, [])

  // 如果本地存储有数据，使用存储的数据
  if (storedData.length > 0) {
    // console.log(`[网盘黑名单] 从本地存储加载 ${storedData.length} 条数据`)
    return storedData
  }

  // 如果本地存储没有数据，从表格数据提取器加载作为初始数据
  // console.log('[网盘黑名单] 本地存储无数据，从表格数据提取器加载初始数据')
  const extractedData = await loadCloudDiskListDataFromTableExtractor()

  // 保存到本地存储供后续使用
  if (extractedData.length > 0) {
    await saveCloudDiskListData(extractedData)
  }

  return extractedData
}

/**
 * 保存黑名单数据
 */
export const saveCloudDiskListData = async (data: UserCloudDiskListData): Promise<void> => {
  await storageHelper.saveArray(DATA_STORAGE_KEY, data)

  // 更新最后更新时间
  await storageHelper.saveNumber(LAST_UPDATE_KEY, Date.now())
}

/**
 * 检查是否需要自动更新
 */
export const shouldAutoUpdate = async (): Promise<boolean> => {
  const lastUpdate = await storageHelper.loadNumber(LAST_UPDATE_KEY, 0)
  const now = Date.now()
  // 使用配置文件中的自动更新间隔
  return !lastUpdate || now - lastUpdate >= AUTO_UPDATE_INTERVAL
}
