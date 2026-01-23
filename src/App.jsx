import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Manager from './components/Manager'
import Footer from './components/Footer'

function App() {
  const [passwordArray, setpasswordArray] = useState([])

  useEffect(() => {
    let passwords = localStorage.getItem("passwords");
    if (passwords) {
      setpasswordArray(JSON.parse(passwords));
    }
  }, [])

  return (
    <>
      <Navbar passwordArray={passwordArray} />
      <Manager passwordArray={passwordArray} setpasswordArray={setpasswordArray} />
      <Footer />
    </>
  )
}

export default App