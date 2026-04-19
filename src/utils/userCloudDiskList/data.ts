import { storageHelper } from '../storageHelper'
import type { TableExtractionData, UserCloudDiskListData, UserCloudDiskListItem } from './types'
import { DATA_STORAGE_KEY, DEFAULT_CloudDiskList_DATA, LAST_UPDATE_KEY, AUTO_UPDATE_INTERVAL } from './config'

/**
 * 从表格数据提取器加载黑名单数据
 */
export const loadCloudDiskListDataFromTableExtractor = async (): Promise<UserCloudDiskListData> => {
  try {
    console.log('[用户黑名单] 尝试从表格数据提取器加载数据')
    const result = await browser.storage.local.get('tableDataExtractor_lastExtraction')
    const extractionData = result.tableDataExtractor_lastExtraction

    if (!extractionData) {
      console.log('[用户黑名单] 未找到表格数据提取器数据，使用默认数据')
      return DEFAULT_CloudDiskList_DATA
    }

    console.log('[用户黑名单] 找到表格数据提取器数据，结构:', Object.keys(extractionData))

    const extractionDataTyped = extractionData as TableExtractionData

    // 打印目标表格数据以便调试
    if (extractionDataTyped.targetTable && extractionDataTyped.targetTable.rows) {
      console.log('[用户黑名单] 目标表格行数:', extractionDataTyped.targetTable.rows.length)

      // 调试信息：表格数据提取（生产环境可注释掉）
      // const sampleRows = extractionDataTyped.targetTable.rows.slice(0, 15)
      // console.log(`[用户黑名单] 表格前 ${sampleRows.length} 行数据（原始）:`)
      // sampleRows.forEach((row, index: number) => {
      //   const cellContents = row.cells.map((cell) => cell.content)
      //   const serialNumber = row.cells[0]?.content?.trim() || ''
      //   const forumId = row.cells[1]?.content?.trim() || ''
      //   console.log(`[用户黑名单] 行 ${index}:`, {
      //     cells: cellContents,
      //     serialNumber,
      //     forumId,
      //     isHeader: serialNumber.includes('序号') || forumId.includes('论坛id'),
      //     isTemplate: forumId === '示例用户' || (serialNumber === '0' && forumId === '示例用户')
      //   })
      // })
    }

    // 根据论坛黑名单表格结构解析数据
    // 表格结构：序号 | 论坛ID | 网盘厂商 | 网盘ID | 帖子链接 | 记录者 | 备注
    // 规则：
    // 1. 每个用户的第一行有"序号"和"论坛ID"
    // 2. 同一用户的其他网盘记录行中，"序号"和"论坛ID"都是"-"
    // 3. 需要跟踪当前用户，将同一用户的所有网盘记录合并

    const CloudDiskListItems: UserCloudDiskListItem[] = []

    if (extractionDataTyped.targetTable && extractionDataTyped.targetTable.rows) {
      let currentForumId = ''
      let currentNote = ''

      extractionDataTyped.targetTable.rows.forEach(row => {
        const cells = row.cells
        if (cells.length >= 7) {
          // 表格有7列
          const serialNumber = cells[0]?.content?.trim() // 第1列：序号
          const forumId = cells[1]?.content?.trim() // 第2列：论坛ID
          const provider = cells[2]?.content?.trim() // 第3列：网盘厂商
          const cloudId = cells[3]?.content?.trim() // 第4列：网盘ID
          const postLink = cells[4]?.content?.trim() // 第5列：帖子链接
          const recorder = cells[5]?.content?.trim() // 第6列：记录者
          const note = cells[6]?.content?.trim() // 第7列：备注

          // 跳过表头行、模板行和无效行
          // 1. 表头行特征：序号列包含"序号"、"编号"等关键词
          // 2. 模板行特征：论坛ID为"示例用户"或序号为"0"的模板数据
          // 3. 无效行：所有关键字段都为空
          const isHeaderOrTemplateRow =
            // 表头行：序号列的表头关键词
            serialNumber.includes('序号') ||
            serialNumber.includes('编号') ||
            // 表头行：论坛ID列的表头关键词
            forumId.includes('论坛id') ||
            forumId.includes('论坛ID') ||
            forumId.includes('72主题') ||
            // 模板行：序号为"0"且论坛ID为"示例用户"
            (serialNumber === '0' && forumId === '示例用户') ||
            // 模板行：论坛ID为"示例用户"（无论序号是什么）
            forumId === '示例用户' ||
            // 其他可能的表头关键词
            serialNumber.includes('主题') ||
            forumId.includes('主题') ||
            // 空行或无效数据
            (!serialNumber && !forumId && !provider && !cloudId)

          if (isHeaderOrTemplateRow) {
            // console.log('[用户黑名单] 跳过行（表头/模板/无效）:', { serialNumber, forumId, provider, cloudId })
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
    }

    // console.log(`[用户黑名单] 从表格解析出 ${CloudDiskListItems.length} 个用户`)
    return CloudDiskListItems.length > 0 ? CloudDiskListItems : DEFAULT_CloudDiskList_DATA
  } catch (error) {
    console.error('[用户黑名单] 从表格数据提取器加载数据失败:', error)
    return DEFAULT_CloudDiskList_DATA
  }
}

/**
 * 加载黑名单数据
 */
export const loadCloudDiskListData = async (): Promise<UserCloudDiskListData> => {
  // 从本地存储加载数据
  const storedData = await storageHelper.loadArray<UserCloudDiskListItem>(DATA_STORAGE_KEY, [])

  // 如果本地存储有数据，使用存储的数据
  if (storedData.length > 0) {
    console.log(`[用户黑名单] 从本地存储加载 ${storedData.length} 条数据`)
    return storedData
  }

  // 如果本地存储没有数据，从表格数据提取器加载作为初始数据
  console.log('[用户黑名单] 本地存储无数据，从表格数据提取器加载初始数据')
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
