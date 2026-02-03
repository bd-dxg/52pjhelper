/**
 * SelectAllToggle 组件测试
 */

import SelectAllToggle from '@com/SelectAllToggle.vue'
import { createFeatureToggleTests } from './featureToggleTestFactory'

createFeatureToggleTests(SelectAllToggle, {
  componentName: 'SelectAllToggle',
  featureName: '全选功能',
  description: '在管理页面添加全选按钮',
  storageKey: 'selectAllEnabled',
  defaultEnabled: true,
})
