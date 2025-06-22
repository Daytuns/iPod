import Screen from "./components/Screen.jsx";
import Wheel from "./components/Wheel.jsx"
import { useElectronSpotify } from "./useElectronSpotify";
import { useState, useEffect } from "react";

function IPod() {
  const { 
    // Auth
    accessToken, 
    refreshAccessToken,
    login,
    
    // Now playing
    currentlyPlaying, 
    isPlaying, 
    togglePlayback, 
    playNext, 
    playPrevious, 
    device, 
    seekPosition, 
    fetchCurrentlyPlaying,
    playTrack,
    
    // Playlists
    playlists,
    loading,
    playlists_error
  } = useElectronSpotify();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [screen, setScreen] = useState("now-playing");
  const [isTokenValid, setIsTokenValid] = useState(false);

  // Check auth on mount and when accessToken changes
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First try local storage
        const localToken = localStorage.getItem('spotify_access_token');
        
        // Then try direct check with main process
        const authStatus = await window.electronAPI.checkAuth();
        console.log('Auth check from iPod component:', authStatus);
        
        const isValid = !!(authStatus.authenticated || localToken || accessToken);
        console.log('Setting isTokenValid:', isValid);
        setIsTokenValid(isValid);
        
        // If the main process has a token but we don't, force a page reload
        if (authStatus.authenticated && !accessToken && !localToken) {
          console.log('Main process has token but renderer doesn\'t - forcing reload');
          window.location.reload();
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
        // Fallback to checking locally
        setIsTokenValid(!!(accessToken || localStorage.getItem('spotify_access_token')));
      }
    };
    
    checkAuthStatus();
  }, [accessToken]);

  console.log('Render with token status:', isTokenValid);

  return (
    <>
      <div className="relative">
        <div style={{ WebkitAppRegion: 'drag' }} className="w-48 h-[440px] flex flex-col items-center rounded-sm bg-gradient-to-b from-gray-800 via-gray-900 to-black">
          <div className="absolute top-0 left-4 right-4 h-12 bg-gradient-to-b from-white/40 via-white/20 to-transparent rounded-t-[1.5rem] blur-sm"></div>
          <div className="absolute bottom-0 left-4 right-4 h-8 bg-gradient-to-t from-black/10 to-transparent rounded-b-[1.5rem]"></div>
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-white/30 to-transparent rounded-l-[2rem]"></div>
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-white/30 to-transparent rounded-l-[2rem]"></div>

          {isTokenValid ? (
            <Screen
              screen={screen}
              setScreen={setScreen}
              currentlyPlaying={currentlyPlaying}
              device={device}
              seekPosition={seekPosition}
              playlists={playlists}
              loading={loading}
              playlists_error={playlists_error}
              accessToken={accessToken || localStorage.getItem('spotify_access_token')}
              refreshAccessToken={refreshAccessToken}
              selectedPlaylistId={selectedPlaylistId}
              setSelectedPlaylistId={setSelectedPlaylistId}
              fetchCurrentlyPlaying={fetchCurrentlyPlaying}
              playTrack={playTrack}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white p-3 text-center">
              <h2 className="text-sm font-bold mb-2">Spotify iPod</h2>
              <p className="text-xs mb-4">Please login to continue</p>
              <button 
                onClick={login}
                style={{ WebkitAppRegion: 'no-drag' }}
                className="bg-green-500 text-white text-xs px-3 py-1 rounded-full"
              >
                Login with Spotify
              </button>
            </div>
          )}
          
          <Wheel 
            isPlaying={isPlaying} 
            onPlayPause={togglePlayback} 
            onNext={playNext} 
            onPrevious={playPrevious} 
            screen={screen} 
            setScreen={setScreen}
            disabled={!isTokenValid}
          />
        </div>
      </div>
    </>
  );
}

export default IPod;
