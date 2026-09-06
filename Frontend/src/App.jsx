import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Sidebar from './Components/Sidebar'
import ChatWindow from './Components/ChatWindow'
import { useAuth0 } from '@auth0/auth0-react'
import LoginPage from './Components/LoginPage'

function App() {

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
    <>
      <Sidebar/>
      <ChatWindow/>
    </>
  )
}

export default App
