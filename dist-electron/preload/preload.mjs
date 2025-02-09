"use strict";
const electron = require("electron");
require("fs/promises");
require("path");
const FILE_CHANNELS = {
  SELECT_FILE: "file:select",
  READ_FILE: "file:read",
  WRITE_FILE: "file:write",
  GET_FILES: "file:get-all",
  DELETE_FILE: "file:delete",
  GET_FILE_INFO: "file:info"
};
electron.contextBridge.exposeInMainWorld("fileAPI", {
  selectFile: (options) => electron.ipcRenderer.invoke(FILE_CHANNELS.SELECT_FILE, options),
  readFile: (path) => electron.ipcRenderer.invoke(FILE_CHANNELS.READ_FILE, path),
  writeFile: (options) => electron.ipcRenderer.invoke(FILE_CHANNELS.WRITE_FILE, options),
  getFiles: (dirPath) => electron.ipcRenderer.invoke(FILE_CHANNELS.GET_FILES, dirPath),
  deleteFile: (path) => electron.ipcRenderer.invoke(FILE_CHANNELS.DELETE_FILE, path),
  getFileInfo: (path) => electron.ipcRenderer.invoke(FILE_CHANNELS.GET_FILE_INFO, path)
});
//# sourceMappingURL=preload.mjs.map
