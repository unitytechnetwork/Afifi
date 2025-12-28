
import React from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { MOCK_USER } from '../constants';

interface SettingsProps {
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  return (
    <div className="flex flex-col h-full bg-background-dark pb-32">
      <TopBar title="Settings" />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="p-4 flex flex-col gap-6">
          <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 flex items-center gap-4 shadow-sm">
            <div className="w-16 h-16 rounded-full border-2 border-primary bg-cover bg-center" style={{ backgroundImage: `url(${MOCK_USER.avatar})` }} />
            <div className="flex-1">
              <h2 className="font-bold text-lg">{MOCK_USER.name}</h2>
              <p className="text-text-muted text-sm font-medium">Lead Technician</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Synced • Online</span>
              </div>
            </div>
            <button className="text-primary hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">qr_code_2</span>
            </button>
          </div>

          <section>
            <h3 className="px-4 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2">Account</h3>
            <div className="bg-surface-dark rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
              {['Edit Profile', 'Privacy & Security'].map((item, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-background-dark flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">{i === 0 ? 'person' : 'lock'}</span>
                    </div>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                  <span className="material-symbols-outlined text-text-muted">chevron_right</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="px-4 text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-2">Preferences</h3>
            <div className="bg-surface-dark rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
              <div className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-background-dark flex items-center justify-center text-orange-500">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                  </div>
                  <span className="text-sm font-medium">Push Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-background-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-background-dark flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500/10">
                    <span className="material-symbols-outlined text-[20px]">sync</span>
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">Sync Settings</span>
                    <span className="text-[10px] text-text-muted">Last sync: 10 mins ago</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-muted">chevron_right</span>
              </button>
            </div>
          </section>

          <button 
            onClick={onLogout}
            className="w-full p-4 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm active:scale-[0.98] transition-all hover:bg-primary/20"
          >
            Log Out
          </button>

          <div className="flex flex-col items-center gap-2 opacity-30 mt-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined">build</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest">FireSafe Inspector Pro</p>
            <p className="text-[8px] font-bold">Version 2.4.0 Build 1024</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
