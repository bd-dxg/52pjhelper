/**
 * ContentFilterToggle 组件测试
 */

import ContentFilterToggle from '@com/ContentFilterToggle.vue'
import { createFeatureToggleTests } from './featureToggleTestFactory'

createFeatureToggleTests(ContentFilterToggle, {
  componentName: 'ContentFilterToggle',
  featureName: '灌水筛选',
  description: '在管理页面创建可拖动的过滤卡片，支持正则和简单匹配，高亮符合条件的行',
  storageKey: 'contentFilterEnabled',
  defaultEnabled: true,
})
