import NowPlayingScreen from "./NowPlayingScreen";
import LibraryScreen from "./LibraryScreen";

const Screen = ({ screen, setScreen, currentlyPlaying, device, seekPosition, playlists, loading, playlists_error }) => {
  switch (screen) {
    case "now-playing":
      return (
        <NowPlayingScreen
          currentlyPlaying={currentlyPlaying}
          device={device}
          seekPosition={seekPosition}
        />
      );
    case "library":
      return <LibraryScreen 
              playlists = {playlists}
              loading = {loading}
              playlists_error = {playlists_error}
            />;
    default:
      return <div className="text-white text-sm p-4">Unknown screen</div>;
  }
}

export default Screen