import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { ToastContainer } from 'react-toastify';
import { Outlet } from 'react-router-dom'
import AppToast from './Apptoast';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
  
    <AppToast/>
  <Outlet/>
      
    </>
  )
}

export default App
