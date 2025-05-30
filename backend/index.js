
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8888;
const querystring = require("querystring");
const axios = require("axios");


// Enable JSON and CORS
app.use(cors());
app.use(express.json());

//login route
app.get("/login", (req, res) => {
  const scope = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "streaming",
    "user-read-email",
    "user-read-private"
  ].join(" ");

  const queryParams = querystring.stringify({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: scope,
    redirect_uri: process.env.REDIRECT_URI,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
        },
      }
    );

    const { access_token, refresh_token } = response.data;

    // For now, just log them and send a basic message
    console.log("Access Token:", access_token);
    console.log("Refresh Token:", refresh_token);

    res.redirect(`${process.env.FRONTEND_URI}/?access_token=${access_token}&refresh_token=${refresh_token}`);

  } catch (error) {
    console.error("Error getting tokens:", error.response?.data || error.message);
    res.send("Error during authentication.");
  }
});

app.get("/refresh_token", async (req, res) => {
  const refresh_token = req.query.refresh_token;
  if (!refresh_token) {
    return res.status(400).send({ error: "Missing refresh_token" });
  }

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
        },
      }
    );

    const { access_token, expires_in } = response.data;

    res.send({ access_token, expires_in });
  } catch (error) {
    console.error("Error refreshing token:", error.response?.data || error.message);
    res.status(500).send({ error: "Failed to refresh token" });
  }
});




app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
})