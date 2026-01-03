
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const BestroLogoSVG = ({ className = "h-32" }: { className?: string }) => (
  <svg viewBox="0 0 400 250" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="200" cy="110" rx="180" ry="100" fill="#ec1313" />
    <path d="M70 120 C 150 70, 300 70, 330 150" stroke="white" strokeWidth="3" strokeOpacity="0.3" fill="none" />
    <text x="50%" y="125" textAnchor="middle" fill="white" style={{ font: 'bold 70px Arial, sans-serif', letterSpacing: '-2px' }}>BESTRO</text>
    <text x="50%" y="165" textAnchor="middle" fill="white" style={{ font: '900 22px Arial, sans-serif', letterSpacing: '8px' }}>ENGINEERING</text>
    <circle cx="330" cy="115" r="28" fill="white" fillOpacity="0.2" />
    <path d="M330 100 Q340 115 330 130 Q320 115 330 100 M330 110 Q335 118 330 125 Q325 118 330 110" fill="white" />
    <text x="50%" y="235" textAnchor="middle" fill="white" style={{ font: 'italic bold 24px serif' }}>Connect & Protect</text>
  </svg>
);

const Login: React.FC<any> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('supervisor@bestro.com');
  
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<'verify' | 'reset'>('verify');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotId, setForgotId] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [resetTargetEmail, setResetTargetEmail] = useState('');

  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('Initialize...');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Check registry first
    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    const userInRegistry = registry.find((u: any) => u.email === email && u.pin === pin);
    
    if (userInRegistry) {
      performLogin(userInRegistry);
      return;
    }

    // 2. Built-in Master Accounts
    if (pin === '1234') {
      if (email === 'supervisor@bestro.com') {
        performLogin({
          id: '9901',
          name: 'Supervisor Ali',
          role: 'Supervisor',
          email: 'supervisor@bestro.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=9901',
          status: 'online',
          pin: '1234',
          hasBiometric: true
        });
        return;
      }
      
      if (email === 'technician@bestro.com') {
        performLogin({
          id: '8821',
          name: 'John Doe',
          role: 'Technician',
          email: 'technician@bestro.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8821',
          status: 'online',
          pin: '1234',
          hasBiometric: true
        });
        return;
      }
    }

    alert("Gagal: Email atau PIN tidak sah.");
    setPin('');
  };

  const performLogin = (user: any) => {
    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('last_user', JSON.stringify(user));
    localStorage.setItem('security_prefs', JSON.stringify({
      biometrics: true,
      clearOnLogout: false,
      securityPin: user.pin
    }));
    onLogin();
  };

  const handleBiometricLogin = () => {
    const lastUser = JSON.parse(localStorage.getItem('last_user') || 'null');
    if (!lastUser || !lastUser.hasBiometric) {
      alert("Biometrik tidak dijumpai.");
      return;
    }

    setIsBiometricScanning(true);
    setScanStatus('Scanning...');
    setTimeout(() => {
      performLogin(lastUser);
      setIsBiometricScanning(false);
    }, 1500);
  };

  const handleVerifyIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    const user = registry.find((u: any) => u.email === forgotEmail && u.id === forgotId);
    if (user || (forgotEmail === 'supervisor@bestro.com' && forgotId === '9901')) {
      setResetTargetEmail(forgotEmail);
      setForgotStep('reset');
    } else {
      alert("Verifikasi Gagal.");
    }
  };

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || newPin !== confirmNewPin) {
      alert("PIN tidak sah.");
      return;
    }
    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    const userIdx = registry.findIndex((u: any) => u.email === resetTargetEmail);
    if (userIdx > -1) {
      registry[userIdx].pin = newPin;
      localStorage.setItem('users_registry', JSON.stringify(registry));
    }
    alert("PIN berjaya ditukar.");
    setShowForgot(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#181111] overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.05]" 
        style={{ backgroundImage: 'radial-gradient(#ec1313 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-12 relative z-10">
        <div className="flex flex-col items-center">
          <BestroLogoSVG className="h-40 drop-shadow-[0_0_20px_rgba(236,19,19,0.4)]" />
        </div>

        <form className="w-full flex flex-col gap-5" onSubmit={handleLoginSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">Kredential Akses</label>
            <div className="flex items-center bg-[#2a1b1b] border border-border-dark rounded-xl px-4 h-14 focus-within:border-primary transition-colors">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-white w-full placeholder-white/20 font-bold"
                placeholder="email@bestro.com"
              />
              <span className="material-symbols-outlined text-text-muted">mail</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Security Pin</label>
              <button type="button" onClick={() => setShowForgot(true)} className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline">Lupa?</button>
            </div>
            <div className="flex items-center bg-[#2a1b1b] border border-border-dark rounded-xl px-4 h-14 focus-within:border-primary transition-colors">
              <input 
                type="password" 
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="bg-transparent border-none focus:ring-0 text-white w-full placeholder-white/20 font-black tracking-[1em]"
                placeholder="••••"
              />
              <span className="material-symbols-outlined text-text-muted">lock</span>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-sm mt-2"
          >
            <span>Masuk Terminal</span>
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </button>
        </form>

        <div className="flex flex-col items-center gap-4">
          <button onClick={() => navigate('/register')} className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors">Daftar Akaun Baru</button>
          <button onClick={handleBiometricLogin} className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity active:scale-90">
            <span className="material-symbols-outlined text-4xl">fingerprint</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Biometrik</span>
          </button>
        </div>
      </div>

      {isBiometricScanning && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="relative w-48 h-48 flex items-center justify-center mb-8">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping"></div>
              <span className="material-symbols-outlined text-7xl text-primary drop-shadow-[0_0_15px_rgba(236,19,19,0.8)]">fingerprint</span>
           </div>
           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white italic">{scanStatus}</h3>
        </div>
      )}

      {showForgot && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end justify-center animate-in slide-in-from-bottom duration-300">
          <div className="bg-surface-dark w-full max-w-md rounded-t-[40px] border-t border-white/10 p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest italic">{forgotStep === 'verify' ? 'Identity Verification' : 'Reset PIN'}</h3>
              <button onClick={() => setShowForgot(false)} className="text-text-muted hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            {forgotStep === 'verify' ? (
              <form onSubmit={handleVerifyIdentity} className="flex flex-col gap-4">
                <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="bg-background-dark/50 border-none rounded-2xl h-14 px-5 text-sm text-white" placeholder="Email" />
                <input type="text" required value={forgotId} onChange={(e) => setForgotId(e.target.value)} className="bg-background-dark/50 border-none rounded-2xl h-14 px-5 text-sm text-white" placeholder="Staff ID" />
                <button type="submit" className="w-full h-14 bg-primary text-white font-black uppercase rounded-2xl">Sahkan Identiti</button>
              </form>
            ) : (
              <form onSubmit={handleResetPin} className="flex flex-col gap-4">
                <input type="password" required maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} className="bg-background-dark/50 border-none rounded-2xl h-14 px-5 text-center font-black tracking-[1em]" placeholder="••••" />
                <input type="password" required maxLength={4} value={confirmNewPin} onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))} className="bg-background-dark/50 border-none rounded-2xl h-14 px-5 text-center font-black tracking-[1em]" placeholder="••••" />
                <button type="submit" className="w-full h-14 bg-emerald-600 text-white font-black uppercase rounded-2xl">Simpan PIN Baru</button>
              </form>
            )}
            <div className="h-8" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
