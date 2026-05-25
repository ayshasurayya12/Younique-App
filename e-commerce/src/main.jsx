import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <WishlistProvider>
          <App />
        </WishlistProvider>
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
)
