'use client';

import { useEffect } from 'react';

interface ConfirmDeleteModalProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({ name, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      role="alertdialog" aria-modal="true" aria-label="Confirmar eliminación"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-darker border border-gold/20 w-full max-w-sm p-8 relative">
        <h3 className="font-serif text-xl text-gold mb-4">Eliminar Perfume</h3>
        <p className="text-gray-400 text-sm mb-6">
          ¿Estás seguro de eliminar <span className="text-white font-medium">{name}</span>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 border border-gold/20 text-gold text-xs uppercase tracking-widest font-bold py-4 hover:bg-gold/10 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-500/10 border border-red-500 text-red-500 text-xs uppercase tracking-widest font-bold py-4 hover:bg-red-500/20 transition-colors">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
