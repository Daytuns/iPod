import React, { useEffect, useState } from 'react'
import { useSongs } from '../useSongs'

const SongsScreen = ({ accessToken, refreshAccessToken, playlistId, setScreen }) => {
  const { songs, loading, songsError } = useSongs(accessToken, refreshAccessToken, playlistId)

  const [time, setTime] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (loading)
    return (
      <div className="w-42 h-50 mt-3 rounded-md border-[6px] border-black overflow-hidden bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#2b2b2b] flex flex-col shadow-[0_0_20px_rgba(0,255,255,0.1)]">
        {/* Top Status Bar */}
        <div className="flex justify-between items-center px-2 py-1 text-[10px] text-gray-100 border-b border-gray-600 font-semibold">
          <span>♪ iPod - Dayton</span>
          <span>{time}</span>
        </div>

        {/* Loader */}
        <div className="flex-grow flex items-center justify-center">
          <div className="spinner flex gap-[4px] w-[54px] h-[30px]">
            <div className="bar r1"></div>
            <div className="bar r2"></div>
            <div className="bar r3"></div>
            <div className="bar r4"></div>
            <div className="bar r5"></div>
          </div>
        </div>

        <style jsx>{`
          .bar {
            background-color: #ffffff;
            height: 14px;
            width: 4px;
            border-radius: 2px;
            flex-shrink: 0;
            animation: bounce 1.2s ease-in-out infinite;
            opacity: 0.8;
            transform-origin: center bottom;
            margin: 0 2px;
          }
          .r1 { animation-delay: 0s; }
          .r2 { animation-delay: 0.15s; }
          .r3 { animation-delay: 0.3s; }
          .r4 { animation-delay: 0.45s; }
          .r5 { animation-delay: 0.6s; }

          @keyframes bounce {
            0%, 100% {
              transform: scaleY(0.4);
              opacity: 0.6;
            }
            50% {
              transform: scaleY(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    )

  if (songsError) return <div>{songsError}</div>

  return (
    <div className="w-42 h-50 mt-3 rounded-md border-[6px] border-black overflow-hidden bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#2b2b2b] flex flex-col shadow-[0_0_20px_rgba(0,255,255,0.1)]">
      {/* Top Status Bar */}
      <div className="flex justify-between items-center px-2 py-1 text-[10px] text-gray-100 border-b border-gray-600 font-semibold">
        <span>♪ iPod - Dayton</span>
        <span>{time}</span>
      </div>

      {/* Songs List */}
      <div className="p-2 flex-1 overflow-y-auto scrollbar-w-1 scrollbar scrollbar-thumb-gray-700 scrollbar-track-gray-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
        <h2 className="font-bold mb-2 text-white">Songs</h2>
        <ul className="space-y-2 overflow-x-hidden">
          {songs.map((track, index) => {
            const playlistUri = playlistId === 'liked'
              ? 'spotify:collection:tracks'
              : `spotify:playlist:${playlistId}`

            return (
              <li
                key={track.id}
                className="flex text-xs text-white items-center gap-2 hover:bg-zinc-700 rounded cursor-pointer px-1 py-0.5"
                onClick={() => {
                  playTrack(track.uri, accessToken, playlistUri, index)
                  setScreen("now-playing")
                }}
              >
                {track.album?.images?.[0]?.url && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.name}
                    className="w-8 h-8 rounded shadow"
                  />
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold truncate text-[10px]">{track.name}</span>
                  <span className="text-[9px] text-gray-300 truncate">
                    {track.artists.map((a) => a.name).join(", ")}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

const playTrack = async (trackUri, accessToken, playlistUri, position) => {
  const isLikedSongs = playlistUri === 'spotify:collection:tracks'

  const body = isLikedSongs
    ? {
        context_uri: 'spotify:collection:tracks',
        offset: { position },
      }
    : {
        context_uri: playlistUri,
        offset: { position },
      }

  try {
    const res = await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const error = await res.json()
      console.error("Playback error:", error)
    }
  } catch (err) {
    console.error("Error calling play API:", err)
  }
}


export default SongsScreen
