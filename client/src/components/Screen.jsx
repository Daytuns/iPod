import React from 'react'

const Screen = () => {
  return (
    <div className="w-42 h-50 bg-gray-100 mt-3 rounded-md border-6 border-black">

        <div className="flex justify-between items-center px-3 py-1 text-[10px] text-black border-b border-gray-800 relative z-10">
            <span>♪ iPod - Username</span>
            <div className="flex items-center gap-1">
            <div className="w-4 h-2 border border-gray-400 rounded-sm bg-black">
                <div className="w-2.5 h-0.5 bg-green-400 rounded-sm m-0.5 shadow-sm"></div>
            </div>
            </div>
        </div>

            {/* Now Playing Interface */}
        <div className="p-2 flex flex-col h-full relative z-10">
            {/* Album Art */}
            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-lg w-18 h-18 mx-auto mb-2 mt-1 flex items-center justify-center relative overflow-hidden border border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/30"></div>
            <div className="absolute top-1 left-1 w-4 h-4 bg-white/30 rounded-full blur-sm"></div>
            <div className="text-white text-2xl relative z-10">♪</div>
            </div>

            <div className="text-center text-black flex flex-col">
                <div className="text-[10px] font-bold text-gray-900">Bohemian Rhapsody</div>
                <div className="text-[10px] text-gray-700">Queen</div>
                <div className="text-[10px] text-gray-600">A Night at the Opera</div>

                <div className='px-3 drop-shadow-2xl flex'>
                    <div className='w-full h-1 bg-gray-600 rounded-sm relative flex items-center'>
                        <div className='w-1/3 h-1 rounded-sm bg-blue-400'></div>
                    </div>
                </div>
                <div className='flex justify-between text-[10px] w-full px-3'>
                    <p>1:23</p>
                    <p>3:45</p>
                </div>
            </div>
        </div>

    </div>
  )
}

export default Screen