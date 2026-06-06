'use client';

import React from 'react';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const DEFAULT_MESSAGE = encodeURIComponent('Hola! Tengo una consulta sobre sus fragancias.');

export default function WhatsAppButton() {
  if (!WHATSAPP_NUMBER) return null;

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${DEFAULT_MESSAGE}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-full shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 transition-all duration-300 hover:scale-105 group"
      aria-label="Contactar por WhatsApp"
    >
      {/* WhatsApp Official SVG Logo */}
      <svg 
        width="22" 
        height="22" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <path 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.175L2 22l4.963-1.4A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm4.725 13.558c-.203.573-1.092.983-1.488 1.024-.396.04-.78.183-2.59-.54-2.19-.9-3.59-3.22-3.696-3.37-.107-.15-.88-1.17-.88-2.23 0-1.06.555-1.57.752-1.785.197-.215.43-.268.573-.268l.413.007c.14.007.33-.052.515.39.185.44.63 1.53.685 1.64.056.11.09.24.02.38-.07.15-.1.24-.2.37-.1.12-.21.26-.3.35-.1.09-.2.19-.09.36.11.17.49.81 1.05 1.31.72.67 1.33.88 1.52.98.19.1.3.08.41-.05.11-.13.47-.55.6-.74.13-.19.26-.16.43-.1.17.06 1.1.52 1.29.61.19.1.32.14.36.22.05.08.05.47-.15 1.05z" 
          fill="currentColor"
        />
      </svg>
      
      <span className="text-sm font-bold uppercase tracking-wider hidden md:block">¡Contáctanos!</span>
      
      {/* Mobile tooltip */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-dark border border-[#25D366]/30 text-[#25D366] text-xs px-3 py-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:hidden">
        ¡Contáctanos!
      </span>
    </a>
  );
}
