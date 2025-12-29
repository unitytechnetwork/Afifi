
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('technician@bestro.com');
  
  // Forgot PIN States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<'verify' | 'reset'>('verify');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotId, setForgotId] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [resetTargetEmail, setResetTargetEmail] = useState('');

  // Biometric Simulation States
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('Initialize...');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    
    // Find user in registry
    const user = registry.find((u: any) => u.email === email && u.pin === pin);
    
    if (user) {
      performLogin(user);
    } else {
      // Fallback for default mock user if registry is empty or no match
      const savedPrefs = localStorage.getItem('security_prefs');
      const correctPin = savedPrefs ? JSON.parse(savedPrefs).securityPin : '1234';
      
      if (email === 'technician@bestro.com' && pin === correctPin) {
        performLogin({
          id: '8821',
          name: 'John Doe',
          role: 'Technician',
          email: 'technician@bestro.com',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFG3hbggbYWUwkhRbLza87RiJoSBru6DD1urjf-rI3NLbdzLApml-XUfr5kiW-2-xT6Vf0lHWpYS9laC5OX9Hx5HTcNe82JLtsC-lvdEKZmW_KLfzDO_zFgjC3DQ0OonhSHEQfqRMilc7voYS5mAgDw18tISty5P9O7dS8GxrFgZGodzDjVchh2CZX25jRFPBjlFhk0joRsOsmcKgKgUwt3ln-TfKj_lrXqOsdVrGOdnIml_sgUdS3vfUEasqb256afBDPEGJara4',
          status: 'online',
          pin: correctPin,
          hasBiometric: true // Default user has biometrics simulated
        });
      } else {
        alert("Unauthorized Access: Invalid Email or Security PIN.");
        setPin('');
      }
    }
  };

  const performLogin = (user: any) => {
    localStorage.setItem('current_user', JSON.stringify(user));
    localStorage.setItem('last_user', JSON.stringify(user)); // Track for biometric recognition
    localStorage.setItem('security_prefs', JSON.stringify({
      biometrics: true,
      clearOnLogout: false,
      securityPin: user.pin
    }));
    onLogin();
  };

  const handleBiometricLogin = () => {
    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    const lastUser = JSON.parse(localStorage.getItem('last_user') || 'null');
    
    // If we have a last user, check if they have biometrics enabled
    const userWithBio = lastUser || registry.find((u: any) => u.hasBiometric);
    
    if (!userWithBio || !userWithBio.hasBiometric) {
      alert("Biometric verification not registered for this device. Please log in manually with your PIN first.");
      return;
    }

    setIsBiometricScanning(true);
    setScanStatus('Reading Fingerprint...');

    setTimeout(() => {
      setScanStatus('Verifying Identity...');
      setTimeout(() => {
        setScanStatus('Bio-Key Decrypted');
        setTimeout(() => {
          performLogin(userWithBio);
          setIsBiometricScanning(false);
        }, 500);
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
      alert("Verification Failed: Credentials do not match our registry.");
    }
  };

  const handleResetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      alert("PIN must be 4 digits.");
      return;
    }
    if (newPin !== confirmNewPin) {
      alert("PINs do not match.");
      return;
    }

    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    const userIdx = registry.findIndex((u: any) => u.email === resetTargetEmail);

    if (userIdx > -1) {
      registry[userIdx].pin = newPin;
      localStorage.setItem('users_registry', JSON.stringify(registry));
    } else if (resetTargetEmail === 'technician@bestro.com') {
      localStorage.setItem('security_prefs', JSON.stringify({
        biometrics: true,
        clearOnLogout: false,
        securityPin: newPin
      }));
    }

    alert("Security PIN reset successful. Please log in.");
    setShowForgot(false);
    setForgotStep('verify');
    setForgotEmail('');
    setForgotId('');
    setNewPin('');
    setConfirmNewPin('');
  };

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
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Security Pin (4-Digits)</label>
              <button 
                type="button" 
                onClick={() => setShowForgot(true)}
                className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline"
              >
                Forgot?
              </button>
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
          <button 
            onClick={() => navigate('/register')}
            className="text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors"
          >
            Create Technician Account
          </button>
          
          <button 
            onClick={handleBiometricLogin}
            className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity active:scale-90"
          >
            <span className="material-symbols-outlined text-4xl">fingerprint</span>
            <span className="text-[9px] font-black uppercase tracking-widest">Biometric Login</span>
          </button>
        </div>
      </div>

      {/* Biometric Scanning Overlay */}
      {isBiometricScanning && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="relative w-48 h-48 flex items-center justify-center mb-8">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping"></div>
              <div className="absolute inset-4 border-2 border-primary/40 rounded-full animate-pulse"></div>
              <span className="material-symbols-outlined text-7xl text-primary drop-shadow-[0_0_15px_rgba(236,19,19,0.8)]">fingerprint</span>
              
              {/* Scanning line animation */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-40 h-1 bg-primary shadow-[0_0_10px_#ec1313] animate-[scan_2s_ease-in-out_infinite] opacity-80"></div>
           </div>
           
           <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white italic">{scanStatus}</h3>
           <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2 animate-pulse">Scanning Bio-Data...</p>

           <button 
             onClick={() => setIsBiometricScanning(false)}
             className="absolute bottom-12 text-[10px] font-black uppercase tracking-widest text-text-muted border border-white/10 px-6 py-3 rounded-full hover:bg-white/5"
           >
             Cancel Verification
           </button>

           <style>{`
             @keyframes scan {
               0%, 100% { top: 20%; }
               50% { top: 80%; }
             }
           `}</style>
        </div>
      )}

      {/* Forgot PIN Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end justify-center animate-in slide-in-from-bottom duration-300">
          <div className="bg-surface-dark w-full max-w-md rounded-t-[40px] border-t border-white/10 p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest italic">
                {forgotStep === 'verify' ? 'Identity Verification' : 'Reset Security PIN'}
              </h3>
              <button 
                onClick={() => { setShowForgot(false); setForgotStep('verify'); }} 
                className="text-text-muted hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {forgotStep === 'verify' ? (
              <form onSubmit={handleVerifyIdentity} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Work Email</label>
                  <input 
                    type="email" 
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="bg-background-dark/50 border-none rounded-2xl h-14 px-5 text-sm font-bold focus:ring-1 focus:ring-primary"
                    placeholder="Enter registered email"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Staff ID Code</label>
                  <input 
                    type="text" 
                    required
                    value={forgotId}
                    onChange={(e) => setForgotId(e.target.value)}
                    className="bg-background-dark/50 border-none rounded-2xl h-14 px-5 text-sm font-bold focus:ring-1 focus:ring-primary"
                    placeholder="e.g. EMP-8821"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl active:scale-[0.98] transition-all hover:bg-red-700 mt-2"
                >
                  Verify Technician
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">New 4-Digit PIN</label>
                  <input 
                    type="password" 
                    required
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="bg-background-dark/50 border-none rounded-2xl h-14 px-5 text-lg font-black tracking-[1em] text-center focus:ring-1 focus:ring-primary"
                    placeholder="••••"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Confirm New PIN</label>
                  <input 
                    type="password" 
                    required
                    maxLength={4}
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                    className="bg-background-dark/50 border-none rounded-2xl h-14 px-5 text-lg font-black tracking-[1em] text-center focus:ring-1 focus:ring-primary"
                    placeholder="••••"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full h-14 bg-emerald-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl active:scale-[0.98] transition-all hover:bg-emerald-700 mt-2"
                >
                  Update Security Credentials
                </button>
              </form>
            )}
            <div className="h-8" />
          </div>
        </div>
      )}

      <div className="p-8 text-center border-t border-white/5 bg-black/20">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
          v2.4.0 • Engineering Maintenance Portal
        </p>
      </div>
    </div>
  );
};

export default Login;
