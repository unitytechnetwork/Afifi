
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BestroLogoSVG } from './Login';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    name: '', staffId: '', email: '', role: 'Technician' as 'Technician' | 'Supervisor', pin: '', confirmPin: '', enableBiometric: false
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pin !== formData.confirmPin || formData.pin.length !== 4) {
      alert("Invalid PIN.");
      return;
    }
    if (formData.enableBiometric) {
      setIsScanning(true);
      setTimeout(() => {
        setIsScanning(false);
        finalizeRegistration();
      }, 3000);
    } else {
      finalizeRegistration();
    }
  };

  const finalizeRegistration = () => {
    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    registry.push({ ...formData, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.staffId}`, status: 'online', hasBiometric: formData.enableBiometric });
    localStorage.setItem('users_registry', JSON.stringify(registry));
    alert(`Registration successful!`);
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-[#181111] overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.05]" 
        style={{ backgroundImage: 'radial-gradient(#ec1313 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}>
      </div>
      
      <div className="flex-1 flex flex-col p-8 gap-8 relative z-10 overflow-y-auto no-scrollbar pt-12">
        <div className="flex flex-col items-center gap-2">
          <BestroLogoSVG className="h-28 drop-shadow-[0_0_15px_rgba(236,19,19,0.3)]" />
          <div className="text-center mt-4">
            <h1 className="text-2xl font-black italic uppercase text-white">Enrollment</h1>
            <p className="text-text-muted text-[10px] font-black uppercase mt-1">Maintenance Registry</p>
          </div>
        </div>

        <form className="w-full flex flex-col gap-4" onSubmit={handleRegister}>
          <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-[#2a1b1b] border-none rounded-xl h-12 px-4 text-sm text-white" placeholder="Name" />
          <input type="text" required value={formData.staffId} onChange={(e) => setFormData({...formData, staffId: e.target.value})} className="bg-[#2a1b1b] border-none rounded-xl h-12 px-4 text-sm text-white" placeholder="Staff ID" />
          <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="bg-[#2a1b1b] border-none rounded-xl h-12 px-4 text-sm text-white" placeholder="Email" />
          
          <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as any})} className="bg-[#2a1b1b] border-none rounded-xl h-12 px-4 text-sm text-white">
            <option value="Technician">Technician</option>
            <option value="Supervisor">Supervisor</option>
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input type="password" required maxLength={4} value={formData.pin} onChange={(e) => setFormData({...formData, pin: e.target.value.replace(/\D/g, '')})} className="bg-[#2a1b1b] border-none rounded-xl h-12 px-4 text-center font-black" placeholder="PIN" />
            <input type="password" required maxLength={4} value={formData.confirmPin} onChange={(e) => setFormData({...formData, confirmPin: e.target.value.replace(/\D/g, '')})} className="bg-[#2a1b1b] border-none rounded-xl h-12 px-4 text-center font-black" placeholder="Confirm" />
          </div>

          <div className="bg-[#2a1b1b] p-4 rounded-xl flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-white">Enable Biometric</span>
            <input type="checkbox" checked={formData.enableBiometric} onChange={(e) => setFormData({...formData, enableBiometric: e.target.checked})} className="accent-primary h-5 w-5" />
          </div>

          <button type="submit" className="w-full bg-primary text-white font-black uppercase py-4 rounded-xl mt-2">Request Enrollment</button>
          <button type="button" onClick={() => navigate('/login')} className="w-full text-[10px] font-black uppercase text-text-muted mt-2">Already Registered? Sign In</button>
        </form>
      </div>

      {isScanning && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in">
          <span className="material-symbols-outlined text-7xl text-primary animate-pulse">fingerprint</span>
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white mt-4 italic">Position Finger...</h3>
        </div>
      )}
    </div>
  );
};

export default Register;
