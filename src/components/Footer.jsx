import React from 'react'

const Footer = () => {
  return (
    <div className='bg-slate-800 text-white flex flex-col justify-center items-center w-full py-4 mt-auto'>
      <div className="mycontainer flex flex-col items-center">
        <div className="logo font-bold text-white text-2xl">
          <span className='text-blue-200'> &lt;</span>
          Pass
          <span className='text-blue-200'> Saver/&gt;</span>
        </div>

        <div className="flex flex-wrap justify-center items-center font-semibold text-blue-200 mt-2 text-center px-4">
          <span>Was your password used somewhere:</span>
          <a href="https://haveibeenpwned.com/#/" target="_blank" rel="noreferrer" className='ml-2 flex items-center'>
            <span className='text-orange-200 font-bold hover:underline'>CHECK</span>
          </a>
        </div>

        <div className='flex flex-wrap justify-center items-center py-2 text-sm md:text-base text-center px-4'>
          <span>copyright © 2026 PassSaver. All rights reserved. Created with</span>
          <img className='w-6 mx-2 inline-block' src="/heart.png" alt="heart_logo" /> 
          <span>by Sayantan Ghosal</span>
        </div>
      </div>
    </div>
  )
}

export default Footer
