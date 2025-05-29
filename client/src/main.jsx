import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import IPod from './iPod.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode> 
    <div className='min-h-screen w-full flex items-center justify-center border border-solid border-red-700'>
      <IPod />
    </div>
  </StrictMode>,
)
