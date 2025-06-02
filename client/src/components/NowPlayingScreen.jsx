import React, { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const NowPlayingScreen = ({ currentlyPlaying, device, seekPosition }) => {

  const [time, setTime] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const progressBarRef = useRef(null);


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

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1000, duration));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !progressBarRef.current) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const ratio = Math.min(Math.max(mouseX / rect.width, 0), 1);
      const newProgress = ratio * duration;

      setProgress(newProgress);
    };

    const handleMouseUp = () => {
      if (!isDragging) return;

      setIsDragging(false);
      seekPosition(progress); 
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
}, [isDragging, duration, progress, seekPosition]);


  const song = currentlyPlaying?.item || null;
  const trackName = song?.name || "No song playing";
  const artists = song?.artists?.map(artist => artist.name).join(", ") || "";
  const albumName = song?.album?.name || "";
  const albumArt = song?.album?.images?.[0]?.url || "https://heroui.com/images/album-cover.png";
  const playbackDevice = device?.name || "Unknown device";

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
    <div className="w-42 h-50 mt-3 rounded-md border-[6px] border-black shadow-inner overflow-hidden bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#2b2b2b]">

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
            className="absolute inset-0 left-6 top-14 w-35 h-35 object-cover blur-md opacity-50 z-0"
        />

        {/* Device */}
        <p className="flex justify-center text-[8px] text-gray-400">Listening on { playbackDevice }</p>

        {/* Album Art */}
        <div className="relative mt-2.5 w-[70px] h-[70px] mx-auto rounded overflow-hidden shadow z-1">
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
          <div className="text-[9px] text-gray-300 truncate">{ artists }</div>
          {/* <div className="text-[8px] text-gray-400">{ albumName }</div> */}
        </div>

        {/* Progress Bar */}
        <div className="px-3 mt-2 z-1">
          <div className="relative w-full h-[8px]">
            <div
              ref={progressBarRef}
              onClick={(e) => {
                if (!progressBarRef.current) return;

                const rect = progressBarRef.current.getBoundingClientRect();
                const clickX = e.clientX - rect.left; 
                const clickRatio = clickX / rect.width;
                const newProgress = clickRatio * duration;

                setProgress(newProgress);
                seekPosition(newProgress); 
              }}
              className="cursor-pointer w-full h-[4px] bg-gray-700 rounded-full overflow-hidden shadow-inner"
            >
              <div
                className="h-full bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Seeker dot */}
            <div
              className="cursor-pointer absolute top-1/4 -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-white shadow transition-all duration-300"
              style={{ left: `calc(${progressPercent}% - 2px)` }}
              onMouseDown={() => setIsDragging(true)}
              onDragStart={(e) => e.preventDefault()}
            />
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

export default NowPlayingScreen
