import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  //当后端无法修改时可在这里配置代理，前端访问/api开头的接口时会代理到后端
  // axios配置里的baseUrl要为空，默认请求地址才跟前端一样
  // server:{
  //   proxy: {
  //     '/api': 'http://localhost:8123'
  //   }
  // },
})
