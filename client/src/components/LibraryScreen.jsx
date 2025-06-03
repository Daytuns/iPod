import React, { useState, useEffect } from 'react'

const LibraryScreen = ({ playlists, loading, playlists_error, setScreen, setSelectedPlaylistId }) => {
    const [time, setTime] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  useEffect(() => {
      const interval = setInterval(() => {
        const now = new Date();
        setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        
      }, 1000)
  
      return () => clearInterval(interval)
    }, [])

    if (loading) return <div>Loading playlists...</div>;
    if (playlists_error) return <div>{playlists_error}</div>;

    return (
        <div className="w-42 h-50 mt-3 rounded-md border-[6px] border-black overflow-hidden bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#2b2b2b] flex flex-col shadow-[0_0_20px_rgba(0,255,255,0.1)]">

            {/* Top Status Bar */}
            <div className="flex justify-between items-center px-2 py-1 text-[10px] text-gray-100 border-b border-gray-600 font-semibold">
                <span>♪ iPod - Dayton</span>
                <span>{time}</span>
            </div>


            {/* Playlists */}
            <div className="p-2 flex-1 overflow-y-auto scrollbar-w-1 scrollbar scrollbar-thumb-gray-700 scrollbar-track-gray-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                <h2 className="font-bold mb-2 text-white">Your Library</h2>
                <ul className="space-y-2 overflow-x-hidden">
                    {playlists.map((playlist) => (
                    <li 
                        key={playlist.id} 
                        className="flex text-xs text-white items-center gap-1 hover:bg-zinc-700 rounded cursor-pointer"
                        onClick={() => {
                            setSelectedPlaylistId(playlist.id);
                            requestAnimationFrame(() => setScreen("songs"));
                        }}
                    >
                        {playlist.images[0] && (
                        <img
                            src={playlist.images[0].url}
                            alt={playlist.name}
                            className="w-8 h-8 rounded shadow-xl"
                        />
                        )}
                        <div className='flex flex-col gap-0.5'>
                            <span className='font-semibold truncate text-[10px]'>{playlist.name}</span>
                            <span className='text-[9px] text-gray-300'>{playlist.tracks.total} songs</span>
                        </div>
                    </li>
                    ))}
                </ul>
            </div>

        </div>
    )
}

export default LibraryScreen