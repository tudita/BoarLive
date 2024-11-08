import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import Huya from './huya'

const huya = new Huya()
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  //虎牙获取直播流
  ipcMain.on('huya-get-play-url', (event, roomdetail, qn) => {
    huya.getPlayUrls(roomdetail, qn).then((playurl) => {
      event.reply('huya-get-play-url-reply', playurl)
    })
  })
  //虎牙获取roomdetail
  ipcMain.on('huya-getroomDetail', (event, roomid) => {
    huya.getRoomDetail(roomid).then((roomdetail) => {
      event.reply('huya-getroomDetail-reply', roomdetail)
    })
  })
  //虎牙获取qn
  ipcMain.on('huya-getPlayQuality', (event, roomDetail) => {
    huya.getPlayQuality(roomDetail).then((qn) => {
      event.reply('huya-getPlayQuality-reply', qn)
    })
  })
  //虎牙搜索
  ipcMain.on('huya-search', (event, keyword, page) => {
    huya.search(keyword, page).then((res) => {
      event.reply('huya-search-reply', res)
    })
  })
  //虎牙推荐房间
  ipcMain.on('huya-getRecommendRooms', (event, page = 1) => {
    huya.search(page).then((res) => {
      event.reply('huya-getRecommendRooms-reply', res)
    })
  })
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
