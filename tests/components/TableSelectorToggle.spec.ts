/**
 * TableSelectorToggle 组件测试
 */

import TableSelectorToggle from '@com/TableSelectorToggle.vue'
import { createFeatureToggleTests } from './featureToggleTestFactory'

createFeatureToggleTests(TableSelectorToggle, {
  componentName: 'TableSelectorToggle',
  featureName: '分表选择',
  description: '将分表选择器替换为按钮式界面，支持隐藏特定分表',
  storageKey: 'tableSelectorEnabled',
  defaultEnabled: true,
})
