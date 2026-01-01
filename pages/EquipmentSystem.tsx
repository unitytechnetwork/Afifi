
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface EquipmentItem {
  id: string;
  location: string;
  hoseStatus: string;
  nozzleStatus: string;
  valveStatus: string;
  drumStatus: string;
  pillarStatus: string;
  canvasStatus: string;
  landingValveStatus: string;
  oringStatus: string;
  capChainStatus: string;
  breechingInletStatus: string;
  drainValveStatus: string;
  cabinetStatus: string;
  airReleaseValveStatus: string;
  pressureStatus: string;
  labelStatus: string;
  mountingStatus: string;
  condition: string;
  remarks?: Record<string, string>;
  photos: Record<string, string>;
}

interface EquipmentLog {
  systemDescription: string;
  systemOverallStatus: 'Normal' | 'Faulty' | 'Partial' | 'N/A';
  items: EquipmentItem[];
  overallRemarks: string;
  servicePhotos: string[];
}

const EquipmentSystem: React.FC = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';
  const equipType = type?.toLowerCase() || 'hosereel';
  
  const [log, setLog] = useState<EquipmentLog>(() => {
    const saved = localStorage.getItem(`equip_${equipType}_${auditId}`);
    const defaultState: EquipmentLog = { 
      systemDescription: `Assessment for ${equipType.toUpperCase()} safety components.`,
      systemOverallStatus: 'Normal',
      items: [], 
      overallRemarks: '', 
      servicePhotos: ['', '', '', ''] 
    };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { 
          ...defaultState, 
          ...parsed,
          items: (parsed.items || []).map((item: any) => ({
            ...item,
            photos: item.photos || {},
            remarks: item.remarks || {}
          }))
        };
      } catch (e) { console.error(e); }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(`equip_${equipType}_${auditId}`, JSON.stringify(log));
  }, [log, auditId, equipType]);

  const updateItem = (itemId: string, updates: Partial<EquipmentItem>) => {
    setLog(prev => ({ ...prev, items: prev.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }));
  };

  const addItem = () => {
    const newItem: EquipmentItem = { 
      id: Date.now().toString(), 
      location: '', 
      hoseStatus: 'Normal', 
      nozzleStatus: 'Normal', 
      valveStatus: 'Normal', 
      drumStatus: 'Normal', 
      pillarStatus: 'Normal', 
      canvasStatus: 'Normal', 
      landingValveStatus: 'Normal', 
      oringStatus: 'Normal', 
      capChainStatus: 'Normal', 
      breechingInletStatus: 'Normal', 
      drainValveStatus: 'Normal', 
      cabinetStatus: 'Normal', 
      airReleaseValveStatus: 'Normal', 
      pressureStatus: 'Normal', 
      labelStatus: 'Intact',
      mountingStatus: 'Secure',
      condition: 'Good', 
      remarks: {},
      photos: {}
    };
    setLog(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const getTogglesForType = (item: EquipmentItem) => {
    if (equipType.includes('hosereel')) {
      return [
        { label: 'Hose Condition', key: 'hoseStatus', val: item.hoseStatus, opt: ['Normal', 'Fault'] },
        { label: 'Nozzle / Jet', key: 'nozzleStatus', val: item.nozzleStatus, opt: ['Normal', 'Fault'] },
        { label: 'Drum / Swing', key: 'drumStatus', val: item.drumStatus, opt: ['Normal', 'Fault'] },
        { label: 'Control Valve', key: 'valveStatus', val: item.valveStatus, opt: ['Normal', 'Fault'] },
        { label: 'O-Ring Seal', key: 'oringStatus', val: item.oringStatus, opt: ['Normal', 'Fault'] },
        { label: 'Cabinet Box', key: 'cabinetStatus', val: item.cabinetStatus, opt: ['Normal', 'Fault'] },
        { label: 'Water Pressure', key: 'pressureStatus', val: item.pressureStatus, opt: ['Normal', 'Low'] },
        { label: 'Instruction Label', key: 'labelStatus', val: item.labelStatus, opt: ['Intact', 'Missing'] },
        { label: 'Wall Mounting', key: 'mountingStatus', val: item.mountingStatus, opt: ['Secure', 'Loose'] },
      ];
    } else if (equipType.includes('hydrant')) {
      return [
        { label: 'Pillar Status', key: 'pillarStatus', val: item.pillarStatus, opt: ['Normal', 'Fault'] },
        { label: 'Isolation Valve', key: 'valveStatus', val: item.valveStatus, opt: ['Normal', 'Fault'] },
        { label: 'Cap & Chain', key: 'capChainStatus', val: item.capChainStatus, opt: ['Normal', 'Fault'] },
        { label: 'Canvas Hose', key: 'canvasStatus', val: item.canvasStatus, opt: ['Normal', 'Fault'] },
        { label: 'Nozzle / Jet', key: 'nozzleStatus', val: item.nozzleStatus, opt: ['Normal', 'Fault'] },
        { label: 'Landing Valve', key: 'landingValveStatus', val: item.landingValveStatus, opt: ['Normal', 'Fault'] },
        { label: 'Static Pressure', key: 'pressureStatus', val: item.pressureStatus, opt: ['Normal', 'Low'] },
        { label: 'Cabinet Box', key: 'cabinetStatus', val: item.cabinetStatus, opt: ['Normal', 'Fault'] },
      ];
    } else if (equipType.includes('riser')) {
      const base = [
        { label: 'Landing Valve', key: 'landingValveStatus', val: item.landingValveStatus, opt: ['Normal', 'Fault'] },
        { label: 'Canvas Hose', key: 'canvasStatus', val: item.canvasStatus, opt: ['Normal', 'Fault'] },
        { label: 'Nozzle / Jet', key: 'nozzleStatus', val: item.nozzleStatus, opt: ['Normal', 'Fault'] },
        { label: 'Water Pressure', key: 'pressureStatus', val: item.pressureStatus, opt: ['Normal', 'Low'] },
        { label: 'Cabinet Box', key: 'cabinetStatus', val: item.cabinetStatus, opt: ['Normal', 'Fault'] },
      ];
      if (equipType.includes('dry')) {
        base.push(
          { label: 'Breeching Inlet', key: 'breechingInletStatus', val: item.breechingInletStatus, opt: ['Normal', 'Fault'] },
          { label: 'Drain Valve', key: 'drainValveStatus', val: item.drainValveStatus, opt: ['Normal', 'Fault'] },
          { label: 'Air Release Valve', key: 'airReleaseValveStatus', val: item.airReleaseValveStatus, opt: ['Normal', 'Fault'] }
        );
      }
      return base;
    }
    return [
      { label: 'Condition', key: 'condition', val: item.condition, opt: ['Good', 'Damaged'] },
    ];
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title={`${equipType.toUpperCase()} ASSETS`} subtitle={`REF: ${auditId}`} showBack />
      <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* RESTYLED: System Audit Profile (Matches others) */}
        <section className="bg-primary/10 border border-primary/20 p-5 rounded-2xl flex flex-col gap-4 shadow-lg shadow-primary/5">
           <div className="flex justify-between items-center border-b border-primary/20 pb-3">
              <h3 className="text-[11px] font-black uppercase text-white tracking-widest italic">System Audit Profile</h3>
              <select value={log.systemOverallStatus} onChange={(e) => setLog({...log, systemOverallStatus: e.target.value as any})} className="bg-background-dark/50 border border-primary/40 rounded px-2 h-6 text-[8px] font-black uppercase text-white">
                <option value="Normal">Normal</option><option value="Faulty">Faulty</option><option value="Partial">Partial</option><option value="N/A">N/A</option>
              </select>
           </div>
           <textarea value={log.systemDescription} onChange={(e) => setLog({...log, systemDescription: e.target.value})} className="bg-background-dark/50 border-white/5 border rounded-xl p-3 text-xs font-medium h-16 text-white placeholder:text-white/10" placeholder="Description..." />
        </section>

        <div className="flex justify-between items-center px-1">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] italic">Registry Log</span>
              <span className="text-[7px] font-black text-primary uppercase tracking-[0.3em]">{log.items.length} Assets Found</span>
           </div>
           <button onClick={addItem} className="text-[9px] font-black text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 transition-all hover:bg-primary hover:text-white">+ Add Asset</button>
        </div>

        <div className="flex flex-col gap-5">
          {log.items.map((item, index) => {
            const toggles = getTogglesForType(item);

            return (
              <div key={item.id} className="p-6 rounded-[2.5rem] bg-surface-dark border border-white/5 shadow-2xl relative overflow-hidden group transition-all animate-in slide-in-from-bottom">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
                <button onClick={() => setLog(prev => ({...prev, items: prev.items.filter(i => i.id !== item.id)}))} className="absolute top-6 right-6 text-text-muted hover:text-primary transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                
                <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-5">
                  <span className="text-[11px] font-black italic uppercase text-primary">Unit #{index + 1}</span>
                  <input type="text" value={item.location} onChange={(e) => updateItem(item.id, { location: e.target.value })} className="flex-1 bg-transparent border-none text-[11px] font-bold text-white focus:ring-0 placeholder:text-white/5" placeholder="Building Location..." />
                </div>
                
                <div className="flex flex-col gap-4">
                  {toggles.map((t) => (
                    <AssetRow 
                      key={t.key}
                      label={t.label} 
                      value={t.val} 
                      options={t.opt}
                      remark={item.remarks?.[t.key]}
                      photo={item.photos?.[t.key]}
                      onToggle={(v: any) => updateItem(item.id, { [t.key]: v })}
                      onRemark={(txt: string) => {
                        const newRemarks = { ...(item.remarks || {}), [t.key]: txt };
                        updateItem(item.id, { remarks: newRemarks });
                      }}
                      onPhoto={(p: string) => {
                        const newPhotos = { ...(item.photos || {}), [t.key]: p };
                        updateItem(item.id, { photos: newPhotos });
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={addItem} className="w-full py-10 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center gap-2 text-text-muted hover:text-primary hover:border-primary/20 transition-all active:scale-[0.98]">
          <span className="material-symbols-outlined text-4xl">add_circle</span>
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Register {equipType.toUpperCase()} Unit</span>
        </button>

        <section className="bg-surface-dark p-6 rounded-[2.5rem] border border-white/5 shadow-xl mt-4">
           <div className="flex items-center gap-2 mb-5 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-primary text-sm">history_edu</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Final Verification & Remarks</h3>
           </div>
           
           <textarea 
             value={log.overallRemarks} 
             onChange={(e) => setLog({...log, overallRemarks: e.target.value})} 
             className="w-full bg-background-dark/40 border-none rounded-2xl p-4 text-[11px] font-medium text-white h-24 mb-6 focus:ring-1 focus:ring-primary" 
             placeholder="Summary findings for this system..." 
           />

           <div className="grid grid-cols-4 gap-3">
              {log.servicePhotos.map((photo, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                   <PhotoCaptureBox 
                     photo={photo} 
                     onCapture={(p) => {
                        const newPhotos = [...log.servicePhotos];
                        newPhotos[idx] = p;
                        setLog({...log, servicePhotos: newPhotos});
                     }} 
                   />
                   <span className="text-[6px] font-black text-text-muted uppercase text-center">Proof {idx+1}</span>
                </div>
              ))}
           </div>
        </section>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-background-dark/95 backdrop-blur-md border-t border-white/5 p-6 pb-12 z-50">
        <button onClick={() => navigate(`/checklist/${auditId}`)} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3">
          <span>Commit Registry</span>
          <span className="material-symbols-outlined text-sm">verified_user</span>
        </button>
      </div>
    </div>
  );
};

const AssetRow: React.FC<any> = ({ label, value, options, onToggle, remark, photo, onRemark, onPhoto }) => {
  const isOk = ['Normal', 'Good', 'Intact', 'Secure', 'Functional'].includes(value);
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase text-white tracking-widest italic">{label}</span>
        <div className="flex gap-1.5">
          {options.map((opt: string) => {
            const isFaultOpt = ['Fault', 'Low', 'Damaged', 'Missing', 'Loose'].includes(opt);
            const isPositiveOpt = ['Normal', 'Good', 'Intact', 'Secure', 'Functional'].includes(opt);
            
            let btnClass = "";
            if (value === opt) {
              if (isPositiveOpt) {
                btnClass = "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20";
              } else if (isFaultOpt) {
                btnClass = "bg-primary text-white shadow-lg shadow-primary/20";
              } else {
                btnClass = "bg-background-dark text-white";
              }
            } else {
              btnClass = "bg-background-dark/50 text-text-muted opacity-40";
            }

            return (
              <button 
                key={opt}
                onClick={() => onToggle(opt)}
                className={`px-4 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${btnClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      
      {!isOk && (
        <div className="bg-background-dark/40 rounded-2xl p-3 flex gap-3 animate-in slide-in-from-top duration-300">
           <PhotoCaptureBox 
             photo={photo} 
             onCapture={onPhoto} 
             className="w-16 h-16 shrink-0" 
           />
           <textarea 
             value={remark || ''} 
             onChange={(e) => onRemark(e.target.value)} 
             className="flex-1 bg-transparent border-none text-[10px] h-16 p-0 font-bold text-white italic placeholder:text-white/10 focus:ring-0" 
             placeholder={`Describe ${label.toLowerCase()} fault...`} 
           />
        </div>
      )}
    </div>
  );
};

const PhotoCaptureBox: React.FC<{ photo?: string; onCapture: (p: string) => void; className?: string }> = ({ photo, onCapture, className }) => {
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
      className={`bg-background-dark rounded-xl border border-primary/20 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors shadow-inner relative group ${className || 'w-full aspect-square'}`}
    >
      {photo ? (
        <img src={photo} className="w-full h-full object-cover" />
      ) : (
        <span className="material-symbols-outlined text-primary text-xl">camera_outdoor</span>
      )}
      <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
    </div>
  );
};

export default EquipmentSystem;
