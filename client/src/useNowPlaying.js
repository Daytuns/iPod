import { useEffect, useState } from "react";

export function useNowPlaying(accessToken, refreshAccessToken) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [device, setDevice] = useState(null); 

  const fetchCurrentlyPlaying = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (response.status === 204) {
        setCurrentlyPlaying(null);
        setIsPlaying(false); 
        return;
        }
      if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) return;
      }

      const data = await response.json();
      setCurrentlyPlaying(data);
      setIsPlaying(data?.is_playing);
    } catch (err) {
      console.error("Now playing error:", err);
    }
  };

  const fetchDeviceInfo = async () => {
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        setDevice(data.device); 
      }
    } catch (err) {
      console.error("Device info fetch error:", err);
    }
  };

  useEffect(() => {
    if (!accessToken) return;

    fetchCurrentlyPlaying();
    fetchDeviceInfo();

    const interval = setInterval(() => {
      fetchCurrentlyPlaying();
      fetchDeviceInfo();
    }, 5000); 

    return () => clearInterval(interval);
  }, [accessToken]);

  const togglePlayback = async () => {
    const endpoint = isPlaying
      ? "https://api.spotify.com/v1/me/player/pause"
      : "https://api.spotify.com/v1/me/player/play";

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (res.ok) {
        setIsPlaying(!isPlaying);
        fetchCurrentlyPlaying();
        fetchDeviceInfo();
    }
    } catch (err) {
      console.error("Playback toggle error:", err);
    }
  };

  const playNext = async () => {
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/next", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (res.ok) {
        setTimeout(() => {
          fetchCurrentlyPlaying();
          fetchDeviceInfo();
        }, 1000);
      }
    } catch (err) {
      console.error("Play next error:", err);
    }
  };

  const playPrevious = async () => {
    try {
      const res = await fetch("https://api.spotify.com/v1/me/player/previous", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (res.ok) {
        setTimeout(() => {
          fetchCurrentlyPlaying();
          fetchDeviceInfo();
        }, 1000);
      }
    } catch (err) {
      console.error("Play previous error:", err);
    }
  };

  const seekPosition = async (pos) => {
  const roundedPos = Math.round(pos); 
  console.log(roundedPos);

  try {
    const res = await fetch(`https://api.spotify.com/v1/me/player/seek?position_ms=${roundedPos}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Seek failed:", errorData);
    }
  } catch (err) {
    console.error("Seek position error: ", err);
  }
};


  return {
    currentlyPlaying,
    isPlaying,
    togglePlayback,
    playNext,
    playPrevious,
    device,
    seekPosition,
    fetchCurrentlyPlaying
  };
}
