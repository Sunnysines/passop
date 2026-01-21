import React from 'react'

const Navbar = () => {
  return (
    <nav className='bg-slate-800 text-white relative'>
      <div className='mycontainer flex justify-between items-center h-14 py-0'>

        <div className="logo font-bold text-white text-2xl">
          
          <span className='text-blue-200'> &lt;</span>
          Pass
          <span className='text-blue-200'> Saver/&gt;</span>
        </div>
        <button className='text-white bg-blue-500 my-5 rounded-md flex gap-4 justify-center items-center px-3 py-2 hover:bg-blue-400 cursor-pointer'> 
          <img className='invert w-8 h-8' src="public\file.png" alt="download_pdflogo" />
          Download Pdf
        </button>
    </div>
    </nav>
  )
}

export default Navbar
