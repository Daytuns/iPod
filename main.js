const { app, BrowserWindow, ipcMain, net, session } = require('electron');
const path = require('path');
const axios = require('axios');
const querystring = require('querystring');
const dotenv = require('dotenv');

// Load environment variables
const result = dotenv.config({ path: path.join(__dirname, '.env') });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('.env file loaded successfully');
}

// Debug logging
console.log('Environment variables:');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID);
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? '****' : 'undefined');
console.log('REDIRECT_URI:', process.env.REDIRECT_URI);

// Spotify auth configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '2ca58c3b2eaf409ba3035506a62e870e';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '796b545a53434d6a9e49a9b277763b64';
const REDIRECT_URI = process.env.REDIRECT_URI || 'spotify-ipod-electron://callback';

// In-memory token storage
let spotifyTokens = {
  accessToken: null,
  refreshToken: null,
  expiresAt: null
};

// Register the custom protocol
app.setAsDefaultProtocolClient('spotify-ipod-electron');

// This is a global variable to prevent multiple windows
let mainWindow;
let isAuthenticating = false;

function getAuthHeader() {
  const creds = `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`;
  return {
    Authorization: 'Basic ' + Buffer.from(creds).toString('base64'),
    'Content-Type': 'application/x-www-form-urlencoded'
  };
}

async function getAccessToken(code) {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      }),
      { headers: getAuthHeader() }
    );
    
    const { access_token, refresh_token, expires_in } = response.data;
    spotifyTokens = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000
    };
    
    return response.data;
  } catch (error) {
    console.error('Error getting access token:', error.message);
    throw error;
  }
}

async function refreshAccessToken() {
  if (!spotifyTokens.refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: spotifyTokens.refreshToken
      }),
      { headers: getAuthHeader() }
    );
    
    spotifyTokens = {
      ...spotifyTokens,
      accessToken: response.data.access_token,
      expiresAt: Date.now() + response.data.expires_in * 1000
    };
    
    // Some Spotify responses don't include a new refresh token
    if (response.data.refresh_token) {
      spotifyTokens.refreshToken = response.data.refresh_token;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error.message);
    throw error;
  }
}

async function ensureValidToken() {
  // Log the current token status
  console.log('Token status check:', {
    hasAccessToken: !!spotifyTokens.accessToken,
    hasRefreshToken: !!spotifyTokens.refreshToken,
    expiresAt: spotifyTokens.expiresAt,
    now: Date.now(),
    timeRemaining: spotifyTokens.expiresAt ? (spotifyTokens.expiresAt - Date.now()) / 1000 + ' seconds' : 'no expiry'
  });
  
  // If token is expired or will expire in the next 5 minutes
  if (!spotifyTokens.accessToken || !spotifyTokens.expiresAt || Date.now() > spotifyTokens.expiresAt - 300000) {
    if (spotifyTokens.refreshToken) {
      try {
        console.log('Token expired or expiring soon, refreshing...');
        const refreshData = await refreshAccessToken();
        
        // Make sure the main window gets the new tokens
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('auth-success', refreshData);
        }
        
        return true;
      } catch (error) {
        console.error('Failed to refresh token:', error.message);
        return false;
      }
    } else {
      console.log('No refresh token available, authentication required');
      return false;
    }
  }
  
  console.log('Token is valid');
  return true;
}

function createWindow() {
  // If window already exists, just focus it instead of creating a new one
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    width: 194,
    height: 442,
    resizable: false,
    alwaysOnTop: true,
    frame: false,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        enableRemoteModule: false,
        webSecurity: false, // sometimes needed to relax CORS/security in dev
        allowRunningInsecureContent: true, // only in dev
        nativeWindowOpen: true,
        },
  });

  const startUrl = app.isPackaged
    ? `file://${path.join(__dirname, 'dist/index.html')}`
    : 'http://localhost:5173';

  mainWindow.loadURL(startUrl);

  // Handle custom protocol (spotify-ipod-electron://callback)
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith(REDIRECT_URI) || url.includes('callback?code=')) {
      event.preventDefault();
      handleAuthCallback(url);
    }
  });
  
  // This event is needed to catch the redirect on some systems
  mainWindow.webContents.on('did-navigate', (event, url) => {
    if (url.startsWith(REDIRECT_URI) || url.includes('callback?code=')) {
      handleAuthCallback(url);
    }
  });
  
  return mainWindow;
}

function handleAuthCallback(url) {
  // Avoid processing the same auth callback multiple times
  if (isAuthenticating) return;
  isAuthenticating = true;

  if (!url || typeof url !== 'string') {
    isAuthenticating = false;
    return;
  }
  
  // Check if this is our redirect URI
  if (!url.startsWith(REDIRECT_URI) && !url.includes('callback?code=')) {
    isAuthenticating = false;
    return;
  }

  let code = null;
  
  // Extract the code using different methods to be robust
  try {
    // Try with URL parsing
    const urlObj = new URL(url);
    code = urlObj.searchParams.get('code');
  } catch (e) {
    // Fallback to manual parsing
    const codeMatch = url.match(/[?&]code=([^&]+)/);
    if (codeMatch) {
      code = codeMatch[1];
    }
  }
  
  if (code) {
    console.log('Auth code received, getting access token...');
    getAccessToken(code)
      .then(tokenData => {
        console.log('Access token received');
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('auth-success', tokenData);
          
          // After successful authentication, load the main app URL
          const startUrl = app.isPackaged
            ? `file://${path.join(__dirname, 'dist/index.html')}`
            : 'http://localhost:5173';
          
          mainWindow.loadURL(startUrl);
          
          // Store tokens in memory right away
          spotifyTokens = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || spotifyTokens.refreshToken,
            expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000
          };
          console.log('Tokens stored in memory');
        }
      })
      .catch(error => {
        console.error('Auth callback error:', error.message);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('auth-error', { error: error.message });
        }
      })
      .finally(() => {
        setTimeout(() => {
          isAuthenticating = false;
          console.log('Auth process completed, flag reset');
        }, 3000); // Add a small delay before allowing another auth process
      });
  } else {
    let error = 'No authorization code received';
    
    try {
      const urlObj = new URL(url);
      if (urlObj.searchParams.get('error')) {
        error = urlObj.searchParams.get('error');
      }
    } catch (e) {
      // Fallback to regex
      const errorMatch = url.match(/[?&]error=([^&]+)/);
      if (errorMatch) {
        error = errorMatch[1];
      }
    }
    
    console.error('Auth callback error:', error);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('auth-error', { error });
    }
    isAuthenticating = false;
  }
}

// IPC handlers
ipcMain.handle('spotify-login', async () => {
  // If we're already authenticated, don't trigger another auth flow
  if (spotifyTokens.accessToken && spotifyTokens.expiresAt && Date.now() < spotifyTokens.expiresAt - 60000) {
    console.log('Already have valid token, skipping login');
    return null; // Signal that no login is needed
  }

  const scope = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'user-read-email',
    'user-read-private',
    'playlist-read-private',
    'user-library-read'
  ].join(' ');

  console.log('Creating Spotify login URL with:');
  console.log('- Client ID:', SPOTIFY_CLIENT_ID ? SPOTIFY_CLIENT_ID.substring(0, 5) + '...' : 'undefined');
  console.log('- Redirect URI:', REDIRECT_URI);

  const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: REDIRECT_URI,
    show_dialog: true
  })}`;
  
  console.log('Generated auth URL:', authUrl);
  
  return authUrl;
});

ipcMain.handle('set-tokens', async (event, tokens) => {
  const { access_token, refresh_token, expires_in } = tokens;
  
  console.log('Setting tokens in main process');
  
  spotifyTokens = {
    accessToken: access_token,
    refreshToken: refresh_token || spotifyTokens.refreshToken,
    expiresAt: Date.now() + (expires_in || 3600) * 1000
  };
  return true;
});

ipcMain.handle('get-now-playing', async () => {
  const isTokenValid = await ensureValidToken();
  if (!isTokenValid) {
    console.log('No valid token available for now-playing');
    return { error: 'No valid token available' };
  }

  try {
    // First get the player status to get device information
    const playerResponse = await axios.get('https://api.spotify.com/v1/me/player', {
      headers: {
        Authorization: `Bearer ${spotifyTokens.accessToken}`
      }
    });
    
    // Get currently playing track
    const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${spotifyTokens.accessToken}`
      }
    });

    // No content means no active player
    if (response.status === 204 || !response.data) {
      console.log('No active player found');
      // Still return device info if available
      if (playerResponse.status === 200 && playerResponse.data) {
        return { 
          isPlaying: false,
          deviceId: playerResponse.data.device?.id,
          deviceName: playerResponse.data.device?.name || 'No Active Device',
          deviceType: playerResponse.data.device?.type
        };
      }
      return { isPlaying: false };
    }

    const item = response.data.item;
    let deviceInfo = { name: 'Spotify', type: 'Unknown' };
    
    // Extract device info from player response
    if (playerResponse.status === 200 && playerResponse.data && playerResponse.data.device) {
      deviceInfo = playerResponse.data.device;
    }

    return {
      isPlaying: response.data.is_playing,
      title: item.name,
      artist: item.artists.map(artist => artist.name).join(', '),
      album: item.album.name,
      albumImageUrl: item.album.images[0]?.url,
      duration_ms: item.duration_ms,
      progress_ms: response.data.progress_ms,
      deviceId: deviceInfo.id,
      deviceName: deviceInfo.name,
      deviceType: deviceInfo.type
    };
  } catch (error) {
    console.error('Error fetching now playing:', error.message);
    return { error: 'Failed to get now playing track' };
  }
});

ipcMain.handle('toggle-playback', async () => {
  const isTokenValid = await ensureValidToken();
  if (!isTokenValid) return false;

  try {
    const nowPlaying = await axios.get('https://api.spotify.com/v1/me/player', {
      headers: {
        Authorization: `Bearer ${spotifyTokens.accessToken}`
      }
    });

    const isPlaying = nowPlaying.data?.is_playing;
    
    await axios({
      method: 'PUT',
      url: `https://api.spotify.com/v1/me/player/${isPlaying ? 'pause' : 'play'}`,
      headers: {
        Authorization: `Bearer ${spotifyTokens.accessToken}`
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error toggling playback:', error.message);
    return false;
  }
});

ipcMain.handle('play-next', async () => {
  const isTokenValid = await ensureValidToken();
  if (!isTokenValid) return false;

  try {
    await axios.post('https://api.spotify.com/v1/me/player/next', {}, {
      headers: {
        Authorization: `Bearer ${spotifyTokens.accessToken}`
      }
    });
    return true;
  } catch (error) {
    console.error('Error playing next track:', error.message);
    return false;
  }
});

ipcMain.handle('play-previous', async () => {
  const isTokenValid = await ensureValidToken();
  if (!isTokenValid) return false;

  try {
    await axios.post('https://api.spotify.com/v1/me/player/previous', {}, {
      headers: {
        Authorization: `Bearer ${spotifyTokens.accessToken}`
      }
    });
    return true;
  } catch (error) {
    console.error('Error playing previous track:', error.message);
    return false;
  }
});

ipcMain.handle('get-playlists', async () => {
  const isTokenValid = await ensureValidToken();
  if (!isTokenValid) {
    return { error: 'No valid token available' };
  }

  try {
    // Fetch user playlists
    const playlistsResponse = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${spotifyTokens.accessToken}`
      }
    });
    
    // Fetch liked songs count
    const likedSongsResponse = await axios.get('https://api.spotify.com/v1/me/tracks?limit=1', {
      headers: {
        Authorization: `Bearer ${spotifyTokens.accessToken}`
      }
    });

    const likedSongsCount = likedSongsResponse.data.total;
    const likedAsPlaylist = {
      id: 'liked',
      name: 'Liked Songs',
      images: [{ url: 'https://misc.scdn.co/liked-songs/liked-songs-640.png' }],
      tracks: { total: likedSongsCount },
      isLikedSongs: true
    };

    return [likedAsPlaylist, ...playlistsResponse.data.items];
  } catch (error) {
    console.error('Error fetching playlists:', error.message);
    return { error: 'Failed to fetch playlists' };
  }
});

// Add this new IPC handler after the existing handlers
ipcMain.handle('check-auth', async () => {
  console.log('Renderer requested auth check');
  
  // Check if we have valid tokens
  const hasValidToken = await ensureValidToken();
  
  if (hasValidToken) {
    // Return the token info directly to the renderer
    return {
      authenticated: true,
      access_token: spotifyTokens.accessToken,
      refresh_token: spotifyTokens.refreshToken,
      expires_in: spotifyTokens.expiresAt ? Math.floor((spotifyTokens.expiresAt - Date.now()) / 1000) : 3600
    };
  } else {
    return {
      authenticated: false
    };
  }
});

// Add endpoint to play a specific track
ipcMain.handle('play-track', async (event, { uri, contextUri }) => {
  const isTokenValid = await ensureValidToken();
  if (!isTokenValid) return { success: false, error: 'No valid token available' };

  try {
    // First check if we have an active device
    const playerResponse = await axios.get('https://api.spotify.com/v1/me/player', {
      headers: {
        Authorization: `Bearer ${spotifyTokens.accessToken}`
      }
    });
    
    if (playerResponse.status === 204 || !playerResponse.data) {
      console.error('No active Spotify device found');
      return { success: false, error: 'No active Spotify device found' };
    }
    
    // Build the request body
    const requestBody = {};
    
    // Special handling for Liked Songs
    const isLikedSongs = contextUri === 'spotify:collection:tracks';
    
    if (isLikedSongs) {
      // For Liked Songs, we need to use the specific track URI directly
      requestBody.uris = [uri];
    } else if (contextUri) {
      // For regular playlists, use context_uri and offset
      requestBody.context_uri = contextUri;
      
      if (uri) {
        // When using context, we need to specify the track via offset
        // First get the tracks in the context to find the position
        let tracksResponse;
        let offset = 0;
        
        if (contextUri.includes('playlist')) {
          const playlistId = contextUri.split(':').pop();
          tracksResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
              Authorization: `Bearer ${spotifyTokens.accessToken}`
            }
          });
          
          // Find the position of the track in the playlist
          const track = tracksResponse.data.items.find(item => item.track && item.track.uri === uri);
          if (track) {
            offset = tracksResponse.data.items.indexOf(track);
          }
        }
        
        // Set the offset in the request
        requestBody.offset = { position: offset };
      }
    } else if (uri) {
      // When not using context, we can just specify the URI directly
      requestBody.uris = [uri];
    }
    
    console.log('Play request body:', requestBody);
    
    // Play the track on the active device
    await axios({
      method: 'PUT',
      url: `https://api.spotify.com/v1/me/player/play${playerResponse.data?.device?.id ? `?device_id=${playerResponse.data.device.id}` : ''}`,
      headers: {
        Authorization: `Bearer ${spotifyTokens.accessToken}`,
        'Content-Type': 'application/json'
      },
      data: requestBody
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error playing track:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return { success: false, error: error.message };
  }
});

// Add endpoint to seek to a position in the current track
ipcMain.handle('seek-position', async (event, positionMs) => {
  const isTokenValid = await ensureValidToken();
  if (!isTokenValid) return { success: false, error: 'No valid token available' };

  try {
    // Round the position to an integer
    const roundedPos = Math.round(positionMs);
    
    // Send the seek request to Spotify API
    await axios({
      method: 'PUT',
      url: `https://api.spotify.com/v1/me/player/seek?position_ms=${roundedPos}`,
      headers: {
        Authorization: `Bearer ${spotifyTokens.accessToken}`
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error seeking position:', error.message);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  // Check if app was started with protocol URL (Windows)
  if (process.platform === 'win32') {
    const protocolUrl = process.argv.find(arg => arg.startsWith('spotify-ipod-electron://'));
    if (protocolUrl) {
      console.log('App started with protocol URL:', protocolUrl);
      setTimeout(() => {
        handleAuthCallback(protocolUrl);
      }, 1000); // Give the app a second to init
    }
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handle open-url events for protocol handling on macOS
app.on('open-url', (event, url) => {
  event.preventDefault();
  if (mainWindow) {
    handleAuthCallback(url);
  } else {
    // If no window exists, create one then handle the URL
    createWindow();
    handleAuthCallback(url);
  }
});

// Handle protocol on Windows
app.on('second-instance', (event, commandLine, workingDirectory) => {
  // Someone tried to run a second instance, we should focus our window.
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    
    // Check if this is a protocol handler call
    const protocolUrl = commandLine.find(arg => arg.startsWith('spotify-ipod-electron://'));
    if (protocolUrl) {
      console.log('Received protocol URL from second instance:', protocolUrl);
      handleAuthCallback(protocolUrl);
    }
  }
});

// Register protocol handler for Windows
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('spotify-ipod-electron', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('spotify-ipod-electron');
}
