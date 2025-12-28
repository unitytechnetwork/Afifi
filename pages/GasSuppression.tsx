
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface IntegrationItem {
  id: string;
  label: string;
  status: 'Functional' | 'Faulty' | 'N/A';
  photo?: string;
  remarks?: string;
}

interface GasSystemEntry {
  id: string;
  panelModel: string;
  zoneName: string;
  cylinderSerial: string;
  cylinderQty: string;
  // Technical Params (Power & Internal)
  dischargeTimer: string;
  batteryVolt: string; // Volt Meter
  chargerVolt: string; // Added Charger Volt
  ampMeter: string;    // Amp Meter
  acDcStatus: 'Normal' | 'Fault'; // Main Fail
  fuseStatus: 'Normal' | 'Blown';
  testBatteryStatus: 'Functional' | 'Faulty';
  // Device Inventory
  smokeQty: string;
  heatQty: string;
  flashingLightQty: string;
  bellQty: string;
  // Added agentType to interface to fix TypeScript error
  agentType: string;
  // Physical Infrastructure
  pipingStatus: 'Normal' | 'Corroded' | 'Loose';
  nozzleStatus: 'Clean' | 'Blocked';
  roomSealing: 'Intact' | 'Leaking';
  // Logic & Interface Controls
  integrationItems: IntegrationItem[];
  // General
  photos: string[]; // Updated to support multiple photos
  remarks?: string;
}

const GasSuppression: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';

  const defaultIntegrationItems: IntegrationItem[] = [
    { id: 'bell_switch', label: 'Bell Switch Control', status: 'Functional' },
    { id: 'test_lamp', label: 'Lamp Test Feature', status: 'Functional' },
    { id: 'buzzer', label: 'Internal Buzzer Health', status: 'Functional' },
    { id: 'manual_key', label: 'Manual Key Switch', status: 'Functional' },
    { id: 'flashing_light', label: 'Visual Alarm (Flashing)', status: 'Functional' },
    { id: 'blanket', label: 'Blanket / Shutter Trip', status: 'Functional' },
    { id: 'fan', label: 'Aircon / Fan Trip', status: 'Functional' },
    { id: 'abort', label: 'Abort Switch Health', status: 'Functional' },
    { id: 'manual_release', label: 'Manual Release Health', status: 'Functional' },
  ];

  const [systems, setSystems] = useState<GasSystemEntry[]>(() => {
    const saved = localStorage.getItem(`gas_suppression_${auditId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate legacy single photo to array if necessary and add new fields
      return parsed.map((s: any) => ({
        ...s,
        photos: s.photos || (s.photo ? [s.photo] : []),
        chargerVolt: s.chargerVolt || '27.4'
      }));
    }
    return [{
      id: Date.now().toString(),
      panelModel: '',
      zoneName: 'Server Room A',
      cylinderSerial: '',
      cylinderQty: '1',
      dischargeTimer: '30 seconds',
      batteryVolt: '27.2',
      chargerVolt: '27.4',
      ampMeter: '0.5',
      acDcStatus: 'Normal',
      fuseStatus: 'Normal',
      testBatteryStatus: 'Functional',
      smokeQty: '0',
      heatQty: '0',
      flashingLightQty: '0',
      bellQty: '0',
      agentType: 'FM-200 (HFC-227ea)',
      pipingStatus: 'Normal',
      nozzleStatus: 'Clean',
      roomSealing: 'Intact',
      integrationItems: [...defaultIntegrationItems],
      photos: [],
      remarks: ''
    }];
  });

  const [activeSystemId, setActiveSystemId] = useState<string>(systems[0]?.id || '');

  useEffect(() => {
    localStorage.setItem(`gas_suppression_${auditId}`, JSON.stringify(systems));
  }, [systems, auditId]);

  const addSystem = () => {
    const newSys: GasSystemEntry = {
      id: Date.now().toString(),
      panelModel: '',
      zoneName: `Zone ${systems.length + 1}`,
      cylinderSerial: '',
      cylinderQty: '1',
      dischargeTimer: '30 seconds',
      batteryVolt: '27.2',
      chargerVolt: '27.4',
      ampMeter: '0.5',
      acDcStatus: 'Normal',
      fuseStatus: 'Normal',
      testBatteryStatus: 'Functional',
      smokeQty: '0',
      heatQty: '0',
      flashingLightQty: '0',
      bellQty: '0',
      agentType: 'FM-200 (HFC-227ea)',
      pipingStatus: 'Normal',
      nozzleStatus: 'Clean',
      roomSealing: 'Intact',
      integrationItems: [...defaultIntegrationItems],
      photos: [],
      remarks: ''
    };
    setSystems([...systems, newSys]);
    setActiveSystemId(newSys.id);
  };

  const updateActiveSystem = (updates: Partial<GasSystemEntry>) => {
    setSystems(prev => prev.map(s => s.id === activeSystemId ? { ...s, ...updates } : s));
  };

  const updateIntegrationItem = (itemId: string, itemUpdates: Partial<IntegrationItem>) => {
    const currentSystem = systems.find(s => s.id === activeSystemId);
    if (!currentSystem) return;

    const updatedItems = currentSystem.integrationItems.map(item => 
      item.id === itemId ? { ...item, ...itemUpdates } : item
    );
    updateActiveSystem({ integrationItems: updatedItems });
  };

  const deleteSystem = (sysId: string) => {
    if (systems.length <= 1) {
      alert("At least one gas system registry must remain.");
      return;
    }
    const filtered = systems.filter(s => s.id !== sysId);
    setSystems(filtered);
    if (activeSystemId === sysId) {
      setActiveSystemId(filtered[0].id);
    }
  };

  const activeSystem = systems.find(s => s.id === activeSystemId);

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="Gas Systems" subtitle={`SITE REF: ${auditId}`} showBack />

      <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* System Selector Tab */}
        <section className="bg-surface-dark p-2 rounded-2xl border border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
           {systems.map((s, idx) => (
              <button 
                key={s.id}
                onClick={() => setActiveSystemId(s.id)}
                className={`flex-shrink-0 px-5 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeSystemId === s.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background-dark/50 text-text-muted hover:bg-white/5'}`}
              >
                 <span className="material-symbols-outlined text-sm">{activeSystemId === s.id ? 'settings_suggest' : 'gas_meter'}</span>
                 {s.zoneName || `Zone ${idx + 1}`}
              </button>
           ))}
           <button 
             onClick={addSystem}
             className="flex-shrink-0 px-4 h-11 rounded-xl bg-white/5 border border-white/10 text-primary flex items-center justify-center active:scale-95"
           >
              <span className="material-symbols-outlined">add</span>
           </button>
        </section>

        {activeSystem ? (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex justify-between items-center px-1">
               <div className="flex flex-col">
                  <h2 className="text-sm font-black uppercase tracking-widest text-white italic">Technical Registry</h2>
                  <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Configuring Active Sheet</span>
               </div>
               <button 
                 onClick={() => deleteSystem(activeSystem.id)}
                 className="flex items-center gap-2 text-primary/50 hover:text-primary transition-colors active:scale-90"
               >
                  <span className="text-[8px] font-black uppercase tracking-widest">Delete Sheet</span>
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
               </button>
            </div>

            {/* Part I: Panel & Context */}
            <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <span className="material-symbols-outlined text-primary text-sm">settings_input_hdmi</span>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part I: Panel & Zone Context</h3>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                       <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Panel Model</label>
                       <input 
                          type="text" 
                          value={activeSystem.panelModel}
                          onChange={(e) => updateActiveSystem({ panelModel: e.target.value })}
                          placeholder="Sigma XT"
                          className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-bold text-primary focus:ring-1 focus:ring-primary"
                       />
                    </div>
                    <div className="flex flex-col gap-1">
                       <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Protected Zone</label>
                       <input 
                          type="text" 
                          value={activeSystem.zoneName}
                          onChange={(e) => updateActiveSystem({ zoneName: e.target.value })}
                          placeholder="e.g. UPS Room"
                          className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-bold focus:ring-1 focus:ring-primary"
                       />
                    </div>
                  </div>
               </div>
            </section>

            {/* Part II: Power Monitoring & Health */}
            <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <span className="material-symbols-outlined text-primary text-sm">bolt</span>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part II: Power & Internal Health</h3>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                       <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1 text-center">Volt Meter (V)</label>
                       <input 
                          type="text" 
                          value={activeSystem.batteryVolt}
                          onChange={(e) => updateActiveSystem({ batteryVolt: e.target.value })}
                          className="bg-background-dark/50 border-none rounded-xl h-11 px-2 text-center text-xs font-black text-emerald-500"
                       />
                    </div>
                    <div className="flex flex-col gap-1">
                       <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1 text-center">Charger Volt (V)</label>
                       <input 
                          type="text" 
                          value={activeSystem.chargerVolt}
                          onChange={(e) => updateActiveSystem({ chargerVolt: e.target.value })}
                          className="bg-background-dark/50 border-none rounded-xl h-11 px-2 text-center text-xs font-black text-blue-400"
                       />
                    </div>
                    <div className="flex flex-col gap-1">
                       <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1 text-center">Amp Meter (A)</label>
                       <input 
                          type="text" 
                          value={activeSystem.ampMeter}
                          onChange={(e) => updateActiveSystem({ ampMeter: e.target.value })}
                          className="bg-background-dark/50 border-none rounded-xl h-11 px-2 text-center text-xs font-black text-amber-500"
                       />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                     {[
                        { label: 'Main Fail', key: 'acDcStatus', options: ['Normal', 'Fault'] },
                        { label: 'Fuse Status', key: 'fuseStatus', options: ['Normal', 'Blown'] },
                        { label: 'Test Battery', key: 'testBatteryStatus', options: ['Functional', 'Faulty'] }
                     ].map(item => (
                        <div key={item.key} className="bg-background-dark/30 p-2 rounded-xl border border-white/5 flex flex-col items-center">
                           <span className="text-[6px] font-black uppercase text-text-muted mb-2">{item.label}</span>
                           <div className="flex flex-col gap-1 w-full">
                              {item.options.map(opt => (
                                 <button
                                    key={opt}
                                    onClick={() => updateActiveSystem({ [item.key]: opt })}
                                    className={`py-1 rounded text-[7px] font-black uppercase transition-all ${activeSystem[item.key as keyof GasSystemEntry] === opt ? (opt === 'Normal' || opt === 'Functional' ? 'bg-emerald-600' : 'bg-primary') + ' text-white' : 'bg-background-dark/50 text-text-muted'}`}
                                 >
                                    {opt}
                                 </button>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* Part III: Device Inventory */}
            <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <span className="material-symbols-outlined text-primary text-sm">inventory</span>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part III: Local Device Inventory</h3>
               </div>
               <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Smoke', key: 'smokeQty', icon: 'detector_smoke' },
                    { label: 'Heat', key: 'heatQty', icon: 'heat' },
                    { label: 'Flash Light', key: 'flashingLightQty', icon: 'flashlight_on' },
                    { label: 'Bell', key: 'bellQty', icon: 'notifications' }
                  ].map(device => (
                    <div key={device.key} className="bg-background-dark/50 rounded-xl p-2 flex flex-col items-center border border-white/5">
                       <span className="material-symbols-outlined text-[10px] text-primary/50 mb-1">{device.icon}</span>
                       <span className="text-[6px] font-black uppercase text-text-muted tracking-tighter mb-1">{device.label}</span>
                       <input 
                          type="number" 
                          value={activeSystem[device.key as keyof GasSystemEntry] as string} 
                          onChange={(e) => updateActiveSystem({ [device.key]: e.target.value })}
                          className="w-full bg-transparent border-none p-0 text-center text-[11px] font-black focus:ring-0 text-white"
                       />
                    </div>
                  ))}
               </div>
            </section>

            {/* Part IV: Physical Distribution (Piping & Nozzles) */}
            <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <span className="material-symbols-outlined text-primary text-sm">account_tree</span>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part IV: Infrastructure Integrity</h3>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background-dark/30 p-3 rounded-xl border border-white/5">
                     <label className="text-[8px] font-black text-text-muted uppercase tracking-widest block mb-2">Piping Integrity</label>
                     <div className="flex flex-col gap-1">
                        {['Normal', 'Corroded', 'Loose'].map(opt => (
                           <button 
                             key={opt}
                             onClick={() => updateActiveSystem({ pipingStatus: opt as any })}
                             className={`py-2 rounded-lg text-[7px] font-black uppercase transition-all ${activeSystem.pipingStatus === opt ? 'bg-primary text-white' : 'bg-background-dark/50 text-text-muted'}`}
                           >
                              {opt}
                           </button>
                        ))}
                     </div>
                  </div>
                  <div className="bg-background-dark/30 p-3 rounded-xl border border-white/5">
                     <label className="text-[8px] font-black text-text-muted uppercase tracking-widest block mb-2">Nozzle Health</label>
                     <div className="flex flex-col gap-1">
                        {['Clean', 'Blocked'].map(opt => (
                           <button 
                             key={opt}
                             onClick={() => updateActiveSystem({ nozzleStatus: opt as any })}
                             className={`py-2 rounded-lg text-[7px] font-black uppercase transition-all ${activeSystem.nozzleStatus === opt ? (opt === 'Clean' ? 'bg-emerald-600' : 'bg-primary') + ' text-white' : 'bg-background-dark/50 text-text-muted'}`}
                           >
                              {opt}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            </section>

            {/* Part V: Critical Logic & Integration */}
            <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <span className="material-symbols-outlined text-primary text-sm">hub</span>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part V: Output & Control Logic</h3>
               </div>
               <div className="flex flex-col gap-4">
                  {activeSystem.integrationItems.map(item => (
                    <IntegrationFaultRow 
                      key={item.id} 
                      item={item} 
                      onUpdate={(upd) => updateIntegrationItem(item.id, upd)} 
                    />
                  ))}
               </div>
            </section>

            {/* Visual Proof / Forensic Evidence (Updated to 4 Photos) */}
            <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <span className="material-symbols-outlined text-primary text-sm">photo_camera</span>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part VI: Forensic Evidence</h3>
               </div>
               <div className="flex flex-col gap-4">
                 <PhotoUploader 
                   photos={activeSystem.photos} 
                   onPhotosChange={(p) => updateActiveSystem({ photos: p })} 
                 />
                 <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">System Remarks</label>
                    <textarea 
                       value={activeSystem.remarks || ''}
                       onChange={(e) => updateActiveSystem({ remarks: e.target.value })}
                       placeholder="Final technical notes for this system..."
                       className="w-full bg-background-dark/50 border-none rounded-xl text-[10px] p-3 h-20 text-white placeholder-white/10 font-bold"
                    />
                 </div>
               </div>
            </section>
          </div>
        ) : (
          <div className="py-20 text-center opacity-20">
             <span className="material-symbols-outlined text-6xl">gas_meter</span>
             <p className="mt-2 font-black uppercase tracking-widest">Select a zone to begin registry</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-surface-dark border-t border-white/5 p-5 pb-10 z-50">
         <button 
           onClick={() => navigate(`/checklist/${auditId}`)}
           className="w-full h-14 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
         >
            <span>Save All Gas Sheets</span>
            <span className="material-symbols-outlined text-sm">inventory</span>
         </button>
      </div>
    </div>
  );
};

const IntegrationFaultRow: React.FC<{ 
  item: IntegrationItem; 
  onUpdate: (upd: Partial<IntegrationItem>) => void 
}> = ({ item, onUpdate }) => {
  const cameraRef = useRef<HTMLInputElement>(null);
  const isFaulty = item.status === 'Faulty';

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onUpdate({ photo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${isFaulty ? 'bg-primary/5 border-primary/20' : 'bg-background-dark/30 border-white/5'}`}>
       <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase text-white tracking-tight">{item.label}</span>
          <div className="flex gap-1 h-8">
             {(['Functional', 'Faulty', 'N/A'] as const).map(opt => (
                <button 
                   key={opt}
                   onClick={() => onUpdate({ status: opt })}
                   className={`px-3 rounded-lg text-[7px] font-black uppercase transition-all ${item.status === opt ? (opt === 'Functional' ? 'bg-emerald-600 shadow-lg' : opt === 'Faulty' ? 'bg-primary shadow-lg' : 'bg-slate-600') + ' text-white' : 'bg-background-dark/50 text-text-muted hover:bg-white/5'}`}
                >
                   {opt}
                </button>
             ))}
          </div>
       </div>

       {isFaulty && (
         <div className="flex gap-3 pt-4 animate-in slide-in-from-top duration-300">
            <div 
               onClick={() => cameraRef.current?.click()}
               className="w-16 h-16 bg-background-dark rounded-xl border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50"
            >
               {item.photo ? (
                 <img src={item.photo} className="w-full h-full object-cover" />
               ) : (
                 <span className="material-symbols-outlined text-primary/40 text-lg">add_a_photo</span>
               )}
               <input type="file" ref={cameraRef} className="hidden" accept="image/*" capture="environment" onChange={handleCapture} />
            </div>
            <textarea 
              value={item.remarks || ''} 
              onChange={(e) => onUpdate({ remarks: e.target.value })} 
              className="flex-1 bg-background-dark/50 border-none rounded-xl text-[9px] p-2 h-16 text-white focus:ring-1 focus:ring-primary placeholder:text-white/10" 
              placeholder="Detail the fault for this output/switch..." 
            />
         </div>
       )}
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
    const newPhotos = photos.filter((_, i) => i !== idx);
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
}

export default GasSuppression;
