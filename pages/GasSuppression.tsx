
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
  dischargeTimer: string;
  batteryVolt: string;
  chargerVolt: string;
  ampMeter: string;
  acDcStatus: 'Normal' | 'Fault';
  fuseStatus: 'Normal' | 'Blown';
  testBatteryStatus: 'Functional' | 'Faulty';
  smokeQty: string;
  heatQty: string;
  flashingLightQty: string;
  bellQty: string;
  blanketQty: string;
  agentType: string;
  pipingStatus: 'Normal' | 'Corroded' | 'Loose';
  nozzleStatus: 'Clean' | 'Blocked';
  roomSealing: 'Intact' | 'Leaking';
  integrationItems: IntegrationItem[];
  photos: string[]; 
  remarks?: string;
  systemDescription: string;
  systemOverallStatus: 'Normal' | 'Faulty' | 'Partial' | 'N/A';
  overallRemarks: string;
  servicePhotos: string[];
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

  const getDefaultSystem = (): GasSystemEntry => ({
    id: Date.now().toString(),
    panelModel: 'Morley Gas Panel',
    zoneName: 'Server Room',
    cylinderSerial: '',
    cylinderQty: '1',
    dischargeTimer: '30 seconds',
    batteryVolt: '27.2',
    chargerVolt: '27.4',
    ampMeter: '0.5',
    acDcStatus: 'Normal',
    fuseStatus: 'Normal',
    testBatteryStatus: 'Functional',
    smokeQty: '2',
    heatQty: '1',
    flashingLightQty: '1',
    bellQty: '1',
    blanketQty: '1',
    agentType: 'FM-200 (HFC-227ea)',
    pipingStatus: 'Normal',
    nozzleStatus: 'Clean',
    roomSealing: 'Intact',
    integrationItems: [...defaultIntegrationItems],
    photos: [],
    remarks: '',
    systemDescription: 'Gas suppression system maintenance and logic verification.',
    systemOverallStatus: 'Normal',
    overallRemarks: '',
    servicePhotos: ['', '', '', '']
  });

  const [systems, setSystems] = useState<GasSystemEntry[]>(() => {
    const saved = localStorage.getItem(`gas_suppression_${auditId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const dataArr = Array.isArray(parsed) ? parsed : [parsed];
        return dataArr.map((s: any) => ({
          ...getDefaultSystem(),
          ...s,
          photos: s.photos || [],
          servicePhotos: s.servicePhotos || ['', '', '', ''],
          integrationItems: Array.isArray(s.integrationItems) ? s.integrationItems : [...defaultIntegrationItems]
        }));
      } catch (e) { console.error(e); }
    }
    return [getDefaultSystem()];
  });

  const [activeSystemId, setActiveSystemId] = useState<string>(systems[0]?.id || '');
  const activeSystem = systems.find(s => s.id === activeSystemId);

  useEffect(() => {
    localStorage.setItem(`gas_suppression_${auditId}`, JSON.stringify(systems));
  }, [systems, auditId]);

  const updateActiveSystem = (updates: Partial<GasSystemEntry>) => {
    setSystems(prev => prev.map(s => s.id === activeSystemId ? { ...s, ...updates } : s));
  };

  const updateIntegrationItem = (itemId: string, itemUpdates: Partial<IntegrationItem>) => {
    if (!activeSystem) return;
    const updatedItems = activeSystem.integrationItems.map(item => item.id === itemId ? { ...item, ...itemUpdates } : item);
    updateActiveSystem({ integrationItems: updatedItems });
  };

  const handleSave = () => {
    localStorage.setItem(`gas_suppression_${auditId}`, JSON.stringify(systems));
    navigate(`/checklist/${auditId}`);
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="Gas Systems" subtitle={`SITE REF: ${auditId}`} showBack />
      
      <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* Zone Selector */}
        <section className="bg-surface-dark p-2 rounded-2xl border border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
           {systems.map((s, idx) => (
              <button key={s.id} onClick={() => setActiveSystemId(s.id)} className={`flex-shrink-0 px-5 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeSystemId === s.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background-dark/50 text-text-muted hover:bg-white/5'}`}>
                 <span className="material-symbols-outlined text-sm">{activeSystemId === s.id ? 'settings_suggest' : 'gas_meter'}</span>{s.zoneName || `Zone ${idx + 1}`}
              </button>
           ))}
           <button onClick={() => { const ns = getDefaultSystem(); setSystems([...systems, ns]); setActiveSystemId(ns.id); }} className="flex-shrink-0 px-4 h-11 rounded-xl bg-white/5 border border-white/10 text-primary flex items-center justify-center active:scale-95"><span className="material-symbols-outlined">add</span></button>
        </section>

        {activeSystem ? (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right duration-300">
            
            {/* AUDIT PROFILE */}
            <section className="bg-primary/10 border border-primary/20 p-5 rounded-2xl flex flex-col gap-4 shadow-lg shadow-primary/5">
               <div className="flex justify-between items-center border-b border-primary/20 pb-3">
                  <h3 className="text-[11px] font-black uppercase text-white tracking-widest italic">System Audit Profile</h3>
                  <select value={activeSystem.systemOverallStatus} onChange={(e) => updateActiveSystem({ systemOverallStatus: e.target.value as any })} className="bg-background-dark/50 border border-primary/40 rounded px-2 h-6 text-[8px] font-black uppercase text-white">
                    <option value="Normal">Normal</option><option value="Faulty">Faulty</option><option value="Partial">Partial</option><option value="N/A">N/A</option>
                  </select>
               </div>
               <textarea value={activeSystem.systemDescription} onChange={(e) => updateActiveSystem({ systemDescription: e.target.value })} className="bg-background-dark/50 border-white/5 border rounded-xl p-3 text-xs font-medium h-16 text-white" placeholder="Description..." />
            </section>

            {/* PART I: PANEL & ZONE */}
            <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3"><span className="material-symbols-outlined text-primary text-sm">settings_input_hdmi</span><h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part I: Panel & Zone</h3></div>
               <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1"><label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Panel Model</label><input type="text" value={activeSystem.panelModel} onChange={(e) => updateActiveSystem({ panelModel: e.target.value })} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-bold text-primary focus:ring-1 focus:ring-primary" /></div>
                  <div className="flex flex-col gap-1"><label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Protected Zone</label><input type="text" value={activeSystem.zoneName} onChange={(e) => updateActiveSystem({ zoneName: e.target.value })} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-bold focus:ring-1 focus:ring-primary" /></div>
               </div>
            </section>

            {/* PART II: TECHNICAL OUTPUT */}
            <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3"><span className="material-symbols-outlined text-primary text-sm">bolt</span><h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part II: Technical Output</h3></div>
               <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1"><label className="text-[8px] font-black text-text-muted uppercase tracking-widest text-center">Volt (V)</label><input type="text" value={activeSystem.batteryVolt} onChange={(e) => updateActiveSystem({ batteryVolt: e.target.value })} className="bg-background-dark/50 border-none rounded-xl h-11 px-2 text-center text-xs font-black text-emerald-500" /></div>
                  <div className="flex flex-col gap-1"><label className="text-[8px] font-black text-text-muted uppercase tracking-widest text-center">Charger (V)</label><input type="text" value={activeSystem.chargerVolt} onChange={(e) => updateActiveSystem({ chargerVolt: e.target.value })} className="bg-background-dark/50 border-none rounded-xl h-11 px-2 text-center text-xs font-black text-blue-400" /></div>
                  <div className="flex flex-col gap-1"><label className="text-[8px] font-black text-text-muted uppercase tracking-widest text-center">Timer (S)</label><input type="text" value={activeSystem.dischargeTimer} onChange={(e) => updateActiveSystem({ dischargeTimer: e.target.value })} className="bg-background-dark/50 border-none rounded-xl h-11 px-2 text-center text-xs font-black text-amber-500" /></div>
               </div>
            </section>

            {/* PART III: DEVICE INVENTORY */}
            <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3"><span className="material-symbols-outlined text-primary text-sm">grid_view</span><h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part III: Device Inventory</h3></div>
               <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: 'Smoke', key: 'smokeQty' },
                    { label: 'Heat', key: 'heatQty' },
                    { label: 'Bell', key: 'bellQty' },
                    { label: 'Flash', key: 'flashingLightQty' },
                    { label: 'Trip', key: 'blanketQty' }
                  ].map(dev => (
                    <div key={dev.key} className="flex flex-col gap-1">
                       <label className="text-[7px] font-black text-text-muted uppercase text-center">{dev.label}</label>
                       <input type="number" value={(activeSystem as any)[dev.key]} onChange={(e) => updateActiveSystem({ [dev.key]: e.target.value })} className="bg-background-dark/50 border-none rounded h-8 text-[10px] text-center font-black text-white" />
                    </div>
                  ))}
               </div>
            </section>

            {/* PART IV: INTEGRATION LOGIC */}
            <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3"><span className="material-symbols-outlined text-primary text-sm">hub</span><h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part IV: Integration Logic</h3></div>
               <div className="flex flex-col gap-4">
                  {activeSystem.integrationItems?.filter(Boolean).map(item => (
                    <IntegrationFaultRow key={item.id} item={item} onUpdate={(upd) => updateIntegrationItem(item.id, upd)} />
                  ))}
               </div>
            </section>

            {/* PART V: FORENSIC EVIDENCE */}
            <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3"><span className="material-symbols-outlined text-primary text-sm">photo_camera</span><h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part V: Forensic Evidence</h3></div>
               <PhotoUploader photos={activeSystem.photos} onPhotosChange={(p) => updateActiveSystem({ photos: p })} />
            </section>

            {/* PART VI: SERVICE VERIFICATION & REMARKS */}
            <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
               <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <span className="material-symbols-outlined text-primary text-sm">history_edu</span>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part VI: Service Verification & Remarks</h3>
               </div>
               
               <div className="flex flex-col gap-2 mb-4">
                  <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Overall System Condition</label>
                  <textarea 
                    value={activeSystem.overallRemarks} 
                    onChange={(e) => updateActiveSystem({ overallRemarks: e.target.value })} 
                    className="w-full bg-background-dark/50 border-none rounded-xl p-4 text-xs font-medium text-white h-24 focus:ring-1 focus:ring-primary" 
                    placeholder="General condition of piping, nozzle, cylinder, and room sealing details..." 
                  />
               </div>

               <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1 mb-2 block">Service Evidence Photos (4)</label>
               <div className="grid grid-cols-4 gap-3">
                  {activeSystem.servicePhotos.map((photo, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                       <PhotoCaptureBox 
                         photo={photo} 
                         onCapture={(p) => {
                            const newPhotos = [...activeSystem.servicePhotos];
                            newPhotos[idx] = p;
                            updateActiveSystem({ servicePhotos: newPhotos });
                         }} 
                       />
                       <span className="text-[6px] font-black text-text-muted uppercase text-center">Img {idx+1}</span>
                    </div>
                  ))}
               </div>
            </section>

          </div>
        ) : <div className="py-20 text-center opacity-20"><span className="material-symbols-outlined text-6xl">gas_meter</span><p className="mt-2 font-black uppercase tracking-widest">System Not Ready</p></div>}
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-surface-dark border-t border-white/5 p-5 pb-10 z-50">
         <button onClick={handleSave} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span>Commit Gas Registry</span>
            <span className="material-symbols-outlined text-sm">verified_user</span>
         </button>
      </div>
    </div>
  );
};

const IntegrationFaultRow: React.FC<{ item: IntegrationItem; onUpdate: (upd: Partial<IntegrationItem>) => void }> = ({ item, onUpdate }) => {
  const cameraRef = useRef<HTMLInputElement>(null);
  if (!item) return null;

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
                <button key={opt} onClick={() => onUpdate({ status: opt })} className={`px-3 rounded-lg text-[7px] font-black uppercase transition-all ${item.status === opt ? (opt === 'Functional' ? 'bg-emerald-600 shadow-lg' : opt === 'Faulty' ? 'bg-primary shadow-lg' : 'bg-slate-600') + ' text-white' : 'bg-background-dark/50 text-text-muted hover:bg-white/5'}`}>{opt}</button>
             ))}
          </div>
       </div>
       {isFaulty && (
         <div className="flex gap-3 pt-4 animate-in slide-in-from-top duration-300">
            <div onClick={() => cameraRef.current?.click()} className="w-16 h-16 bg-background-dark rounded-xl border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50">{item.photo ? <img src={item.photo} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary/40 text-lg">add_a_photo</span>}<input type="file" ref={cameraRef} className="hidden" accept="image/*" capture="environment" onChange={handleCapture} /></div>
            <textarea value={item.remarks || ''} onChange={(e) => onUpdate({ remarks: e.target.value })} className="flex-1 bg-background-dark/50 border-none rounded-xl text-[9px] p-2 h-16 text-white focus:ring-1 focus:ring-primary placeholder:text-white/10" placeholder="Detail the fault..." />
         </div>
       )}
    </div>
  );
};

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
    <div onClick={() => fileRef.current?.click()} className="w-16 h-16 bg-background-dark/80 rounded-xl border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50 transition-colors shadow-inner">
      {photo ? (
        <img src={photo} className="w-full h-full object-cover" />
      ) : (
        <span className="material-symbols-outlined text-primary/40 text-lg">add_a_photo</span>
      )}
      <input type="file" ref={fileRef} className="hidden" accept="image/*" capture="environment" onChange={handleFile} />
    </div>
  );
};

const PhotoUploader: React.FC<{ photos: string[]; onPhotosChange: (p: string[]) => void; }> = ({ photos, onPhotosChange }) => {
  const cameraRef = useRef<HTMLInputElement>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeIdx !== null) {
      const reader = new FileReader();
      reader.onloadend = () => { const newPhotos = [...photos]; newPhotos[activeIdx] = reader.result as string; onPhotosChange(newPhotos); };
      reader.readAsDataURL(file);
    }
  };
  const slots = [0, 1, 2, 3];
  return (<div className="grid grid-cols-4 gap-3">{slots.map((idx) => (<div key={idx} onClick={() => { setActiveIdx(idx); cameraRef.current?.click(); }} className={`aspect-square bg-background-dark rounded-2xl border border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-all group relative ${photos[idx] ? 'border-primary/40' : 'border-white/10 hover:border-primary/40'}`}>{photos[idx] ? (<><img src={photos[idx]} className="w-full h-full object-cover" /><button onClick={(e) => { e.stopPropagation(); const p = photos.filter((_, i) => i !== idx); onPhotosChange(p); }} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white"><span className="material-symbols-outlined text-[12px]">close</span></button></>) : (<><span className="material-symbols-outlined text-xl opacity-20 group-hover:opacity-100 transition-opacity">add_a_photo</span></>)}</div>))}<input type="file" ref={cameraRef} className="hidden" accept="image/*" capture="environment" onChange={handleCapture} /></div>);
}

export default GasSuppression;
