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
        '/douyu': {
          target: 'https://www.douyu.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/douyu/, '')
        },
        '/bilibili1': {
          target: 'https://api.live.bilibili.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/bilibili1/, ''),
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
            Referer: 'https://api.live.bilibili.com'
          }
        },
        '/bilibili2': {
          target: 'https://api.bilibili.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/bilibili2/, ''),
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
            Referer: 'https://api.bilibili.com',
            cookie: 'buvid3=infoc'
          }
        },
        '/douyin1': {
          target: 'https://live.douyin.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/douyin1/, ''),
          headers: {
            Authority: 'https://live.douyin.com',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0',
            Referer: 'https://live.douyin.com',
            'Content-Type': 'text/plain',
            accept: 'application/json, text/plain, */*',
            'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'sec-ch-ua': '"Microsoft Edge";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin'
          }
        }
      }
    }
  }
})
