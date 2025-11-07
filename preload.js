const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, data) => ipcRenderer.invoke(channel, data)
  },
  require: (module) => {
    switch (module) {
      case 'fs': return fs;
      case 'path': return path;
      case 'os': return os;
      default: throw new Error(`No autorizado: ${module}`);
    }
  }
});
