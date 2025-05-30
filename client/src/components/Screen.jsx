import React, { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

const Screen = () => {
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

  return (
    <div className="w-42 h-50 mt-3 rounded-md border-[6px] border-black shadow-inner overflow-hidden">

      {/* Top Status Bar */}
      <div className="flex justify-between items-center px-2 py-1 text-[10px] text-gray-100 border-b border-gray-600 font-semibold">
        <span>♪ iPod - Dayton</span>
        <span>{time}</span>
      </div>


      {/* Content Area */}
      <div className="p-2 flex flex-col h-full justify-between">

        {/* Album Art */}
        <div className="relative w-[80px] h-[80px] mx-auto rounded overflow-hidden shadow border border-gray-600">
          <img
            src="https://heroui.com/images/album-cover.png"
            alt="Album Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/10 pointer-events-none" />
        </div>

        {/* Track Info */}
        <div className="text-center text-gray-100 mt-1 space-y-[2px] leading-tight">
          <div className="text-[10px] font-bold text-white truncate">Bohemian Rhapsody</div>
          <div className="text-[9px] text-gray-300">Queen</div>
          <div className="text-[8px] text-gray-400">A Night at the Opera</div>
        </div>

        {/* Progress Bar */}
        <div className="px-3 mt-2">
          <div className="w-full h-[4px] bg-gray-700 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-blue-400 w-1/3 rounded-full"></div>
          </div>
          <div className="flex justify-between text-[8px] mt-[2px] text-gray-400">
            <span>1:23</span>
            <span>3:45</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-center gap-2 mt-1 px-3">
          <VolumeX className="w-3 h-3 text-gray-400 drop-shadow-sm" />
          <div className="w-full h-[3px] bg-gray-700 rounded-full shadow-inner">
            <div className="h-full bg-gray-300 w-1/2 rounded-full" />
          </div>
          <Volume2 className="w-3 h-3 text-gray-400 drop-shadow-sm" />
        </div>

      </div>
    </div>
  )
}

export default Screen
