/**
 * FloorHighlighterToggle 组件测试
 */

import FloorHighlighterToggle from '@com/FloorHighlighterToggle.vue'
import { createFeatureToggleTests } from './featureToggleTestFactory'

createFeatureToggleTests(FloorHighlighterToggle, {
  componentName: 'FloorHighlighterToggle',
  featureName: '楼层高亮',
  description: '根据URL参数高亮指定楼层',
  storageKey: 'floorHighlighterEnabled',
  defaultEnabled: true,
})
