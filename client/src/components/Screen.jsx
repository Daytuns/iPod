import NowPlayingScreen from "./NowPlayingScreen";
import LibraryScreen from "./LibraryScreen";
import SongsScreen from "./SongsScreen";

const Screen = ({ screen, setScreen, currentlyPlaying, device, seekPosition, playlists, loading, playlists_error, accessToken, refreshAccessToken, selectedPlaylistId, setSelectedPlaylistId, fetchCurrentlyPlaying }) => {
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
      return (
        <LibraryScreen 
          playlists = {playlists}
          loading = {loading}
          playlists_error = {playlists_error}
          setScreen={setScreen}
          setSelectedPlaylistId={setSelectedPlaylistId}
        />
      );

    case "songs":
      return (
        <SongsScreen
          accessToken={accessToken}
          refreshAccessToken={refreshAccessToken}
          playlistId={selectedPlaylistId}
          setScreen={setScreen}
          fetchCurrentlyPlaying={fetchCurrentlyPlaying}
        />

      );

    default:
      return <div className="text-white text-sm p-4">Unknown screen</div>;
  }
}

export default Screen