import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import { StoreProvider } from './context/StoreContext'
import App from './App.jsx'
import './index.css'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'placeholder';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <StoreProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </StoreProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
