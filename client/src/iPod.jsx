import Screen from "./components/Screen.jsx"
import Wheel from "./components/Wheel.jsx"
import { useEffect, useState } from 'react';

function IPod() {

  const [accessToken, setAccessToken] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    if (!refreshToken) return;

    try {
      const response = await fetch(`http://localhost:8888/refresh_token?refresh_token=${refreshToken}`);
      const data = await response.json();

      if (data.access_token) {
        setAccessToken(data.access_token);
        localStorage.setItem("spotify_access_token", data.access_token);
        console.log("Refreshed access token");
        return data.access_token;
      } else {
        console.error("Failed to refresh access token:", data);
      }
    } catch (err) {
      console.error("Error refreshing access token:", err);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("access_token");
    const refresh = query.get("refresh_token");

    if (token) {
      console.log("Access token being used:", token);
      setAccessToken(token);
      localStorage.setItem("spotify_access_token", token);
      localStorage.setItem("spotify_refresh_token", refresh);
      window.history.replaceState({}, document.title, "/");

      // Refresh 5 minutes before token expires
      setTimeout(() => {
        console.log("Refreshing token...");
        refreshAccessToken();
      }, 55 * 60 * 1000); // 55 minutes

    } else {
      const storedToken = localStorage.getItem('spotify_access_token');
      console.log("Token from localStorage:", storedToken);
      if (storedToken) {
        setAccessToken(storedToken);
      }
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    const getCurrentlyPlaying = async () => {
      try {
        const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (response.status === 204) {
          setCurrentlyPlaying(null); // Nothing playing
          return;
        }

        if (response.status === 401) {
          console.warn("Token expired. Refreshing...");
          const newToken = await refreshAccessToken();
          if (newToken) setAccessToken(newToken);
          return;
        }

        const data = await response.json();
        setCurrentlyPlaying(data);
        setIsPlaying(data?.is_playing);
        console.log("Now playing:", data);

      } catch (error) {
        console.error("Error fetching currently playing", error);
      }
    };

    getCurrentlyPlaying();
    const interval = setInterval(getCurrentlyPlaying, 5000);

    return () => clearInterval(interval);
  }, [accessToken]);

  const handlePlayPause = async () => {
    const endpoint = isPlaying
      ? "https://api.spotify.com/v1/me/player/pause"
      : "https://api.spotify.com/v1/me/player/play";

      console.log("Local isPlaying state:", isPlaying);

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });


      if (response.ok) {
        setIsPlaying(!isPlaying);
      } else {
        const err = await response.json();
        console.error("Failed to toggle playback", err);
      }
    } catch (error) {
      console.error("Error toggling playback", error);
    }
  };

  return (
    <>
      {accessToken ? (
        <p className="text-green-400 text-xs fixed top-10 left-1/2">Logged In</p>
      ) : (
        <p className="text-red-400 text-xs mt-2">Not Logged In</p>
      )}

      <div className='relative'>
        <div className="w-48 h-[440px] flex flex-col items-center rounded-sm bg-gradient-to-b from-gray-800 via-gray-900 to-black">
          {/* Curved body highlights */}
          <div className="absolute top-0 left-4 right-4 h-12 bg-gradient-to-b from-white/40 via-white/20 to-transparent rounded-t-[1.5rem] blur-sm"></div>
          <div className="absolute bottom-0 left-4 right-4 h-8 bg-gradient-to-t from-black/10 to-transparent rounded-b-[1.5rem]"></div>
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-white/30 to-transparent rounded-l-[2rem]"></div>
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-l from-white/30 to-transparent rounded-l-[2rem]"></div>

          <Screen currentlyPlaying={currentlyPlaying}/>
          <Wheel isPlaying={isPlaying} onPlayPause={handlePlayPause} />
        </div>
      </div>
    </>
  )
}

export default IPod;
