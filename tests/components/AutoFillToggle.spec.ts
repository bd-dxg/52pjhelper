/**
 * AutoFillToggle 组件测试
 */

import AutoFillToggle from '@com/AutoFillToggle.vue'
import { createFeatureToggleTests } from './featureToggleTestFactory'

createFeatureToggleTests(AutoFillToggle, {
  componentName: 'AutoFillToggle',
  featureName: '自动填充',
  description: '监控评分表单，当满足条件时自动填充回复内容',
  storageKey: 'autoFillEnabled',
  defaultEnabled: true,
})
