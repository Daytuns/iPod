import React from 'react'

const Wheel = ({ onPlayPause, isPlaying, onNext, onPrevious }) => {
  return (
    <div className="w-40 h-40 mt-6 mx-auto rounded-full relative">
        {/* Inner Ring */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            <div className='text-gray-200 text-[10px] font-semibold absolute top-3 left-14'>
                <p>MENU</p>
            </div>
            <svg
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="#e5e7eb"
              width={18}
              height={18}
            >
            <path d="M3.65 6.62L11.15 11.37c.21.14.33.36.35.57v-4.69c0-.41.34-.75.75-.75h3c.41 0 .75.34.75.75v9.5c0 .41-.34.75-.75.75h-3a.75.75 0 01-.75-.75v-4.69c-.02.22-.14.44-.35.58L3.65 17.38C3.15 17.7 2.5 17.34 2.5 16.75v-9.5c0-.59.65-.96 1.15-.63zM21.25 6.5c.41 0 .75.34.75.75v9.5c0 .41-.34.75-.75.75h-3a.75.75 0 01-.75-.75v-9.5c0-.41.34-.75.75-.75h3z" />
            </svg>

            <svg
              onClick={onNext} 
              width={12} 
              height={12} 
              className="absolute bottom-1/2 right-3 hover:cursor-pointer" 
              fill="#e5e7eb" viewBox="0 0 32 32" enable-background="new 0 0 32 32" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="play"></g> <g id="stop"></g> <g id="pause"></g> <g id="replay"></g> <g id="next"> <g> <g> <path d="M4.561,3.728C4.184,3.328,4,3.45,4,4v24c0,0.55,0.184,0.672,0.561,0.272l10.816-11.544 c0.377-0.4,0.408-1.056,0.031-1.456L4.561,3.728z"></path> <path d="M4.202,29.507L4.202,29.507C4.079,29.507,3,29.465,3,28V4c0-1.465,1.079-1.507,1.202-1.507 c0.568,0,0.958,0.414,1.087,0.55l10.848,11.545c0.725,0.77,0.711,2.038-0.031,2.826L5.29,28.956 C5.16,29.094,4.771,29.507,4.202,29.507z M5.004,5.66L5,26.337l9.674-10.389L5.004,5.66z"></path> </g> <g> <path d="M17.561,3.728C17.184,3.328,17,3.45,17,4v24c0,0.55,0.184,0.672,0.561,0.272l10.816-11.544 c0.377-0.4,0.408-1.056,0.031-1.456L17.561,3.728z"></path> <path d="M17.202,29.507L17.202,29.507C17.079,29.507,16,29.465,16,28V4c0-1.465,1.079-1.507,1.202-1.507 c0.568,0,0.958,0.414,1.087,0.55l10.848,11.545c0.725,0.77,0.711,2.038-0.031,2.826L18.29,28.956 C18.16,29.094,17.771,29.507,17.202,29.507z M18.004,5.66L18,26.337l9.674-10.389L18.004,5.66z"></path> </g> </g> </g> <g id="Layer_8"></g> <g id="search"></g> <g id="list"></g> <g id="love"></g> <g id="menu"></g> <g id="add"></g> <g id="headset"></g> <g id="random"></g> <g id="music"></g> <g id="setting"></g> <g id="Layer_17"></g> <g id="Layer_18"></g> <g id="Layer_19"></g> <g id="Layer_20"></g> <g id="Layer_21"></g> <g id="Layer_22"></g> <g id="Layer_23"></g> <g id="Layer_24"></g> <g id="Layer_25"></g> <g id="Layer_26"></g> </g>
            </svg>

            <svg
              onClick={onPrevious}
              width={12} 
              height={12} 
              className="hover:cursor-pointer absolute bottom-1/2 left-3 transform scale-[-1]" fill="#e5e7eb" viewBox="0 0 32 32" enable-background="new 0 0 32 32" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="play"></g> <g id="stop"></g> <g id="pause"></g> <g id="replay"></g> <g id="next"> <g> <g> <path d="M4.561,3.728C4.184,3.328,4,3.45,4,4v24c0,0.55,0.184,0.672,0.561,0.272l10.816-11.544 c0.377-0.4,0.408-1.056,0.031-1.456L4.561,3.728z"></path> <path d="M4.202,29.507L4.202,29.507C4.079,29.507,3,29.465,3,28V4c0-1.465,1.079-1.507,1.202-1.507 c0.568,0,0.958,0.414,1.087,0.55l10.848,11.545c0.725,0.77,0.711,2.038-0.031,2.826L5.29,28.956 C5.16,29.094,4.771,29.507,4.202,29.507z M5.004,5.66L5,26.337l9.674-10.389L5.004,5.66z"></path> </g> <g> <path d="M17.561,3.728C17.184,3.328,17,3.45,17,4v24c0,0.55,0.184,0.672,0.561,0.272l10.816-11.544 c0.377-0.4,0.408-1.056,0.031-1.456L17.561,3.728z"></path> <path d="M17.202,29.507L17.202,29.507C17.079,29.507,16,29.465,16,28V4c0-1.465,1.079-1.507,1.202-1.507 c0.568,0,0.958,0.414,1.087,0.55l10.848,11.545c0.725,0.77,0.711,2.038-0.031,2.826L18.29,28.956 C18.16,29.094,17.771,29.507,17.202,29.507z M18.004,5.66L18,26.337l9.674-10.389L18.004,5.66z"></path> </g> </g> </g> <g id="Layer_8"></g> <g id="search"></g> <g id="list"></g> <g id="love"></g> <g id="menu"></g> <g id="add"></g> <g id="headset"></g> <g id="random"></g> <g id="music"></g> <g id="setting"></g> <g id="Layer_17"></g> <g id="Layer_18"></g> <g id="Layer_19"></g> <g id="Layer_20"></g> <g id="Layer_21"></g> <g id="Layer_22"></g> <g id="Layer_23"></g> <g id="Layer_24"></g> <g id="Layer_25"></g> <g id="Layer_26"></g> </g></svg>
        </div>

        {/* Center hole */}
        <div
        onClick={onPlayPause}
        className="absolute top-1/2 left-1/2 rounded-full bg-gray-950 hover:cursor-pointer"
        style={{
            width: '72px',
            height: '72px',
            transform: 'translate(-50%, -50%)',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.7)',
            zIndex: 10,
        }}
        />
    </div>
  )
}

export default Wheel