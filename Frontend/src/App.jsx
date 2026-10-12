import { useEffect, useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Sidebar from './Components/Sidebar'
import ChatWindow from './Components/ChatWindow'
import { useAuth0 } from '@auth0/auth0-react'
import LoginPage from './Components/LoginPage'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.matchMedia('(max-width: 760px)').matches)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const updateSidebar = () => setSidebarCollapsed(media.matches)
    media.addEventListener('change', updateSidebar)
    return () => media.removeEventListener('change', updateSidebar)
  }, [])

  const {isLoading,isAuthenticated}=useAuth0()
 if (isLoading) {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
    </div>
  );
}
  if(!isAuthenticated){
    return <LoginPage/>
  }
 

  return (
    <div className={`app-layout${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(value => !value)} onClose={() => setSidebarCollapsed(true)}/>
      <ChatWindow/>
    </div>
  )
}

export default App
