/**
 * NativeFloorDisplayToggle 组件测试
 */

import NativeFloorDisplayToggle from '@com/NativeFloorDisplayToggle.vue'
import { createFeatureToggleTests } from './featureToggleTestFactory'

createFeatureToggleTests(NativeFloorDisplayToggle, {
  componentName: 'NativeFloorDisplayToggle',
  featureName: '原生楼层',
  description: '显示已结帖的原生楼层，方便管理悬赏贴',
  storageKey: 'nativeFloorDisplayEnabled',
  defaultEnabled: true,
})
