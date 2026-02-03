import App from './App.vue'
import { initTheme } from '../../utils/themeManager'

// 初始化主题系统
initTheme()

const app = createApp(App)
app.mount('#app')
