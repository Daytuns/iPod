import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const Screen = ({ currentlyPlaying }) => {

  const [time, setTime] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);


  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!currentlyPlaying) return;

    const { progress_ms, item, is_playing } = currentlyPlaying;

    setProgress(progress_ms || 0);
    setDuration(item?.duration_ms || 1);
    setIsPlaying(is_playing);
  }, [currentlyPlaying]);

  // Local timer that simulates playback progress
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1000, duration));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const song = currentlyPlaying?.item || null;
  const trackName = song?.name || "No song playing";
  const artists = song?.artists?.map(artist => artist.name).join(", ") || "";
  const albumName = song?.album?.name || "";
  const albumArt = song?.album?.images?.[0]?.url || "https://heroui.com/images/album-cover.png";

  const progressPercent = (progress / duration) * 100;

  const msToTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
    {/* <div className="bg-black/20 backdrop-blur-xs z-50 fixed w-[156px] h-[188px] mt-[18px] rounded-md"></div> */}
    <div className="w-42 h-50 mt-3 rounded-md border-[6px] border-black shadow-inner overflow-hidden bg-gray-800">

      {/* Top Status Bar */}
      <div className="flex justify-between items-center px-2 py-1 text-[10px] text-gray-100 border-b border-gray-600 font-semibold">
        <span>♪ iPod - Dayton</span>
        <span>{time}</span>
      </div>


      {/* Content Area */}
      <div className="p-2 flex flex-col h-full ">

        {/* Blurred BG */}
        <img
            src={albumArt}
            alt="Album Cover"
            className="absolute inset-0 left-7 top-13 w-34 h-34 object-cover blur-sm opacity-40 z-0"
          />

        {/* Album Art */}
        <div className="relative mt-1 w-[70px] h-[70px] mx-auto rounded overflow-hidden shadow border border-gray-600 z-1">
          <img
            src={albumArt}
            alt="Album Cover"
            className="absolute inset-0 w-full h-full object-cover z-1"
          />
          <div className="absolute inset-0 bg-white/10 pointer-events-none" />
        </div>

        {/* Track Info */}
        <div className="text-center text-gray-100 mt-1 space-y-[2px] leading-tight z-1">
          <div className="text-[10px] font-bold text-white truncate">{ trackName }</div>
          <div className="text-[9px] text-gray-300">{ artists }</div>
          <div className="text-[8px] text-gray-400">{ albumName }</div>
        </div>

        {/* Progress Bar */}
        <div className="px-3 mt-2 z-1">
          <div className="w-full h-[4px] bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-blue-400 w-1/3 rounded-full"
            style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[8px] mt-[2px] text-gray-400">
            <span>{msToTime(progress)}</span>
            <span>{msToTime(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        {/* <div className="flex items-center justify-center gap-2 mt-1 px-3">
          <VolumeX className="w-3 h-3 text-gray-400 drop-shadow-sm" />
          <div className="w-full h-[3px] bg-gray-700 rounded-full shadow-inner">
            <div className="h-full bg-gray-300 w-1/2 rounded-full" />
          </div>
          <Volume2 className="w-3 h-3 text-gray-400 drop-shadow-sm" />
        </div> */}

      </div>
    </div>
    </>
  )
}

export default Screen
