export {};

declare global {
  interface Window {
    electronAPI: {
      getNowPlaying: () => Promise<any>;
      sendToMain: (channel: string, data: any) => void;
      onFromMain: (channel: string, callback: (event: any, ...args: any[]) => void) => void;
    };
  }
}
