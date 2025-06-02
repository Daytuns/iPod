import { useEffect, useState } from "react";

export function usePlaylists(accessToken, refreshAccessToken) {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  const fetchPlaylists = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
        const response = await fetch("https://api.spotify.com/v1/me/playlists", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (response.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) return;
        }

        const data = await response.json();
        setPlaylists(data.items);
        setError(null);
    } catch (err) {
        console.error("Fetch playlists:", err);
        setError("Failed to load playlists");
    } finally {
        setLoading(false);
    }
  };


  useEffect(() => {
    if (!accessToken) return;

    fetchPlaylists();
  }, [accessToken]);

  


  return {
    playlists,
    loading,
    error,
  };
}
