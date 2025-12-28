
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface EquipmentItem {
  id: string;
  location: string;
  // Hose Reel Specifics
  hoseStatus: 'Normal' | 'Fault';
  nozzleStatus: 'Normal' | 'Fault';
  valveStatus: 'Normal' | 'Fault';
  drumStatus: 'Normal' | 'Fault';
  // Hydrant Specifics
  pillarStatus: 'Normal' | 'Fault';
  canvasStatus: 'Normal' | 'Fault';
  landingValveStatus: 'Normal' | 'Fault';
  oringStatus: 'Normal' | 'Fault';
  capChainStatus: 'Normal' | 'Fault';
  // Wet Riser Specifics
  breechingInletStatus: 'Normal' | 'Fault';
  drainValveStatus: 'Normal' | 'Fault';
  cabinetStatus: 'Normal' | 'Fault';
  // Shared
  pressureStatus: 'Normal' | 'Low';
  // General fallback
  condition: 'Good' | 'Damaged';
  remarks?: string;
  photo?: string;
}

interface EquipmentLog {
  items: EquipmentItem[];
  overallRemarks: string;
  photos: string[]; // Up to 4 photos for the entire system
}

const EquipmentSystem: React.FC = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';
  const equipType = type || 'hosereel';
  const isHoseReel = equipType.toLowerCase().includes('hosereel');
  const isHydrant = equipType.toLowerCase().includes('hydrant');
  const isWetRiser = equipType.toLowerCase().includes('wetriser');

  const [log, setLog] = useState<EquipmentLog>(() => {
    const saved = localStorage.getItem(`equip_${equipType}_${auditId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return {
            items: parsed,
            overallRemarks: '',
            photos: ['', '', '', '']
          };
        }
        return {
          ...parsed,
          photos: parsed.photos || ['', '', '', '']
        };
      } catch (e) {
        console.error("Parse error", e);
      }
    }
    return {
      items: [],
      overallRemarks: '',
      photos: ['', '', '', '']
    };
  });

  useEffect(() => {
    localStorage.setItem(`equip_${equipType}_${auditId}`, JSON.stringify(log));
  }, [log, auditId, equipType]);

  const createNewItem = (): EquipmentItem => ({
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
    pressureStatus: 'Normal',
    condition: 'Good',
    remarks: ''
  });

  const addItem = () => {
    setLog(prev => ({ ...prev, items: [...prev.items, createNewItem()] }));
  };

  const updateItem = (itemId: string, updates: Partial<EquipmentItem>) => {
    setLog(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, ...updates } : i)
    }));
  };

  const deleteItem = (itemId: string) => {
    setLog(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== itemId)
    }));
  };

  const handlePhotosChange = (newPhotos: string[]) => {
    setLog(prev => ({ ...prev, photos: newPhotos }));
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title={`${equipType.toUpperCase()} ASSETS`} subtitle={`AUDIT #${auditId}`} showBack />

      <div className="p-4 flex flex-col gap-6">
        <div className="flex justify-between items-center px-1">
           <div className="flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Asset Inventory</h3>
              <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em]">{log.items.length} Units Registered</span>
           </div>
           <button onClick={addItem} className="text-[9px] font-black text-primary bg-primary/10 px-4 py-2 rounded-xl uppercase tracking-widest border border-primary/20 active:scale-95 transition-all shadow-lg shadow-primary/5">+ Add Unit</button>
        </div>

        <div className="flex flex-col gap-4">
          {log.items.map((item, index) => (
            <AssetUnitCard 
                key={item.id}
                index={index}
                item={item}
                isHoseReel={isHoseReel}
                isHydrant={isHydrant}
                isWetRiser={isWetRiser}
                onUpdate={(upd) => updateItem(item.id, upd)}
                onDelete={() => deleteItem(item.id)}
            />
          ))}
        </div>

        {log.items.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center opacity-20 text-center">
             <span className="material-symbols-outlined text-6xl mb-4">inventory_2</span>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] max-w-[200px]">No equipment records found in local registry.</p>
             <button onClick={addItem} className="mt-6 px-6 py-2 border border-white/20 rounded-full text-[8px] font-black uppercase tracking-widest">Start New Log</button>
          </div>
        )}

        {log.items.length > 0 && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-700">
            <section className="bg-surface-dark p-5 rounded-3xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <span className="material-symbols-outlined text-primary text-sm">photo_camera</span>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">System Visual Proof (Max 4)</h3>
               </div>
               <PhotoUploader photos={log.photos} onPhotosChange={handlePhotosChange} />
            </section>

            <section className="bg-surface-dark p-5 rounded-3xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Overall Technical Observation</h3>
               </div>
               <textarea 
                  value={log.overallRemarks}
                  onChange={(e) => setLog(prev => ({ ...prev, overallRemarks: e.target.value }))}
                  placeholder="Record overall system findings, maintenance work carried out, or general site conditions..."
                  className="w-full bg-background-dark/50 border-none rounded-2xl text-[10px] p-4 h-32 text-white font-bold placeholder:opacity-20 focus:ring-1 focus:ring-primary"
               />
            </section>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-surface-dark/95 backdrop-blur-xl border-t border-white/5 p-5 pb-10 z-50">
         <button onClick={() => navigate(`/checklist/${auditId}`)} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl active:scale-95 flex items-center justify-center gap-3">
            <span>Commit Asset Log</span>
            <span className="material-symbols-outlined text-sm">verified_user</span>
         </button>
      </div>
    </div>
  );
};

interface AssetCardProps {
  index: number;
  item: EquipmentItem;
  isHoseReel: boolean;
  isHydrant: boolean;
  isWetRiser: boolean;
  onUpdate: (upd: Partial<EquipmentItem>) => void;
  onDelete: () => void;
}

const AssetUnitCard: React.FC<AssetCardProps> = ({ index, item, isHoseReel, isHydrant, isWetRiser, onUpdate, onDelete }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  
  let hasFault = false;
  if (isHoseReel) {
    hasFault = (item.hoseStatus === 'Fault' || item.nozzleStatus === 'Fault' || item.valveStatus === 'Fault' || item.drumStatus === 'Fault' || item.pressureStatus === 'Low');
  } else if (isHydrant) {
    hasFault = (item.pillarStatus === 'Fault' || item.canvasStatus === 'Fault' || item.nozzleStatus === 'Fault' || item.landingValveStatus === 'Fault' || item.oringStatus === 'Fault' || item.capChainStatus === 'Fault' || item.pressureStatus === 'Low' || item.cabinetStatus === 'Fault');
  } else if (isWetRiser) {
    hasFault = (item.landingValveStatus === 'Fault' || item.breechingInletStatus === 'Fault' || item.drainValveStatus === 'Fault' || item.cabinetStatus === 'Fault' || item.pressureStatus === 'Low' || item.nozzleStatus === 'Fault' || item.hoseStatus === 'Fault' || item.capChainStatus === 'Fault' || item.oringStatus === 'Fault');
  } else {
    hasFault = (item.condition === 'Damaged');
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdate({ photo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`p-5 rounded-3xl border transition-all animate-in slide-in-from-bottom duration-300 relative group ${hasFault ? 'bg-primary/5 border-primary/20 shadow-2xl' : 'bg-surface-dark border-white/5 shadow-xl'}`}>
       <button onClick={onDelete} className="absolute top-5 right-5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"><span className="material-symbols-outlined text-sm">delete</span></button>
       
       <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
             <span className="text-[11px] font-black italic uppercase text-primary">Unit #{index + 1}</span>
             <div className="h-px flex-1 bg-white/5" />
          </div>

          <div className="flex flex-col gap-1.5">
             <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Installation Location</label>
             <input 
                type="text" 
                value={item.location}
                onChange={(e) => onUpdate({ location: e.target.value })}
                className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-[11px] font-bold text-white focus:ring-1 focus:ring-primary placeholder:opacity-20"
                placeholder="e.g. Level 2 Block B"
             />
          </div>

          {isHoseReel ? (
             <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-2">
                   <ConditionToggle label="Hose Condition" value={item.hoseStatus} onToggle={(v) => onUpdate({ hoseStatus: v as any })} />
                   <ConditionToggle label="Nozzle Condition" value={item.nozzleStatus} onToggle={(v) => onUpdate({ nozzleStatus: v as any })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <ConditionToggle label="Stop Valve" value={item.valveStatus} onToggle={(v) => onUpdate({ valveStatus: v as any })} />
                   <ConditionToggle label="Drum / Swing" value={item.drumStatus} onToggle={(v) => onUpdate({ drumStatus: v as any })} />
                </div>
                <PressureToggle value={item.pressureStatus} onToggle={(v) => onUpdate({ pressureStatus: v as any })} />
             </div>
          ) : isHydrant ? (
             <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-2">
                   <ConditionToggle label="Hydrant Pillar" value={item.pillarStatus} onToggle={(v) => onUpdate({ pillarStatus: v as any })} />
                   <ConditionToggle label="Canvas Hose" value={item.canvasStatus} onToggle={(v) => onUpdate({ canvasStatus: v as any })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <ConditionToggle label="Nozzle" value={item.nozzleStatus} onToggle={(v) => onUpdate({ nozzleStatus: v as any })} />
                   <ConditionToggle label="Landing Valve" value={item.landingValveStatus} onToggle={(v) => onUpdate({ landingValveStatus: v as any })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <ConditionToggle label="O-Ring / Gasket" value={item.oringStatus} onToggle={(v) => onUpdate({ oringStatus: v as any })} />
                   <ConditionToggle label="Cap & Chain" value={item.capChainStatus} onToggle={(v) => onUpdate({ capChainStatus: v as any })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <ConditionToggle label="Hydrant Cabinet" value={item.cabinetStatus} onToggle={(v) => onUpdate({ cabinetStatus: v as any })} />
                   <PressureToggle value={item.pressureStatus} onToggle={(v) => onUpdate({ pressureStatus: v as any })} />
                </div>
             </div>
          ) : isWetRiser ? (
            <div className="grid grid-cols-1 gap-3">
               <div className="grid grid-cols-2 gap-2">
                  <ConditionToggle label="Landing Valve" value={item.landingValveStatus} onToggle={(v) => onUpdate({ landingValveStatus: v as any })} />
                  <ConditionToggle label="Breeching Inlet" value={item.breechingInletStatus} onToggle={(v) => onUpdate({ breechingInletStatus: v as any })} />
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <ConditionToggle label="Drain Valve" value={item.drainValveStatus} onToggle={(v) => onUpdate({ drainValveStatus: v as any })} />
                  <ConditionToggle label="Cabinet / Glass" value={item.cabinetStatus} onToggle={(v) => onUpdate({ cabinetStatus: v as any })} />
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <ConditionToggle label="Nozzle Condition" value={item.nozzleStatus} onToggle={(v) => onUpdate({ nozzleStatus: v as any })} />
                  <ConditionToggle label="Hose Condition" value={item.hoseStatus} onToggle={(v) => onUpdate({ hoseStatus: v as any })} />
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <ConditionToggle label="Cap & Chain" value={item.capChainStatus} onToggle={(v) => onUpdate({ capChainStatus: v as any })} />
                  <ConditionToggle label="O-Ring / Gasket" value={item.oringStatus} onToggle={(v) => onUpdate({ oringStatus: v as any })} />
               </div>
               <PressureToggle value={item.pressureStatus} onToggle={(v) => onUpdate({ pressureStatus: v as any })} />
            </div>
          ) : (
             <div className="flex items-center justify-between bg-background-dark/30 p-3 rounded-2xl border border-white/5">
                <span className="text-[9px] font-black uppercase text-white tracking-tight">Physical Status</span>
                <div className="flex gap-1 h-8">
                   {['Good', 'Damaged'].map(v => (
                      <button 
                         key={v}
                         onClick={() => onUpdate({ condition: v as any })}
                         className={`px-4 rounded-lg text-[8px] font-black uppercase transition-all ${item.condition === v ? (v === 'Good' ? 'bg-emerald-600' : 'bg-primary shadow-lg animate-pulse') + ' text-white' : 'bg-background-dark/50 text-text-muted'}`}
                      >
                         {v}
                      </button>
                   ))}
                </div>
             </div>
          )}

          {hasFault && (
             <div className="flex gap-3 pt-2 animate-in slide-in-from-top duration-300 border-t border-white/5 mt-2">
                <div 
                   onClick={() => fileRef.current?.click()}
                   className="w-16 h-16 bg-background-dark rounded-2xl border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50 transition-colors"
                >
                   {item.photo ? (
                      <img src={item.photo} className="w-full h-full object-cover" />
                   ) : (
                      <span className="material-symbols-outlined text-primary/40 text-xl">add_a_photo</span>
                   )}
                   <input type="file" ref={fileRef} className="hidden" accept="image/*" capture="environment" onChange={handleFile} />
                </div>
                <textarea 
                   value={item.remarks || ''}
                   onChange={(e) => onUpdate({ remarks: e.target.value })}
                   placeholder="Identify specific asset defect..."
                   className="flex-1 bg-background-dark/50 border-none rounded-2xl text-[10px] p-3 h-16 text-white font-bold focus:ring-1 focus:ring-primary placeholder:opacity-20"
                />
             </div>
          )}
       </div>
    </div>
  );
};

const ConditionToggle: React.FC<{ label: string; value: 'Normal' | 'Fault'; onToggle: (v: string) => void }> = ({ label, value, onToggle }) => (
  <div className="bg-background-dark/30 p-3 rounded-2xl border border-white/5 flex flex-col gap-2">
     <span className="text-[7px] font-black uppercase text-text-muted tracking-widest text-center">{label}</span>
     <div className="flex gap-1 h-7">
        {['Normal', 'Fault'].map(v => (
           <button 
              key={v}
              onClick={() => onToggle(v)}
              className={`flex-1 rounded-lg text-[7px] font-black uppercase transition-all ${value === v ? (v === 'Normal' ? 'bg-emerald-600' : 'bg-primary') + ' text-white' : 'bg-background-dark/50 text-text-muted'}`}
           >
              {v}
           </button>
        ))}
     </div>
  </div>
);

const PressureToggle: React.FC<{ value: 'Normal' | 'Low'; onToggle: (v: string) => void }> = ({ value, onToggle }) => (
  <div className="bg-background-dark/30 p-3 rounded-2xl border border-white/5 flex items-center justify-between">
    <span className="text-[9px] font-black uppercase text-white tracking-tight">Pressure Status</span>
    <div className="flex gap-1 h-8">
      {['Normal', 'Low'].map(v => (
          <button 
            key={v}
            onClick={() => onToggle(v)}
            className={`px-4 rounded-lg text-[8px] font-black uppercase transition-all ${value === v ? (v === 'Normal' ? 'bg-emerald-600' : 'bg-primary shadow-lg animate-pulse') + ' text-white' : 'bg-background-dark/50 text-text-muted'}`}
          >
            {v}
          </button>
      ))}
    </div>
  </div>
);

const PhotoUploader: React.FC<{ 
  photos: string[]; 
  onPhotosChange: (p: string[]) => void;
}> = ({ photos, onPhotosChange }) => {
  const cameraRef = useRef<HTMLInputElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeIdx !== null) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotos = [...photos];
        newPhotos[activeIdx] = reader.result as string;
        onPhotosChange(newPhotos);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (idx: number) => {
    const newPhotos = [...photos];
    newPhotos[idx] = '';
    onPhotosChange(newPhotos);
  };

  const slots = [0, 1, 2, 3];

  return (
    <div className="grid grid-cols-4 gap-3">
      {slots.map((idx) => (
        <div 
          key={idx} 
          onClick={() => { setActiveIdx(idx); cameraRef.current?.click(); }} 
          className={`aspect-square bg-background-dark rounded-2xl border border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-all group relative ${photos[idx] ? 'border-primary/40' : 'border-white/10 hover:border-primary/40'}`}
        >
          {photos[idx] ? (
            <>
              <img src={photos[idx]} className="w-full h-full object-cover" />
              <button 
                onClick={(e) => { e.stopPropagation(); removePhoto(idx); }} 
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[12px]">close</span>
              </button>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-xl opacity-20 group-hover:opacity-100 transition-opacity">add_a_photo</span>
              <span className="text-[6px] font-black uppercase text-text-muted mt-1">Slot {idx + 1}</span>
            </>
          )}
        </div>
      ))}
      <input type="file" ref={cameraRef} className="hidden" accept="image/*" capture="environment" onChange={handleCapture} />
    </div>
  );
};

export default EquipmentSystem;
