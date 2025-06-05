const { app, BrowserWindow } = require('electron');
const path = require('path');
const { ipcMain } = require('electron');
const axios = require('axios');

console.log('Preload path:', path.join(__dirname, 'preload.js'));

ipcMain.handle('get-now-playing', async () => {
  try {
    const res = await axios.get('http://localhost:8888/api/now-playing');
    return res.data;
  } catch (err) {
    console.error('IPC: Error getting now playing', err.message);
    return { error: 'Failed to fetch now playing' };
  }
});


function createWindow() {
  const win = new BrowserWindow({
    width: 194,
    height: 442,
    resizable: false,
    alwaysOnTop: true,
    frame: false,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        enableRemoteModule: false,
        webSecurity: false, // sometimes needed to relax CORS/security in dev
        allowRunningInsecureContent: true, // only in dev
        nativeWindowOpen: true,
        },
  });

  const startUrl = app.isPackaged
    ? `file://${path.join(__dirname, 'dist/index.html')}`
    : 'http://localhost:5173';

  win.loadURL(startUrl);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
