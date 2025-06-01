import Screen from "./components/Screen.jsx"
import Wheel from "./components/Wheel.jsx"
import { useSpotifyAuth } from "./useSpotifyAuth";
import { useNowPlaying } from "./useNowPlaying";

function IPod() {
  const { accessToken, refreshAccessToken } = useSpotifyAuth();
  const { currentlyPlaying, isPlaying, togglePlayback, playNext, playPrevious, device, seekPosition } = useNowPlaying(accessToken, refreshAccessToken);

  return (
    <>
      {accessToken ? (
        <p className="text-green-400 text-xs fixed top-10 left-1/2">Logged In</p>
      ) : (
        <p className="text-red-400 text-xs mt-2">Not Logged In</p>
      )}
      <div className="relative">
        <div className="w-48 h-[440px] flex flex-col items-center rounded-sm bg-gradient-to-b from-gray-800 via-gray-900 to-black">
          <div className="absolute top-0 left-4 right-4 h-12 bg-gradient-to-b from-white/40 via-white/20 to-transparent rounded-t-[1.5rem] blur-sm"></div>
          <div className="absolute bottom-0 left-4 right-4 h-8 bg-gradient-to-t from-black/10 to-transparent rounded-b-[1.5rem]"></div>
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-white/30 to-transparent rounded-l-[2rem]"></div>
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-white/30 to-transparent rounded-l-[2rem]"></div>

          <Screen currentlyPlaying={currentlyPlaying} device={device} seekPosition={seekPosition}/>
          <Wheel isPlaying={isPlaying} onPlayPause={togglePlayback} onNext={playNext} onPrevious={playPrevious} />
        </div>
      </div>
    </>
  );
}

export default IPod;
