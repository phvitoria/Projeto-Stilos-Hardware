import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Mail, ShieldAlert, KeyRound, CheckCircle2, Cpu } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: { fullName: string; email: string }) => void;
  accentClass: string;
  accentColor: string;
}

export default function AuthScreen({ onLoginSuccess, accentClass, accentColor }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        // Login API Call
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, accessKey })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Falha no login');
        }
        setSuccess('Acesso concedido. Inicializando central de controle...');
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 1200);
      } else {
        // Register API Call
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, accessKey })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Falha no cadastro');
        }
        setSuccess('Cadastro realizado! Redirecionando para login em instantes...');
        setTimeout(() => {
          setIsLogin(true);
          setSuccess(null);
        }, 1800);
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão no portal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f1f5f9] relative overflow-hidden font-sans select-none">
      {/* Background Bento Grid dotted pattern */}
      <div className="absolute inset-0 bg-[#e2e8f0]/40 bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(226,232,240,0.8)_0%,transparent_70%)] pointer-events-none" />

      {/* Cyberpunk branding logo at top */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <span className="text-slate-800 font-display font-medium text-4xl block font-bold tracking-tight select-none">
          Stilos Hardware
        </span>
        <span className="text-[10px] text-slate-400 font-mono tracking-[0.3em] uppercase block mt-1">
          PAINEL DE AUTENTICAÇÃO
        </span>
      </motion.div>

      {/* Auth Panel Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] z-10 p-8 shadow-md relative text-slate-800"
      >
        <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-slate-800 tracking-tight">
            {isLogin ? 'Login de Acesso' : 'Cadastro'}
          </h2>
          <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-lg border text-white font-bold" style={{ backgroundColor: accentColor, borderColor: accentColor }}>
            {isLogin ? 'Uplink' : 'Registrar'}
          </span>
        </div>

        {/* Status Feedbacks */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 text-xs font-mono bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-2xl flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }} 
            animate={{ opacity: 1, x: 0 }}
            className="mb-4 text-xs font-mono bg-emerald-50 border border-emerald-200 text-emerald-600 p-3 rounded-2xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 animate-pulse" />
            <span>{success}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* NOME_COMPLETO (Only shown in sign up mode) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">
                Nome Completo
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu Nome Completo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/10 transition-all duration-205"
                />
              </div>
            </div>
          )}

          {/* EMAIL_IDENTIFICACAO */}
          <div className="space-y-1">
            <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">
              E-mail de Identificação
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operador@stilos.com.br"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/10 transition-all duration-205"
              />
            </div>
          </div>

          {/* CHAVE_DE_ACESSO */}
          <div className="space-y-1">
            <label className="block text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-1">
              Chave de Acesso
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/10 transition-all duration-205"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold uppercase text-xs tracking-wider rounded-2xl py-3.5 transition duration-200 hover:scale-102 active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            style={{ 
              backgroundColor: accentColor,
              boxShadow: `0 4px 14px ${accentColor}30`
            }}
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Acessar Central ⚡' : 'Cadastrar Operator ⚡'}</span>
              </>
            )}
          </button>
        </form>

        {/* Switch Mode Link */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setSuccess(null);
            }}
            className="text-xs text-slate-400 font-bold hover:text-slate-700 transition cursor-pointer"
          >
            {isLogin ? '→ Não tem conta? Registrar novo operador' : '→ Já tenho uma conta cadastrada'}
          </button>
        </div>
      </motion.div>

      {/* Footer credits */}
      <span className="absolute bottom-4 text-[10px] font-mono text-slate-400">
        PROTOCOL: REGISTRATION_WIZARD_V1 // CORP SECURITY UPLINK ACTIVE
      </span>
    </div>
  );
}
