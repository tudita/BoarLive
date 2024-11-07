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
        },
        '/api3': {
          target: 'https://m.huya.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api3/, ''),
          headers: {
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
          }
        },
        '/api4': {
          target: 'https://udblgn.huya.com/web/anonymousLogin',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api4/, ''),
          headers: {
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
          }
        }
      }
    }
  }
})
