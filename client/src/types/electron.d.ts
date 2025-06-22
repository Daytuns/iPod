export {};

declare global {
  interface Window {
    electronAPI: {
      // Authentication
      checkAuth: () => Promise<{ authenticated: boolean }>;
      login: () => Promise<void>;
      onAuthSuccess: (callback: (data: any) => void) => void;
      onAuthError: (callback: (data: any) => void) => void;
      
      // Playback control
      getNowPlaying: () => Promise<any>;
      togglePlayback: () => Promise<boolean>;
      playNext: () => Promise<boolean>;
      playPrevious: () => Promise<boolean>;
      seekPosition: (positionMs: number) => Promise<{ success: boolean, error?: string }>;
      playTrack: (options: { uri?: string, contextUri?: string }) => Promise<{ success: boolean, error?: string }>;
      
      // Playlists
      getPlaylists: () => Promise<any[]>;
    };
  }
}
