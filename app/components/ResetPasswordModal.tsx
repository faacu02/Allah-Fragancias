'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { csrfFetch } from '@/lib/csrf-client';
import toast from 'react-hot-toast';

interface ResetPasswordModalProps {
  token: string;
  onClose: () => void;
  onLoginRedirect: () => void;
}

export default function ResetPasswordModal({ token, onClose, onLoginRedirect }: ResetPasswordModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-darker flex flex-col items-center justify-center px-8"
      role="dialog"
      aria-modal="true"
      aria-label="Restablecer contraseña"
    >
      <InnerForm token={token} onClose={onClose} onLoginRedirect={onLoginRedirect} />
    </motion.div>
  );
}

function InnerForm({ token, onClose, onLoginRedirect }: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await csrfFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      toast.success('Contraseña actualizada exitosamente');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="font-serif text-xl font-bold tracking-[0.2em] text-gold uppercase text-center mb-10">
          ALLAH FRAGANCIAS
        </div>
        <div className="text-center">
          <p className="text-gold text-sm mb-4">Contraseña actualizada exitosamente</p>
          <p className="text-gray-400 text-xs">Ahora podés iniciar sesión con tu nueva contraseña.</p>
          <button onClick={onLoginRedirect} className="mt-8 text-gold text-xs uppercase tracking-widest hover:underline px-4 py-3">
            Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="font-serif text-xl font-bold tracking-[0.2em] text-gold uppercase text-center mb-10">
        ALLAH FRAGANCIAS
      </div>
      <form onSubmit={handleSubmit}>
        <h2 className="font-serif text-4xl text-gold-light leading-tight tracking-tighter mb-4 text-center">
          Nueva Contraseña
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed tracking-widest uppercase text-center mb-10">
          Ingresá tu nueva contraseña
        </p>
        {error && <div className="text-red-500 text-xs text-center border border-red-500/20 py-2 bg-red-500/10 mb-6">{error}</div>}
        <button type="button" onClick={onLoginRedirect} className="text-gray-400 text-[10px] uppercase tracking-widest hover:text-gold transition-colors mb-6 block px-4 py-3">
          ← Volver a Iniciar Sesión
        </button>
        <div className="relative group mb-10">
          <input
            type="password" id="reset-password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full py-3 bg-transparent border-0 border-b border-gold/20 text-white outline-none focus:outline-none focus:ring-0 focus:border-gold transition-all duration-300 peer placeholder-transparent"
            placeholder="Nueva Contraseña" required
          />
          <label htmlFor="reset-password" className="absolute left-0 top-3 text-gray-400 text-sm uppercase tracking-widest pointer-events-none transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75">
            Nueva Contraseña
          </label>
        </div>
        <button disabled={loading} className="w-full bg-gradient-to-r from-gold to-gold-dark text-dark font-bold py-5 tracking-[0.2em] uppercase text-xs hover:opacity-90 active:scale-[0.98] transition-all duration-500 shadow-xl shadow-gold/10">
          {loading ? 'CARGANDO...' : 'RESTABLECER CONTRASEÑA'}
        </button>
      </form>
    </div>
  );
}

