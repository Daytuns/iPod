import { useEffect, useState } from "react";

export function useSpotifyAuth() {
  const [accessToken, setAccessToken] = useState(null);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("spotify_refresh_token");
    if (!refreshToken) return;

    try {
      const response = await fetch(`http://localhost:8888/refresh_token?refresh_token=${refreshToken}`);
      const data = await response.json();
      if (data.access_token) {
        setAccessToken(data.access_token);
        localStorage.setItem("spotify_access_token", data.access_token);
        return data.access_token;
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const token = query.get("access_token");
    const refresh = query.get("refresh_token");

    if (token) {
      setAccessToken(token);
      localStorage.setItem("spotify_access_token", token);
      localStorage.setItem("spotify_refresh_token", refresh);
      window.history.replaceState({}, document.title, "/");
      setTimeout(refreshAccessToken, 55 * 60 * 1000);
    } else {
      const storedToken = localStorage.getItem("spotify_access_token");
      if (storedToken) setAccessToken(storedToken);
    }
  }, []);

  return { accessToken, refreshAccessToken };
}
