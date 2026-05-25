'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ArrowLeft } from 'lucide-react';

interface RegisterProps {
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

export default function Register({ onClose, onSuccess }: RegisterProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'forgot') {
      if (!formData.email.trim()) {
        setError('El email es requerido'); return;
      }
      setError('');
      setLoading(true);
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email })
        });
        await res.json();
        setForgotSent(true);
      } catch {
        setError('Error al enviar la solicitud');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'register') {
      if (!formData.name.trim()) { setError('El nombre es requerido'); return; }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) { setError('El email no es válido'); return; }
      if (!formData.password || formData.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
      if (formData.phone && !/^\d+$/.test(formData.phone)) { setError('El teléfono debe contener solo números'); return; }
    } else {
      if (!formData.email.trim()) { setError('El email es requerido'); return; }
      if (!formData.password) { setError('La contraseña es requerida'); return; }
    }

    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ocurrió un error');

      onSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-darker flex flex-col overflow-y-auto"
    >
      <nav className="flex justify-between items-center px-8 h-20 border-b border-gold/5">
        <button onClick={onClose} className="text-gold hover:text-gold-light transition-colors cursor-pointer">
          <X size={24} />
        </button>
        <div className="font-serif text-xl font-bold tracking-[0.2em] text-gold uppercase">
          ALLAH FRAGANCIAS
        </div>
        <div className="w-6" />
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center px-8 py-12 relative">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none overflow-hidden">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #d4af37 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="w-full max-w-md z-10">
          <header className="mb-12 text-center md:text-left">
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-serif text-4xl md:text-5xl text-gold-light leading-tight tracking-tighter mb-4"
            >
              {mode === 'forgot' ? '¿Olvidaste tu Contraseña?' : mode === 'login' ? 'Bienvenido' : 'Únase al Círculo'}
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-gray-400 text-sm leading-relaxed tracking-widest uppercase max-w-xs mx-auto md:mx-0"
            >
              {mode === 'forgot'
                ? 'Ingresá tu correo y te enviaremos un enlace.'
                : mode === 'login'
                  ? 'Ingrese a su cuenta para continuar.'
                  : 'Acceda a la exclusividad de nuestras fragancias.'}
            </motion.p>
          </header>

          {mode === 'forgot' && forgotSent ? (
            <div className="text-center py-12">
              <p className="text-gold text-sm mb-4">Correo enviado exitosamente.</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.
              </p>
              <button
                onClick={() => { setMode('login'); setForgotSent(false); setError(''); }}
                className="mt-8 text-gold text-xs uppercase tracking-widest hover:underline"
              >
                Volver a Iniciar Sesión
              </button>
            </div>
          ) : (
            <form className="space-y-10" onSubmit={handleSubmit}>
              {error && <div className="text-red-500 text-xs text-center border border-red-500/20 py-2 bg-red-500/10">{error}</div>}

              {mode === 'forgot' && (
                <div className="relative group">
                  <input
                    type="email" id="forgot-email" value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="block w-full py-3 bg-transparent border-0 border-b border-gold/20 text-white outline-none focus:outline-none focus:ring-0 focus:border-gold transition-all duration-300 peer placeholder-transparent"
                    placeholder="Correo Electrónico" required
                  />
                  <label htmlFor="forgot-email" className="absolute left-0 top-3 text-gray-500 text-sm uppercase tracking-widest pointer-events-none transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75">
                    Correo Electrónico
                  </label>
                </div>
              )}

              {mode !== 'forgot' && (
                <>
                  {mode === 'register' && (
                    <>
                      <div className="relative group">
                        <input type="text" id="name" value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="block w-full py-3 bg-transparent border-0 border-b border-gold/20 text-white outline-none focus:outline-none focus:ring-0 focus:border-gold transition-all duration-300 peer placeholder-transparent"
                          placeholder="Nombre Completo" required />
                        <label htmlFor="name" className="absolute left-0 top-3 text-gray-500 text-sm uppercase tracking-widest pointer-events-none transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75">
                          Nombre Completo
                        </label>
                      </div>
                      <div className="relative group">
                        <input type="tel" id="phone" value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="block w-full py-3 bg-transparent border-0 border-b border-gold/20 text-white outline-none focus:outline-none focus:ring-0 focus:border-gold transition-all duration-300 peer placeholder-transparent"
                          placeholder="Teléfono Celular" />
                        <label htmlFor="phone" className="absolute left-0 top-3 text-gray-500 text-sm uppercase tracking-widest pointer-events-none transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75">
                          Teléfono Celular
                        </label>
                      </div>
                    </>
                  )}

                  <div className="relative group">
                    <input type="email" id="email" value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="block w-full py-3 bg-transparent border-0 border-b border-gold/20 text-white outline-none focus:outline-none focus:ring-0 focus:border-gold transition-all duration-300 peer placeholder-transparent"
                      placeholder="Correo Electrónico" required />
                    <label htmlFor="email" className="absolute left-0 top-3 text-gray-500 text-sm uppercase tracking-widest pointer-events-none transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75">
                      Correo Electrónico
                    </label>
                  </div>

                  <div className="relative group">
                    <input type="password" id="password" value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="block w-full py-3 bg-transparent border-0 border-b border-gold/20 text-white outline-none focus:outline-none focus:ring-0 focus:border-gold transition-all duration-300 peer placeholder-transparent"
                      placeholder="Contraseña" required />
                    <label htmlFor="password" className="absolute left-0 top-3 text-gray-500 text-sm uppercase tracking-widest pointer-events-none transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75">
                      Contraseña
                    </label>
                  </div>
                </>
              )}

              <button disabled={loading} className="w-full bg-gradient-to-r from-gold to-gold-dark text-dark font-bold py-5 tracking-[0.2em] uppercase text-xs hover:opacity-90 active:scale-[0.98] transition-all duration-500 shadow-xl shadow-gold/10">
                {loading ? 'CARGANDO...' : mode === 'forgot' ? 'ENVIAR ENLACE' : mode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
              </button>
            </form>
          )}

          <div className="mt-10 text-center">
            {mode === 'forgot' ? (
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className="text-gold text-xs uppercase tracking-widest hover:underline"
              >
                ← Volver a Iniciar Sesión
              </button>
            ) : (
              <>
                <p className="text-xs text-gray-500 tracking-wider">
                  {mode === 'login' ? '¿No tiene una cuenta?' : '¿Ya tiene una cuenta?'}
                  <button
                    onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}
                    className="text-gold font-bold ml-2 hover:underline underline-offset-4 transition-all uppercase"
                  >
                    {mode === 'login' ? 'Regístrese' : 'Inicie sesión'}
                  </button>
                </p>
                {mode === 'login' && (
                  <button
                    onClick={() => { setError(''); setMode('forgot'); }}
                    className="text-gray-500 text-[10px] uppercase tracking-widest mt-4 hover:text-gold transition-colors"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </motion.div>
  );
}