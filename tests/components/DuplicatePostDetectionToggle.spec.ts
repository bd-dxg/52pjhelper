/**
 * DuplicatePostDetectionToggle 组件测试
 */

import DuplicatePostDetectionToggle from '@com/DuplicatePostDetectionToggle.vue'
import { createFeatureToggleTests } from './featureToggleTestFactory'

createFeatureToggleTests(DuplicatePostDetectionToggle, {
  componentName: 'DuplicatePostDetectionToggle',
  featureName: '重帖检测',
  description: '在论坛列表页面检测当天发布的重复发帖，高亮显示重复发帖的行',
  storageKey: 'duplicatePostDetectionEnabled',
  defaultEnabled: true,
})
