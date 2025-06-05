let accessToken = null;
let refreshToken = null;

function setTokens({ access_token, refresh_token: newRefreshToken }) {
  accessToken = access_token;
  if (newRefreshToken) refreshToken = newRefreshToken;
}

function getAccessToken() {
  return accessToken;
}

function getRefreshToken() {
  return refreshToken;
}

module.exports = {
  setTokens,
  getAccessToken,
  getRefreshToken
};
