import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn } from 'child_process'
import NodeMediaServer from 'node-media-server'

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    mediaroot: './media',
    allow_origin: '*'
  },
  trans: {
    ffmpeg: 'ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]'
      }
    ]
  }
}

const nms = new NodeMediaServer(config)
nms.run()

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
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    // adjust CSP for development
    if (is.dev) {
      mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' *"]
          }
        })
      })
    }
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

// Use dynamic import for electron-store
let store
;(async () => {
  const Store = await import('electron-store')
  store = new Store.default()

  // Handle IPC events
  ipcMain.handle('store-get', (event, key) => {
    return store.get(key)
  })

  ipcMain.handle('store-set', (event, key, value) => {
    store.set(key, value)
  })
})()

ipcMain.handle('start-stream', async (event, cameraIp) => {
  return new Promise((resolve, reject) => {
    const streamKey = `camera_${Date.now()}`
    console.log(`Starting stream for camera: ${cameraIp}`)
    const command = `ffmpeg -i ${cameraIp} -c:v libx264 -preset veryfast -c:a aac -ar 44100 -f flv rtmp://localhost/live/${streamKey}`

    console.log(`Executing command: ${command}`)

    const process = spawn('ffmpeg', [
      '-i',
      cameraIp,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-c:a',
      'aac',
      '-ar',
      '44100',
      '-f',
      'flv',
      `rtmp://localhost/live/${streamKey}`
    ])

    process.stderr.on('data', (data) => {
      const message = data.toString()
      console.log(message)
      console.log("-----------------")
      
      if (message.includes('Press [q] to stop')) {
        console.log(`Stream started for camera: ${cameraIp} *****************************************************************`)
        resolve(`http://localhost:8000/live/${streamKey}.m3u8`)
      }
    })

    process.on('error', (error) => {
      console.error(`exec error: ${error}`)
      reject(error)
    })

    process.on('close', (code) => {
      console.log(`FFmpeg process exited with code ${code}`)
    })
  })
})
