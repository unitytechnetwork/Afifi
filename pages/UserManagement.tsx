
import React, { useState, useEffect, useMemo } from 'react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { USERS_LIST } from '../constants';
import { User } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // New User Form State
  const [newUser, setNewUser] = useState({
    name: '',
    id: '',
    email: '',
    role: 'Technician' as 'Technician' | 'Supervisor',
    pin: '1234'
  });

  // Load and merge users from registry and defaults
  useEffect(() => {
    const loadUsers = () => {
      try {
        const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
        const combined = [...registry, ...USERS_LIST];
        // Deduplicate by ID
        const uniqueUsers = Array.from(
          new Map(combined.map(u => [String(u.id), u])).values()
        );
        setUsers(uniqueUsers);
      } catch (e) {
        setUsers(USERS_LIST);
      }
    };
    loadUsers();
  }, [refreshTrigger]);

  // Search logic
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.id || !newUser.email) {
      alert("Missing Information: Please fill all required fields.");
      return;
    }

    const userObj: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.id}`,
      status: 'offline'
    };

    try {
      const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
      if (registry.some((u: any) => String(u.id) === String(userObj.id))) {
        alert("ID Conflict: This Staff ID is already registered.");
        return;
      }
      
      registry.push({ ...userObj, pin: newUser.pin });
      localStorage.setItem('users_registry', JSON.stringify(registry));
      
      setShowAddModal(false);
      setNewUser({ name: '', id: '', email: '', role: 'Technician', pin: '1234' });
      setRefreshTrigger(prev => prev + 1);
      alert("Success: New team member added to registry.");
    } catch (e) {
      alert("Storage Error: Failed to save user.");
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === '8821') { // Protection for main admin/mock
      alert("Access Denied: Cannot delete root administrator.");
      return;
    }

    if (window.confirm("Confirm Deletion: Remove this user from the engineering registry?")) {
      const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
      const updated = registry.filter((u: any) => String(u.id) !== String(userId));
      localStorage.setItem('users_registry', JSON.stringify(updated));
      setRefreshTrigger(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-dark pb-32">
      <TopBar title="User Management" subtitle="Personnel Directory" />

      <div className="p-4 flex flex-col gap-6 overflow-y-auto no-scrollbar">
        {/* Search Header */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-text-muted group-focus-within:text-primary transition-colors text-xl">search</span>
          </div>
          <input 
            type="text" 
            placeholder="Search by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-dark border-white/5 border rounded-2xl h-14 pl-12 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary focus:border-primary transition-all text-white placeholder:opacity-20 shadow-xl"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] italic">Engineering Resource List ({filteredUsers.length})</h3>
            <div className="flex gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[8px] font-black uppercase text-emerald-500 tracking-widest">Registry Sync Active</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <div key={user.id} className="bg-surface-dark p-4 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-white/20 transition-all shadow-lg group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-background-dark bg-cover bg-center border-2 border-white/5 shadow-inner" style={{ backgroundImage: `url(${user.avatar})` }}>
                    {!user.avatar && <span className="material-symbols-outlined text-white/10 flex items-center justify-center h-full">person</span>}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-surface-dark ${user.status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-600'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-bold text-sm truncate uppercase tracking-tight">{user.name}</h4>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-md text-white tracking-widest uppercase ${
                      user.role === 'Admin' ? 'bg-primary' : 
                      user.role === 'Supervisor' ? 'bg-blue-600' : 'bg-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[9px] text-text-muted font-black uppercase tracking-widest truncate">ID: {user.id} • {user.email}</p>
                </div>

                <button 
                  onClick={() => handleDeleteUser(user.id)}
                  className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 rounded-xl transition-all active:scale-90"
                >
                  <span className="material-symbols-outlined text-xl">delete_outline</span>
                </button>
              </div>
            )) : (
              <div className="py-20 text-center opacity-20 flex flex-col items-center">
                 <span className="material-symbols-outlined text-5xl mb-2">person_search</span>
                 <p className="text-[10px] font-black uppercase tracking-widest">No matching personnel found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-5 bg-primary text-white h-16 w-16 rounded-2xl shadow-[0_10px_30px_rgba(236,19,19,0.3)] flex flex-col items-center justify-center z-40 active:scale-90 transition-all border-4 border-background-dark"
      >
        <span className="material-symbols-outlined text-2xl">person_add</span>
        <span className="text-[7px] font-black uppercase tracking-widest">Add User</span>
      </button>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-end justify-center animate-in slide-in-from-bottom duration-300">
           <div className="bg-surface-dark w-full max-w-md rounded-t-[40px] border-t border-white/10 p-8 flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-sm font-black uppercase tracking-widest italic text-primary">Enroll Personnel</h3>
                    <p className="text-[9px] text-text-muted font-black uppercase mt-1 tracking-widest">Access Control System</p>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>
              
              <form onSubmit={handleAddUser} className="flex flex-col gap-4 pb-10">
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="bg-background-dark/50 border-white/5 border rounded-2xl h-14 px-5 text-sm font-bold focus:ring-1 focus:ring-primary text-white"
                      placeholder="e.g. Ahmad Kamal"
                    />
                 </div>

                 <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Staff ID / Code</label>
                    <input 
                      type="text" 
                      required
                      value={newUser.id}
                      onChange={(e) => setNewUser({...newUser, id: e.target.value})}
                      className="bg-background-dark/50 border-white/5 border rounded-2xl h-14 px-5 text-sm font-bold focus:ring-1 focus:ring-primary text-white"
                      placeholder="e.g. EMP-9900"
                    />
                 </div>

                 <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Work Email</label>
                    <input 
                      type="email" 
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="bg-background-dark/50 border-white/5 border rounded-2xl h-14 px-5 text-sm font-bold focus:ring-1 focus:ring-primary text-white"
                      placeholder="name@bestro.com"
                    />
                 </div>

                 <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Operational Role</label>
                    <select 
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value as any})}
                      className="bg-background-dark/50 border-white/5 border rounded-2xl h-14 px-5 text-sm font-bold focus:ring-1 focus:ring-primary text-white appearance-none"
                    >
                       <option value="Technician" className="bg-surface-dark">Technician (Field Tech)</option>
                       <option value="Supervisor" className="bg-surface-dark">Supervisor (Admin)</option>
                    </select>
                 </div>

                 <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Initial Security PIN (4-Digits)</label>
                    <input 
                      type="password" 
                      maxLength={4}
                      value={newUser.pin}
                      onChange={(e) => setNewUser({...newUser, pin: e.target.value.replace(/\D/g, '')})}
                      className="bg-background-dark/50 border-white/5 border rounded-2xl h-14 px-5 text-sm font-black tracking-[1em] focus:ring-1 focus:ring-primary text-white text-center"
                    />
                 </div>

                 <button 
                   type="submit"
                   className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl active:scale-[0.98] transition-all mt-4 border border-white/10"
                 >
                   Authorize & Add Member
                 </button>
              </form>
           </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default UserManagement;
