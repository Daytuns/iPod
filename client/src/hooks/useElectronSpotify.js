import { useState, useEffect, useCallback } from 'react';

export function useElectronSpotify() {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('spotify_access_token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('spotify_refresh_token'));
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [device, setDevice] = useState({ name: 'Spotify' });
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playlistsError, setPlaylistsError] = useState(null);
  const [authInProgress, setAuthInProgress] = useState(false);

  // Direct check with main process on startup
  useEffect(() => {
    const verifyAuthWithMainProcess = async () => {
      try {
        console.log('Checking auth status with main process');
        const authStatus = await window.electronAPI.checkAuth();
        console.log('Auth status from main process:', authStatus);
        
        if (authStatus.authenticated && authStatus.access_token) {
          console.log('Main process has valid token, updating renderer');
          
          // Update localStorage
          localStorage.setItem('spotify_access_token', authStatus.access_token);
          if (authStatus.refresh_token) {
            localStorage.setItem('spotify_refresh_token', authStatus.refresh_token);
          }
          
          // Update state
          setAccessToken(authStatus.access_token);
          if (authStatus.refresh_token) {
            setRefreshToken(authStatus.refresh_token);
          }
        } else {
          console.log('Not authenticated according to main process');
        }
      } catch (err) {
        console.error('Error checking auth with main process:', err);
      }
    };
    
    verifyAuthWithMainProcess();
  }, []);

  // Check for stored tokens on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken && storedToken !== accessToken) {
      console.log('Found stored token, updating state');
      setAccessToken(storedToken);
    }
  }, []);

  // Authentication
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return null;

    try {
      const data = await window.electronAPI.getNowPlaying();
      if (data && !data.error) {
        setAccessToken(localStorage.getItem('spotify_access_token'));
        return localStorage.getItem('spotify_access_token');
      }
      return null;
    } catch (err) {
      console.error('Error refreshing token:', err);
      return null;
    }
  }, [refreshToken]);

  const handleLogin = async () => {
    if (authInProgress) return;
    
    try {
      setAuthInProgress(true);
      const authUrl = await window.electronAPI.spotifyLogin();
      console.log('Opening auth URL:', authUrl);
      
      // If null is returned, we're already authenticated
      if (!authUrl) {
        console.log('Already authenticated, no need to login again');
        
        // Force a check with the main process
        const authStatus = await window.electronAPI.checkAuth();
        if (authStatus.authenticated && authStatus.access_token) {
          console.log('Main process confirms authentication, updating local state');
          localStorage.setItem('spotify_access_token', authStatus.access_token);
          setAccessToken(authStatus.access_token);
        }
        
        setAuthInProgress(false);
        return;
      }
      
      // Instead of opening in a new window, redirect the current window
      window.location.href = authUrl;
    } catch (err) {
      console.error('Login error:', err);
      setAuthInProgress(false);
    }
  };

  // Authentication listeners
  useEffect(() => {
    const handleAuthSuccess = (data) => {
      console.log('Auth success received in hook', data);
      const { access_token, refresh_token } = data;
      
      // Store tokens in localStorage
      localStorage.setItem('spotify_access_token', access_token);
      if (refresh_token) {
        localStorage.setItem('spotify_refresh_token', refresh_token);
      }
      
      // Update state
      setAccessToken(access_token);
      if (refresh_token) {
        setRefreshToken(refresh_token);
      }
      
      // Store tokens in the main process
      window.electronAPI.setTokens(data);
      
      // Clear authentication flag
      setAuthInProgress(false);
      
      // Force re-render to update UI
      setTimeout(() => {
        window.location.reload();
      }, 300);
    };

    const handleAuthError = (data) => {
      console.error('Authentication error:', data.error);
      setAuthInProgress(false);
    };

    window.electronAPI.onAuthSuccess(handleAuthSuccess);
    window.electronAPI.onAuthError(handleAuthError);

    return () => {
      // Unfortunately, there's no removeListener in this setup,
      // but in a production app you'd want to clean these up
    };
  }, []);

  // Now Playing functions
  const fetchCurrentlyPlaying = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const data = await window.electronAPI.getNowPlaying();
      if (data?.error) {
        console.error('Error fetching now playing:', data.error);
        
        // If unauthorized, clear token
        if (data.error === 'No valid token available' || data.error.includes('unauthorized')) {
          console.log('Token invalid, clearing state');
          setAccessToken(null);
          localStorage.removeItem('spotify_access_token');
        }
        return;
      }

      // Update device information
      if (data.deviceName) {
        setDevice({
          id: data.deviceId,
          name: data.deviceName,
          type: data.deviceType || 'unknown'
        });
      }

      if (!data.isPlaying && !data.title) {
        setCurrentlyPlaying(null);
        setIsPlaying(false);
        return;
      }

      // Transform the data to match the format expected by the UI
      const transformed = {
        item: {
          name: data.title,
          uri: data.uri,
          artists: data.artist
            ? data.artist.split(',').map(name => ({ name: name.trim() }))
            : [],
          album: {
            name: data.album,
            images: [{ url: data.albumImageUrl }]
          },
          duration_ms: data.duration_ms || 180000,
        },
        is_playing: data.isPlaying,
        progress_ms: data.progress_ms || 0,
      };

      setCurrentlyPlaying(transformed);
      setIsPlaying(transformed.is_playing);
    } catch (err) {
      console.error('Error fetching now playing:', err);
    }
  }, [accessToken]);

  const playTrack = async (uri, contextUri) => {
    if (!accessToken) return false;
    
    try {
      const result = await window.electronAPI.playTrack({ uri, contextUri });
      
      if (result.success) {
        // Wait a moment for Spotify to update, then fetch the new currently playing track
        setTimeout(fetchCurrentlyPlaying, 1000);
        return true;
      } else {
        console.error('Failed to play track:', result.error);
        return false;
      }
    } catch (err) {
      console.error('Error playing track:', err);
      return false;
    }
  };

  const togglePlayback = async () => {
    try {
      const success = await window.electronAPI.togglePlayback();
      if (success) {
        setIsPlaying(prev => !prev);
        setTimeout(fetchCurrentlyPlaying, 500);
      }
    } catch (err) {
      console.error('Toggle playback error:', err);
    }
  };

  const playNext = async () => {
    try {
      const success = await window.electronAPI.playNext();
      if (success) {
        setTimeout(fetchCurrentlyPlaying, 500);
      }
    } catch (err) {
      console.error('Play next error:', err);
    }
  };

  const playPrevious = async () => {
    try {
      const success = await window.electronAPI.playPrevious();
      if (success) {
        setTimeout(fetchCurrentlyPlaying, 500);
      }
    } catch (err) {
      console.error('Play previous error:', err);
    }
  };

  // Seek implementation
  const seekPosition = async (positionMs) => {
    if (!accessToken) return false;
    
    try {
      const roundedPos = Math.round(positionMs);
      const result = await window.electronAPI.seekPosition(roundedPos);
      
      if (result.success) {
        // Update local state to reflect the change immediately
        if (currentlyPlaying) {
          setCurrentlyPlaying(prev => ({
            ...prev,
            progress_ms: roundedPos
          }));
        }
        return true;
      } else {
        console.error('Failed to seek position:', result.error);
        return false;
      }
    } catch (err) {
      console.error('Error seeking position:', err);
      return false;
    }
  };

  // Playlist functions
  const fetchPlaylists = useCallback(async () => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const playlists = await window.electronAPI.getPlaylists();
      
      if (playlists.error) {
        setPlaylistsError(playlists.error);
      } else {
        setPlaylists(playlists);
        setPlaylistsError(null);
      }
    } catch (err) {
      console.error('Fetch playlists error:', err);
      setPlaylistsError('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Fetch current playing track
  useEffect(() => {
    if (!accessToken) return;

    fetchCurrentlyPlaying();
    const interval = setInterval(fetchCurrentlyPlaying, 5000);
    return () => clearInterval(interval);
  }, [accessToken, fetchCurrentlyPlaying]);

  // Fetch playlists
  useEffect(() => {
    if (!accessToken) return;
    fetchPlaylists();
  }, [accessToken, fetchPlaylists]);

  // Log when accessToken changes
  useEffect(() => {
    console.log('Access token state updated:', accessToken ? 'Token present' : 'No token');
  }, [accessToken]);

  return {
    // Auth props & methods
    accessToken,
    refreshAccessToken,
    login: handleLogin,

    // Now playing props & methods
    currentlyPlaying,
    isPlaying,
    togglePlayback,
    playNext,
    playPrevious,
    device,
    seekPosition,
    fetchCurrentlyPlaying,
    playTrack,

    // Playlists props & methods
    playlists,
    loading,
    playlists_error: playlistsError,
  };
} 