
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { MOCK_USER } from '../constants';
import { sendLocalNotification } from '../components/NotificationManager';

interface SettingsProps {
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : MOCK_USER;
  });

  const [securityPrefs, setSecurityPrefs] = useState(() => {
    const saved = localStorage.getItem('security_prefs');
    return saved ? JSON.parse(saved) : {
      biometrics: user.hasBiometric || false,
      clearOnLogout: false,
      securityPin: user.pin || '1234'
    };
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('app_notifications_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('10 mins ago');
  const [showQR, setShowQR] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  
  const [editName, setEditName] = useState(user.name);
  const [editId, setEditId] = useState(user.id);
  const [editPin, setEditPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleNotificationToggle = () => {
    const newVal = !notifications;
    setNotifications(newVal);
    localStorage.setItem('app_notifications_enabled', JSON.stringify(newVal));
    
    if (newVal && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  };

  const handleTestNotification = () => {
    if (!("Notification" in window)) {
      alert("Browser anda tidak menyokong notifikasi.");
      return;
    }

    if (Notification.permission === "denied") {
      alert("Akses notifikasi telah disekat (Blocked). Sila benarkan akses dalam tetapan browser anda.");
      return;
    }

    sendLocalNotification(
      "Bestro System Test",
      "Sistem notifikasi Bestro Engineering berfungsi dengan sempurna! Unit sedia untuk operasi."
    );
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      setLastSync(`Today at ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
      alert("Database synchronized with Engineering Cloud.");
    }, 2000);
  };

  const handleSaveProfile = () => {
    const newUser = { ...user, name: editName, id: editId };
    setUser(newUser);
    localStorage.setItem('current_user', JSON.stringify(newUser));
    setShowEdit(false);
  };

  const handleSaveSecurity = () => {
    if (editPin.length !== 4) {
      alert("Security Error: New PIN must be exactly 4 digits.");
      return;
    }

    if (editPin !== confirmPin) {
      alert("Validation Error: PIN confirmation does not match.");
      return;
    }

    const updatedUser = { ...user, pin: editPin };
    
    setUser(updatedUser);
    localStorage.setItem('current_user', JSON.stringify(updatedUser));
    localStorage.setItem('last_user', JSON.stringify(updatedUser));

    const newPrefs = { ...securityPrefs, securityPin: editPin };
    setSecurityPrefs(newPrefs);
    localStorage.setItem('security_prefs', JSON.stringify(newPrefs));
    
    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    const userIndex = registry.findIndex((u: any) => 
      String(u.id) === String(updatedUser.id) || 
      u.email === updatedUser.email
    );
    
    if (userIndex > -1) {
      registry[userIndex].pin = editPin;
      localStorage.setItem('users_registry', JSON.stringify(registry));
    } else {
      registry.push(updatedUser);
      localStorage.setItem('users_registry', JSON.stringify(registry));
    }

    setShowSecurity(false);
    setEditPin('');
    setConfirmPin('');
    alert("SYSTEM: Security credentials updated and synchronized.");
  };

  const updateSecurityToggle = (key: keyof typeof securityPrefs) => {
    const newValue = !securityPrefs[key];
    const newPrefs = { ...securityPrefs, [key]: newValue };
    setSecurityPrefs(newPrefs);
    localStorage.setItem('security_prefs', JSON.stringify(newPrefs));

    if (key === 'biometrics') {
      const updatedUser = { ...user, hasBiometric: newValue };
      setUser(updatedUser);
      localStorage.setItem('current_user', JSON.stringify(updatedUser));
      localStorage.setItem('last_user', JSON.stringify(updatedUser));

      const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
      const userIndex = registry.findIndex((u: any) => String(u.id) === String(updatedUser.id) || u.email === updatedUser.email);
      if (userIndex > -1) {
        registry[userIndex].hasBiometric = newValue;
        localStorage.setItem('users_registry', JSON.stringify(registry));
      }
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Avatar = reader.result as string;
        const newUser = { ...user, avatar: base64Avatar };
        setUser(newUser);
        localStorage.setItem('current_user', JSON.stringify(newUser));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoutAction = () => {
    if (securityPrefs.clearOnLogout) {
      const auditKeys = Object.keys(localStorage).filter(key => 
        key.includes('AUDIT') || 
        key.includes('checklist_') || 
        key.includes('setup_')
      );
      auditKeys.forEach(key => localStorage.removeItem(key));
    }
    localStorage.removeItem('current_user');
    onLogout();
  };

  const handleSystemReset = () => {
    const confirm = window.confirm("SYSTEM RESET: This will delete ALL stored data. Proceed?");
    if (confirm) {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-dark pb-32">
      <TopBar title="Settings" subtitle="System Configuration" />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-4 flex flex-col gap-6">
          <div className="bg-surface-dark p-5 rounded-3xl border border-white/5 flex items-center gap-4 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            
            <div 
              onClick={handleAvatarClick}
              className="w-16 h-16 rounded-full border-2 border-primary bg-surface-dark bg-cover bg-center shadow-lg shrink-0 relative cursor-pointer overflow-hidden group/avatar active:scale-95 transition-all" 
              style={{ backgroundImage: `url(${user.avatar})` }} 
            >
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-white text-sm">photo_camera</span>
              </div>
              <input 
                type="file" 
                ref={avatarInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange} 
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg truncate uppercase tracking-tight">{user.name}</h2>
              <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">{user.role} • ID: {user.id}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${securityPrefs.biometrics ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">
                  {securityPrefs.biometrics ? 'Biometric Active' : 'PIN Access Only'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setShowQR(true)}
              className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all active:scale-90"
            >
              <span className="material-symbols-outlined">qr_code_2</span>
            </button>
          </div>

          <section>
            <h3 className="px-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 italic">Security Hub</h3>
            <div className="bg-surface-dark rounded-3xl border border-white/5 divide-y divide-white/5 overflow-hidden shadow-xl">
              <button 
                onClick={() => {
                  setEditName(user.name);
                  setEditId(user.id);
                  setShowEdit(true);
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-background-dark flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-tight">Identity Details</span>
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
              
              <button 
                onClick={() => {
                  setEditPin('');
                  setConfirmPin('');
                  setShowSecurity(true);
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-background-dark flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs font-bold uppercase tracking-tight">PIN & Biometrics</span>
                    <span className="text-[7px] font-black text-primary uppercase tracking-widest">Manage Authorization</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          </section>

          <section>
            <h3 className="px-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 italic">App Configuration</h3>
            <div className="bg-surface-dark rounded-3xl border border-white/5 divide-y divide-white/5 overflow-hidden shadow-xl">
              <div className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-background-dark flex items-center justify-center text-amber-500">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-tight">Push Notifications</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleTestNotification}
                    className="px-2 py-1 bg-white/5 rounded text-[8px] font-black uppercase text-text-muted hover:text-white"
                  >
                    Send Test
                  </button>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications} 
                      onChange={handleNotificationToggle}
                    />
                    <div className="w-10 h-5 bg-background-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl bg-background-dark flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/10 ${isSyncing ? 'animate-spin' : ''}`}>
                    <span className="material-symbols-outlined text-[20px]">sync</span>
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs font-bold uppercase tracking-tight">Sync Cloud Data</span>
                    <span className="text-[7px] font-black text-text-muted uppercase tracking-widest italic">Status: {lastSync}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-muted">chevron_right</span>
              </button>
            </div>
          </section>

          <section>
            <h3 className="px-4 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 italic">System Control</h3>
            <div className="bg-surface-dark rounded-3xl border border-white/5 divide-y divide-white/5 overflow-hidden shadow-xl">
              <button 
                onClick={handleLogoutAction}
                className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-background-dark flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-tight text-white">Log Out</span>
                </div>
                <span className="material-symbols-outlined text-text-muted">chevron_right</span>
              </button>

              <button 
                onClick={handleSystemReset}
                className="w-full flex items-center justify-between p-4 hover:bg-red-900/10 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-background-dark flex items-center justify-center text-red-800">
                    <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-tight text-red-600">Factory Reset</span>
                </div>
                <span className="material-symbols-outlined text-red-900/50">chevron_right</span>
              </button>
            </div>
          </section>

          <div className="flex flex-col items-center gap-2 opacity-30 mt-6 pb-12">
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">Bestro Maintenance OS v2.4</p>
          </div>
        </div>
      </div>

      {showSecurity && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-end justify-center animate-in slide-in-from-bottom duration-300">
           <div className="bg-surface-dark w-full max-w-md rounded-t-[40px] border-t border-white/10 p-8 flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest italic text-primary">Security Replacement</h3>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">Ganti PIN & Tetapan Biometrik</p>
                 </div>
                 <button onClick={() => setShowSecurity(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>
              
              <div className="flex flex-col gap-6">
                 <div className="bg-background-dark/30 p-5 rounded-3xl border border-white/5 flex items-center justify-between transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${securityPrefs.biometrics ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/5 text-text-muted'}`}>
                          <span className="material-symbols-outlined text-2xl">fingerprint</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-xs font-bold uppercase tracking-tight text-white">Biometric Auth</span>
                          <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">{securityPrefs.biometrics ? 'Biometrics Enabled' : 'PIN Required Only'}</span>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={securityPrefs.biometrics} 
                        onChange={() => updateSecurityToggle('biometrics')}
                      />
                      <div className="w-12 h-6 bg-background-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                    </label>
                 </div>

                 <div className="flex flex-col gap-4">
                    <div className="bg-background-dark/30 p-5 rounded-3xl border border-white/5 flex flex-col gap-3">
                       <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary text-lg">lock</span>
                          <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">New 4-Digit PIN</label>
                       </div>
                       
                       <div className="relative flex justify-center gap-3 py-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div 
                              key={i} 
                              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                                editPin.length > i ? 'border-primary text-white bg-primary/10' : 'border-white/10 text-white/5'
                              }`}
                            >
                               {editPin[i] ? '•' : ''}
                            </div>
                          ))}
                          <input 
                            type="tel"
                            maxLength={4}
                            value={editPin}
                            onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ''))}
                            className="absolute inset-0 opacity-0 w-full cursor-pointer h-full"
                          />
                       </div>
                    </div>

                    <div className={`bg-background-dark/30 p-5 rounded-3xl border transition-all ${editPin.length === 4 ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                       <div className="flex items-center gap-3 mb-3">
                          <span className="material-symbols-outlined text-primary text-lg">verified_user</span>
                          <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Confirm New PIN</label>
                       </div>
                       
                       <div className="relative flex justify-center gap-3 py-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div 
                              key={i} 
                              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                                confirmPin.length > i 
                                  ? (confirmPin === editPin ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-primary text-primary bg-primary/10')
                                  : 'border-white/10 text-white/5'
                              }`}
                            >
                               {confirmPin[i] ? '•' : ''}
                            </div>
                          ))}
                          <input 
                            type="tel"
                            maxLength={4}
                            disabled={editPin.length !== 4}
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                            className="absolute inset-0 opacity-0 w-full cursor-pointer h-full"
                          />
                       </div>
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleSaveSecurity}
                disabled={editPin.length !== 4 || confirmPin !== editPin}
                className={`w-full h-16 font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl transition-all border border-white/10 mt-4 ${
                  editPin.length === 4 && confirmPin === editPin 
                    ? 'bg-primary text-white hover:bg-red-700 active:scale-[0.98]' 
                    : 'bg-white/5 text-white/20'
                }`}
              >
                Ganti Security PIN
              </button>
              <div className="h-10" />
           </div>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-surface-dark w-full max-w-xs p-8 rounded-[40px] border border-white/10 flex flex-col items-center gap-6 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Credential Token</h3>
            <div className="bg-white p-6 rounded-3xl shadow-inner">
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TECH-${user.id}`} 
                 alt="QR Code" 
                 className="w-48 h-48"
               />
            </div>
            <button onClick={() => setShowQR(false)} className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white">Close</button>
          </div>
        </div>
      )}

      {showEdit && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end justify-center animate-in slide-in-from-bottom duration-300">
           <div className="bg-surface-dark w-full max-w-md rounded-t-[40px] border-t border-white/10 p-8 flex flex-col gap-6 shadow-2xl">
              <div className="flex justify-between items-center">
                 <h3 className="text-sm font-black uppercase tracking-widest italic text-primary">Edit Identity</h3>
                 <button onClick={() => setShowEdit(false)} className="text-text-muted hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>
              <div className="flex flex-col gap-4">
                 <input 
                   type="text" 
                   value={editName}
                   onChange={(e) => setEditName(e.target.value)}
                   className="bg-background-dark/50 border-white/5 border rounded-2xl h-14 px-5 text-sm font-bold text-white focus:ring-1 focus:ring-primary"
                   placeholder="Name"
                 />
                 <input 
                   type="text" 
                   value={editId}
                   onChange={(e) => setEditId(e.target.value)}
                   className="bg-background-dark/50 border-white/5 border rounded-2xl h-14 px-5 text-sm font-bold text-white focus:ring-1 focus:ring-primary"
                   placeholder="Staff ID"
                 />
              </div>
              <button onClick={handleSaveProfile} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl active:scale-[0.98]">Update Profile</button>
              <div className="h-8" />
           </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Settings;
