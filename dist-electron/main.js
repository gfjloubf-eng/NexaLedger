"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const isDev = !electron_1.app.isPackaged;
function createWindow() {
    const win = new electron_1.BrowserWindow({
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
    win.webContents.on("console-message", (_event, level, message, line, sourceId) => {
        console.log("[electron][console-message]", {
            level,
            message,
            line,
            sourceId,
        });
    });
    win.webContents.on("render-process-gone", (_event, details) => {
        console.error("[electron] render-process-gone", details);
    });
    if (isDev) {
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(path_1.default.join(__dirname, "../dist/index.html"));
    }
}
electron_1.app.whenReady().then(createWindow);
