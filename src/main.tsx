import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-center"
      toastOptions={{ 
        style: { 
           background: '#0d0d0d', 
           color: '#d4af37', 
           border: '1px solid rgba(212, 175, 55, 0.2)',
           borderRadius: '0',
           letterSpacing: '0.1em',
           textTransform: 'uppercase',
           fontSize: '10px'
        } 
      }} 
    />
  </StrictMode>,
);
