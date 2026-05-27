import { app, BrowserWindow } from "electron";
import path from "path";

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let didInit = false;

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: "#0b0f0f",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error("[electron] did-fail-load", {
        errorCode,
        errorDescription,
        validatedURL,
      });
    }
  );

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
    // Crash-safe relaunch (best-effort)
    if (!didInit) return;
    if (!win.isDestroyed()) return;

    setTimeout(() => {
      try {
        // recreate if needed
        if (!mainWindow || mainWindow.isDestroyed()) ensureMainWindow();
      } catch (e) {
        console.error("[electron] relaunch failed", e);
      }
    }, 750);
  });


  // Show only after navigation is ready to avoid white flashes.
  win.once("ready-to-show", () => {
    if (!win.isDestroyed()) win.show();
  });

  // Load URL / File with production-safe guard.
  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    const productionHtmlPath = path.join(__dirname, "../dist/index.html");
    try {
      win.loadFile(productionHtmlPath);
    } catch (e) {
      console.error("[electron] loadFile failed, falling back to file URL:", e);
      win.loadURL("file://" + productionHtmlPath);
    }
  }

  win.on("closed", () => {
    mainWindow = null;
  });

  return win;
}

function ensureMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) return mainWindow;
  mainWindow = createMainWindow();
  return mainWindow;
}

app.whenReady().then(() => {
  if (didInit) return;
  didInit = true;
  ensureMainWindow();

  app.on("activate", () => {
    // Prevent duplicate windows.
    ensureMainWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

process.on("uncaughtException", (error) => {
  console.error("[electron] Uncaught Exception in main process:", error);
});

process.on("unhandledRejection", (reason) => {
  console.error("[electron] Unhandled Rejection in main process:", reason);
});

