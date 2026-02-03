/**
 * UserLinkQueryToggle 组件测试
 */

import UserLinkQueryToggle from '@com/UserLinkQueryToggle.vue'
import { createFeatureToggleTests } from './featureToggleTestFactory'

createFeatureToggleTests(UserLinkQueryToggle, {
  componentName: 'UserLinkQueryToggle',
  featureName: '审核查询',
  description: '在后台审核页面鼠标移动到用户名链接时显示用户违规记录',
  storageKey: 'userLinkQueryEnabled',
  defaultEnabled: true,
})
