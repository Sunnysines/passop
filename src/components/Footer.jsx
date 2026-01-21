import React from 'react'

const Footer = () => {
  return (
    <div className='bg-slate-800 text-white flex flex-col justify-center items-center w-full'>
        
        <div>
             <div className="logo font-bold text-white text-2xl">
          
          <span className='text-blue-200'> &lt;</span>
          Pass
          <span className='text-blue-200'> Saver/&gt;</span>
        </div>
        </div>
        <div className='flex justify-center items-center py-2'>

              copyright © 2026 PassSaver. All rights reserved. Created with <img className='w-7 mx-2' src="public\heart.png" alt="heart_logo" /> by Sayantan Ghosal
        </div>
    </div>
  )
}

export default Footer
