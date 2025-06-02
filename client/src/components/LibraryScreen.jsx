import React, { useState, useEffect } from 'react'

const LibraryScreen = () => {
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

    return (
        <div className="w-42 h-50 mt-3 rounded-md border-[6px] border-black shadow-inner overflow-hidden bg-gray-800">

            {/* Top Status Bar */}
            <div className="flex justify-between items-center px-2 py-1 text-[10px] text-gray-100 border-b border-gray-600 font-semibold">
                <span>♪ iPod - Dayton</span>
                <span>{time}</span>
            </div>

        </div>
    )
}

export default LibraryScreen