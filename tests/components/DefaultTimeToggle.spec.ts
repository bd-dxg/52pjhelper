/**
 * DefaultTimeToggle 组件测试
 */

import DefaultTimeToggle from '@com/DefaultTimeToggle.vue'
import { createFeatureToggleTests } from './featureToggleTestFactory'

createFeatureToggleTests(DefaultTimeToggle, {
  componentName: 'DefaultTimeToggle',
  featureName: '默认时间',
  description: '将查询开始时间默认设置为2008-03-13',
  storageKey: 'defaultTimeEnabled',
  defaultEnabled: true,
})
