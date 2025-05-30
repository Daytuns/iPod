const axios = require("axios");
const querystring = require("querystring");

const getAuthHeader = () => {
  const creds = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  return {
    Authorization: "Basic " + Buffer.from(creds).toString("base64"),
    "Content-Type": "application/x-www-form-urlencoded",
  };
};

const getAccessToken = async (code) => {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    querystring.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.REDIRECT_URI,
    }),
    { headers: getAuthHeader() }
  );
  return response.data;
};

const refreshAccessToken = async (refresh_token) => {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    querystring.stringify({
      grant_type: "refresh_token",
      refresh_token,
    }),
    { headers: getAuthHeader() }
  );
  return response.data;
};

module.exports = {
  getAccessToken,
  refreshAccessToken,
};
