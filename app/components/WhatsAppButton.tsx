'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

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
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={22} fill="white" className="flex-shrink-0" />
      <span className="text-sm font-bold uppercase tracking-wider hidden md:block">Contactanos!</span>
      
      {/* Mobile tooltip */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-dark border border-green-500/30 text-green-400 text-xs px-3 py-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:hidden">
        Contactanos!
      </span>
    </a>
  );
}
