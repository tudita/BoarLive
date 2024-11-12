import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

contextBridge.exposeInMainWorld('electronAPI', {
  // 虎牙
  huya_getRoomDetail: (roomid) => ipcRenderer.send('huya-getroomDetail', roomid),
  huya_receiveRoomDetail: (callback) =>
    ipcRenderer.once('huya-getroomDetail-reply', (event, ...args) => callback(...args)),

  huya_getLiveStatus: (roomid) => ipcRenderer.send('huya-getLiveStatus', roomid),
  huya_receiveLiveStatus: (callback) =>
    ipcRenderer.once('huya-getLiveStatus-reply', (event, ...args) => callback(...args)),

  huya_getPlayUrl: (roomDetail, qn) => ipcRenderer.send('huya-get-play-url', roomDetail, qn),
  huya_receivePlayUrl: (callback) =>
    ipcRenderer.on('huya-get-play-url-reply', (event, ...args) => callback(...args)),

  huya_getPlayQuality: (roomDetail) => ipcRenderer.send('huya-getPlayQuality', roomDetail),
  huya_receivePlayQuality: (callback) =>
    ipcRenderer.once('huya-getPlayQuality-reply', (event, ...args) => callback(...args)),

  huya_getSearch: (keyword, page) => ipcRenderer.send('huya-search', keyword, page),
  huya_receiveSearch: (callback) =>
    ipcRenderer.on('huya-search-reply', (event, ...args) => callback(...args)),

  huya_getRecommendRooms: (page = 1) => ipcRenderer.send('huya-getRecommendRooms', page),
  huya_receiveRecommendRooms: (callback) =>
    ipcRenderer.on('huya-getRecommendRooms-reply', (event, ...args) => callback(...args)),
  // 抖音
  douyin_getRoomDetail: (roomid) => ipcRenderer.send('douyin-getroomDetail', roomid),
  douyin_receiveRoomDetail: (callback) =>
    ipcRenderer.once('douyin-getroomDetail-reply', (event, ...args) => callback(...args)),

  douyin_getLiveStatus: (roomid) => ipcRenderer.send('douyin-getLiveStatus', roomid),
  douyin_receiveLiveStatus: (callback) =>
    ipcRenderer.once('douyin-getLiveStatus-reply', (event, ...args) => callback(...args)),

  douyin_getPlayUrl: (roomDetail, qn) => ipcRenderer.send('douyin-get-play-url', roomDetail, qn),
  douyin_receivePlayUrl: (callback) =>
    ipcRenderer.on('douyin-get-play-url-reply', (event, ...args) => callback(...args)),

  douyin_getPlayQuality: (roomDetail) => ipcRenderer.send('douyin-getPlayQuality', roomDetail),
  douyin_receivePlayQuality: (callback) =>
    ipcRenderer.once('douyin-getPlayQuality-reply', (event, ...args) => callback(...args)),

  douyin_getSearch: (keyword, page) => ipcRenderer.send('douyin-search', keyword, page),
  douyin_receiveSearch: (callback) =>
    ipcRenderer.on('douyin-search-reply', (event, ...args) => callback(...args)),

  douyin_getRecommendRooms: (page = 1) => ipcRenderer.send('douyin-getRecommendRooms', page),
  douyin_receiveRecommendRooms: (callback) =>
    ipcRenderer.on('douyin-getRecommendRooms-reply', (event, ...args) => callback(...args)),
  // Bilibili
  bili_getRoomDetail: (roomid) => ipcRenderer.send('bili-getroomDetail', roomid),
  bili_receiveRoomDetail: (callback) =>
    ipcRenderer.on('bili-getroomDetail-reply', (event, ...args) => callback(...args)),

  bili_getLiveStatus: (roomid) => ipcRenderer.send('bili-getLiveStatus', roomid),
  bili_receiveLiveStatus: (callback) =>
    ipcRenderer.once('bili-getLiveStatus-reply', (event, ...args) => callback(...args)),

  bili_getPlayUrl: (roomDetail, qn) => ipcRenderer.send('bili-get-play-url', roomDetail, qn),
  bili_receivePlayUrl: (callback) =>
    ipcRenderer.on('bili-get-play-url-reply', (event, ...args) => callback(...args)),

  bili_getPlayQuality: (roomDetail) => ipcRenderer.send('bili-getPlayQuality', roomDetail),
  bili_receivePlayQuality: (callback) =>
    ipcRenderer.on('bili-getPlayQuality-reply', (event, ...args) => callback(...args)),

  bili_getSearch: (keyword, page) => ipcRenderer.send('bili-search', keyword, page),
  bili_receiveSearch: (callback) =>
    ipcRenderer.on('bili-search-reply', (event, ...args) => callback(...args)),

  bili_getRecommendRooms: (page = 1) => ipcRenderer.send('bili-getRecommendRooms', page),
  bili_receiveRecommendRooms: (callback) =>
    ipcRenderer.on('bili-getRecommendRooms-reply', (event, ...args) => callback(...args)),

})

//contextBridge.exposeInMainWorld('electronAPI', {
//  huya_getSearch: (keyword, page = 1) => ipcRenderer.send('huya-search', keyword, page),
//  huya_receiveSearch: (callback) =>
//    ipcRenderer.on('huya-search-reply', (event, ...args) => callback(...args))
//})
