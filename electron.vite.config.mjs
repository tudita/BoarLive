import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue()],
    server: {
      proxy: {
        '/api1': {
          target: 'https://www.huya.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api1/, '')
        },
        '/api2': {
          target: 'https://search.cdn.huya.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api2/, '')
        }
      }
    }
  }
})
