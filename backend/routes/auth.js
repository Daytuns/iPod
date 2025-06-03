const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const { getAccessToken, refreshAccessToken } = require("../utils/spotify");

// /login
router.get("/login", (req, res) => {
  const scope = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "streaming",
    "user-read-email",
    "user-read-private",
    "playlist-read-private",
    "user-library-read"
  ].join(" ");

  const queryParams = querystring.stringify({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: process.env.REDIRECT_URI,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

// /callback
router.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing authorization code");

  try {
    const { access_token, refresh_token } = await getAccessToken(code);
    res.redirect(`${process.env.FRONTEND_URI}/?access_token=${access_token}&refresh_token=${refresh_token}`);
  } catch (error) {
    console.error("Callback error:", error.message);
    res.status(500).send("Authentication failed");
  }
});

// /refresh_token
router.get("/refresh_token", async (req, res) => {
  const refresh_token = req.query.refresh_token;
  if (!refresh_token) return res.status(400).send({ error: "Missing refresh_token" });

  try {
    const { access_token, expires_in } = await refreshAccessToken(refresh_token);
    res.send({ access_token, expires_in });
  } catch (error) {
    console.error("Refresh error:", error.message);
    res.status(500).send({ error: "Failed to refresh token" });
  }
});

module.exports = router;
