
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-[#181111] overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.05]" 
        style={{ backgroundImage: 'radial-gradient(#ec1313 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8 relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-12 bg-gradient-to-b from-primary to-red-800 rounded-full flex flex-col items-center justify-center shadow-xl border-2 border-white/20">
            <span className="text-sm font-black italic tracking-tighter text-white">BESTRO</span>
            <span className="text-[6px] font-bold tracking-[0.3em] text-white/90 -mt-1">ENGINEERING</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight italic uppercase">BestroEng</h1>
            <p className="text-text-muted text-xs uppercase tracking-[0.2em] font-black mt-1">Maintenance Access</p>
          </div>
        </div>

        <form className="w-full flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Work Email</label>
            <div className="flex items-center bg-[#2a1b1b] border border-border-dark rounded-xl px-4 h-14 focus-within:border-primary transition-colors">
              <input 
                type="email" 
                defaultValue="technician@bestro.com"
                className="bg-transparent border-none focus:ring-0 text-white w-full placeholder-white/20 font-bold"
                placeholder="name@company.com"
              />
              <span className="material-symbols-outlined text-text-muted">mail</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Security Pin</label>
              <button type="button" className="text-[10px] text-primary font-black uppercase tracking-widest">Forgot?</button>
            </div>
            <div className="flex items-center bg-[#2a1b1b] border border-border-dark rounded-xl px-4 h-14 focus-within:border-primary transition-colors">
              <input 
                type="password" 
                defaultValue="password123"
                className="bg-transparent border-none focus:ring-0 text-white w-full placeholder-white/20 font-bold"
                placeholder="••••••••"
              />
              <span className="material-symbols-outlined text-text-muted">lock</span>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-sm mt-2"
          >
            <span>Authorize Access</span>
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </button>
        </form>

        <div className="flex flex-col items-center gap-4">
          <button 
            onClick={() => navigate('/register')}
            className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors"
          >
            Create Technician Account
          </button>
          
          <button className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
            <span className="material-symbols-outlined text-4xl">fingerprint</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Biometric Login</span>
          </button>
        </div>
      </div>

      <div className="p-8 text-center border-t border-white/5 bg-black/20">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
          v2.4.0 • Engineering Maintenance Portal
        </p>
      </div>
    </div>
  );
};

export default Login;
