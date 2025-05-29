import React from 'react'
import { Volume2 } from 'lucide-react'
import { VolumeX } from 'lucide-react'
import {Image} from "@heroui/react";

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
            {/* <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-lg w-18 h-18 mx-auto mb-2 mt-1 flex items-center justify-center relative overflow-hidden border border-gray-700">
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/30"></div>
            <div className="absolute top-1 left-1 w-4 h-4 bg-white/30 rounded-full blur-sm"></div>
            <div className="text-white text-2xl relative z-10">♪</div>
            </div> */}

            <div className="relative w-[80px] h-[80px] mx-auto">
                <img
                    src="https://heroui.com/images/album-cover.png"
                    alt="Background Blur"
                    className="absolute inset-0 w-full h-full object-cover blur-md opacity-50 rounded"
                />
                <img
                    src="https://heroui.com/images/album-cover.png"
                    alt="Album Cover"
                    className="relative w-[50px] h-[50px] rounded shadow-md mx-auto mt-3"
                />
            </div>


            <div className="text-center text-black flex flex-col">
                <div className='flex flex-col gap-0'>
                    <div className="text-[10px]/1 font-bold text-gray-900">Bohemian Rhapsody</div>
                    <div className="text-[10px] text-gray-700">Queen</div>
                    <div className="text-[10px]/1 text-gray-600">A Night at the Opera</div>

                    <div className='px-3 mt-2 drop-shadow-2xl flex'>
                        <div className='w-full h-1 bg-gray-600 rounded-sm relative flex items-center'>
                            <div className='w-1/3 h-1 rounded-sm bg-blue-400'></div>
                        </div>
                    </div>
                    <div className='flex justify-between text-[10px] w-full px-3'>
                        <p>1:23</p>
                        <p>3:45</p>
                    </div>
                </div>


                    {/* <svg width={8} height={8} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 1H6L2 5H0V11H2L6 15H8V1Z" fill="#000000"></path> <path d="M12 8C12 9.10457 11.1046 10 10 10V6C11.1046 6 12 6.89543 12 8Z" fill="#000000"></path> </g></svg> */}
                    <div className="flex items-center justify-center gap-2 mt-1 px-3">
                        <VolumeX className="w-3 h-3 drop-shadow-sm" />
                        <div className="flex w-full">
                        <div className="w-full bg-gray-200 h-0.5 rounded-full shadow-[inset_0_1px_1px_rgba(0,0,0,0.8)]">
                            <div
                            className="bg-gray-300 w-1/3 h-0.5 rounded-full shadow-[0_0_2px_rgba(255,255,255,0.3)]"
                            ></div>
                        </div>
                        </div>
                        <Volume2 className="w-3 h-3 drop-shadow-sm" />
                    </div>
                    {/* <svg width={8} height={8} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M6 1H8V15H6L2 11H0V5H2L6 1Z" fill="#000000"></path> <path d="M14 8C14 5.79086 12.2091 4 10 4V2C13.3137 2 16 4.68629 16 8C16 11.3137 13.3137 14 10 14V12C12.2091 12 14 10.2091 14 8Z" fill="#000000"></path> <path d="M12 8C12 9.10457 11.1046 10 10 10V6C11.1046 6 12 6.89543 12 8Z" fill="#000000"></path> </g></svg> */}
               
            </div>
        </div>

    </div>
  )
}

export default Screen