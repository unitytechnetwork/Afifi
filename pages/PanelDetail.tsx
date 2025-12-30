
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface PanelSpecs {
  model: string;
  location: string;
  batteryVolt: string;
  chargerVolt: string;
  batteryStatus: 'Normal' | 'Defective';
  testLampStatus: 'Normal' | 'Fault';
  testBatteryStatus: 'Normal' | 'Fault';
  batteryPhoto?: string;
  batteryRemarks?: string;
  panelPhoto?: string;
  panelRemarks?: string;
}

interface CardCondition {
  id: string;
  label: string;
  status: 'Normal' | 'Defective';
  photo?: string;
  remarks?: string;
}

interface ZoneDetail {
  id: string;
  zoneNo: string;
  name: string;
  breakglassQty: string;
  smokeQty: string;
  heatQty: string;
  bellQty: string;
  status: 'Normal' | 'Defective';
  photo?: string;
  remarks?: string;
}

interface PanelIndicator {
  id: string;
  label: string;
  category: 'Pump' | 'Gas' | 'Integration';
  status: 'Normal' | 'Fault' | 'N/A';
  photo?: string;
  remarks?: string;
}

const PanelDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';
  
  const batteryCameraRef = useRef<HTMLInputElement>(null);

  // Default values for robustness
  const DEFAULT_PANEL_SPECS: PanelSpecs = {
    model: 'Morley DXc4',
    location: 'Main Lobby G-Floor',
    batteryVolt: '26.4',
    chargerVolt: '27.2',
    batteryStatus: 'Normal',
    testLampStatus: 'Normal',
    testBatteryStatus: 'Normal',
    panelRemarks: ''
  };

  const DEFAULT_CARDS: CardCondition[] = [
    { id: 'c1', label: 'Charger Card', status: 'Normal' },
    { id: 'c2', label: 'Zone Card', status: 'Normal' },
    { id: 'c3', label: 'Fault Card', status: 'Normal' },
    { id: 'c4', label: 'Power Card', status: 'Normal' },
  ];

  const DEFAULT_INDICATORS: PanelIndicator[] = [
    { id: 'ind1', label: 'Hose Reel Pump Signal', category: 'Pump', status: 'Normal' },
    { id: 'ind2', label: 'Sprinkler Pump Signal', category: 'Pump', status: 'Normal' },
    { id: 'ind3', label: 'Hydrant Pump Signal', category: 'Pump', status: 'Normal' },
    { id: 'ind4', label: 'Gas Discharge Signal', category: 'Gas', status: 'Normal' },
    { id: 'ind5', label: 'Gas System Fault Signal', category: 'Gas', status: 'Normal' },
    { id: 'sig1', label: 'Output Bell Link', category: 'Integration', status: 'Normal' },
    { id: 'sig2', label: 'Lift Homol / Trip Link', category: 'Integration', status: 'Normal' },
    { id: 'sig3', label: 'CMS to Bomba (SPP)', category: 'Integration', status: 'Normal' },
  ];

  // Safe State Initialization
  const [panelSpecs, setPanelSpecs] = useState<PanelSpecs>(() => {
    const saved = localStorage.getItem(`checklist_${auditId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.panelSpecs || DEFAULT_PANEL_SPECS;
      } catch (e) {
        return DEFAULT_PANEL_SPECS;
      }
    }
    return DEFAULT_PANEL_SPECS;
  });

  const [cardConditions, setCardConditions] = useState<CardCondition[]>(() => {
    const saved = localStorage.getItem(`checklist_${auditId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.cardConditions || DEFAULT_CARDS;
      } catch (e) {
        return DEFAULT_CARDS;
      }
    }
    return DEFAULT_CARDS;
  });

  const [zones, setZones] = useState<ZoneDetail[]>(() => {
    const saved = localStorage.getItem(`checklist_${auditId}`);
    const defaultZone = [{ 
      id: 'z1', 
      zoneNo: '1', 
      name: 'Main Lobby', 
      breakglassQty: '0', 
      smokeQty: '0', 
      heatQty: '0', 
      bellQty: '0',
      status: 'Normal' 
    }];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.zones || defaultZone;
      } catch (e) {
        return defaultZone;
      }
    }
    return defaultZone;
  });

  const [indicators, setIndicators] = useState<PanelIndicator[]>(() => {
    const saved = localStorage.getItem(`checklist_${auditId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.indicators || DEFAULT_INDICATORS;
      } catch (e) {
        return DEFAULT_INDICATORS;
      }
    }
    return DEFAULT_INDICATORS;
  });

  const [photos, setPhotos] = useState<string[]>(() => {
    const saved = localStorage.getItem(`checklist_${auditId}`);
    const defaultPhotos = ['', '', '', ''];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.photos || defaultPhotos;
      } catch (e) {
        return defaultPhotos;
      }
    }
    return defaultPhotos;
  });

  const deviceTotals = useMemo(() => {
    return zones.reduce((acc, z) => ({
      smoke: acc.smoke + (parseInt(z.smokeQty) || 0),
      heat: acc.heat + (parseInt(z.heatQty) || 0),
      bell: acc.bell + (parseInt(z.bellQty) || 0),
      breakglass: acc.breakglass + (parseInt(z.breakglassQty) || 0),
    }), { smoke: 0, heat: 0, bell: 0, breakglass: 0 });
  }, [zones]);

  const handleSave = () => {
    const existing = JSON.parse(localStorage.getItem(`checklist_${auditId}`) || '{}');
    const updated = { ...existing, panelSpecs, cardConditions, zones, indicators, photos, isNA: false };
    localStorage.setItem(`checklist_${auditId}`, JSON.stringify(updated));
    navigate(`/checklist/${auditId}`);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>, field: 'batteryPhoto' | 'panelPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPanelSpecs(prev => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const updateCard = (cardId: string, updates: Partial<CardCondition>) => {
    setCardConditions(prev => prev.map(c => c.id === cardId ? { ...c, ...updates } : c));
  };

  const updateIndicator = (indId: string, updates: Partial<PanelIndicator>) => {
    setIndicators(prev => prev.map(ind => ind.id === indId ? { ...ind, ...updates } : ind));
  };

  const addZone = () => {
    const newZone: ZoneDetail = {
      id: Date.now().toString(),
      zoneNo: (zones.length + 1).toString(),
      name: '',
      breakglassQty: '0',
      smokeQty: '0',
      heatQty: '0',
      bellQty: '0',
      status: 'Normal'
    };
    setZones([...zones, newZone]);
  };

  const updateZone = (zoneId: string, updates: Partial<ZoneDetail>) => {
    setZones(prev => prev.map(z => z.id === zoneId ? { ...z, ...updates } : z));
  };

  const deleteZone = (zoneId: string) => {
    setZones(prev => prev.filter(z => z.id !== zoneId));
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar 
        title="Technical Registry" 
        subtitle={`REF: ${auditId}`} 
        showBack 
        onBack={() => navigate(`/checklist/${auditId}`)}
      />

      <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* Device Totals Summary */}
        <section className="bg-gradient-to-br from-primary/20 to-surface-dark p-5 rounded-2xl border border-primary/20 shadow-2xl">
           <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary text-sm material-symbols-filled">analytics</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white italic">Device Inventory Summary</h3>
           </div>
           
           <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Smoke', val: deviceTotals.smoke, icon: 'detector_smoke' },
                { label: 'Heat', val: deviceTotals.heat, icon: 'heat' },
                { label: 'Bell', val: deviceTotals.bell, icon: 'notifications' },
                { label: 'Breakglass', val: deviceTotals.breakglass, icon: 'smart_button' }
              ].map(item => (
                <div key={item.label} className="bg-background-dark/40 p-2 rounded-xl border border-white/5 flex flex-col items-center">
                   <span className="material-symbols-outlined text-[10px] mb-1 text-primary">{item.icon}</span>
                   <span className="text-md font-black leading-none">{item.val}</span>
                   <span className="text-[5px] font-black uppercase text-text-muted mt-1 text-center leading-tight tracking-tighter">{item.label}</span>
                </div>
              ))}
              <div className="col-span-4 bg-primary/20 p-3 rounded-xl flex items-center justify-between border border-primary/30 mt-2">
                 <span className="text-[8px] font-black uppercase text-white tracking-widest">Grand Total Load</span>
                 <span className="text-sm font-black text-white">{(Object.values(deviceTotals) as number[]).reduce((a, b) => a + b, 0)} UNITS</span>
              </div>
           </div>
        </section>

        {/* Part I: Panel Model */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">precision_manufacturing</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part I: Model & Exterior</h3>
           </div>
           
           <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Panel Model</label>
                <input type="text" value={panelSpecs.model} onChange={(e) => setPanelSpecs({...panelSpecs, model: e.target.value})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-bold text-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Location</label>
                <input type="text" value={panelSpecs.location} onChange={(e) => setPanelSpecs({...panelSpecs, location: e.target.value})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-bold focus:ring-1 focus:ring-primary" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between bg-background-dark/30 p-2 rounded-xl border border-white/5">
                 <span className="text-[8px] font-black uppercase text-text-muted tracking-widest">Test Lamp</span>
                 <button onClick={() => setPanelSpecs({...panelSpecs, testLampStatus: panelSpecs.testLampStatus === 'Normal' ? 'Fault' : 'Normal'})} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${panelSpecs.testLampStatus === 'Normal' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-primary border-primary/20 bg-primary/5 animate-pulse'}`}>{panelSpecs.testLampStatus}</button>
              </div>
              <div className="flex items-center justify-between bg-background-dark/30 p-2 rounded-xl border border-white/5">
                 <span className="text-[8px] font-black uppercase text-text-muted tracking-widest">Test Battery</span>
                 <button onClick={() => setPanelSpecs({...panelSpecs, testBatteryStatus: panelSpecs.testBatteryStatus === 'Normal' ? 'Fault' : 'Normal'})} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${panelSpecs.testBatteryStatus === 'Normal' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-primary border-primary/20 bg-primary/5 animate-pulse'}`}>{panelSpecs.testBatteryStatus}</button>
              </div>
           </div>
        </section>

        {/* Part II: Power Supply (Battery & Charger) */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">battery_charging_full</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part II: Power Supply Health</h3>
           </div>
           
           <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                 <label className="text-[8px] font-black text-text-muted uppercase tracking-widest">Battery Status</label>
                 <div className="flex gap-1 h-8">
                    {(['Normal', 'Defective'] as const).map(s => (
                      <button key={s} onClick={() => setPanelSpecs({...panelSpecs, batteryStatus: s})} className={`px-4 rounded-lg text-[8px] font-black uppercase transition-all ${panelSpecs.batteryStatus === s ? (s === 'Normal' ? 'bg-emerald-600 shadow-[0_0_15px_rgba(5,150,105,0.4)]' : 'bg-primary shadow-[0_0_15px_rgba(236,19,19,0.4)]') + ' text-white' : 'bg-background-dark/50 text-text-muted'}`}>{s}</button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Battery (V)</label>
                    <input type="text" value={panelSpecs.batteryVolt} onChange={(e) => setPanelSpecs({...panelSpecs, batteryVolt: e.target.value})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-black text-emerald-500 focus:ring-1 focus:ring-primary" placeholder="e.g. 26.4V" />
                 </div>
                 <div className="flex flex-col gap-1">
                    <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Charger (V)</label>
                    <input type="text" value={panelSpecs.chargerVolt} onChange={(e) => setPanelSpecs({...panelSpecs, chargerVolt: e.target.value})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-black text-blue-400 focus:ring-1 focus:ring-primary" placeholder="e.g. 27.2V" />
                 </div>
              </div>

              {panelSpecs.batteryStatus === 'Defective' && (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex gap-3 animate-in slide-in-from-top duration-300">
                  <div onClick={() => batteryCameraRef.current?.click()} className="w-16 h-16 bg-background-dark rounded-xl border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer">
                      {panelSpecs.batteryPhoto ? <img src={panelSpecs.batteryPhoto} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary opacity-40">add_a_photo</span>}
                      <input type="file" ref={batteryCameraRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => handlePhotoCapture(e, 'batteryPhoto')} />
                  </div>
                  <textarea value={panelSpecs.batteryRemarks || ''} onChange={(e) => setPanelSpecs({...panelSpecs, batteryRemarks: e.target.value})} className="flex-1 bg-background-dark/50 border-none rounded-xl text-[10px] p-2 h-16 text-white focus:ring-1 focus:ring-primary" placeholder="Describe battery defect..." />
                </div>
              )}
           </div>
        </section>

        {/* Part III: Module Card Registry */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">memory</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part III: Card Module Registry</h3>
           </div>
           <div className="flex flex-col gap-3">
              {cardConditions.map(card => (
                 <FaultEntryRow 
                   key={card.id} 
                   label={card.label} 
                   status={card.status} 
                   photo={card.photo}
                   remarks={card.remarks}
                   onStatusChange={(s) => updateCard(card.id, { status: s as any })}
                   onDataChange={(upd) => updateCard(card.id, upd)}
                   faultTerm="Defective"
                 />
              ))}
           </div>
        </section>

        {/* Part IV: Integration Signals */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">hub</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part IV: Integration Signals</h3>
           </div>
           
           <div className="flex flex-col gap-4">
              {['Integration', 'Gas', 'Pump'].map(cat => (
                 <div key={cat} className="flex flex-col gap-2">
                    <span className="text-[8px] font-black uppercase text-text-muted tracking-widest ml-1">{cat === 'Integration' ? 'Main Control Output' : `${cat} Link Status`}</span>
                    {indicators.filter(i => i.category === cat).map(ind => (
                       <FaultEntryRow 
                         key={ind.id}
                         label={ind.label}
                         status={ind.status}
                         photo={ind.photo}
                         remarks={ind.remarks}
                         onStatusChange={(s) => updateIndicator(ind.id, { status: s as any })}
                         onDataChange={(upd) => updateIndicator(ind.id, upd)}
                         options={['Normal', 'Fault', 'N/A']}
                         faultTerm="Fault"
                         isItalicLabel
                       />
                    ))}
                 </div>
              ))}
           </div>
        </section>

        {/* Part V: Zone Registry */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary text-sm">grid_view</span>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part V: Zone Registry</h3>
              </div>
              <button onClick={addZone} className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-primary/20 active:scale-95 transition-all">+ Add Zone</button>
           </div>
           
           <div className="flex flex-col gap-4">
              {zones.map((zone) => (
                <div key={zone.id} className="bg-background-dark/30 rounded-2xl border border-white/5 p-4 flex flex-col gap-4 relative group">
                   <button onClick={() => deleteZone(zone.id)} className="absolute top-4 right-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity"><span className="material-symbols-outlined text-sm">delete</span></button>
                   <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-3 flex flex-col gap-1">
                        <label className="text-[7px] font-black text-text-muted uppercase tracking-widest ml-1">Zone No.</label>
                        <input type="text" value={zone.zoneNo} onChange={(e) => updateZone(zone.id, { zoneNo: e.target.value })} className="bg-background-dark/50 border-none rounded-lg h-9 text-xs font-black text-center text-primary focus:ring-1 focus:ring-primary" />
                      </div>
                      <div className="col-span-9 flex flex-col gap-1">
                        <label className="text-[7px] font-black text-text-muted uppercase tracking-widest ml-1">Location</label>
                        <input type="text" value={zone.name} onChange={(e) => updateZone(zone.id, { name: e.target.value })} className="bg-background-dark/50 border-none rounded-lg h-9 px-3 text-xs font-bold focus:ring-1 focus:ring-primary" placeholder="e.g. Level 3 Server" />
                      </div>
                   </div>
                   <div className="grid grid-cols-4 gap-2 py-2">
                      {[
                        { label: 'SMOKE', key: 'smokeQty', icon: 'detector_smoke' },
                        { label: 'HEAT', key: 'heatQty', icon: 'heat' },
                        { label: 'BELL', key: 'bellQty', icon: 'notifications' },
                        { label: 'BG', key: 'breakglassQty', icon: 'smart_button' }
                      ].map(device => (
                        <div key={device.key} className="bg-background-dark/50 rounded-xl p-2 flex flex-col items-center border border-white/5">
                           <span className="material-symbols-outlined text-[10px] text-primary/50 mb-1">{device.icon}</span>
                           <span className="text-[6px] font-black uppercase text-text-muted tracking-tighter mb-1">{device.label}</span>
                           <input type="number" value={zone[device.key as keyof ZoneDetail] as string} onChange={(e) => updateZone(zone.id, { [device.key]: e.target.value })} className="w-full bg-transparent border-none p-0 text-center text-[10px] font-black focus:ring-0 text-white" />
                        </div>
                      ))}
                   </div>
                   <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-[8px] font-black uppercase text-text-muted tracking-widest">Zone Status</span>
                      <div className="flex gap-1">
                         {(['Normal', 'Defective'] as const).map(s => (
                           <button key={s} onClick={() => updateZone(zone.id, { status: s })} className={`px-3 py-1 rounded-md text-[7px] font-black uppercase transition-all ${zone.status === s ? (s === 'Normal' ? 'bg-emerald-600 text-white' : 'bg-primary text-white') : 'bg-background-dark/50 text-text-muted'}`}>{s}</button>
                         ))}
                      </div>
                   </div>

                   {zone.status === 'Defective' && (
                      <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex gap-3 animate-in slide-in-from-top duration-300">
                        <PhotoCaptureBox 
                          photo={zone.photo} 
                          onCapture={(p) => updateZone(zone.id, { photo: p })} 
                        />
                        <textarea 
                          value={zone.remarks || ''} 
                          onChange={(e) => updateZone(zone.id, { remarks: e.target.value })} 
                          className="flex-1 bg-background-dark/50 border-none rounded-xl text-[10px] p-2 h-16 text-white focus:ring-1 focus:ring-primary" 
                          placeholder="Zone-specific fault details..." 
                        />
                      </div>
                   )}
                </div>
              ))}
           </div>
        </section>

        {/* General Observations */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">edit_note</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part VI: Observations</h3>
           </div>
           <textarea value={panelSpecs.panelRemarks || ''} onChange={(e) => setPanelSpecs({...panelSpecs, panelRemarks: e.target.value})} className="w-full bg-background-dark/50 border-none rounded-xl text-[10px] p-3 h-28 text-white focus:ring-1 focus:ring-primary placeholder:opacity-30" placeholder="Final technician notes..." />
        </section>

        {/* Visual Proof */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">photo_camera</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part VII: Visual Proof (Max 4)</h3>
           </div>
           <PhotoUploader photos={photos} onPhotosChange={setPhotos} />
        </section>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-surface-dark border-t border-white/5 p-5 pb-10 z-50">
         <button onClick={handleSave} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span>Commit Technical Data</span>
            <span className="material-symbols-outlined text-sm">verified_user</span>
         </button>
      </div>
    </div>
  );
};

// --- Helper Components for Fault/Defect Captures ---

const FaultEntryRow: React.FC<{
  label: string;
  status: string;
  photo?: string;
  remarks?: string;
  onStatusChange: (s: string) => void;
  onDataChange: (upd: { photo?: string; remarks?: string }) => void;
  options?: string[];
  faultTerm: string;
  isItalicLabel?: boolean;
}> = ({ label, status, photo, remarks, onStatusChange, onDataChange, options = ['Normal', 'Defective'], faultTerm, isItalicLabel }) => {
  const isFault = status === faultTerm;

  return (
    <div className={`flex flex-col gap-3 p-3 bg-background-dark/30 rounded-xl border transition-all ${isFault ? 'border-primary/40 bg-primary/5' : 'border-white/5'}`}>
       <div className="flex items-center justify-between">
          <span className={`text-[9px] font-black uppercase text-white tracking-tight ${isItalicLabel ? 'italic' : ''}`}>{label}</span>
          <div className="flex gap-1 h-7">
             {options.map(s => (
                <button 
                  key={s} 
                  onClick={() => onStatusChange(s)} 
                  className={`px-3 rounded-lg text-[7px] font-black uppercase transition-all ${status === s ? (s === 'Normal' ? 'bg-emerald-600 text-white' : s === 'N/A' ? 'bg-slate-600 text-white' : 'bg-primary text-white shadow-lg animate-pulse') : 'bg-background-dark/50 text-text-muted'}`}
                >
                   {s}
                </button>
             ))}
          </div>
       </div>

       {isFault && (
          <div className="flex gap-3 animate-in slide-in-from-top duration-300">
             <PhotoCaptureBox photo={photo} onCapture={(p) => onDataChange({ photo: p })} />
             <textarea 
               value={remarks || ''} 
               onChange={(e) => onDataChange({ remarks: e.target.value })} 
               className="flex-1 bg-background-dark/50 border-none rounded-xl text-[9px] p-2 h-16 text-white focus:ring-1 focus:ring-primary" 
               placeholder={`Describe ${label.toLowerCase()} deficiency...`} 
             />
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
    <div 
       onClick={() => fileRef.current?.click()} 
       className="w-16 h-16 bg-background-dark rounded-xl border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50 transition-colors"
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
        <div key={idx} onClick={() => { setActiveIdx(idx); cameraRef.current?.click(); }} className={`aspect-square bg-background-dark rounded-2xl border border-dashed flex flex-col items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition-all group relative ${photos[idx] ? 'border-primary/40' : 'border-white/10 hover:border-primary/40'}`}>
          {photos[idx] ? (
            <>
              <img src={photos[idx]} className="w-full h-full object-cover" />
              <button onClick={(e) => { e.stopPropagation(); removePhoto(idx); }} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white">
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

export default PanelDetail;
