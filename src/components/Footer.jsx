import React from 'react'

const Footer = () => {
  return (
    <div className='bg-slate-800 text-white flex flex-col justify-center items-center w-full py-2'>
      <div className="logo font-bold text-white text-2xl">
        <span className='text-blue-200'> &lt;</span>
        Pass
        <span className='text-blue-200'> Saver/&gt;</span>
      </div>

      {/* Security Check Sentence moved here */}
      <div className="flex justify-center items-center font-semibold text-blue-200 mt-1">
        Was your password used somewhere:
        <a href="https://haveibeenpwned.com/#/" target="_blank" rel="noreferrer" className='ml-2 flex items-center'>
          <span className='text-orange-200 font-bold'>CHECK</span>
        </a>
      </div>

      <div className='flex justify-center items-center py-2'>
        copyright © 2026 PassSaver. All rights reserved. Created with 
        <img className='w-7 mx-2' src="public\heart.png" alt="heart_logo" /> 
        by Sayantan Ghosal
      </div>
    </div>
  )
}

export default Footer
