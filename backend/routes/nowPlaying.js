const express = require('express');
const router = express.Router();
const axios = require('axios');
const { getRefreshToken, getAccessToken: getCachedAccessToken, setTokens } = require('../utils/tokenCache');
const { refreshAccessToken } = require('../utils/spotify');

router.get('/now-playing', async (req, res) => {
  try {
    let accessToken = getCachedAccessToken();

    // Refresh if no access token available
    if (!accessToken) {
      const refreshed = await refreshAccessToken(getRefreshToken());
      accessToken = refreshed.access_token;
      setTokens(refreshed); // update cache
    }

    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204 || response.data === '') {
      return res.status(200).json({ isPlaying: false });
    }

    const item = response.data.item;
    const nowPlaying = {
      isPlaying: response.data.is_playing,
      title: item.name,
      artist: item.artists.map((artist) => artist.name).join(', '),
      album: item.album.name,
      albumImageUrl: item.album.images[0]?.url,
    };

    res.json(nowPlaying);
  } catch (err) {
    console.error('Error fetching now playing:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to get now playing track' });
  }
});

module.exports = router;
