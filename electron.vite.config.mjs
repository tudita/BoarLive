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
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36 Edg/117.0.0.0'
          }
          // onProxyReq: (proxyReq) => {
          //   proxyReq.setHeader(
          //     'User-Agent',
          //     'Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36 Edg/117.0.0.0'
          //   )
          // }
        }
      }
    }
  }
})
