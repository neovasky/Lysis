"use strict";
const electron = require("electron");
require("fs/promises");
require("path");
require("crypto");
const FILE_CHANNELS = {
  SELECT_FILE: "file:select",
  READ_FILE: "file:read",
  WRITE_FILE: "file:write",
  GET_FILES: "file:get-all",
  DELETE_FILE: "file:delete",
  GET_FILE_INFO: "file:info",
  RENAME_FILE: "file:rename",
  CREATE_DIRECTORY: "file:create-dir",
  MOVE_FILE: "file:move",
  COPY_FILE: "file:copy"
};
electron.contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    on: (channel, func) => {
      const subscription = (_event, ...args) => func(args);
      electron.ipcRenderer.on(channel, subscription);
      return () => electron.ipcRenderer.removeListener(channel, subscription);
    },
    once: (channel, func) => {
      electron.ipcRenderer.once(
        channel,
        (_event, ...args) => func(args)
      );
    },
    send: (channel, message) => {
      electron.ipcRenderer.send(channel, message);
    }
  }
});
electron.contextBridge.exposeInMainWorld("fileAPI", {
  selectFile: (options) => electron.ipcRenderer.invoke(FILE_CHANNELS.SELECT_FILE, options),
  readFile: (path) => electron.ipcRenderer.invoke(FILE_CHANNELS.READ_FILE, path),
  writeFile: (options) => electron.ipcRenderer.invoke(FILE_CHANNELS.WRITE_FILE, options),
  getFiles: (dirPath) => electron.ipcRenderer.invoke(FILE_CHANNELS.GET_FILES, dirPath),
  deleteFile: (path) => electron.ipcRenderer.invoke(FILE_CHANNELS.DELETE_FILE, path),
  getFileInfo: (path) => electron.ipcRenderer.invoke(FILE_CHANNELS.GET_FILE_INFO, path),
  renameFile: (oldPath, newPath) => electron.ipcRenderer.invoke(FILE_CHANNELS.RENAME_FILE, { oldPath, newPath }),
  createDirectory: (path) => electron.ipcRenderer.invoke(FILE_CHANNELS.CREATE_DIRECTORY, path),
  moveFile: (options) => electron.ipcRenderer.invoke(FILE_CHANNELS.MOVE_FILE, options),
  copyFile: (options) => electron.ipcRenderer.invoke(FILE_CHANNELS.COPY_FILE, options)
});
//# sourceMappingURL=preload.mjs.map
