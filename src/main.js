import { createApp } from 'vue'
import App from './App.vue'
import { initPerformanceMonitoring } from './utils/performance.js'
import './styles/global.css'

// Initialize performance monitoring for SEO optimization
initPerformanceMonitoring()

createApp(App).mount('#app')