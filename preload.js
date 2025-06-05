const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload loaded');

try {
  contextBridge.exposeInMainWorld('electronAPI', {
  getNowPlaying: async () => {
    console.log('[preload] getNowPlaying called');
    const result = await ipcRenderer.invoke('get-now-playing');
    console.log('[preload] got result:', result);
    return result;
  },
  sendToMain: (channel, data) => ipcRenderer.send(channel, data),
  onFromMain: (channel, callback) => ipcRenderer.on(channel, callback),
});
  console.log('electronAPI exposed');
} catch (e) {
  console.error('Failed to expose electronAPI', e);
}
