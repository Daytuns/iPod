const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload loaded');

try {
  contextBridge.exposeInMainWorld('electronAPI', {
    // Authentication methods
    spotifyLogin: async () => {
      return await ipcRenderer.invoke('spotify-login');
    },
    setTokens: async (tokens) => {
      return await ipcRenderer.invoke('set-tokens', tokens);
    },
    onAuthSuccess: (callback) => {
      ipcRenderer.on('auth-success', (event, data) => callback(data));
    },
    onAuthError: (callback) => {
      ipcRenderer.on('auth-error', (event, data) => callback(data));
    },
    checkAuth: async () => {
      return await ipcRenderer.invoke('check-auth');
    },
    
    // Playback methods
    getNowPlaying: async () => {
      return await ipcRenderer.invoke('get-now-playing');
    },
    togglePlayback: async () => {
      return await ipcRenderer.invoke('toggle-playback');
    },
    playNext: async () => {
      return await ipcRenderer.invoke('play-next');
    },
    playPrevious: async () => {
      return await ipcRenderer.invoke('play-previous');
    },
    
    // Playlist methods
    getPlaylists: async () => {
      return await ipcRenderer.invoke('get-playlists');
    },
    
    // Track control
    playTrack: async (options) => {
      return await ipcRenderer.invoke('play-track', options);
    },
    
    // Seek position in track
    seekPosition: async (positionMs) => {
      return await ipcRenderer.invoke('seek-position', positionMs);
    },
  });
  console.log('electronAPI exposed');
} catch (e) {
  console.error('Failed to expose electronAPI', e);
}
