
import React from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { USERS_LIST } from '../constants';

const UserManagement: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-background-dark pb-32">
      <TopBar title="User Management" />

      <div className="p-4 flex flex-col gap-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search technicians, supervisors..."
            className="w-full bg-surface-dark border-border-dark rounded-xl h-12 pl-10 pr-4 text-sm focus:ring-primary focus:border-primary"
          />
          <span className="material-symbols-outlined absolute left-3 top-3 text-text-muted">search</span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">All Users ({USERS_LIST.length})</h3>
            <button className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline transition-all">Filter</button>
          </div>

          <div className="flex flex-col gap-2">
            {USERS_LIST.map((user) => (
              <div key={user.id} className="bg-surface-dark p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatar})` }} />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-dark ${user.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm truncate">{user.name}</h4>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded text-white ${
                      user.role === 'Admin' ? 'bg-primary' : 
                      user.role === 'Supervisor' ? 'bg-blue-600' : 'bg-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted truncate mt-0.5">ID: {user.id} • {user.email}</p>
                </div>
                <button className="text-text-muted p-1"><span className="material-symbols-outlined">more_vert</span></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="fixed bottom-24 right-5 bg-primary text-white h-14 pl-5 pr-6 rounded-full shadow-2xl flex items-center gap-2 z-40 active:scale-95 transition-all font-bold text-sm uppercase tracking-wider border-4 border-background-dark">
        <span className="material-symbols-outlined">add</span>
        <span>Add User</span>
      </button>

      <BottomNav />
    </div>
  );
};

export default UserManagement;
