/**
 * RowClickToCheckToggle 组件测试
 */

import RowClickToCheckToggle from '@com/RowClickToCheckToggle.vue'
import { createFeatureToggleTests } from './featureToggleTestFactory'

createFeatureToggleTests(RowClickToCheckToggle, {
  componentName: 'RowClickToCheckToggle',
  featureName: '勾选范围',
  description: '在管理页面上点击表格行（tr）来勾选对应的复选框，提高操作效率',
  storageKey: 'rowClickToCheckEnabled',
  defaultEnabled: true,
})
