 const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#111827',
    autoHideMenuBar: true,

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.openDevTools();

  win.loadURL('http://localhost:5173');
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});