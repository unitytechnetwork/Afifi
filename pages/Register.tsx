
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('Initializing...');
  const [formData, setFormData] = useState({
    name: '',
    staffId: '',
    email: '',
    role: 'Technician' as 'Technician' | 'Supervisor',
    pin: '',
    confirmPin: '',
    enableBiometric: false
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.pin !== formData.confirmPin) {
      alert("Security PINs do not match.");
      return;
    }

    if (formData.pin.length !== 4) {
      alert("Security PIN must be exactly 4 digits.");
      return;
    }

    if (formData.enableBiometric) {
      startBiometricEnrollment();
    } else {
      finalizeRegistration();
    }
  };

  const startBiometricEnrollment = () => {
    setIsScanning(true);
    setScanStatus('Position Finger on Scanner...');
    
    setTimeout(() => {
      setScanStatus('Capturing Bio-Template...');
      setTimeout(() => {
        setScanStatus('Encrypting Signature...');
        setTimeout(() => {
          setScanStatus('Biometric Registered');
          setTimeout(() => {
            setIsScanning(false);
            finalizeRegistration();
          }, 800);
        }, 1200);
      }, 1500);
    }, 1000);
  };

  const finalizeRegistration = () => {
    const newUser = {
      id: formData.staffId,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.staffId}`,
      status: 'online',
      pin: formData.pin,
      hasBiometric: formData.enableBiometric
    };

    // Save to user registry
    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    const userExists = registry.some((u: any) => u.email === formData.email || u.id === formData.staffId);
    
    if (userExists) {
      alert("A user with this Email or Staff ID already exists.");
      return;
    }

    registry.push(newUser);
    localStorage.setItem('users_registry', JSON.stringify(registry));

    alert(`Registration successful! You are now registered as a ${formData.role}. Please log in.`);
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
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                value={formData.staffId}
                onChange={(e) => setFormData({...formData, staffId: e.target.value})}
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
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-transparent border-none focus:ring-0 text-white w-full text-sm font-bold placeholder-white/10"
                placeholder="name@bestro.com"
              />
              <span className="material-symbols-outlined text-text-muted text-sm">mail</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Job Role</label>
            <div className="flex items-center bg-[#2a1b1b] border border-border-dark rounded-xl px-4 h-12 focus-within:border-primary transition-colors">
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="bg-transparent border-none focus:ring-0 text-white w-full text-sm font-bold appearance-none"
              >
                <option value="Technician" className="bg-surface-dark">Technician (Field Auditor)</option>
                <option value="Supervisor" className="bg-surface-dark">Supervisor (Job Assigner)</option>
              </select>
              <span className="material-symbols-outlined text-text-muted text-sm">
                {formData.role === 'Supervisor' ? 'verified_user' : 'engineering'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Pin</label>
              <div className="flex items-center bg-[#2a1b1b] border border-border-dark rounded-xl px-4 h-12 focus-within:border-primary transition-colors">
                <input 
                  type="password" 
                  required
                  maxLength={4}
                  value={formData.pin}
                  onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})}
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
                  maxLength={4}
                  value={formData.confirmPin}
                  onChange={(e) => setFormData({...formData, confirmPin: e.target.value.replace(/\D/g, '')})}
                  className="bg-transparent border-none focus:ring-0 text-white w-full text-sm font-bold placeholder-white/10"
                  placeholder="••••"
                />
              </div>
            </div>
          </div>

          {/* Biometric Toggle Section */}
          <div className="bg-[#2a1b1b] p-4 rounded-xl border border-white/5 flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">fingerprint</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Biometric Setup</span>
                <span className="text-[8px] font-bold text-text-muted uppercase">Enable Fingerprint Login</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={formData.enableBiometric}
                onChange={(e) => setFormData({...formData, enableBiometric: e.target.checked})}
              />
              <div className="w-10 h-5 bg-background-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl mt-2">
            <p className="text-[9px] font-bold text-primary/80 uppercase tracking-widest leading-relaxed">
              Note: Account activation requires verification by the Technical Supervisor. Biometric data is encrypted locally.
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

      {/* Biometric Enrollment Simulation Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="relative w-48 h-48 flex items-center justify-center mb-8">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping"></div>
            <div className="absolute inset-4 border-2 border-primary/40 rounded-full animate-pulse"></div>
            <span className="material-symbols-outlined text-7xl text-primary drop-shadow-[0_0_15px_rgba(236,19,19,0.8)]">fingerprint</span>
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-40 h-1 bg-primary shadow-[0_0_10px_#ec1313] animate-[scan_2s_ease-in-out_infinite] opacity-80"></div>
          </div>
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white italic">{scanStatus}</h3>
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-2 animate-pulse">Encoding Bio-Structure...</p>
          <style>{`
             @keyframes scan {
               0%, 100% { top: 20%; }
               50% { top: 80%; }
             }
          `}</style>
        </div>
      )}

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
