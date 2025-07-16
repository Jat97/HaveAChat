import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {QueryClientProvider} from '@tanstack/react-query';
import {client} from './client';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode> 
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)