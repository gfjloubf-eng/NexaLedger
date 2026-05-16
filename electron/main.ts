import { app, BrowserWindow } from "electron";
import path from "path";

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
    console.error("[electron] did-fail-load", {
      errorCode,
      errorDescription,
      validatedURL,
    });
  });

  win.webContents.on(
    "console-message",
    (_event, level, message, line, sourceId) => {
      console.log("[electron][console-message]", {
        level,
        message,
        line,
        sourceId,
      });
    }
  );

  win.webContents.on("render-process-gone", (_event, details) => {
    console.error("[electron] render-process-gone", details);
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

