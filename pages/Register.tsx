
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Technician registration pending supervisor approval.");
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-[#181111] overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.05]" 
        style={{ backgroundImage: 'radial-gradient(#ec1313 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>
      
      <div className="flex-1 flex flex-col p-8 gap-8 relative z-10 overflow-y-auto no-scrollbar pt-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-8 bg-gradient-to-b from-primary to-red-800 rounded-full flex items-center justify-center shadow-xl border border-white/20">
            <span className="text-[10px] font-black italic tracking-tighter text-white uppercase">New Tech</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight italic uppercase">Account Enrollment</h1>
            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">Bestro Maintenance Registry</p>
          </div>
        </div>

        <form className="w-full flex flex-col gap-4" onSubmit={handleRegister}>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Full Name</label>
            <div className="flex items-center bg-[#2a1b1b] border border-border-dark rounded-xl px-4 h-12 focus-within:border-primary transition-colors">
              <input 
                type="text" 
                required
                className="bg-transparent border-none focus:ring-0 text-white w-full text-sm font-bold placeholder-white/10"
                placeholder="Johnathan Doe"
              />
              <span className="material-symbols-outlined text-text-muted text-sm">person</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Staff ID / Employee Code</label>
            <div className="flex items-center bg-[#2a1b1b] border border-border-dark rounded-xl px-4 h-12 focus-within:border-primary transition-colors">
              <input 
                type="text" 
                required
                className="bg-transparent border-none focus:ring-0 text-white w-full text-sm font-bold placeholder-white/10"
                placeholder="EMP-8821"
              />
              <span className="material-symbols-outlined text-text-muted text-sm">badge</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Work Email</label>
            <div className="flex items-center bg-[#2a1b1b] border border-border-dark rounded-xl px-4 h-12 focus-within:border-primary transition-colors">
              <input 
                type="email" 
                required
                className="bg-transparent border-none focus:ring-0 text-white w-full text-sm font-bold placeholder-white/10"
                placeholder="name@bestro.com"
              />
              <span className="material-symbols-outlined text-text-muted text-sm">mail</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Pin</label>
              <div className="flex items-center bg-[#2a1b1b] border border-border-dark rounded-xl px-4 h-12 focus-within:border-primary transition-colors">
                <input 
                  type="password" 
                  required
                  className="bg-transparent border-none focus:ring-0 text-white w-full text-sm font-bold placeholder-white/10"
                  placeholder="••••"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Confirm</label>
              <div className="flex items-center bg-[#2a1b1b] border border-border-dark rounded-xl px-4 h-12 focus-within:border-primary transition-colors">
                <input 
                  type="password" 
                  required
                  className="bg-transparent border-none focus:ring-0 text-white w-full text-sm font-bold placeholder-white/10"
                  placeholder="••••"
                />
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl mt-2">
            <p className="text-[9px] font-bold text-primary/80 uppercase tracking-widest leading-relaxed">
              Note: Account activation requires verification by the Technical Supervisor. You will be notified via work email.
            </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-sm mt-2"
          >
            <span>Request Enrollment</span>
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/login')}
            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted hover:text-white transition-colors"
          >
            Existing Tech? Sign In
          </button>
        </form>
      </div>

      <div className="p-8 text-center border-t border-white/5 bg-black/20">
        <div className="flex justify-center gap-4 opacity-30">
           <span className="material-symbols-outlined text-sm">security</span>
           <span className="material-symbols-outlined text-sm">privacy_tip</span>
           <span className="material-symbols-outlined text-sm">verified_user</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
