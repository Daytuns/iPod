import { useEffect, useState } from "react";

export function usePlaylists(accessToken, refreshAccessToken) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlaylists = async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      // Fetch user playlists
      const response = await fetch("https://api.spotify.com/v1/me/playlists", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) return;
      }

      const data = await response.json();
      const playlists = data.items;

      // Fetch liked songs total count
      const likedRes = await fetch("https://api.spotify.com/v1/me/tracks?limit=1", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (likedRes.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) return;
      }

      const likedData = await likedRes.json();
      const likedSongsCount = typeof likedData.total === "number" ? likedData.total : 0;
      console.log("Liked Songs Total:", likedData.total);

      const likedAsPlaylist = {
        id: "liked",
        name: "Liked Songs",
        images: [
          {
            url: "https://misc.scdn.co/liked-songs/liked-songs-640.png",
          },
        ],
        tracks: {
          total: likedSongsCount,
        },
        isLikedSongs: true,
      };

      setPlaylists([likedAsPlaylist, ...playlists]);
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
