
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: () => void;
}

const BestroLogo = () => (
  <div className="flex flex-col items-center gap-2">
    <svg width="240" height="120" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_20px_rgba(236,19,19,0.4)]">
      {/* Background Oval - Deep Red with slight gradient feel */}
      <ellipse cx="120" cy="60" rx="110" ry="52" fill="#ec1313" />
      
      {/* Refined Silver Swooshes */}
      <path d="M45 28C75 18 165 18 195 28" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
      <path d="M45 92C75 102 165 102 195 92" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
      
      {/* BESTR Text - Aligned to the left of center */}
      <text x="100" y="66" fontFamily="Inter, Arial Black, sans-serif" fontSize="42" fontWeight="900" fill="white" textAnchor="middle" letterSpacing="-1.5">BESTR</text>
      
      {/* Polished Graphic O with Flame */}
      <g transform="translate(178, 55)">
        <circle cx="0" cy="0" r="17" fill="white" />
        {/* Outer Flame */}
        <path d="M0 -9C0 -9 6 -3 6 3C6 9 0 12 0 12C0 12 -6 9 -6 3C-6 -3 0 -9 0 -9Z" fill="#ec1313" />
        {/* Inner Flame Detail */}
        <path d="M0 -4C0 -4 2.5 -1.5 2.5 1.5C2.5 4.5 0 6 0 6C0 6 -2.5 4.5 -2.5 1.5C-2.5 -1.5 0 -4 0 -4Z" fill="white" fillOpacity="0.4" />
      </g>
      
      {/* Neat ENGINEERING Subtitle */}
      <text x="120" y="88" fontFamily="Inter, Arial, sans-serif" fontSize="11" fontWeight="800" fill="white" textAnchor="middle" letterSpacing="5" fillOpacity="0.95">ENGINEERING</text>
    </svg>
    <div className="text-white/80 font-serif italic text-xs tracking-[0.3em] mt-2 uppercase font-medium">'Connect & Protect'</div>
  </div>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('technician@bestro.com');
  
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
    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    const user = registry.find((u: any) => u.email === email && u.pin === pin);
    
    if (user) {
      performLogin(user);
    } else {
      const savedPrefs = localStorage.getItem('security_prefs');
      const correctPin = savedPrefs ? JSON.parse(savedPrefs).securityPin : '1234';
      
      if (email === 'technician@bestro.com' && pin === correctPin) {
        performLogin({
          id: '8821',
          name: 'John Doe',
          role: 'Technician',
          email: 'technician@bestro.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=8821',
          status: 'online',
          pin: correctPin,
          hasBiometric: true
        });
      } else {
        alert("Unauthorized Access: Invalid Email or Security PIN.");
        setPin('');
      }
    }
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
      alert("Biometric verification not registered for this device.");
      return;
    }

    setIsBiometricScanning(true);
    setScanStatus('Reading Fingerprint...');
    setTimeout(() => {
      setScanStatus('Verifying Identity...');
      setTimeout(() => {
        performLogin(lastUser);
        setIsBiometricScanning(false);
      }, 1500);
    }, 1200);
  };

  const handleVerifyIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    const user = registry.find((u: any) => u.email === forgotEmail && u.id === forgotId);
    if (user || (forgotEmail === 'technician@bestro.com' && forgotId === '8821')) {
      setResetTargetEmail(forgotEmail);
      setForgotStep('reset');
    } else {
      alert("Verification Failed.");
    }
  };

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || newPin !== confirmNewPin) {
      alert("Invalid PIN entry.");
      return;
    }
    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    const userIdx = registry.findIndex((u: any) => u.email === resetTargetEmail);
    if (userIdx > -1) {
      registry[userIdx].pin = newPin;
      localStorage.setItem('users_registry', JSON.stringify(registry));
    }
    alert("PIN reset successful.");
    setShowForgot(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#181111] overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.05]" 
        style={{ backgroundImage: 'radial-gradient(#ec1313 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-12 relative z-10">
        <div className="flex flex-col items-center">
          <BestroLogo />
        </div>

        <form className="w-full flex flex-col gap-5" onSubmit={handleLoginSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Work Email</label>
            <div className="flex items-center bg-[#2a1b1b] border border-border-dark rounded-xl px-4 h-14 focus-within:border-primary transition-colors">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-white w-full placeholder-white/20 font-bold"
                placeholder="name@company.com"
              />
              <span className="material-symbols-outlined text-text-muted">mail</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Security Pin</label>
              <button type="button" onClick={() => setShowForgot(true)} className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline">Forgot?</button>
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
            <span>Authorize Access</span>
            <span className="material-symbols-outlined text-[20px]">verified_user</span>
          </button>
        </form>

        <div className="flex flex-col items-center gap-4">
          <button onClick={() => navigate('/register')} className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors">Create Account</button>
          <button onClick={handleBiometricLogin} className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity active:scale-90">
            <span className="material-symbols-outlined text-4xl">fingerprint</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Biometric Login</span>
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
                <button type="submit" className="w-full h-14 bg-primary text-white font-black uppercase rounded-2xl">Verify</button>
              </form>
            ) : (
              <form onSubmit={handleResetPin} className="flex flex-col gap-4">
                <input type="password" required maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} className="bg-background-dark/50 border-none rounded-2xl h-14 px-5 text-center font-black tracking-[1em]" placeholder="••••" />
                <input type="password" required maxLength={4} value={confirmNewPin} onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))} className="bg-background-dark/50 border-none rounded-2xl h-14 px-5 text-center font-black tracking-[1em]" placeholder="••••" />
                <button type="submit" className="w-full h-14 bg-emerald-600 text-white font-black uppercase rounded-2xl">Reset PIN</button>
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
