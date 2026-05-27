import { contextBridge, ipcRenderer } from "electron";

const appVersion = () => {
  try {
    // app is available in main, but not always in preload scope; best-effort via versions.
    const versions: unknown = (process as unknown as { versions?: { electron?: string } }).versions;
    const electron = (versions as { electron?: string } | undefined)?.electron;
    return electron ?? "";
  } catch {
    return "";
  }
};

contextBridge.exposeInMainWorld("nexaLedger", {
  appVersion: appVersion(),
  platform: process.platform,

  // Intentionally conservative IPC wrappers.
  invoke: <T = unknown>(channel: string, ...args: unknown[]): Promise<T> => {
    // No business IPC channels are allowed by default.
    const allowed = new Set<string>(["nexaledger:noop"]);
    if (!allowed.has(channel)) {
      return Promise.reject(new Error(`Blocked IPC invoke channel: ${channel}`));
    }
    return ipcRenderer.invoke(channel, ...args) as Promise<T>;
  },

  send: (channel: string, ...args: unknown[]) => {
    const allowed = new Set<string>(["nexaledger:noop"]);
    if (!allowed.has(channel)) {
      throw new Error(`Blocked IPC send channel: ${channel}`);
    }
    ipcRenderer.send(channel, ...args);
  },
});

