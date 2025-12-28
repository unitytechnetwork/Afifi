
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface LightingUnit {
  id: string;
  location: string;
  test: 'Functional' | 'Failed';
  backup: 'Verified' | 'Low';
}

const LightingSystem: React.FC = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';
  const lightType = type || 'Emergency';

  const [items, setItems] = useState<LightingUnit[]>(() => {
    const saved = localStorage.getItem(`light_${lightType}_${auditId}`);
    return saved ? JSON.parse(saved) : [{ id: '1', location: '', test: 'Functional', backup: 'Verified' }];
  });

  useEffect(() => {
    localStorage.setItem(`light_${lightType}_${auditId}`, JSON.stringify(items));
  }, [items, auditId, lightType]);

  const updateItem = (itemId: string, updates: Partial<LightingUnit>) => {
    setItems(items.map(i => i.id === itemId ? { ...i, ...updates } : i));
  };

  const deleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title={`${lightType.toUpperCase()} LOG`} subtitle={`AUDIT #${auditId}`} showBack />

      <div className="p-4 flex flex-col gap-4">
         <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 mb-2">
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-relaxed italic">
               Note: Perform a 30-second manual discharge test to verify battery integrity.
            </p>
         </div>

         {items.map((item, idx) => (
           <div key={item.id} className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-4 relative group">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                 <span className="text-[9px] font-black text-text-muted uppercase italic">Unit Log #{idx + 1}</span>
                 <button onClick={() => deleteItem(item.id)} className="text-text-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                    <span className="material-symbols-outlined text-sm">delete</span>
                 </button>
              </div>
              <div className="flex flex-col gap-1">
                 <label className="text-[7px] font-black text-text-muted uppercase tracking-widest ml-1">Installation Location</label>
                 <input 
                   type="text" 
                   value={item.location}
                   onChange={(e) => updateItem(item.id, { location: e.target.value })}
                   className="bg-background-dark/50 border-none rounded-xl h-10 px-3 text-xs font-bold text-white focus:ring-1 focus:ring-primary" 
                   placeholder="e.g. Exit Door B" 
                 />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="flex flex-col gap-1">
                    <label className="text-[7px] font-black text-text-muted uppercase tracking-widest ml-1">Test Outcome</label>
                    <button 
                      onClick={() => updateItem(item.id, { test: item.test === 'Functional' ? 'Failed' : 'Functional' })}
                      className={`h-9 rounded-lg bg-background-dark/50 text-[8px] font-black uppercase border transition-all ${item.test === 'Functional' ? 'border-emerald-500/20 text-emerald-500' : 'border-primary/20 text-primary animate-pulse'}`}
                    >
                      {item.test}
                    </button>
                 </div>
                 <div className="flex flex-col gap-1">
                    <label className="text-[7px] font-black text-text-muted uppercase tracking-widest ml-1">Backup Verify</label>
                    <button 
                      onClick={() => updateItem(item.id, { backup: item.backup === 'Verified' ? 'Low' : 'Verified' })}
                      className={`h-9 rounded-lg bg-background-dark/50 text-[8px] font-black uppercase border transition-all ${item.backup === 'Verified' ? 'border-emerald-500/20 text-emerald-500' : 'border-primary/20 text-primary animate-pulse'}`}
                    >
                      {item.backup}
                    </button>
                 </div>
              </div>
           </div>
         ))}

         <button 
           onClick={() => setItems([...items, { id: Date.now().toString(), location: '', test: 'Functional', backup: 'Verified' }])}
           className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-text-muted hover:text-primary hover:border-primary/30 transition-all"
        >
           <span className="material-symbols-outlined text-sm">add_circle</span>
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add {lightType} Unit</span>
        </button>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-surface-dark border-t border-white/5 p-5 pb-10 z-50">
         <button onClick={() => navigate(`/checklist/${auditId}`)} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-2xl active:scale-[0.98] transition-all">
            Commit {lightType} Audit
         </button>
      </div>
    </div>
  );
};

export default LightingSystem;
