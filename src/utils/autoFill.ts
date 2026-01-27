// 向后兼容的入口文件
// 导入新的 autofills 模块
export {
  getAutoFillManager,
  autoFillManager
} from './autofills/index'

// 导出类型
export type { AutoFillConfig } from './autofills/base'