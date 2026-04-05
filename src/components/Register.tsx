import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Eye, Apple, Mail } from 'lucide-react';

interface RegisterProps {
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

export default function Register({ onClose, onSuccess }: RegisterProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error');
      }

      // Guardar token y userData en localStorage
      localStorage.setItem('mirage_token', data.token);
      localStorage.setItem('mirage_user', JSON.stringify(data.user));
      
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
        <button 
          onClick={onClose}
          className="text-gold hover:text-gold-light transition-colors cursor-pointer"
        >
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
              {isLogin ? 'Bienvenido' : 'Únase al Círculo'}
            </motion.h2>
            <motion.p 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="text-gray-400 text-sm leading-relaxed tracking-widest uppercase max-w-xs mx-auto md:mx-0"
            >
              {isLogin 
                ? 'Ingrese a su cuenta para continuar.' 
                : 'Acceda a la exclusividad de nuestras fragancias.'}
            </motion.p>
          </header>

          <form className="space-y-10" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-xs text-center border border-red-500/20 py-2 bg-red-500/10">{error}</div>}
            
            {!isLogin && (
              <div className="relative group">
                <input 
                  type="text" 
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="block w-full py-3 bg-transparent border-0 border-b border-gold/20 text-white focus:ring-0 focus:border-gold transition-all duration-300 peer placeholder-transparent"
                  placeholder="Nombre Completo"
                  required
                />
                <label 
                  htmlFor="name"
                  className="absolute left-0 top-3 text-gray-500 text-sm uppercase tracking-widest pointer-events-none transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75"
                >
                  Nombre Completo
                </label>
              </div>
            )}

            <div className="relative group">
              <input 
                type="email" 
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="block w-full py-3 bg-transparent border-0 border-b border-gold/20 text-white focus:ring-0 focus:border-gold transition-all duration-300 peer placeholder-transparent"
                placeholder="Correo Electrónico"
                required
              />
              <label 
                htmlFor="email"
                className="absolute left-0 top-3 text-gray-500 text-sm uppercase tracking-widest pointer-events-none transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75"
              >
                 Correo Electrónico
              </label>
            </div>

            <div className="relative group">
              <input 
                type="password" 
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="block w-full py-3 bg-transparent border-0 border-b border-gold/20 text-white focus:ring-0 focus:border-gold transition-all duration-300 peer placeholder-transparent"
                placeholder="Contraseña"
                required
              />
              <label 
                htmlFor="password"
                className="absolute left-0 top-3 text-gray-500 text-sm uppercase tracking-widest pointer-events-none transition-all duration-300 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:scale-75"
              >
                Contraseña
              </label>
            </div>

            <button disabled={loading} className="w-full bg-gradient-to-r from-gold to-gold-dark text-dark font-bold py-5 tracking-[0.2em] uppercase text-xs hover:opacity-90 active:scale-[0.98] transition-all duration-500 shadow-xl shadow-gold/10">
              {loading ? 'CARGANDO...' : (isLogin ? 'INICIAR SESIÓN' : 'CREAR CUENTA')}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-gray-500 tracking-wider">
              {isLogin ? '¿No tiene una cuenta?' : '¿Ya tiene una cuenta?'} 
              <button 
                onClick={() => { setError(''); setIsLogin(!isLogin); }}
                className="text-gold font-bold ml-2 hover:underline underline-offset-4 transition-all uppercase"
              >
                {isLogin ? 'Regístrese' : 'Inicie sesión'}
              </button>
            </p>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
