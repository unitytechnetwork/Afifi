
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { sendLocalNotification } from '../components/NotificationManager';

interface FaultRecord {
  system: string;
  section: string;
  itemLabel: string;
  description: string;
  photo?: string;
  path: string;
  status: 'Open' | 'Rectified';
}

interface InventoryCount {
  label: string;
  count: number;
  subDetails?: string;
}

interface LocationSummary {
  location: string;
  items: InventoryCount[];
}

const Summary: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auditId = id || 'NEW-AUDIT';
  
  const [sigData, setSigData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupData, setSetupData] = useState<any>(null);

  const DEFECT_TERMS = ['Defective', 'Fault', 'Faulty', 'Damaged', 'Failed', 'Low', 'Broken', 'Leaking', 'Corroded', 'Loose', 'Blocked', 'Blown', 'Expired', 'Missing'];

  const [faultRegistry, setFaultRegistry] = useState<FaultRecord[]>([]);
  const [inventoryRegistry, setInventoryRegistry] = useState<Record<string, LocationSummary[]>>({});
  const [systemStats, setSystemStats] = useState({ totalSystems: 0, totalAssets: 0 });

  useEffect(() => {
    const scanAllSystems = () => {
      const faults: FaultRecord[] = [];
      const inventory: Record<string, LocationSummary[]> = {};
      let totalSystems = 0;
      let totalAssets = 0;
      
      const config = [
        { key: `checklist_${auditId}`, label: 'Main Fire Alarm', path: `/checklist/${auditId}/panel` },
        { key: `gas_suppression_${auditId}`, label: 'Gas Suppression', path: `/checklist/${auditId}/gas` },
        { key: `pump_hosereel_${auditId}`, label: 'Hose Reel Pump', path: `/checklist/${auditId}/pump/hosereel` },
        { key: `pump_wetriser_${auditId}`, label: 'Wet Riser Pump', path: `/checklist/${auditId}/pump/wetriser` },
        { key: `pump_hydrant_${auditId}`, label: 'Hydrant Pump', path: `/checklist/${auditId}/pump/hydrant` },
        { key: `pump_sprinkler_${auditId}`, label: 'Sprinkler Pump', path: `/checklist/${auditId}/pump/sprinkler` },
        { key: `equip_hosereel_${auditId}`, label: 'Hose Reel Equipment', path: `/checklist/${auditId}/equip/hosereel` },
        { key: `equip_hydrant_${auditId}`, label: 'Hydrant Equipment', path: `/checklist/${auditId}/equip/hydrant` },
        { key: `equip_wetriser_${auditId}`, label: 'Wet Riser Equipment', path: `/checklist/${auditId}/equip/wetriser` },
        { key: `equip_dryriser_${auditId}`, label: 'Dry Riser Equipment', path: `/checklist/${auditId}/equip/dryriser` },
        { key: `extinguisher_${auditId}`, label: 'Fire Extinguishers', path: `/checklist/${auditId}/extinguisher` },
        { key: `light_emergency_${auditId}`, label: 'Emergency Lighting', path: `/checklist/${auditId}/light/emergency` },
        { key: `light_keluar_${auditId}`, label: 'Keluar Signs', path: `/checklist/${auditId}/light/keluar` },
      ];

      config.forEach(sys => {
        try {
          const raw = localStorage.getItem(sys.key);
          if (!raw) return;
          const data = JSON.parse(raw);
          if (data.isNA) return;

          totalSystems++;
          const sysInventory: LocationSummary[] = [];

          if (sys.label === 'Main Fire Alarm') {
            if (DEFECT_TERMS.includes(data.panelSpecs?.batteryStatus)) faults.push({ system: sys.label, section: 'Panel', itemLabel: 'Battery', description: data.panelSpecs.batteryRemarks || 'Defective battery detected.', photo: data.panelSpecs.batteryPhoto, path: sys.path, status: 'Open' });
            data.cardConditions?.forEach((c: any) => { if (DEFECT_TERMS.includes(c.status)) faults.push({ system: sys.label, section: 'Card', itemLabel: c.label, description: c.remarks || 'Card integrity fault.', photo: c.photo, path: sys.path, status: 'Open' }); });
            
            data.zones?.forEach((z: any) => {
              if (DEFECT_TERMS.includes(z.status)) faults.push({ system: sys.label, section: `Zone ${z.zoneNo}`, itemLabel: z.name, description: z.remarks || 'Zone logic fault.', photo: z.photo, path: sys.path, status: 'Open' });
              
              const zoneDevices = [];
              if (parseInt(z.smokeQty) > 0) zoneDevices.push({ label: 'Smoke Detectors', count: parseInt(z.smokeQty) });
              if (parseInt(z.heatQty) > 0) zoneDevices.push({ label: 'Heat Detectors', count: parseInt(z.heatQty) });
              if (parseInt(z.bellQty) > 0) zoneDevices.push({ label: 'Alarm Bells', count: parseInt(z.bellQty) });
              if (parseInt(z.breakglassQty) > 0) zoneDevices.push({ label: 'Breakglass', count: parseInt(z.breakglassQty) });
              
              if (zoneDevices.length > 0) {
                sysInventory.push({ location: `ZONE ${z.zoneNo}: ${z.name}`, items: zoneDevices });
                totalAssets += zoneDevices.reduce((sum, d) => sum + d.count, 0);
              }
            });
          } 
          else if (sys.label === 'Gas Suppression') {
            const systems = Array.isArray(data) ? data : [data];
            systems.forEach((s: any) => {
              s.integrationItems?.forEach((i: any) => { if (DEFECT_TERMS.includes(i.status)) faults.push({ system: sys.label, section: s.zoneName, itemLabel: i.label, description: i.remarks || 'Integration failure.', photo: i.photo, path: sys.path, status: 'Open' }); });
              
              const gasDevices = [
                { label: 'Smoke Detectors', count: parseInt(s.smokeQty || 0) },
                { label: 'Heat Detectors', count: parseInt(s.heatQty || 0) },
                { label: 'Alarm Bells', count: parseInt(s.bellQty || 0) },
                { label: 'Flashers', count: parseInt(s.flashingLightQty || 0) }
              ].filter(d => d.count > 0);

              if (gasDevices.length > 0) {
                sysInventory.push({ location: s.zoneName || 'Server Room', items: gasDevices });
                totalAssets += gasDevices.reduce((sum, d) => sum + d.count, 0);
              }
            });
          }
          else if (sys.label.includes('Pump')) {
            const units = [];
            if (data.jockeyUnit) units.push({ label: 'Jockey Pump Unit', count: 1, subDetails: data.jockeyUnit.status });
            if (data.dutyUnit) units.push({ label: 'Duty Pump Unit', count: 1, subDetails: data.dutyUnit.status });
            if (data.standbyUnit) units.push({ label: 'Standby Pump Unit', count: 1, subDetails: data.standbyUnit.status });
            
            if (units.length > 0) sysInventory.push({ location: 'Pump Room', items: units });
            
            if (DEFECT_TERMS.includes(data.dutyUnit?.status)) faults.push({ system: sys.label, section: 'Pump', itemLabel: 'Duty', description: data.dutyUnit.remarks || 'Pump performance fault.', photo: data.dutyUnit.photo, path: sys.path, status: 'Open' });
            if (DEFECT_TERMS.includes(data.standbyUnit?.status)) faults.push({ system: sys.label, section: 'Pump', itemLabel: 'Standby', description: data.standbyUnit.remarks || 'Pump performance fault.', photo: data.standbyUnit.photo, path: sys.path, status: 'Open' });
          }
          else {
            const items = Array.isArray(data) ? data : (data.items || []);
            const locMap: Record<string, InventoryCount[]> = {};

            items.forEach((item: any, idx: number) => {
              const loc = item.location || 'Unspecified Location';
              if (!locMap[loc]) locMap[loc] = [];
              
              const label = item.type || item.brand || sys.label;
              const existing = locMap[loc].find(i => i.label === label);
              if (existing) {
                existing.count++;
              } else {
                locMap[loc].push({ label: label, count: 1 });
              }
              totalAssets++;

              const hasFault = Object.values(item).some(v => typeof v === 'string' && DEFECT_TERMS.includes(v));
              if (hasFault) {
                // Handle remarks object for Equipment, Extinguisher, Lights
                let faultDesc = 'Multiple defects detected.';
                if (typeof item.remarks === 'string' && item.remarks) {
                  faultDesc = item.remarks;
                } else if (typeof item.remarks === 'object' && item.remarks) {
                  const remarkValues = Object.values(item.remarks).filter(val => typeof val === 'string' && val.trim() !== '');
                  if (remarkValues.length > 0) faultDesc = remarkValues.join('. ');
                }

                // Pick first photo from photos object if needed
                let faultPhoto = item.photo;
                if (!faultPhoto && typeof item.photos === 'object' && item.photos) {
                  faultPhoto = Object.values(item.photos).find(p => typeof p === 'string' && p.startsWith('data:')) as string;
                }

                faults.push({ 
                  system: sys.label, 
                  section: 'Inventory', 
                  itemLabel: item.serial || item.location || `Unit #${idx+1}`, 
                  description: faultDesc, 
                  photo: faultPhoto, 
                  path: sys.path, 
                  status: 'Open' 
                });
              }
            });

            Object.entries(locMap).forEach(([loc, counts]) => {
              sysInventory.push({ location: loc, items: counts });
            });
          }

          if (sysInventory.length > 0) {
            inventory[sys.label] = sysInventory;
          }
        } catch (e) {}
      });

      setFaultRegistry(faults);
      setInventoryRegistry(inventory);
      setSystemStats({ totalSystems, totalAssets });
      const savedSetup = localStorage.getItem(`setup_${auditId}`);
      if (savedSetup) setSetupData(JSON.parse(savedSetup));
    };

    scanAllSystems();
  }, [auditId]);

  const faultsBySystem = useMemo(() => {
    return faultRegistry.reduce((acc, fault) => {
      if (!acc[fault.system]) acc[fault.system] = [];
      acc[fault.system].push(fault);
      return acc;
    }, {} as Record<string, FaultRecord[]>);
  }, [faultRegistry]);

  const handleFinalize = () => {
    if (!sigData) return;

    if (faultRegistry.length > 0) {
      sendLocalNotification(
        "Critical System Deficiencies Recorded",
        `Technical Dossier #${auditId} has been committed with ${faultRegistry.length} faults. Supervision is notified.`
      );
    }

    setIsSubmitting(true);
    setTimeout(() => {
      navigate('/success', { state: { auditId } });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="Certification Hub" subtitle={`AUDIT #${auditId}`} showBack />
      
      {isSubmitting ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-[#181111] fixed inset-0 z-[100]">
           <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8" />
           <h2 className="text-xl font-black italic uppercase tracking-widest text-white">Generating Dossier</h2>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-6">
          <div className="bg-surface-dark p-6 rounded-3xl border-l-8 border-primary shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
             <div className="flex flex-col gap-1 relative z-10">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Maintenance Verification Hub</p>
                <h1 className="text-2xl font-black italic uppercase tracking-tight">{setupData?.clientName || 'SITE AUDIT'}</h1>
                <div className="flex gap-4 mt-3">
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-text-muted uppercase">Inspected Systems</span>
                      <span className="text-lg font-black text-white">{systemStats.totalSystems}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[8px] font-black text-text-muted uppercase">Verified Assets</span>
                      <span className="text-lg font-black text-emerald-500">{systemStats.totalAssets}</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] italic">System Census & Inventory</h3>
            </div>
            
            <div className="flex flex-col gap-3">
              {(Object.entries(inventoryRegistry) as [string, LocationSummary[]][]).map(([sysLabel, locations]) => (
                <div key={sysLabel} className="bg-surface-dark rounded-3xl border border-white/5 overflow-hidden shadow-xl">
                   <div className="bg-white/5 px-5 py-3 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic">{sysLabel}</span>
                      <span className="text-[8px] font-black text-text-muted uppercase tracking-tighter">Inventory Audit</span>
                   </div>
                   <div className="p-2 flex flex-col gap-2">
                      {locations.map((loc, lIdx) => (
                        <div key={lIdx} className="bg-background-dark/40 rounded-2xl p-4 border border-white/5">
                           <div className="flex items-center gap-2 mb-3">
                              <span className="material-symbols-outlined text-sm text-text-muted">location_on</span>
                              <span className="text-[10px] font-black uppercase text-white tracking-tight">{loc.location}</span>
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                              {loc.items.map((item, iIdx) => (
                                <div key={iIdx} className="bg-white/5 p-2 rounded-xl flex items-center justify-between border border-white/5">
                                   <span className="text-[9px] font-bold text-text-muted truncate mr-2">{item.label}</span>
                                   <span className="text-[11px] font-black text-white bg-primary/20 px-2 py-0.5 rounded shadow-inner">{item.count}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between px-2 mt-4">
                <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] italic">Deficiency Registry</h3>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${faultRegistry.length > 0 ? 'bg-primary text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-500'}`}>
                   {faultRegistry.length} Faults Found
                </span>
             </div>

             {faultRegistry.length > 0 ? (Object.entries(faultsBySystem) as [string, FaultRecord[]][]).map(([system, faults]) => (
                <div key={system} className="bg-surface-dark rounded-3xl border border-white/5 overflow-hidden shadow-xl">
                   <div className="bg-primary/5 px-5 py-3 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">{system}</span>
                      <span className="text-[8px] font-black text-text-muted uppercase">Defects Detected</span>
                   </div>
                   <div className="flex flex-col divide-y divide-white/5">
                      {faults.map((fault, idx) => (
                         <div key={idx} onClick={() => navigate(fault.path)} className="p-5 flex gap-4 active:bg-white/5 transition-colors cursor-pointer group">
                            <div className="w-16 h-16 rounded-xl bg-background-dark border border-primary/20 shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
                               {fault.photo ? <img src={fault.photo} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary/40">no_photography</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start mb-1">
                                  <span className="text-[7px] font-black text-text-muted uppercase tracking-widest">{fault.section}</span>
                                  <span className="text-[7px] font-black text-primary uppercase bg-primary/10 px-1.5 py-0.5 rounded tracking-tighter shadow-sm">CRITICAL</span>
                               </div>
                               <h4 className="text-xs font-bold text-white truncate uppercase tracking-tight group-hover:text-primary transition-colors">{fault.itemLabel}</h4>
                               <p className="text-[9px] text-text-muted font-medium italic mt-1 line-clamp-2 leading-relaxed opacity-80">"{fault.description}"</p>
                            </div>
                            <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform">
                               <span className="material-symbols-outlined text-xl">chevron_right</span>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             )) : (
                <div className="py-20 bg-surface-dark/40 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center opacity-30 text-center px-10">
                   <span className="material-symbols-outlined text-5xl mb-4 text-emerald-500">verified_user</span>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Fault Matrix</p>
                   <p className="text-[8px] font-bold mt-2 tracking-widest leading-relaxed">System performance verified within certified parameters.</p>
                </div>
             )}
          </div>

          <div className="bg-surface-dark p-6 rounded-3xl border border-white/5 flex flex-col gap-6 shadow-2xl mb-20 relative overflow-hidden">
             <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mb-16 blur-2xl pointer-events-none" />
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
                <h3 className="font-black uppercase tracking-[0.2em] text-[10px] italic">Final Dossier Certification</h3>
             </div>
             <p className="text-[9px] text-text-muted font-medium -mt-4 leading-relaxed">I certify that the above technical census and deficiency records are accurate based on field verification conducted as per Bestro Quality Protocols.</p>
             <SignaturePad onSign={setSigData} placeholder="Lead Auditor Digital Signature" />
          </div>
        </div>
      )}

      {!isSubmitting && (
        <div className="fixed bottom-0 w-full max-w-md bg-background-dark/95 backdrop-blur-xl border-t border-white/5 p-5 pb-10 z-50">
          <button 
            onClick={handleFinalize} 
            disabled={!sigData}
            className={`w-full h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl ${sigData ? 'bg-primary text-white shadow-primary/30' : 'bg-white/5 text-white/20 some-other-class border border-white/5'}`}
          >
            <span>Lock & Commit Report</span>
            <span className="material-symbols-outlined">verified</span>
          </button>
        </div>
      )}
    </div>
  );
};

const SignaturePad: React.FC<{ onSign: (data: string) => void; placeholder: string }> = ({ onSign, placeholder }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [isEmpty, setIsEmpty] = React.useState(true);

  const startDrawing = (e: any) => { setIsDrawing(true); draw(e); };
  const stopDrawing = () => { setIsDrawing(false); if (canvasRef.current) onSign(canvasRef.current.toDataURL()); };
  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#ec1313';
    if (isEmpty) { ctx.beginPath(); ctx.moveTo(x, y); setIsEmpty(false); }
    else { ctx.lineTo(x, y); ctx.stroke(); }
  };
  return (
    <div className="relative w-full h-36 bg-background-dark/80 rounded-2xl border border-white/10 overflow-hidden cursor-crosshair group shadow-inner">
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 text-center px-4">
          <span className="material-symbols-outlined text-4xl animate-pulse">edit_square</span>
          <span className="text-[8px] font-black uppercase tracking-[0.2em] mt-2 leading-relaxed">{placeholder}</span>
        </div>
      )}
      <canvas ref={canvasRef} width={400} height={144} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-full touch-none" />
      {!isEmpty && <button onClick={() => { const c = canvasRef.current; c?.getContext('2d')?.clearRect(0,0,c.width,c.height); setIsEmpty(true); onSign(''); }} className="absolute top-2 right-2 p-2 bg-white/5 hover:bg-primary/20 rounded-xl text-[7px] font-black uppercase text-text-muted hover:text-white transition-all">Clear</button>}
    </div>
  );
};

export default Summary;
