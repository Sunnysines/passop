import { useState, useEffect, useCallback } from 'react'
import Navbar from './components/Navbar'
import Manager from './components/Manager'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const [passwordArray, setpasswordArray] = useState([])
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authEmail, setAuthEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const notify = (msg, type = "success") => {
    toast[type](msg, {
      position: "top-right",
      autoClose: 2500,
      theme: "colored",
      style: type === "success" ? { backgroundColor: "#3b82f6" } : { backgroundColor: "#ef4444" }
    });
  }

  // Fetch passwords strictly from MongoDB for authenticated user
  const loadPasswords = useCallback(async (authToken) => {
    if (authToken) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/passwords', {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.passwords)) {
          setpasswordArray(data.passwords);
          localStorage.setItem("passwords", JSON.stringify(data.passwords));
          return;
        }
      } catch (err) {
        console.error("Failed to fetch passwords from MongoDB:", err);
      } finally {
        setIsLoading(false);
      }
    }

    // When not logged in / guest mode: load local storage or start empty
    const local = localStorage.getItem("passwords");
    if (local) {
      try {
        setpasswordArray(JSON.parse(local));
      } catch {
        setpasswordArray([]);
      }
    } else {
      setpasswordArray([]);
    }
  }, []);

  // Check saved session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("passsaver_token");
    const savedUser = localStorage.getItem("passsaver_user");

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        loadPasswords(savedToken);
        return;
      } catch (e) {
        console.error("Error restoring session:", e);
      }
    }

    loadPasswords(null);
  }, [loadPasswords]);

  const handleOpenAuth = (mode = 'login', email = '') => {
    setAuthMode(mode);
    setAuthEmail(email);
    setIsAuthOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
  };

  const handleAuthSuccess = async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("passsaver_user", JSON.stringify(userData));
    localStorage.setItem("passsaver_token", userToken);

    // Fetch this user's isolated passwords from MongoDB (new users will get an empty list [])
    await loadPasswords(userToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("passsaver_user");
    localStorage.removeItem("passsaver_token");
    localStorage.removeItem("passwords"); // Clear out stored passwords so subsequent users/guests start clean
    setpasswordArray([]);
    notify("Logged out successfully");
  };

  const handleAccountDeleted = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("passsaver_user");
    localStorage.removeItem("passsaver_token");
    localStorage.removeItem("passwords");
    setpasswordArray([]);
    notify("Account and saved passwords deleted permanently.", "error");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer />
      <Navbar 
        passwordArray={passwordArray} 
        user={user}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />
      
      <Manager 
        passwordArray={passwordArray} 
        setpasswordArray={setpasswordArray}
        user={user}
        token={token}
        onOpenAuth={handleOpenAuth}
        notify={notify}
        isLoading={isLoading}
      />
      
      <Footer />

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        initialMode={authMode}
        initialEmail={authEmail}
        onAuthSuccess={handleAuthSuccess}
        onAccountDeleted={handleAccountDeleted}
        notify={notify}
      />
    </div>
  )
}

export default App