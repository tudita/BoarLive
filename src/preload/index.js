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
  huya_getRoomDetail: (roomid) => ipcRenderer.send('huya-getroomDetail', roomid),
  huya_receiveRoomDetail: (callback) =>
    ipcRenderer.on('huya-getroomDetail-reply', (event, ...args) => callback(...args))
})
contextBridge.exposeInMainWorld('electronAPI', {
  huya_getPlayUrl: (roomDetail, qn) => ipcRenderer.send('huya-get-play-url', roomDetail, qn),
  huya_receivePlayUrl: (callback) =>
    ipcRenderer.on('huya-get-play-url-reply', (event, ...args) => callback(...args))
})
contextBridge.exposeInMainWorld('electronAPI', {
  huya_getPlayQuality: (roomDetail) => ipcRenderer.send('huya-getPlayQuality', roomDetail),
  huya_receivePlayQuality: (callback) =>
    ipcRenderer.on('huya-getPlayQuality-reply', (event, ...args) => callback(...args))
})
contextBridge.exposeInMainWorld('electronAPI', {
  huya_getSearch: (keyword, page = 1) => ipcRenderer.send('huya-search', keyword, page),
  huya_receiveSearch: (callback) =>
    ipcRenderer.on('huya-search-reply', (event, ...args) => callback(...args))
})
contextBridge.exposeInMainWorld('electronAPI', {
  huya_getRecommendRooms: (page = 1) => ipcRenderer.send('huya-getRecommendRooms', page),
  huya_receiveRecommendRooms: (callback) =>
    ipcRenderer.on('huya-getRecommendRooms-reply', (event, ...args) => callback(...args))
})
