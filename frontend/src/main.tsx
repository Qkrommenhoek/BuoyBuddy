import { StrictMode } from 'react'
import { useState } from 'react'
import './index.css'
import App from './App.tsx'
import Login from './Login.tsx'
import Register from './Register.tsx'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { clearStoredToken, getValidStoredToken } from './auth'

function Root() {
  const [token, setToken] = useState<string | null>(getValidStoredToken)

  function handleAuthError() {
    clearStoredToken()
    setToken(null)
  }

  return(
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={setToken} />} />
        <Route path="/register" element={<Register onRegister={setToken} />} />
        <Route
          path="/*"
          element={token ? <App token={token} onAuthError={handleAuthError} /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)