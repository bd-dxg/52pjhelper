/**
 * 网盘记录接口
 * @property provider 网盘厂商（如"百度"、"夸克"、"迅雷"等）
 * @property id 网盘ID（可能包含*号隐藏部分）
 * @property postLink 帖子链接（可能为空）
 * @property recorder 记录者（管理员用户名）
 */
export interface CloudStorageRecord {
  provider: string
  id: string
  postLink: string
  recorder: string
}

/**
 * 用户黑名单条目接口
 * @property forumId 论坛ID（唯一标识）
 * @property cloudStorages 网盘记录数组
 * @property note 备注信息（可选）
 */
export interface UserBlacklistItem {
  forumId: string
  cloudStorages: CloudStorageRecord[]
  note?: string
}

/**
 * 黑名单数据类型
 */
export type UserBlacklistData = UserBlacklistItem[]

/**
 * 表格数据提取器数据结构
 */
export interface TableExtractionData {
  targetTable?: {
    rows?: Array<{
      cells: Array<{
        content: string
      }>
    }>
  }
  subTables?: Array<{
    data: {
      rows?: Array<{
        cells: Array<{
          content: string
        }>
      }>
    }
  }>
  url: string
  extractedAt: string
}

/**
 * 用户黑名单管理器接口
 */
export interface IUserBlacklist {
  /** 启用功能 */
  enable(): Promise<void>
  /** 禁用功能 */
  disable(): Promise<void>
  /** 切换功能状态 */
  toggle(): Promise<boolean>
  /** 获取功能状态 */
  getStatus(): boolean
  /** 手动更新黑名单数据 */
  updateData(data: UserBlacklistData): Promise<void>
  /** 获取黑名单数据 */
  getData(): Promise<UserBlacklistData>
  /** 检查是否需要自动更新 */
  shouldAutoUpdate(): Promise<boolean>
  /** 重新加载数据并重新扫描 */
  reloadData(): Promise<void>
}