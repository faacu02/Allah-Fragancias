import type { Metadata } from 'next';
import { Noto_Serif, Manrope } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '600', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Allah Fragancias — Luxury Perfumery',
    template: '%s | Allah Fragancias',
  },
  description: 'Descubra el lujo en cada gota. Colección exclusiva de fragancias orientales de alta perfumería.',
  keywords: ['perfumes', 'fragancias', 'lujo', 'oriente', 'alta perfumería', 'Arabia', 'oud', 'colonia'],
  authors: [{ name: 'Allah Fragancias' }],
  openGraph: {
    title: 'Allah Fragancias — Luxury Perfumery',
    description: 'Descubra el lujo en cada gota. Colección exclusiva de fragancias orientales de alta perfumería.',
    siteName: 'Allah Fragancias',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Allah Fragancias — Luxury Perfumery',
    description: 'Descubra el lujo en cada gota. Colección exclusiva de fragancias orientales.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${notoSerif.variable} ${manrope.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:bg-gold focus:text-dark focus:px-6 focus:py-3 focus:text-sm focus:font-bold focus:uppercase focus:tracking-widest"
        >
          Saltar al contenido principal
        </a>
        <div id="main-content">
          {children}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'Allah Fragancias',
              description: 'Colección exclusiva de fragancias orientales de alta perfumería.',
              url: 'https://allahfragancias.vercel.app',
              image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800',
              currencyAccepted: 'ARS',
              paymentAccepted: ['Efectivo', 'Transferencia bancaria'],
              areaServed: 'Argentina',
            }),
          }}
        />
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
