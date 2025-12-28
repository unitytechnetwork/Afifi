
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface Extinguisher {
  id: string;
  serial: string;
  type: string;
  expiry: string;
  pressure: 'Normal' | 'Low';
  pin: 'Intact' | 'Broken';
}

const FireExtinguisher: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';

  const [items, setItems] = useState<Extinguisher[]>(() => {
    const saved = localStorage.getItem(`extinguisher_${auditId}`);
    return saved ? JSON.parse(saved) : [{ id: '1', serial: '', type: 'ABC Powder', expiry: '', pressure: 'Normal', pin: 'Intact' }];
  });

  useEffect(() => {
    localStorage.setItem(`extinguisher_${auditId}`, JSON.stringify(items));
  }, [items, auditId]);

  const updateItem = (itemId: string, updates: Partial<Extinguisher>) => {
    setItems(items.map(i => i.id === itemId ? { ...i, ...updates } : i));
  };

  const deleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="EXTINGUISHER LOG" subtitle={`AUDIT #${auditId}`} showBack />

      <div className="p-4 flex flex-col gap-4">
        {items.map((item, idx) => (
          <div key={item.id} className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl flex flex-col gap-4 relative group">
            <button onClick={() => deleteItem(item.id)} className="absolute top-4 right-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="material-symbols-outlined text-sm">delete</span>
            </button>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
               <span className="text-[10px] font-black text-primary uppercase italic">Unit #{idx + 1}</span>
               <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Verified Log</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input 
                type="text" 
                value={item.serial}
                onChange={(e) => updateItem(item.id, { serial: e.target.value })}
                placeholder="Serial No." 
                className="bg-background-dark/50 border-none rounded-xl h-10 px-3 text-xs font-bold text-white focus:ring-1 focus:ring-primary" 
              />
              <select 
                value={item.type}
                onChange={(e) => updateItem(item.id, { type: e.target.value })}
                className="bg-background-dark/50 border-none rounded-xl h-10 px-3 text-xs font-bold text-white"
              >
                 <option>ABC Powder</option>
                 <option>CO2 Gas</option>
                 <option>Water Mist</option>
                 <option>Foam</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="flex flex-col gap-1">
                  <label className="text-[7px] font-black text-text-muted uppercase tracking-widest ml-1">Pressure Status</label>
                  <button 
                    onClick={() => updateItem(item.id, { pressure: item.pressure === 'Normal' ? 'Low' : 'Normal' })}
                    className={`h-9 rounded-lg bg-background-dark/50 text-[8px] font-black uppercase border transition-all ${item.pressure === 'Normal' ? 'border-emerald-500/20 text-emerald-500' : 'border-primary/20 text-primary animate-pulse'}`}
                  >
                    {item.pressure}
                  </button>
               </div>
               <div className="flex flex-col gap-1">
                  <label className="text-[7px] font-black text-text-muted uppercase tracking-widest ml-1">Safety Pin Seal</label>
                  <button 
                    onClick={() => updateItem(item.id, { pin: item.pin === 'Intact' ? 'Broken' : 'Intact' })}
                    className={`h-9 rounded-lg bg-background-dark/50 text-[8px] font-black uppercase border transition-all ${item.pin === 'Intact' ? 'border-emerald-500/20 text-emerald-500' : 'border-primary/20 text-primary animate-pulse'}`}
                  >
                    {item.pin}
                  </button>
               </div>
            </div>
          </div>
        ))}
        
        <button 
           onClick={() => setItems([...items, { id: Date.now().toString(), serial: '', type: 'ABC Powder', expiry: '', pressure: 'Normal', pin: 'Intact' }])}
           className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-text-muted hover:text-primary hover:border-primary/30 transition-all"
        >
           <span className="material-symbols-outlined text-sm">add_circle</span>
           <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Extinguisher Unit</span>
        </button>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-surface-dark border-t border-white/5 p-5 pb-10 z-50">
         <button onClick={() => navigate(`/checklist/${auditId}`)} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-2xl active:scale-[0.98] transition-all">
            Save Fire Extinguisher Log
         </button>
      </div>
    </div>
  );
};

export default FireExtinguisher;
