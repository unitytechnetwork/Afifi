
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { MOCK_USER } from '../constants';

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
      biometrics: true,
      clearOnLogout: false,
      securityPin: user.pin || '1234'
    };
  });

  const [notifications, setNotifications] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState('10 mins ago');
  const [showQR, setShowQR] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  
  const [editName, setEditName] = useState(user.name);
  const [editId, setEditId] = useState(user.id);
  const [editPin, setEditPin] = useState(securityPrefs.securityPin);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);

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
      alert("Security PIN must be exactly 4 digits.");
      return;
    }

    // 1. Update Security Prefs (Global Device Level)
    const newPrefs = { ...securityPrefs, securityPin: editPin };
    setSecurityPrefs(newPrefs);
    localStorage.setItem('security_prefs', JSON.stringify(newPrefs));
    
    // 2. Update Current Active User State & Storage
    const updatedUser = { ...user, pin: editPin };
    setUser(updatedUser);
    localStorage.setItem('current_user', JSON.stringify(updatedUser));
    
    // 3. Update Last User Cache (Crucial for Biometric/Quick Login)
    localStorage.setItem('last_user', JSON.stringify(updatedUser));

    // 4. Update the Master Registry (For manual Login lookup)
    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    const userIndex = registry.findIndex((u: any) => String(u.id) === String(updatedUser.id));
    
    if (userIndex > -1) {
      registry[userIndex].pin = editPin;
      localStorage.setItem('users_registry', JSON.stringify(registry));
    } else {
      // If user isn't in registry yet (e.g. first login), add them now
      registry.push(updatedUser);
      localStorage.setItem('users_registry', JSON.stringify(registry));
    }

    setShowSecurity(false);
    alert("SYSTEM: Security PIN has been successfully replaced.");
  };

  const updateSecurityToggle = (key: keyof typeof securityPrefs) => {
    const newPrefs = { ...securityPrefs, [key]: !securityPrefs[key] };
    setSecurityPrefs(newPrefs);
    localStorage.setItem('security_prefs', JSON.stringify(newPrefs));
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
    const confirm = window.confirm("SYSTEM RESET: This will delete ALL stored data, including user accounts and saved reports. This action cannot be undone. Proceed?");
    if (confirm) {
      const doubleCheck = window.confirm("Final Warning: Are you absolutely sure you want to factory reset the application?");
      if (doubleCheck) {
        localStorage.clear();
        alert("System storage cleared. The app will now return to the login screen.");
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-dark pb-32">
      <TopBar title="Settings" subtitle="System Configuration" />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-4 flex flex-col gap-6">
          {/* Profile Card */}
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
                <div className={`w-1.5 h-1.5 rounded-full bg-emerald-500`} />
                <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">
                  Secure Access Active
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

          {/* Account Section */}
          <section>
            <h3 className="px-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 italic">Maintenance Account</h3>
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
                  <span className="text-xs font-bold uppercase tracking-tight">Profile Identity</span>
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
              
              <button 
                onClick={() => {
                  setEditPin(securityPrefs.securityPin);
                  setShowSecurity(true);
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-background-dark flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">security</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold uppercase tracking-tight">PIN & Biometrics</span>
                    <span className="text-[7px] font-black text-primary uppercase tracking-widest">Update Security Code</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          </section>

          {/* App Settings Section */}
          <section>
            <h3 className="px-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 italic">App Preferences</h3>
            <div className="bg-surface-dark rounded-3xl border border-white/5 divide-y divide-white/5 overflow-hidden shadow-xl">
              <div className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-background-dark flex items-center justify-center text-amber-500">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-tight">Push Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notifications} 
                    onChange={() => setNotifications(!notifications)}
                  />
                  <div className="w-10 h-5 bg-background-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group disabled:opacity-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl bg-background-dark flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/10 ${isSyncing ? 'animate-spin' : ''}`}>
                    <span className="material-symbols-outlined text-[20px]">cloud_sync</span>
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xs font-bold uppercase tracking-tight">Manual Data Sync</span>
                    <span className="text-[7px] font-black text-text-muted uppercase tracking-widest italic">Last: {lastSync}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          </section>

          {/* SYSTEM CONTROL SECTION */}
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
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold uppercase tracking-tight text-white">System Logout</span>
                    <span className="text-[7px] font-black text-text-muted uppercase tracking-widest">Terminate Current Session</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-muted group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>

              <button 
                onClick={handleSystemReset}
                className="w-full flex items-center justify-between p-4 hover:bg-red-900/10 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-background-dark flex items-center justify-center text-red-800">
                    <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold uppercase tracking-tight text-red-600">System Wipe / Reset</span>
                    <span className="text-[7px] font-black text-text-muted uppercase tracking-widest">Clear All App Data & Cache</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-red-900/50 group-hover:translate-x-1 transition-transform">chevron_right</span>
              </button>
            </div>
          </section>

          <div className="flex flex-col items-center gap-2 opacity-30 mt-6 pb-12">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <span className="material-symbols-outlined text-xl text-primary">terminal</span>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em]">Bestro Maintenance OS v2.4</p>
            <p className="text-[7px] font-bold">Secure Local Environment • Build 2405</p>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-surface-dark w-full max-w-xs p-8 rounded-[40px] border border-white/10 flex flex-col items-center gap-6 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Technician ID Card</h3>
            <div className="bg-white p-6 rounded-3xl shadow-inner">
               <img 
                 src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TECH-${user.id}-${user.name.replace(/ /g, '_')}`} 
                 alt="QR Code" 
                 className="w-48 h-48"
               />
            </div>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-tight">{user.name}</p>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">Authorized Engineering Staff</p>
            </div>
            <button 
              onClick={() => setShowQR(false)}
              className="w-full py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              Close ID
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
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
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Staff Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-background-dark/50 border-white/5 border rounded-2xl h-14 px-5 text-sm font-bold text-white focus:ring-1 focus:ring-primary"
                    />
                 </div>
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Employee ID Code</label>
                    <input 
                      type="text" 
                      value={editId}
                      onChange={(e) => setEditId(e.target.value)}
                      className="bg-background-dark/50 border-white/5 border rounded-2xl h-14 px-5 text-sm font-bold text-white focus:ring-1 focus:ring-primary"
                    />
                 </div>
              </div>

              <button 
                onClick={handleSaveProfile}
                className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl active:scale-[0.98] transition-all hover:bg-red-700 mt-2"
              >
                Update Profile
              </button>
              <div className="h-8" />
           </div>
        </div>
      )}

      {/* Privacy & Security Modal */}
      {showSecurity && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end justify-center animate-in slide-in-from-bottom duration-300">
           <div className="bg-surface-dark w-full max-w-md rounded-t-[40px] border-t border-white/10 p-8 flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest italic text-primary">Security Hub</h3>
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">Replace System PIN</p>
                 </div>
                 <button onClick={() => setShowSecurity(false)} className="text-text-muted hover:text-white transition-colors">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>
              
              <div className="flex flex-col gap-5">
                 <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center mb-1">
                       <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">New Security PIN</label>
                       <span className="text-[8px] font-bold text-primary uppercase tracking-widest">Must be 4-Digits</span>
                    </div>
                    
                    <div className="relative flex justify-center gap-3 py-2">
                       {[0, 1, 2, 3].map((i) => (
                         <div 
                           key={i} 
                           className={`w-14 h-16 rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all ${
                             editPin.length > i ? 'border-primary text-white bg-primary/10 shadow-lg' : 'border-white/10 text-white/10'
                           }`}
                         >
                            {editPin[i] ? '•' : ''}
                         </div>
                       ))}
                       <input 
                         type="tel"
                         autoFocus
                         maxLength={4}
                         value={editPin}
                         onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ''))}
                         className="absolute inset-0 opacity-0 w-full cursor-pointer h-full"
                       />
                    </div>
                 </div>

                 <div className="bg-background-dark/30 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                       <span className="material-symbols-outlined text-primary">fingerprint</span>
                       <span className="text-xs font-bold uppercase tracking-tight">Biometric Login</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={securityPrefs.biometrics} 
                        onChange={() => updateSecurityToggle('biometrics')}
                      />
                      <div className="w-10 h-5 bg-background-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                 </div>

                 <div className="bg-background-dark/30 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3">
                       <span className="material-symbols-outlined text-primary">auto_delete</span>
                       <span className="text-xs font-bold uppercase tracking-tight text-white">Auto-Wipe on Logout</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={securityPrefs.clearOnLogout} 
                        onChange={() => updateSecurityToggle('clearOnLogout')}
                      />
                      <div className="w-10 h-5 bg-background-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                 </div>
              </div>

              <button 
                onClick={handleSaveSecurity}
                className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl active:scale-[0.98] transition-all hover:bg-red-700 mt-2"
              >
                Replace Security PIN
              </button>
              <div className="h-8" />
           </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Settings;
