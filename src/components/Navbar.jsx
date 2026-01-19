import React from 'react'

const Navbar = () => {
  return (
    <nav className='bg-slate-800 text-white'>
      <div className='mycontainer flex justify-between items-center h-14 py-0'>

        <div className="logo font-bold text-white text-2xl">
          
          <span className='text-blue-200'> &lt;</span>
          Pass
          <span className='text-blue-200'> Saver/&gt;</span>
        </div>
        <ul>
            <li className='flex gap-4'>
                <a className='hover:font-bold'href='/'>Home</a>
                <a className='hover:font-bold'href='#'>About</a>
                <a className='hover:font-bold'href='#'>Contact</a>
            </li>
        </ul>
    </div>
    </nav>
  )
}

export default Navbar
