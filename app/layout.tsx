import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Allah Fragancias — Luxury Perfumery',
  description: 'Descubra el lujo en cada gota. Colección exclusiva de fragancias orientales de alta perfumería.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{ 
            style: { 
               background: '#0d0d0d', 
               color: '#d4af37', 
               border: '1px solid rgba(212, 175, 55, 0.2)',
               borderRadius: '0',
               letterSpacing: '0.1em',
               textTransform: 'uppercase' as const,
               fontSize: '10px'
            } 
          }} 
        />
      </body>
    </html>
  );
}
