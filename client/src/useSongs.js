import { useEffect, useState } from "react";

export function useSongs(accessToken, refreshAccessToken, playlistId) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [songsError, setSongsError] = useState(null);

  const fetchSongs = async () => {
    if (!accessToken || !playlistId) return;

    setLoading(true);
    try {
      let tokenToUse = accessToken;
      let endpoint =
        playlistId === "liked"
          ? "https://api.spotify.com/v1/me/tracks?limit=50"
          : `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

      let response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${tokenToUse}` }
      });

      if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          tokenToUse = newToken;
          response = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${tokenToUse}` }
          });
        }
      }

      if (!response.ok) throw new Error("Failed to fetch songs");

      const data = await response.json();

      const items =
        playlistId === "liked"
          ? data.items
              .filter(item => item.track !== null)
              .map(item => item.track) // extract .track for liked songs
          : data.items
              .filter(item => item.track !== null)
              .map(item => item.track); // also extract .track for playlist songs

      setSongs(items);
      setSongsError(null);
    } catch (err) {
      console.error("Fetch songs error:", err);
      setSongsError("Failed to load songs");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!accessToken || !playlistId) return;
    fetchSongs();
  }, [accessToken, playlistId]);

  return {
    songs,
    loading,
    songsError,
  };
}
