
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface LightingUnit {
  id: string;
  location: string;
  brand: string;
  model: string;
  lampType: 'LED' | 'Fluorescent' | 'T5/T8';
  batteryType: 'Ni-Cd' | 'Lithium' | 'Lead-Acid';
  mode: 'Maintained' | 'Non-Maintained' | 'Sustained';
  durationTest: string; // Minutes
  chargingLed: 'Normal' | 'Fault';
  housingCondition: 'Good' | 'Damaged';
  mountingStatus: 'Secure' | 'Loose';
  testOutcome: 'Functional' | 'Failed';
  photo?: string;
  remarks?: string;
}

const LightingSystem: React.FC = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';
  const lightType = type || 'Emergency';

  const [items, setItems] = useState<LightingUnit[]>(() => {
    const saved = localStorage.getItem(`light_${lightType}_${auditId}`);
    return saved ? JSON.parse(saved) : [{ 
      id: '1', 
      location: '', 
      brand: '',
      model: '',
      lampType: 'LED',
      batteryType: 'Ni-Cd',
      mode: 'Non-Maintained',
      durationTest: '120',
      chargingLed: 'Normal',
      housingCondition: 'Good',
      mountingStatus: 'Secure',
      testOutcome: 'Functional' 
    }];
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

  const addItem = () => {
    setItems([...items, { 
      id: Date.now().toString(), 
      location: '', 
      brand: '',
      model: '',
      lampType: 'LED',
      batteryType: 'Ni-Cd',
      mode: 'Non-Maintained',
      durationTest: '120',
      chargingLed: 'Normal',
      housingCondition: 'Good',
      mountingStatus: 'Secure',
      testOutcome: 'Functional' 
    }]);
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title={`${lightType.toUpperCase()} SYSTEM`} subtitle={`AUDIT #${auditId}`} showBack />

      <div className="p-4 flex flex-col gap-6">
        <div className="flex justify-between items-center px-1">
           <div className="flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Unit Registry</h3>
              <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em]">{items.length} Assets Logged</span>
           </div>
           <button onClick={addItem} className="text-[9px] font-black text-primary bg-primary/10 px-4 py-2 rounded-xl uppercase tracking-widest border border-primary/20 active:scale-95 transition-all">+ Add Unit</button>
        </div>

        <div className="flex flex-col gap-5">
          {items.map((item, idx) => {
            const hasFault = item.testOutcome === 'Failed' || 
                             item.chargingLed === 'Fault' || 
                             item.housingCondition === 'Damaged' || 
                             item.mountingStatus === 'Loose';

            return (
              <div key={item.id} className={`p-5 rounded-3xl border transition-all animate-in slide-in-from-bottom duration-300 relative group ${hasFault ? 'bg-primary/5 border-primary/20 shadow-2xl' : 'bg-surface-dark border-white/5 shadow-xl'}`}>
                <button onClick={() => deleteItem(item.id)} className="absolute top-5 right-5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary">
                   <span className="material-symbols-outlined text-sm">delete</span>
                </button>
                
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                     <span className="text-[11px] font-black italic uppercase text-primary">Asset #{idx + 1}</span>
                     <div className="h-px flex-1 bg-white/5" />
                  </div>

                  {/* Identification Row - Serial Removed, Location Full Width */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Location / Zone</label>
                    <input 
                      type="text" 
                      value={item.location}
                      onChange={(e) => updateItem(item.id, { location: e.target.value })}
                      placeholder="e.g. Exit Stair 1, Lobby Level 2" 
                      className="w-full bg-background-dark/50 border-none rounded-xl h-11 px-4 text-[11px] font-bold text-white focus:ring-1 focus:ring-primary" 
                    />
                  </div>

                  {/* Technical Specs Row 1 */}
                  <div className="grid grid-cols-2 gap-3">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Brand Name</label>
                        <input 
                          type="text" 
                          value={item.brand}
                          onChange={(e) => updateItem(item.id, { brand: e.target.value })}
                          placeholder="e.g. PNE / Econlite" 
                          className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-[11px] font-bold text-white focus:ring-1 focus:ring-primary" 
                        />
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Lamp Type</label>
                        <select 
                          value={item.lampType}
                          onChange={(e) => updateItem(item.id, { lampType: e.target.value as any })}
                          className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-[11px] font-bold text-white focus:ring-1 focus:ring-primary appearance-none"
                        >
                           <option>LED</option>
                           <option>Fluorescent</option>
                           <option>T5/T8</option>
                        </select>
                     </div>
                  </div>

                  {/* Technical Specs Row 2 */}
                  <div className="grid grid-cols-3 gap-2">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1 text-center">Battery</label>
                        <select 
                          value={item.batteryType}
                          onChange={(e) => updateItem(item.id, { batteryType: e.target.value as any })}
                          className="bg-background-dark/50 border-none rounded-lg h-9 text-[9px] font-black text-white text-center"
                        >
                           <option>Ni-Cd</option>
                           <option>Lithium</option>
                           <option>Lead-Acid</option>
                        </select>
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1 text-center">Mode</label>
                        <select 
                          value={item.mode}
                          onChange={(e) => updateItem(item.id, { mode: e.target.value as any })}
                          className="bg-background-dark/50 border-none rounded-lg h-9 text-[9px] font-black text-white text-center"
                        >
                           <option>Maintained</option>
                           <option>Non-Maintained</option>
                           <option>Sustained</option>
                        </select>
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1 text-center">Duration (M)</label>
                        <input 
                          type="number" 
                          value={item.durationTest}
                          onChange={(e) => updateItem(item.id, { durationTest: e.target.value })}
                          className="bg-background-dark/50 border-none rounded-lg h-9 text-[10px] font-black text-emerald-500 text-center" 
                        />
                     </div>
                  </div>

                  {/* Condition Toggles */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                     <StatusToggle 
                        label="Charging Indicator" 
                        value={item.chargingLed} 
                        options={['Normal', 'Fault']} 
                        onToggle={(v) => updateItem(item.id, { chargingLed: v as any })} 
                     />
                     <StatusToggle 
                        label="Mounting Security" 
                        value={item.mountingStatus} 
                        options={['Secure', 'Loose']} 
                        onToggle={(v) => updateItem(item.id, { mountingStatus: v as any })} 
                     />
                     <StatusToggle 
                        label="Housing / Diffuser" 
                        value={item.housingCondition} 
                        options={['Good', 'Damaged']} 
                        onToggle={(v) => updateItem(item.id, { housingCondition: v as any })} 
                     />
                     <StatusToggle 
                        label="Manual Discharge" 
                        value={item.testOutcome} 
                        options={['Functional', 'Failed']} 
                        onToggle={(v) => updateItem(item.id, { testOutcome: v as any })} 
                     />
                  </div>

                  {/* Fault Proof Section */}
                  {hasFault && (
                    <div className="flex gap-3 pt-2 animate-in slide-in-from-top duration-300 border-t border-white/5 mt-2">
                      <PhotoCaptureBox 
                        photo={item.photo} 
                        onCapture={(p) => updateItem(item.id, { photo: p })} 
                      />
                      <textarea 
                        value={item.remarks || ''}
                        onChange={(e) => updateItem(item.id, { remarks: e.target.value })}
                        placeholder="Detail the failure point (e.g. Battery dead, LED blown, Diffuser cracked)..."
                        className="flex-1 bg-background-dark/50 border-none rounded-2xl text-[10px] p-3 h-16 text-white font-bold focus:ring-1 focus:ring-primary placeholder:opacity-20"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <button 
           onClick={addItem}
           className="w-full py-5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-1 text-text-muted hover:text-primary hover:border-primary/30 transition-all active:scale-95 group"
        >
           <span className="material-symbols-outlined text-2xl group-hover:scale-125 transition-transform">add_circle</span>
           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Register New {lightType}</span>
        </button>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-surface-dark/95 backdrop-blur-xl border-t border-white/5 p-5 pb-10 z-50">
         <button onClick={() => navigate(`/checklist/${auditId}`)} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl active:scale-95 flex items-center justify-center gap-3">
            <span>Commit {lightType} Audit</span>
            <span className="material-symbols-outlined text-sm">verified_user</span>
         </button>
      </div>
    </div>
  );
};

const StatusToggle: React.FC<{ 
  label: string; 
  value: string; 
  options: [string, string]; 
  onToggle: (v: string) => void;
}> = ({ label, value, options, onToggle }) => (
  <div className="bg-background-dark/30 p-3 rounded-2xl border border-white/5 flex flex-col gap-2">
     <span className="text-[7px] font-black uppercase text-text-muted tracking-widest text-center">{label}</span>
     <div className="flex gap-1 h-7">
        {options.map(v => {
           const isFaultOption = v === 'Failed' || v === 'Fault' || v === 'Loose' || v === 'Damaged';
           return (
              <button 
                 key={v}
                 onClick={() => onToggle(v)}
                 className={`flex-1 rounded-lg text-[7px] font-black uppercase transition-all ${value === v ? (isFaultOption ? 'bg-primary' : 'bg-emerald-600') + ' text-white shadow-lg' : 'bg-background-dark/50 text-text-muted'}`}
              >
                 {v}
              </button>
           );
        })}
     </div>
  </div>
);

const PhotoCaptureBox: React.FC<{ photo?: string; onCapture: (p: string) => void }> = ({ photo, onCapture }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onCapture(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
       onClick={() => fileRef.current?.click()} 
       className="w-16 h-16 bg-background-dark rounded-2xl border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50 transition-colors shadow-inner"
    >
       {photo ? (
         <img src={photo} className="w-full h-full object-cover" />
       ) : (
         <span className="material-symbols-outlined text-primary/40 text-lg">add_a_photo</span>
       )}
       <input type="file" ref={fileRef} className="hidden" accept="image/*" capture="environment" onChange={handleFile} />
    </div>
  );
};

export default LightingSystem;
