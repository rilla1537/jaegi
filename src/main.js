// main.js

// import './assets/main.css' // 필요하다면 주석 해제

import { createApp } from 'vue'
import { createPinia } from 'pinia' // 1. Pinia 생성 함수 임포트
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia() // 2. Pinia 인스턴스 생성

app.use(pinia) // 3. Vue 앱에 Pinia 플러그인 등록
app.mount('#app')