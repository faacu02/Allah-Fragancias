'use client';

import { useFocusTrap } from '@/lib/useFocusTrap';

interface ConfirmLogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmLogoutModal({ onConfirm, onCancel }: ConfirmLogoutModalProps) {
  const ref = useFocusTrap(true);

  return (
    <div ref={ref} className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Confirmar cierre de sesión">
      <div className="bg-darker border border-gold/20 w-full max-w-sm p-8 relative">
        <h3 className="font-serif text-xl text-gold mb-4">Cerrar Sesión</h3>
        <p className="text-gray-400 text-sm mb-6">¿Estás seguro de que querés cerrar sesión?</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 border border-gold/20 text-gold text-xs uppercase tracking-widest font-bold py-4 hover:bg-gold/10 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-500/10 border border-red-500 text-red-500 text-xs uppercase tracking-widest font-bold py-4 hover:bg-red-500/20 transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
