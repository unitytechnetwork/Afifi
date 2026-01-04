
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface PanelSpecs {
  model: string;
  location: string;
  totalZones: string;
  batteryVolt: string;
  chargerVolt: string;
  batteryStatus: 'Normal' | 'Defective';
  testLampStatus: 'Normal' | 'Fault';
  testBatteryStatus: 'Normal' | 'Fault';
  batteryRemarks?: string;
  panelRemarks?: string;
  panelPhoto?: string;
  batteryPhoto?: string;
}

interface CardCondition {
  id: string;
  label: string;
  status: 'Normal' | 'Defective';
  remarks?: string;
  photo?: string;
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
  remarks?: string;
  photo?: string;
}

interface PanelIndicator {
  id: string;
  label: string;
  category: 'Pump' | 'Gas' | 'Integration';
  status: 'Normal' | 'Fault' | 'N/A';
  remarks?: string;
  photo?: string;
}

interface PanelSystemEntry {
  id: string;
  systemName: string;
  systemDescription: string;
  systemOverallStatus: 'Normal' | 'Faulty' | 'Partial' | 'N/A';
  panelSpecs: PanelSpecs;
  cardConditions: CardCondition[];
  indicators: PanelIndicator[];
  zones: ZoneDetail[];
  overallRemarks: string;
  servicePhotos: string[];
}

const PanelDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';

  const defaultDescription = 'The main fire alarm system comprises a fire alarm control panel, primary and standby power supply with battery backup, detection devices, and alarm notification appliances. The system is designed to detect fire conditions and provide early warning to occupants. Inspection was carried out to verify system configuration, power supply condition, battery status, detection devices, and alarm signal functionality as part of routine service maintenance.';

  const getDefaultSystem = (index: number): PanelSystemEntry => ({
    id: Date.now().toString() + index,
    systemName: index === 0 ? 'Main Panel' : `Sub Panel ${index}`,
    systemDescription: defaultDescription,
    systemOverallStatus: 'Normal',
    panelSpecs: {
      model: 'Morley DXc4',
      location: '',
      totalZones: '4',
      batteryVolt: '26.4',
      chargerVolt: '27.2',
      batteryStatus: 'Normal',
      testLampStatus: 'Normal',
      testBatteryStatus: 'Normal',
      panelRemarks: '',
      batteryRemarks: ''
    },
    cardConditions: [
      { id: 'c1', label: 'Charger Card', status: 'Normal', remarks: '' },
      { id: 'c2', label: 'Zone Card', status: 'Normal', remarks: '' },
      { id: 'c3', label: 'Fault Card', status: 'Normal', remarks: '' },
      { id: 'c4', label: 'Power Card', status: 'Normal', remarks: '' },
    ],
    indicators: [
      { id: 'i1', label: 'Jockey Pump Signal', category: 'Pump', status: 'Normal', remarks: '' },
      { id: 'i2', label: 'Duty Pump Signal', category: 'Pump', status: 'Normal', remarks: '' },
      { id: 'i3', label: 'Standby Pump Signal', category: 'Pump', status: 'Normal', remarks: '' },
      { id: 'i4', label: 'Gas System Status', category: 'Gas', status: 'Normal', remarks: '' },
      { id: 'i5', label: 'Gas Discharge Signal', category: 'Gas', status: 'Normal', remarks: '' },
    ],
    zones: [{ 
      id: 'z1', zoneNo: '1', name: 'Main Lobby', breakglassQty: '4', smokeQty: '8', heatQty: '2', bellQty: '4', status: 'Normal', remarks: '' 
    }],
    overallRemarks: '',
    servicePhotos: ['', '', '', '']
  });

  const [systems, setSystems] = useState<PanelSystemEntry[]>(() => {
    const saved = localStorage.getItem(`checklist_${auditId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && !Array.isArray(parsed) && parsed.panelSpecs) {
          return [{
            ...getDefaultSystem(0),
            ...parsed,
            id: 'legacy-panel',
            systemName: 'Main Panel'
          }];
        }
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return [getDefaultSystem(0)];
  });

  const [activeSystemId, setActiveSystemId] = useState<string>(systems[0]?.id || '');
  const activeSystem = systems.find(s => s.id === activeSystemId);

  useEffect(() => {
    localStorage.setItem(`checklist_${auditId}`, JSON.stringify(systems));
  }, [systems, auditId]);

  const updateActiveSystem = (updates: Partial<PanelSystemEntry>) => {
    setSystems(prev => prev.map(s => s.id === activeSystemId ? { ...s, ...updates } : s));
  };

  const handleSave = () => {
    localStorage.setItem(`checklist_${auditId}`, JSON.stringify(systems));
    navigate(`/checklist/${auditId}`);
  };

  const addNewPanel = () => {
    const nextIdx = systems.length;
    const newSys = getDefaultSystem(nextIdx);
    setSystems([...systems, newSys]);
    setActiveSystemId(newSys.id);
  };

  const deletePanel = (e: React.MouseEvent, panelId: string) => {
    e.stopPropagation();
    if (systems.length <= 1) {
       alert("Sistem terakhir tidak boleh dipadam.");
       return;
    }
    if (window.confirm("Padam checksheet untuk panel ini? Semua data panel ini akan hilang.")) {
      const newSystems = systems.filter(s => s.id !== panelId);
      setSystems(newSystems);
      if (activeSystemId === panelId) {
        setActiveSystemId(newSystems[0].id);
      }
    }
  };

  if (!activeSystem) return null;

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="Fire Alarm Systems" subtitle={`REF: ${auditId}`} showBack />

      <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* Panel Selector Bar */}
        <section className="bg-surface-dark p-2 rounded-2xl border border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
           {systems.map((s, idx) => (
              <div key={s.id} className="relative shrink-0">
                <button 
                  onClick={() => setActiveSystemId(s.id)} 
                  className={`px-5 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 pr-10 ${activeSystemId === s.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background-dark/50 text-text-muted hover:bg-white/5'}`}
                >
                   <span className="material-symbols-outlined text-sm">notifications_active</span>
                   {s.systemName || `Panel ${idx + 1}`}
                </button>
                {systems.length > 1 && (
                  <button 
                    onClick={(e) => deletePanel(e, s.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-white/20 hover:text-primary transition-colors bg-black/20 rounded-full"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}
              </div>
           ))}
           <button onClick={addNewPanel} className="flex-shrink-0 px-4 h-11 rounded-xl bg-white/5 border border-white/10 text-primary flex items-center justify-center active:scale-95">
              <span className="material-symbols-outlined">add</span>
           </button>
        </section>

        {/* AUDIT PROFILE HEADER */}
        <section className="bg-primary/10 border border-primary/20 p-5 rounded-2xl flex flex-col gap-4 shadow-lg shadow-primary/5">
           <div className="flex justify-between items-center border-b border-primary/20 pb-3">
              <div className="flex flex-col">
                <h3 className="text-[11px] font-black uppercase text-white tracking-widest italic">System Audit Profile</h3>
                <input 
                  value={activeSystem.systemName} 
                  onChange={(e) => updateActiveSystem({ systemName: e.target.value })}
                  className="bg-transparent border-none p-0 text-[10px] font-black text-primary uppercase focus:ring-0"
                  placeholder="PANEL IDENTIFIER"
                />
              </div>
              <select 
                value={activeSystem.systemOverallStatus} 
                onChange={(e) => updateActiveSystem({ systemOverallStatus: e.target.value as any })} 
                className="bg-background-dark/50 border border-primary/40 rounded px-2 h-6 text-[8px] font-black uppercase text-white"
              >
                <option value="Normal">Normal</option><option value="Faulty">Faulty</option><option value="Partial">Partial</option><option value="N/A">N/A</option>
              </select>
           </div>
           <textarea 
             value={activeSystem.systemDescription} 
             onChange={(e) => updateActiveSystem({ systemDescription: e.target.value })} 
             className="bg-background-dark/50 border-white/5 border rounded-xl p-3 text-[10px] font-medium h-28 text-white leading-relaxed" 
             placeholder="Description..." 
           />
        </section>

        {/* PART I: HARDWARE SPECIFICATIONS */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">precision_manufacturing</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part I: Hardware Specifications</h3>
           </div>
           <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1"><label className="text-[7px] font-black text-text-muted uppercase">Model</label><input type="text" value={activeSystem.panelSpecs.model} onChange={(e) => updateActiveSystem({ panelSpecs: {...activeSystem.panelSpecs, model: e.target.value}})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-bold text-primary" /></div>
              <div className="flex flex-col gap-1"><label className="text-[7px] font-black text-text-muted uppercase">Total Zones</label><input type="text" value={activeSystem.panelSpecs.totalZones} onChange={(e) => updateActiveSystem({ panelSpecs: {...activeSystem.panelSpecs, totalZones: e.target.value}})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-black text-white" /></div>
           </div>
           <div className="flex flex-col gap-1 mb-3"><label className="text-[7px] font-black text-text-muted uppercase">Location</label><input type="text" value={activeSystem.panelSpecs.location} onChange={(e) => updateActiveSystem({ panelSpecs: {...activeSystem.panelSpecs, location: e.target.value}})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-bold text-white" /></div>
           <textarea value={activeSystem.panelSpecs.panelRemarks} onChange={(e) => updateActiveSystem({ panelSpecs: {...activeSystem.panelSpecs, panelRemarks: e.target.value}})} className="w-full bg-background-dark/30 border-white/5 border rounded-xl p-3 text-[10px] h-14 text-white italic" placeholder="Hardware Remarks..." />
        </section>

        {/* PART II: POWER LOGISTICS */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">battery_charging_full</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part II: Power Logistics</h3>
           </div>
           <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1"><label className="text-[7px] font-black text-text-muted uppercase">Batt Volt (V)</label><input type="text" value={activeSystem.panelSpecs.batteryVolt} onChange={(e) => updateActiveSystem({ panelSpecs: {...activeSystem.panelSpecs, batteryVolt: e.target.value}})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-black text-emerald-500" /></div>
              <div className="flex flex-col gap-1"><label className="text-[7px] font-black text-text-muted uppercase">Charger Volt (V)</label><input type="text" value={activeSystem.panelSpecs.chargerVolt} onChange={(e) => updateActiveSystem({ panelSpecs: {...activeSystem.panelSpecs, chargerVolt: e.target.value}})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-black text-blue-400" /></div>
           </div>
           <div className="bg-background-dark/30 p-3 rounded-xl border border-white/5 mb-3">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-[8px] font-black text-text-muted uppercase">Standby Battery Health</span>
                 <div className="flex gap-1">
                    {['Normal', 'Defective'].map(s => (
                       <button key={s} onClick={() => updateActiveSystem({ panelSpecs: {...activeSystem.panelSpecs, batteryStatus: s as any}})} className={`px-3 py-1 rounded text-[8px] font-black uppercase ${activeSystem.panelSpecs.batteryStatus === s ? 'bg-primary text-white' : 'bg-background-dark text-text-muted'}`}>{s}</button>
                    ))}
                 </div>
              </div>
              {activeSystem.panelSpecs.batteryStatus === 'Defective' && (
                <div className="flex gap-2 pt-2 animate-in slide-in-from-top">
                   <PhotoCaptureBox photo={activeSystem.panelSpecs.batteryPhoto} onCapture={(p) => updateActiveSystem({ panelSpecs: {...activeSystem.panelSpecs, batteryPhoto: p}})} />
                   <textarea value={activeSystem.panelSpecs.batteryRemarks} onChange={(e) => updateActiveSystem({ panelSpecs: {...activeSystem.panelSpecs, batteryRemarks: e.target.value}})} className="flex-1 bg-background-dark border-none rounded-xl p-2 text-[9px] text-white" placeholder="Describe battery fault..." />
                </div>
              )}
           </div>
           {activeSystem.panelSpecs.batteryStatus === 'Normal' && <textarea value={activeSystem.panelSpecs.batteryRemarks} onChange={(e) => updateActiveSystem({ panelSpecs: {...activeSystem.panelSpecs, batteryRemarks: e.target.value}})} className="w-full bg-background-dark/30 border-white/5 border rounded-xl p-3 text-[10px] h-14 text-white italic" placeholder="Battery/Charger Remarks..." />}
        </section>

        {/* PART III: INTEGRATION SIGNALS */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">monitor_heart</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part III: System Integration Signals</h3>
           </div>
           <div className="flex flex-col gap-3">
              {activeSystem.indicators.map((ind, idx) => (
                 <div key={ind.id} className="bg-background-dark/30 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                       <div className="flex flex-col">
                          <span className="text-[7px] font-black text-primary uppercase tracking-widest">{ind.category}</span>
                          <span className="text-[9px] font-bold text-white uppercase">{ind.label}</span>
                       </div>
                       <div className="flex gap-1 h-7">
                          {['Normal', 'Fault', 'N/A'].map(s => (
                             <button key={s} onClick={() => {
                                const ni = [...activeSystem.indicators]; ni[idx].status = s as any; updateActiveSystem({ indicators: ni });
                             }} className={`px-2 rounded-lg text-[7px] font-black uppercase ${ind.status === s ? (s === 'Normal' ? 'bg-emerald-600' : s === 'Fault' ? 'bg-primary' : 'bg-slate-600') + ' text-white' : 'bg-background-dark text-text-muted'}`}>{s}</button>
                          ))}
                       </div>
                    </div>
                    {ind.status === 'Fault' ? (
                       <div className="flex gap-2 animate-in slide-in-from-top">
                          <PhotoCaptureBox photo={ind.photo} onCapture={(p) => { const ni = [...activeSystem.indicators]; ni[idx].photo = p; updateActiveSystem({ indicators: ni }); }} />
                          <textarea value={ind.remarks} onChange={(e) => { const ni = [...activeSystem.indicators]; ni[idx].remarks = e.target.value; updateActiveSystem({ indicators: ni }); }} className="flex-1 bg-background-dark border-none rounded-lg p-2 text-[8px] text-white" placeholder="Signal fault details..." />
                       </div>
                    ) : (
                       <input value={ind.remarks} onChange={(e) => {
                          const ni = [...activeSystem.indicators]; ni[idx].remarks = e.target.value; updateActiveSystem({ indicators: ni });
                       }} className="w-full bg-background-dark/50 border-none rounded-lg h-7 px-3 text-[8px] text-white italic" placeholder="Signal Remark..." />
                    )}
                 </div>
              ))}
           </div>
        </section>

        {/* PART IV: CARD LOGIC */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">memory</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part IV: Card Logic Registry</h3>
           </div>
           <div className="grid grid-cols-1 gap-3">
              {activeSystem.cardConditions.map((card, idx) => (
                 <div key={card.id} className="bg-background-dark/30 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[9px] font-bold text-white uppercase">{card.label}</span>
                       <div className="flex gap-1">
                          {['Normal', 'Defective'].map(s => (
                             <button key={s} onClick={() => {
                                const nc = [...activeSystem.cardConditions]; nc[idx].status = s as any; updateActiveSystem({ cardConditions: nc });
                             }} className={`px-3 py-1 rounded-lg text-[7px] font-black uppercase ${card.status === s ? 'bg-primary text-white' : 'bg-background-dark text-text-muted'}`}>{s}</button>
                          ))}
                       </div>
                    </div>
                    {card.status === 'Defective' ? (
                      <div className="flex gap-2 animate-in slide-in-from-top">
                        <PhotoCaptureBox photo={card.photo} onCapture={(p) => { const nc = [...activeSystem.cardConditions]; nc[idx].photo = p; updateActiveSystem({ cardConditions: nc }); }} />
                        <textarea value={card.remarks} onChange={(e) => { const nc = [...activeSystem.cardConditions]; nc[idx].remarks = e.target.value; updateActiveSystem({ cardConditions: nc }); }} className="flex-1 bg-background-dark border-none rounded-lg p-2 text-[8px] text-white" placeholder="Card defect details..." />
                      </div>
                    ) : (
                      <input value={card.remarks} onChange={(e) => {
                         const nc = [...activeSystem.cardConditions]; nc[idx].remarks = e.target.value; updateActiveSystem({ cardConditions: nc });
                      }} className="w-full bg-background-dark/50 border-none rounded-lg h-7 px-3 text-[8px] text-white italic" placeholder="Card Remark..." />
                    )}
                 </div>
              ))}
           </div>
        </section>

        {/* PART V: ZONE REGISTRY */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary text-sm">grid_view</span>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part V: Zone Device Registry</h3>
              </div>
              <button onClick={() => updateActiveSystem({ zones: [...activeSystem.zones, { id: Date.now().toString(), zoneNo: (activeSystem.zones.length+1).toString(), name: '', breakglassQty:'0', smokeQty:'0', heatQty:'0', bellQty:'0', status:'Normal', remarks: ''}]})} className="text-primary text-[8px] font-black uppercase">+ Add Zone</button>
           </div>
           <div className="flex flex-col gap-4">
              {activeSystem.zones.map((zone, zIdx) => (
                <div key={zone.id} className="bg-background-dark/30 rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-primary italic">ZONE {zone.zoneNo}</span>
                      <div className="flex gap-1 h-7">
                        {['Normal', 'Defective'].map(s => (
                          <button key={s} onClick={() => {
                            const nz = [...activeSystem.zones]; nz[zIdx].status = s as any; updateActiveSystem({ zones: nz });
                          }} className={`px-3 rounded-lg text-[8px] font-black uppercase ${zone.status === s ? 'bg-primary text-white' : 'bg-background-dark text-text-muted'}`}>{s}</button>
                        ))}
                      </div>
                   </div>
                   <input value={zone.name} onChange={(e) => {
                     const nz = [...activeSystem.zones]; nz[zIdx].name = e.target.value; updateActiveSystem({ zones: nz });
                   }} className="bg-background-dark/50 border-none rounded-xl h-10 px-4 text-xs font-bold text-white" placeholder="Location Name..." />
                   
                   <div className="grid grid-cols-4 gap-2">
                      {['smokeQty', 'heatQty', 'bellQty', 'breakglassQty'].map(qty => (
                         <div key={qty} className="flex flex-col gap-1">
                            <label className="text-[6px] font-black text-text-muted uppercase text-center">{qty.replace('Qty', '')}</label>
                            <input type="number" value={(zone as any)[qty]} onChange={(e) => {
                               const nz = [...activeSystem.zones]; (nz[zIdx] as any)[qty] = e.target.value; updateActiveSystem({ zones: nz });
                            }} className="bg-background-dark/50 border-none rounded h-7 text-[9px] text-center font-black text-white" />
                         </div>
                      ))}
                   </div>
                   {zone.status === 'Defective' ? (
                      <div className="flex gap-2 animate-in slide-in-from-top">
                        <PhotoCaptureBox photo={zone.photo} onCapture={(p) => { const nz = [...activeSystem.zones]; nz[zIdx].photo = p; updateActiveSystem({ zones: nz }); }} />
                        <textarea value={zone.remarks} onChange={(e) => { const nz = [...activeSystem.zones]; nz[zIdx].remarks = e.target.value; updateActiveSystem({ zones: nz }); }} className="flex-1 bg-background-dark border-none rounded-lg p-2 text-[8px] text-white" placeholder="Describe zone issue..." />
                      </div>
                   ) : (
                      <textarea value={zone.remarks} onChange={(e) => {
                        const nz = [...activeSystem.zones]; nz[zIdx].remarks = e.target.value; updateActiveSystem({ zones: nz });
                      }} className="bg-background-dark/50 border-white/5 border rounded-xl p-2 text-[9px] h-12 text-white italic" placeholder="Zone Remark..." />
                   )}
                </div>
              ))}
           </div>
        </section>

        {/* PART VI: SERVICE EVIDENCE & REMARKS */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">history_edu</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part VI: Service Evidence & Remarks</h3>
           </div>
           
           <div className="flex flex-col gap-2 mb-4">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Overall System Remarks</label>
              <textarea 
                value={activeSystem.overallRemarks} 
                onChange={(e) => updateActiveSystem({ overallRemarks: e.target.value })} 
                className="w-full bg-background-dark/50 border-none rounded-xl p-4 text-xs font-medium text-white h-24 focus:ring-1 focus:ring-primary" 
                placeholder="Summary of all services performed, testing results, and critical findings..." 
              />
           </div>

           <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1 mb-2 block">Service Verification Photos (4)</label>
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

      <div className="fixed bottom-0 w-full max-w-md bg-surface-dark border-t border-white/5 p-5 pb-10 z-50">
         <button onClick={handleSave} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span>Commit Technical Data</span>
            <span className="material-symbols-outlined text-sm">verified_user</span>
         </button>
      </div>
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
      <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
    </div>
  );
};

export default PanelDetail;
