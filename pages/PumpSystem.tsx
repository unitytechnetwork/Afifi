
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface PumpComponent {
  label: string;
  type: 'Electric' | 'Diesel';
  mode: 'Auto' | 'Manual' | 'Off';
  status: 'Normal' | 'Fault';
  loadValue: string;
  cutIn: string;
  cutOut: string;
  batteryVolt?: string;
  chargerVolt?: string;
  photo?: string;
  remarks?: string;
}

interface PumpData {
  id: string;
  systemName: string;
  location: string;
  systemDescription: string;
  systemOverallStatus: 'Normal' | 'Faulty' | 'Partial' | 'N/A';
  headerPressure: string;
  tankLevel: string;
  jockeyUnit?: PumpComponent;
  dutyUnit: PumpComponent;
  standbyUnit: PumpComponent;
  jockeyRating: string;
  motorRating: string;
  engineRating: string;
  pumpVibration: 'Normal' | 'High';
  pumpNoise: 'Normal' | 'Abnormal';
  glandPacking: 'Normal' | 'Leaking';
  pumpCondition: 'Normal' | 'Fault';
  valveCondition: 'Normal' | 'Fault';
  panelIncomingVolt: string;
  panelLampsStatus: 'Normal' | 'Fault';
  panelLampsPhoto?: string;
  panelLampsRemarks?: string;
  panelWiringStatus: 'Normal' | 'Fault';
  panelWiringPhoto?: string;
  panelWiringRemarks?: string;
  selectorSwitchStatus: 'Normal' | 'Fault';
  selectorSwitchPhoto?: string;
  selectorSwitchRemarks?: string;
  generalRemarks?: string;
  overallRemarks?: string;
  isNA?: boolean;
  photos: string[];
  servicePhotos: string[];
}

const PumpSystem: React.FC = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';
  const pumpType = type || 'hosereel';
  const isHoseReel = pumpType.toLowerCase().includes('hosereel');
  const isHydrant = pumpType.toLowerCase().includes('hydrant');
  const isWetRiser = pumpType.toLowerCase().includes('wetriser');
  const isSprinkler = pumpType.toLowerCase().includes('sprinkler');

  const getBaseDefaults = (index: number): PumpData => {
    const defaultDesc = isHoseReel 
      ? 'The hose reel pump system is provided to supply water for first-aid firefighting purposes. The system comprises jockey, duty, and standby pumps. Inspection was conducted to verify pump operation, pressure performance, control settings, and operational readiness.'
      : isHydrant
      ? 'The hydrant pump system is designed to supply water to the external and internal fire hydrant network during fire emergencies. Inspection was carried out to verify pump operation, pressure performance, and control system functionality in accordance with routine service maintenance.'
      : isWetRiser
      ? 'The wet and dry riser systems are installed to provide firefighting water supply at various floor levels. Inspection was conducted to verify system condition, accessibility, and operational readiness as part of routine maintenance procedures.'
      : isSprinkler
      ? 'The pump system is designed to supply adequate water pressure to the fire protection system during emergency conditions. The system consists of jockey, duty, and standby pumps. Inspection was carried out to verify pump operation, pressure readings, control settings, and overall system readiness.'
      : `${pumpType.toUpperCase()} Pump System verification and performance test.`;

    return {
      id: Date.now().toString() + index,
      systemName: index === 0 ? 'Main Pump Set' : `Pump Set ${index + 1}`,
      location: '',
      systemDescription: defaultDesc,
      systemOverallStatus: 'Normal',
      headerPressure: '7.0',
      tankLevel: 'Full',
      dutyUnit: { label: 'Duty Pump', type: 'Electric', mode: 'Auto', status: 'Normal', loadValue: '15.5', cutIn: '6.0', cutOut: '8.0', remarks: '' },
      standbyUnit: { label: 'Standby Pump', type: 'Diesel', mode: 'Auto', status: 'Normal', loadValue: '100', cutIn: '5.5', cutOut: '8.0', batteryVolt: '12.6', chargerVolt: '13.8', remarks: '' },
      jockeyRating: '1.5HP / 1.1kW',
      motorRating: '15HP / 11kW',
      engineRating: '25HP',
      pumpVibration: 'Normal',
      pumpNoise: 'Normal',
      glandPacking: 'Normal',
      pumpCondition: 'Normal',
      valveCondition: 'Normal',
      panelIncomingVolt: '415',
      panelLampsStatus: 'Normal',
      panelLampsPhoto: '',
      panelLampsRemarks: '',
      panelWiringStatus: 'Normal',
      panelWiringPhoto: '',
      panelWiringRemarks: '',
      selectorSwitchStatus: 'Normal',
      selectorSwitchPhoto: '',
      selectorSwitchRemarks: '',
      generalRemarks: '',
      overallRemarks: '',
      photos: ['', '', '', ''],
      servicePhotos: ['', '', '', '']
    };
  };

  const [systems, setSystems] = useState<PumpData[]>(() => {
    const saved = localStorage.getItem(`pump_${pumpType}_${auditId}`);
    const firstDefault = getBaseDefaults(0);
    if (!isHoseReel) {
      firstDefault.jockeyUnit = { label: 'Jockey Pump', type: 'Electric', mode: 'Auto', status: 'Normal', loadValue: '1.2', cutIn: '7.5', cutOut: '8.5', remarks: '' };
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Handle migration from single object to array
        if (parsed && !Array.isArray(parsed) && parsed.dutyUnit) {
          return [{
            ...firstDefault,
            ...parsed,
            id: 'legacy-pump-1',
            systemName: 'Main Pump Set'
          }];
        }
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { console.error(e); }
    }
    return [firstDefault];
  });

  const [activeSystemId, setActiveSystemId] = useState<string>(systems[0]?.id || '');
  const activeSystem = systems.find(s => s.id === activeSystemId);

  useEffect(() => {
    localStorage.setItem(`pump_${pumpType}_${auditId}`, JSON.stringify(systems));
  }, [systems, auditId, pumpType]);

  const updateActiveSystem = (updates: Partial<PumpData>) => {
    setSystems(prev => prev.map(s => s.id === activeSystemId ? { ...s, ...updates } : s));
  };

  const updateUnit = (key: 'jockeyUnit' | 'dutyUnit' | 'standbyUnit', updates: Partial<PumpComponent>) => {
    if (!activeSystem) return;
    const currentUnit = activeSystem[key];
    if (!currentUnit) return;
    updateActiveSystem({ [key]: { ...currentUnit, ...updates } });
  };

  const addNewPumpSet = () => {
    const nextIdx = systems.length;
    const newSys = getBaseDefaults(nextIdx);
    if (!isHoseReel) {
      newSys.jockeyUnit = { label: 'Jockey Pump', type: 'Electric', mode: 'Auto', status: 'Normal', loadValue: '1.2', cutIn: '7.5', cutOut: '8.5', remarks: '' };
    }
    setSystems([...systems, newSys]);
    setActiveSystemId(newSys.id);
  };

  const deletePumpSet = (e: React.MouseEvent, pumpId: string) => {
    e.stopPropagation();
    if (systems.length <= 1) return;
    if (window.confirm("Confirm: Remove this pump checksheet?")) {
      const newSystems = systems.filter(s => s.id !== pumpId);
      setSystems(newSystems);
      if (activeSystemId === pumpId) {
        setActiveSystemId(newSystems[0].id);
      }
    }
  };

  if (!activeSystem) return null;

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title={`${pumpType.toUpperCase()} SYSTEM`} subtitle={`REF: ${auditId}`} showBack />
      
      <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* Pump Set Selector Bar */}
        <section className="bg-surface-dark p-2 rounded-2xl border border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
           {systems.map((s, idx) => (
              <div key={s.id} className="relative group flex-shrink-0">
                <button 
                  onClick={() => setActiveSystemId(s.id)} 
                  className={`px-5 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 pr-10 ${activeSystemId === s.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-background-dark/50 text-text-muted hover:bg-white/5'}`}
                >
                   <span className="material-symbols-outlined text-sm">water_pump</span>
                   {s.systemName || `Pump Set ${idx + 1}`}
                </button>
                {systems.length > 1 && (
                  <button 
                    onClick={(e) => deletePumpSet(e, s.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-white/20 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                )}
              </div>
           ))}
           <button onClick={addNewPumpSet} className="flex-shrink-0 px-4 h-11 rounded-xl bg-white/5 border border-white/10 text-primary flex items-center justify-center active:scale-95">
              <span className="material-symbols-outlined">add</span>
           </button>
        </section>

        {/* Audit Grade System Header */}
        <section className="bg-primary/10 border border-primary/20 p-5 rounded-2xl flex flex-col gap-4">
           <div className="flex justify-between items-center border-b border-primary/20 pb-3">
              <div className="flex flex-col">
                <h3 className="text-[11px] font-black uppercase text-white tracking-widest italic">System Audit Profile</h3>
                <input 
                  value={activeSystem.systemName} 
                  onChange={(e) => updateActiveSystem({ systemName: e.target.value })}
                  className="bg-transparent border-none p-0 text-[10px] font-black text-primary uppercase focus:ring-0"
                  placeholder="PUMP IDENTIFIER"
                />
              </div>
              <div className="flex items-center gap-2">
                 <select 
                   value={activeSystem.systemOverallStatus} 
                   onChange={(e) => updateActiveSystem({ systemOverallStatus: e.target.value as any })} 
                   className={`px-2 h-6 rounded text-[8px] font-black border uppercase transition-all ${activeSystem.systemOverallStatus === 'Normal' ? 'bg-emerald-600/20 border-emerald-600 text-emerald-500' : 'bg-primary/20 border-primary text-primary'}`}
                 >
                    <option value="Normal">Normal</option>
                    <option value="Faulty">Faulty</option>
                    <option value="Partial">Partial</option>
                    <option value="N/A">N/A</option>
                 </select>
              </div>
           </div>
           
           <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Pump Room Location</label>
              <input 
                type="text" 
                value={activeSystem.location} 
                onChange={(e) => updateActiveSystem({ location: e.target.value })} 
                className="bg-background-dark/50 border-white/5 border rounded-xl h-11 px-4 text-sm font-bold text-white focus:ring-1 focus:ring-primary" 
                placeholder="e.g. Basement 1, Level G..." 
              />
           </div>

           <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-widest">Technical Description</label>
              <textarea value={activeSystem.systemDescription} onChange={(e) => updateActiveSystem({ systemDescription: e.target.value })} className="bg-background-dark/50 border-white/5 border rounded-xl p-3 text-xs font-medium text-white h-20 focus:ring-1 focus:ring-primary" placeholder="Technical summary of the pump system..." />
           </div>
        </section>

        {/* Part I: Line Metrics */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3"><span className="material-symbols-outlined text-primary text-sm">speed</span><h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part I: Line Metrics</h3></div>
           <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5"><label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Header (Bar)</label><input type="text" value={activeSystem.headerPressure} onChange={(e) => updateActiveSystem({ headerPressure: e.target.value })} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-sm font-black text-emerald-500" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Tank Level</label><select value={activeSystem.tankLevel} onChange={(e) => updateActiveSystem({ tankLevel: e.target.value })} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-bold text-white"><option>Full</option><option>75%</option><option>50%</option><option>Low</option><option>Empty</option></select></div>
           </div>
        </section>

        {/* Part II: Pump Registry */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3"><span className="material-symbols-outlined text-primary text-sm">hub</span><h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part II: Pump Registry</h3></div>
           <div className="flex flex-col gap-4">
              {!isHoseReel && activeSystem.jockeyUnit && <PumpUnitRow component={activeSystem.jockeyUnit} onUpdate={(upd) => updateUnit('jockeyUnit', upd)} />}
              {activeSystem.dutyUnit && <PumpUnitRow component={activeSystem.dutyUnit} onUpdate={(upd) => updateUnit('dutyUnit', upd)} />}
              {activeSystem.standbyUnit && <PumpUnitRow component={activeSystem.standbyUnit} onUpdate={(upd) => updateUnit('standbyUnit', upd)} isStandby />}
           </div>
        </section>

        {/* Part III: Technical Details */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3"><span className="material-symbols-outlined text-primary text-sm">precision_manufacturing</span><h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part III: Technical Details</h3></div>
           <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Pump Condition', key: 'pumpCondition', opt: ['Normal', 'Fault'] },
                { label: 'Valve Condition', key: 'valveCondition', opt: ['Normal', 'Fault'] },
                { label: 'Vibration', key: 'pumpVibration', opt: ['Normal', 'High'] }, 
                { label: 'Noise', key: 'pumpNoise', opt: ['Normal', 'Abnormal'] }, 
                { label: 'Seal/Packing', key: 'glandPacking', opt: ['Normal', 'Leaking'] }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between bg-background-dark/30 p-3 rounded-xl border border-white/5">
                   <span className="text-[9px] font-bold uppercase text-white">{item.label}</span>
                   <div className="flex gap-1">{item.opt.map(o => (<button key={o} onClick={() => updateActiveSystem({ [item.key]: o } as any)} className={`px-3 py-1 rounded-md text-[7px] font-black uppercase ${activeSystem[item.key as keyof PumpData] === o ? (o === 'Normal' ? 'bg-emerald-600' : 'bg-primary') + ' text-white' : 'bg-background-dark/50 text-text-muted'}`}>{o}</button>))}</div>
                </div>
              ))}
           </div>
        </section>

        {/* Part IV: Pump Control Panel Status */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">electrical_services</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part IV: Control Panel Status</h3>
           </div>
           
           <div className="flex flex-col gap-3">
              {/* Incoming Volt */}
              <div className="flex items-center justify-between bg-background-dark/30 p-3 rounded-xl border border-white/5">
                 <span className="text-[9px] font-bold uppercase text-white">Incoming Volt (V)</span>
                 <input 
                   type="text" 
                   value={activeSystem.panelIncomingVolt} 
                   onChange={(e) => updateActiveSystem({ panelIncomingVolt: e.target.value })} 
                   className="w-20 bg-background-dark/50 border-none rounded-lg h-8 text-center text-xs font-black text-blue-400" 
                   placeholder="415"
                 />
              </div>

              {/* Indicator Lamps */}
              <div className="flex flex-col bg-background-dark/30 p-3 rounded-xl border border-white/5 gap-2">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase text-white">Indicator Lamps</span>
                    <div className="flex gap-1">
                       {['Normal', 'Fault'].map(o => (
                          <button key={o} onClick={() => updateActiveSystem({ panelLampsStatus: o as any })} className={`px-3 py-1 rounded-md text-[7px] font-black uppercase ${activeSystem.panelLampsStatus === o ? (o === 'Normal' ? 'bg-emerald-600' : 'bg-primary') + ' text-white' : 'bg-background-dark/50 text-text-muted'}`}>{o}</button>
                       ))}
                    </div>
                 </div>
                 {activeSystem.panelLampsStatus === 'Fault' && (
                    <div className="flex gap-2 mt-1 animate-in slide-in-from-top duration-300">
                       <PhotoCaptureBox photo={activeSystem.panelLampsPhoto} onCapture={(p) => updateActiveSystem({ panelLampsPhoto: p })} />
                       <textarea 
                         value={activeSystem.panelLampsRemarks} 
                         onChange={(e) => updateActiveSystem({ panelLampsRemarks: e.target.value })} 
                         className="flex-1 bg-background-dark/50 border-none rounded-lg p-2 text-[8px] text-white italic h-16" 
                         placeholder="Lamp fault details..." 
                       />
                    </div>
                 )}
              </div>

              {/* Wiring Condition */}
              <div className="flex flex-col bg-background-dark/30 p-3 rounded-xl border border-white/5 gap-2">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase text-white">Wiring Condition</span>
                    <div className="flex gap-1">
                       {['Normal', 'Fault'].map(o => (
                          <button key={o} onClick={() => updateActiveSystem({ panelWiringStatus: o as any })} className={`px-3 py-1 rounded-md text-[7px] font-black uppercase ${activeSystem.panelWiringStatus === o ? (o === 'Normal' ? 'bg-emerald-600' : 'bg-primary') + ' text-white' : 'bg-background-dark/50 text-text-muted'}`}>{o}</button>
                       ))}
                    </div>
                 </div>
                 {activeSystem.panelWiringStatus === 'Fault' && (
                    <div className="flex gap-2 mt-1 animate-in slide-in-from-top duration-300">
                       <PhotoCaptureBox photo={activeSystem.panelWiringPhoto} onCapture={(p) => updateActiveSystem({ panelWiringPhoto: p })} />
                       <textarea 
                         value={activeSystem.panelWiringRemarks} 
                         onChange={(e) => updateActiveSystem({ panelWiringRemarks: e.target.value })} 
                         className="flex-1 bg-background-dark/50 border-none rounded-lg p-2 text-[8px] text-white italic h-16" 
                         placeholder="Wiring issue details..." 
                       />
                    </div>
                 )}
              </div>

              {/* Selector Switch */}
              <div className="flex flex-col bg-background-dark/30 p-3 rounded-xl border border-white/5 gap-2">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase text-white">Selector Switch</span>
                    <div className="flex gap-1">
                       {['Normal', 'Fault'].map(o => (
                          <button key={o} onClick={() => updateActiveSystem({ selectorSwitchStatus: o as any })} className={`px-3 py-1 rounded-md text-[7px] font-black uppercase ${activeSystem.selectorSwitchStatus === o ? (o === 'Normal' ? 'bg-emerald-600' : 'bg-primary') + ' text-white' : 'bg-background-dark/50 text-text-muted'}`}>{o}</button>
                       ))}
                    </div>
                 </div>
                 {activeSystem.selectorSwitchStatus === 'Fault' && (
                    <div className="flex gap-2 mt-1 animate-in slide-in-from-top duration-300">
                       <PhotoCaptureBox photo={activeSystem.selectorSwitchPhoto} onCapture={(p) => updateActiveSystem({ selectorSwitchPhoto: p })} />
                       <textarea 
                         value={activeSystem.selectorSwitchRemarks} 
                         onChange={(e) => updateActiveSystem({ selectorSwitchRemarks: e.target.value })} 
                         className="flex-1 bg-background-dark/50 border-none rounded-lg p-2 text-[8px] text-white italic h-16" 
                         placeholder="Switch fault details..." 
                       />
                    </div>
                 )}
              </div>
           </div>
        </section>

        {/* Part V: Service Evidence & Remarks */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">history_edu</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part V: Service Evidence & Remarks</h3>
           </div>
           
           <div className="flex flex-col gap-2 mb-4">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Overall System Remarks</label>
              <textarea 
                value={activeSystem.overallRemarks || ''} 
                onChange={(e) => updateActiveSystem({ overallRemarks: e.target.value })} 
                className="w-full bg-background-dark/50 border-none rounded-xl p-4 text-xs font-medium text-white h-24 focus:ring-1 focus:ring-primary" 
                placeholder="Describe maintenance work performed, testing results, or findings..." 
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
         <button onClick={() => navigate(`/checklist/${auditId}`)} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"><span>Commit Registry</span><span className="material-symbols-outlined text-sm">verified_user</span></button>
      </div>
    </div>
  );
};

const PumpUnitRow: React.FC<{ component: PumpComponent; onUpdate: (upd: Partial<PumpComponent>) => void; isStandby?: boolean }> = ({ component, onUpdate, isStandby }) => {
  const isDiesel = component.type === 'Diesel';
  const isFault = component.status === 'Fault';

  return (
    <div className={`p-4 rounded-xl border transition-all ${isFault ? 'bg-primary/5 border-primary/20 shadow-[0_0_15px_rgba(236,19,19,0.1)]' : 'bg-background-dark/30 border-white/5'}`}>
       <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-white italic uppercase">{component.label}</span>
                <div className="flex gap-1 mt-1">
                   {(['Electric', 'Diesel'] as const).map(t => (
                      <button key={t} onClick={() => onUpdate({ type: t })} className={`px-2 py-0.5 rounded text-[6px] font-black uppercase transition-all ${component.type === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-background-dark text-text-muted'}`}>{t}</button>
                   ))}
                </div>
             </div>
             <div className="flex gap-1 h-7 self-start">{(['Normal', 'Fault'] as const).map(s => (<button key={s} onClick={() => onUpdate({ status: s })} className={`px-3 rounded-lg text-[7px] font-black uppercase ${component.status === s ? (s === 'Normal' ? 'bg-emerald-600' : 'bg-primary') + ' text-white' : 'bg-background-dark text-text-muted'}`}>{s}</button>))}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
             <div className="flex flex-col gap-1"><span className="text-[7px] font-black uppercase text-text-muted">Mode</span><select value={component.mode} onChange={(e) => onUpdate({ mode: e.target.value as any })} className="bg-background-dark border-none rounded-lg h-9 px-2 text-[9px] font-black uppercase text-primary"><option>Auto</option><option>Manual</option><option>Off</option></select></div>
             <div className="flex flex-col gap-1"><span className="text-[7px] font-black uppercase text-text-muted">{component.type === 'Electric' ? 'Ampere (A)' : 'Fuel (%)'}</span><input type="text" value={component.loadValue} onChange={(e) => onUpdate({ loadValue: e.target.value })} className="bg-background-dark border-none rounded-lg h-9 px-2 text-center text-[10px] font-black text-amber-500" /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="flex flex-col gap-1"><span className="text-[7px] font-black uppercase text-text-muted">Cut-In (Bar)</span><input type="text" value={component.cutIn} onChange={(e) => onUpdate({ cutIn: e.target.value })} className="bg-background-dark border-none rounded-lg h-9 px-2 text-center text-[10px] font-black text-emerald-500" /></div>
             <div className="flex flex-col gap-1"><span className="text-[7px] font-black uppercase text-text-muted">Cut-Out (Bar)</span><input type="text" value={component.cutOut} onChange={(e) => onUpdate({ cutOut: e.target.value })} className="bg-background-dark border-none rounded-lg h-9 px-2 text-center text-[10px] font-black text-blue-500" /></div>
          </div>

          {isDiesel && (
            <div className="grid grid-cols-2 gap-3 pt-1">
               <div className="flex flex-col gap-1"><span className="text-[7px] font-black uppercase text-text-muted">Batt (V)</span><input type="text" value={component.batteryVolt || ''} onChange={(e) => onUpdate({ batteryVolt: e.target.value })} className="bg-background-dark/50 border-none rounded-lg h-9 text-center text-[9px] font-black text-emerald-500" /></div>
               <div className="flex flex-col gap-1"><span className="text-[7px] font-black uppercase text-text-muted">Chg (V)</span><input type="text" value={component.chargerVolt || ''} onChange={(e) => onUpdate({ chargerVolt: e.target.value })} className="bg-background-dark/50 border-none rounded-lg h-9 text-center text-[9px] font-black text-blue-400" /></div>
            </div>
          )}

          {isFault ? (
            <div className="flex gap-2 mt-1 animate-in slide-in-from-top duration-300">
               <PhotoCaptureBox photo={component.photo} onCapture={(p) => onUpdate({ photo: p })} />
               <textarea value={component.remarks || ''} onChange={(e) => onUpdate({ remarks: e.target.value })} className="flex-1 bg-background-dark/50 border-none rounded-lg p-2 text-[8px] text-white italic h-16" placeholder="Describe fault evidence..." />
            </div>
          ) : (
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[7px] font-black uppercase text-text-muted ml-1">Remark</span>
              <textarea value={component.remarks || ''} onChange={(e) => onUpdate({ remarks: e.target.value })} className="w-full bg-background-dark/50 border-none rounded-lg p-2 text-[9px] h-14 text-white italic" placeholder="Unit-specific notes..." />
            </div>
          )}
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
      <input type="file" ref={fileRef} className="hidden" accept="image/*" capture="environment" onChange={handleFile} />
    </div>
  );
};

export default PumpSystem;
