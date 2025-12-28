
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface PumpComponent {
  label: string;
  type: 'Electric' | 'Diesel';
  mode: 'Auto' | 'Manual' | 'Off';
  status: 'Normal' | 'Fault';
  loadValue: string; // Ampere for Electric, Fuel % for Diesel
  cutIn: string;
  cutOut: string;
  batteryVolt?: string;
  chargerVolt?: string;
  photo?: string;
  remarks?: string;
}

interface PumpData {
  headerPressure: string;
  tankLevel: string;
  // Dynamic Pump Units
  jockeyUnit?: PumpComponent;
  dutyUnit: PumpComponent;
  standbyUnit: PumpComponent;
  // Technical Specifications
  jockeyRating: string;
  motorRating: string;
  engineRating: string;
  pumpVibration: 'Normal' | 'High';
  pumpNoise: 'Normal' | 'Abnormal';
  glandPacking: 'Normal' | 'Leaking';
  // Control Panel Health
  panelIncomingVolt: string;
  panelLampsStatus: 'Normal' | 'Fault';
  panelWiringStatus: 'Normal' | 'Fault';
  selectorSwitchStatus: 'Normal' | 'Fault';
  // General Observations
  generalRemarks?: string;
  isNA?: boolean;
  photos: string[]; // Up to 4 photos
}

const PumpSystem: React.FC = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';
  const pumpType = type || 'hosereel';
  
  // Logic to determine if we show 2 or 3 pumps
  const isHoseReel = pumpType.toLowerCase().includes('hosereel');

  const [data, setData] = useState<PumpData>(() => {
    const saved = localStorage.getItem(`pump_${pumpType}_${auditId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure defaults for any missing fields during migration
        return {
          ...parsed,
          photos: parsed.photos || ['', '', '', ''],
          jockeyUnit: parsed.jockeyUnit || (isHoseReel ? undefined : { label: 'Jockey Pump', type: 'Electric', mode: 'Auto', status: 'Normal', loadValue: '1.2', cutIn: '7.5', cutOut: '8.5' }),
        };
      } catch (e) {
        console.error("Storage parse error:", e);
      }
    }

    // Default Initialization
    const base: PumpData = {
      headerPressure: '7.0',
      tankLevel: 'Full',
      dutyUnit: { label: 'Duty Pump', type: 'Electric', mode: 'Auto', status: 'Normal', loadValue: '15.5', cutIn: '6.0', cutOut: '8.0' },
      standbyUnit: { label: 'Standby Pump', type: 'Diesel', mode: 'Auto', status: 'Normal', loadValue: '100', cutIn: '5.5', cutOut: '8.0', batteryVolt: '12.6', chargerVolt: '13.8' },
      jockeyRating: '1.5HP / 1.1kW',
      motorRating: '15HP / 11kW',
      engineRating: '25HP',
      pumpVibration: 'Normal',
      pumpNoise: 'Normal',
      glandPacking: 'Normal',
      panelIncomingVolt: '415',
      panelLampsStatus: 'Normal',
      panelWiringStatus: 'Normal',
      selectorSwitchStatus: 'Normal',
      generalRemarks: '',
      photos: ['', '', '', '']
    };

    if (!isHoseReel) {
      base.jockeyUnit = { label: 'Jockey Pump', type: 'Electric', mode: 'Auto', status: 'Normal', loadValue: '1.2', cutIn: '7.5', cutOut: '8.5' };
    }

    return base;
  });

  useEffect(() => {
    localStorage.setItem(`pump_${pumpType}_${auditId}`, JSON.stringify(data));
  }, [data, auditId, pumpType]);

  const updateUnit = (key: 'jockeyUnit' | 'dutyUnit' | 'standbyUnit', updates: Partial<PumpComponent>) => {
    setData(prev => {
      const currentUnit = prev[key];
      if (!currentUnit) return prev;
      return {
        ...prev,
        [key]: { ...currentUnit, ...updates }
      };
    });
  };

  const handlePhotosChange = (newPhotos: string[]) => {
    setData(prev => ({ ...prev, photos: newPhotos }));
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title={`${pumpType.toUpperCase()} SYSTEM`} subtitle={`REF: ${auditId}`} showBack />

      <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* Main Pressures */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">speed</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part I: Main Line Metrics</h3>
           </div>
           <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                 <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Header Pressure (Bar)</label>
                 <input 
                    type="text" 
                    value={data.headerPressure}
                    onChange={(e) => setData({...data, headerPressure: e.target.value})}
                    className="bg-background-dark/50 border-none rounded-xl h-12 px-4 text-sm font-black text-emerald-500 focus:ring-1 focus:ring-primary"
                 />
              </div>
              <div className="flex flex-col gap-1.5">
                 <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Tank Water Level</label>
                 <select 
                    value={data.tankLevel}
                    onChange={(e) => setData({...data, tankLevel: e.target.value})}
                    className="bg-background-dark/50 border-none rounded-xl h-12 px-4 text-xs font-bold text-white focus:ring-1 focus:ring-primary"
                 >
                    <option>Full</option>
                    <option>75%</option>
                    <option>50%</option>
                    <option>Low</option>
                    <option>Empty</option>
                 </select>
              </div>
           </div>
        </section>

        {/* Pump Units Registry */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">hub</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part II: Pump Unit Registry</h3>
           </div>
           <div className="flex flex-col gap-4">
              {!isHoseReel && data.jockeyUnit && (
                 <PumpUnitRow 
                    component={data.jockeyUnit}
                    onUpdate={(upd) => updateUnit('jockeyUnit', upd)}
                 />
              )}
              <PumpUnitRow 
                 component={data.dutyUnit}
                 onUpdate={(upd) => updateUnit('dutyUnit', upd)}
                 allowTypeChange={!isHoseReel}
              />
              <PumpUnitRow 
                 component={data.standbyUnit}
                 onUpdate={(upd) => updateUnit('standbyUnit', upd)}
                 allowTypeChange
              />
           </div>
        </section>

        {/* Technical Specs */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">precision_manufacturing</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part III: Engineering Details</h3>
           </div>
           <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2">
                {!isHoseReel && (
                   <div className="flex flex-col gap-1">
                      <label className="text-[7px] font-black text-text-muted uppercase tracking-widest ml-1">Jockey (HP)</label>
                      <input 
                         type="text" 
                         value={data.jockeyRating}
                         onChange={(e) => setData({...data, jockeyRating: e.target.value})}
                         className="bg-background-dark/50 border-none rounded-xl h-10 px-3 text-[10px] font-bold"
                      />
                   </div>
                )}
                <div className={`flex flex-col gap-1 ${isHoseReel ? 'col-span-2' : ''}`}>
                   <label className="text-[7px] font-black text-text-muted uppercase tracking-widest ml-1">Duty Motor</label>
                   <input 
                      type="text" 
                      value={data.motorRating}
                      onChange={(e) => setData({...data, motorRating: e.target.value})}
                      className="bg-background-dark/50 border-none rounded-xl h-10 px-3 text-[10px] font-bold"
                   />
                </div>
                <div className="flex flex-col gap-1">
                   <label className="text-[7px] font-black text-text-muted uppercase tracking-widest ml-1">Standby Unit</label>
                   <input 
                      type="text" 
                      value={data.engineRating}
                      onChange={(e) => setData({...data, engineRating: e.target.value})}
                      className="bg-background-dark/50 border-none rounded-xl h-10 px-3 text-[10px] font-bold"
                   />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                 {[
                    { label: 'Pump Vibration Level', key: 'pumpVibration', opt: ['Normal', 'High'] },
                    { label: 'System Operating Noise', key: 'pumpNoise', opt: ['Normal', 'Abnormal'] },
                    { label: 'Mechanical Seal / Packing', key: 'glandPacking', opt: ['Normal', 'Leaking'] },
                 ].map(item => (
                    <div key={item.key} className="flex items-center justify-between bg-background-dark/30 p-3 rounded-xl border border-white/5">
                       <span className="text-[9px] font-bold uppercase text-white tracking-tight">{item.label}</span>
                       <div className="flex gap-1">
                          {item.opt.map(o => (
                             <button 
                                key={o}
                                onClick={() => setData({...data, [item.key]: o} as any)}
                                className={`px-3 py-1 rounded-md text-[7px] font-black uppercase transition-all ${data[item.key as keyof PumpData] === o ? (o === 'Normal' ? 'bg-emerald-600' : 'bg-primary shadow-lg animate-pulse') + ' text-white' : 'bg-background-dark/50 text-text-muted'}`}
                             >
                                {o}
                             </button>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Control Panel Status */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">settings_input_component</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part IV: Control Panel Details</h3>
           </div>
           <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                 <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Panel Incoming Power (RYB)</label>
                 <input 
                    type="text" 
                    value={data.panelIncomingVolt}
                    onChange={(e) => setData({...data, panelIncomingVolt: e.target.value})}
                    className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-black text-blue-400"
                    placeholder="e.g. 415V"
                 />
              </div>
              <div className="grid grid-cols-1 gap-2">
                 {[
                    { label: 'Signal & Indicator Lamps', key: 'panelLampsStatus' },
                    { label: 'Internal Contactors / Wiring', key: 'panelWiringStatus' },
                    { label: 'Selection Switches (A/M/O)', key: 'selectorSwitchStatus' },
                 ].map(item => (
                    <div key={item.key} className="flex items-center justify-between bg-background-dark/30 p-3 rounded-xl border border-white/5">
                       <span className="text-[9px] font-bold uppercase text-white tracking-tight">{item.label}</span>
                       <div className="flex gap-1">
                          {(['Normal', 'Fault'] as const).map(o => (
                             <button 
                                key={o}
                                onClick={() => setData({...data, [item.key]: o} as any)}
                                className={`px-4 py-1 rounded-md text-[7px] font-black uppercase transition-all ${data[item.key as keyof PumpData] === o ? (o === 'Normal' ? 'bg-emerald-600' : 'bg-primary shadow-lg animate-pulse') + ' text-white' : 'bg-background-dark/50 text-text-muted'}`}
                             >
                                {o}
                             </button>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Visual Proof Section */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">photo_camera</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part V: Visual Proof (Max 4)</h3>
           </div>
           <PhotoUploader photos={data.photos} onPhotosChange={handlePhotosChange} />
        </section>

        {/* Observations */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Technician Observation</h3>
           </div>
           <textarea 
              value={data.generalRemarks}
              onChange={(e) => setData({...data, generalRemarks: e.target.value})}
              placeholder="Record any system defects or maintenance actions taken..."
              className="w-full bg-background-dark/50 border-none rounded-xl text-[10px] p-3 h-24 text-white font-bold placeholder:opacity-30"
           />
        </section>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-surface-dark border-t border-white/5 p-5 pb-10 z-50">
         <button onClick={() => navigate(`/checklist/${auditId}`)} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span>Commit Registry</span>
            <span className="material-symbols-outlined text-sm">verified_user</span>
         </button>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const PumpUnitRow: React.FC<{
  component: PumpComponent;
  onUpdate: (upd: Partial<PumpComponent>) => void;
  allowTypeChange?: boolean;
}> = ({ component, onUpdate, allowTypeChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const isFault = component.status === 'Fault';
  const isDiesel = component.type === 'Diesel';

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdate({ photo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${isFault ? 'bg-primary/5 border-primary/20 shadow-lg' : 'bg-background-dark/30 border-white/5'}`}>
       <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
             <div className="flex flex-col">
                <span className="text-[11px] font-black text-white italic uppercase tracking-wider">{component.label}</span>
                <div className="flex gap-2 mt-1">
                  {(['Electric', 'Diesel'] as const).map(t => (
                    <button 
                      key={t}
                      disabled={!allowTypeChange && component.type !== t}
                      onClick={() => onUpdate({ type: t, loadValue: t === 'Electric' ? '0.0' : '100' })}
                      className={`text-[6px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-all ${component.type === t ? 'bg-primary text-white' : 'bg-white/5 text-text-muted'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
             </div>
             <div className="flex gap-1 h-7">
                {(['Normal', 'Fault'] as const).map(s => (
                   <button 
                      key={s} 
                      onClick={() => onUpdate({ status: s })}
                      className={`px-3 rounded-lg text-[7px] font-black uppercase transition-all ${component.status === s ? (s === 'Normal' ? 'bg-emerald-600' : 'bg-primary animate-pulse') + ' text-white' : 'bg-background-dark/50 text-text-muted'}`}
                   >
                      {s}
                   </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1">
                <span className="text-[7px] font-black uppercase text-text-muted ml-1 tracking-widest">Operation Mode</span>
                <select 
                   value={component.mode}
                   onChange={(e) => onUpdate({ mode: e.target.value as any })}
                   className="bg-background-dark border-none rounded-lg h-9 px-2 text-[9px] font-black uppercase text-primary focus:ring-1 focus:ring-primary"
                >
                   <option>Auto</option>
                   <option>Manual</option>
                   <option>Off</option>
                </select>
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[7px] font-black uppercase text-text-muted ml-1 tracking-widest">{component.type === 'Electric' ? 'Load (Ampere)' : 'Fuel Tank (%)'}</span>
                <input 
                   type="text"
                   value={component.loadValue}
                   onChange={(e) => onUpdate({ loadValue: e.target.value })}
                   className={`bg-background-dark border-none rounded-lg h-9 px-2 text-center text-[10px] font-black ${component.type === 'Electric' ? 'text-amber-500' : 'text-blue-400'}`}
                   placeholder={component.type === 'Electric' ? '0.0A' : '100%'}
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
             <div className="flex flex-col gap-1">
                <span className="text-[7px] font-black uppercase text-text-muted ml-1 tracking-widest">Start Point (Bar)</span>
                <input 
                   type="text"
                   value={component.cutIn}
                   onChange={(e) => onUpdate({ cutIn: e.target.value })}
                   className="bg-background-dark/50 border-none rounded-lg h-9 px-2 text-center text-[10px] font-black text-emerald-400"
                   placeholder="0.0"
                />
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[7px] font-black uppercase text-text-muted ml-1 tracking-widest">Stop Point (Bar)</span>
                <input 
                   type="text"
                   value={component.cutOut}
                   onChange={(e) => onUpdate({ cutOut: e.target.value })}
                   className="bg-background-dark/50 border-none rounded-lg h-9 px-2 text-center text-[10px] font-black text-red-400"
                   placeholder="0.0"
                />
             </div>
          </div>

          {isDiesel && (
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3 animate-in slide-in-from-top duration-300">
               <div className="flex flex-col gap-1">
                  <span className="text-[7px] font-black uppercase text-text-muted ml-1 tracking-widest">Battery Volt (V)</span>
                  <input 
                    type="text"
                    value={component.batteryVolt || ''}
                    onChange={(e) => onUpdate({ batteryVolt: e.target.value })}
                    className="bg-background-dark/50 border-none rounded-lg h-9 px-2 text-center text-[10px] font-black text-emerald-500"
                    placeholder="12.6V"
                  />
               </div>
               <div className="flex flex-col gap-1">
                  <span className="text-[7px] font-black uppercase text-text-muted ml-1 tracking-widest">Charger Volt (V)</span>
                  <input 
                    type="text"
                    value={component.chargerVolt || ''}
                    onChange={(e) => onUpdate({ chargerVolt: e.target.value })}
                    className="bg-background-dark/50 border-none rounded-lg h-9 px-2 text-center text-[10px] font-black text-blue-400"
                    placeholder="13.8V"
                  />
               </div>
            </div>
          )}

          {isFault && (
             <div className="flex gap-3 mt-1 animate-in slide-in-from-top duration-300">
                <div 
                   onClick={() => fileRef.current?.click()}
                   className="w-16 h-16 bg-background-dark rounded-xl border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50"
                >
                   {component.photo ? <img src={component.photo} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary/40 text-lg">add_a_photo</span>}
                   <input type="file" ref={fileRef} className="hidden" accept="image/*" capture="environment" onChange={handleFile} />
                </div>
                <textarea 
                   value={component.remarks || ''}
                   onChange={(e) => onUpdate({ remarks: e.target.value })}
                   placeholder="Detail component defect..."
                   className="flex-1 bg-background-dark/50 border-none rounded-xl text-[9px] p-2 h-16 text-white font-bold focus:ring-1 focus:ring-primary"
                />
             </div>
          )}
       </div>
    </div>
  );
};

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

export default PumpSystem;
