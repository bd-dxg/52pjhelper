/**
 * QuickReplyToggle 组件测试
 */

import QuickReplyToggle from '@com/QuickReplyToggle.vue'
import { createFeatureToggleTests } from './featureToggleTestFactory'

createFeatureToggleTests(QuickReplyToggle, {
  componentName: 'QuickReplyToggle',
  featureName: '快捷回复',
  description: '在举报处理页面添加快捷回复短语下拉框',
  storageKey: 'quickReplyEnabled',
  defaultEnabled: true,
})
