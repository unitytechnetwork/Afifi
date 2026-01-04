
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { InspectionStatus } from '../types';

interface DefectEntry {
  uid: string;
  system: string;
  section: string;
  itemLabel: string;
  description: string;
  photo?: string;
  path: string;
  dateDetected: string;
  dossierId: string;
  severity: 'Critical' | 'Major' | 'Minor';
  status: 'Open' | 'In Progress' | 'Rectified';
  technician: string;
  sourceKey: string; 
  sourceId: string;  
}

const DefectReport: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoUid, setActivePhotoUid] = useState<string | null>(null);

  const [defects, setDefects] = useState<DefectEntry[]>([]);
  const [tracker, setTracker] = useState<Record<string, { status: any, severity: any }>>({});
  const [setupData, setSetupData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'Major' | 'Minor'>('All');

  const DEFECT_TERMS = ['Defective', 'Fault', 'Faulty', 'Damaged', 'Failed', 'Low', 'Broken', 'Leaking', 'Corroded', 'Loose', 'Blocked', 'Blown', 'Expired', 'High', 'Abnormal', 'Missing'];

  useEffect(() => {
    const scanSystems = () => {
      setIsLoading(true);
      const foundDefects: DefectEntry[] = [];
      
      const savedSetup = localStorage.getItem(`setup_${auditId}`);
      const setup = savedSetup ? JSON.parse(savedSetup) : null;
      setSetupData(setup);

      const savedTracker = localStorage.getItem(`defect_registry_${auditId}`);
      const trackerData = savedTracker ? JSON.parse(savedTracker) : {};
      setTracker(trackerData);

      const config = [
        { key: `checklist_${auditId}`, label: 'Main Fire Alarm', path: `/checklist/${auditId}/panel` },
        { key: `gas_suppression_${auditId}`, label: 'Gas Suppression', path: `/checklist/${auditId}/gas` },
        { key: `pump_hosereel_${auditId}`, label: 'Hose Reel Pump', path: `/checklist/${auditId}/pump/hosereel` },
        { key: `pump_wetriser_${auditId}`, label: 'Wet Riser Pump', path: `/checklist/${auditId}/pump/wetriser` },
        { key: `pump_hydrant_${auditId}`, label: 'Hydrant Pump', path: `/checklist/${auditId}/pump/hydrant` },
        { key: `pump_sprinkler_${auditId}`, label: 'Sprinkler Pump', path: `/checklist/${auditId}/pump/sprinkler` },
        { key: `equip_hosereel_${auditId}`, label: 'Hose Reel Assets', path: `/checklist/${auditId}/equip/hosereel` },
        { key: `equip_hydrant_${auditId}`, label: 'Hydrant Assets', path: `/checklist/${auditId}/equip/hydrant` },
        { key: `equip_wetriser_${auditId}`, label: 'Wet Riser Assets', path: `/checklist/${auditId}/equip/wetriser` },
        { key: `equip_dryriser_${auditId}`, label: 'Dry Riser Assets', path: `/checklist/${auditId}/equip/dryriser` },
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

          if (sys.label === 'Main Fire Alarm') {
            const panels = Array.isArray(data) ? data : [data];
            panels.forEach((p:any) => {
              if (DEFECT_TERMS.includes(p.panelSpecs?.batteryStatus)) {
                foundDefects.push(createDefect(sys.label, p.systemName || 'Panel', 'Battery', p.panelSpecs.batteryRemarks, p.panelSpecs.batteryPhoto, sys.path, 'Critical', trackerData, setup, `batt_${p.id}`, sys.key));
              }
              p.cardConditions?.forEach((c: any) => {
                if (DEFECT_TERMS.includes(c.status)) foundDefects.push(createDefect(sys.label, p.systemName || 'Panel', c.label, c.remarks, c.photo, sys.path, 'Critical', trackerData, setup, `card_${c.id}`, sys.key));
              });
              p.indicators?.forEach((ind: any) => {
                if (DEFECT_TERMS.includes(ind.status)) foundDefects.push(createDefect(sys.label, p.systemName || 'Panel', ind.label, ind.remarks, ind.photo, sys.path, 'Major', trackerData, setup, `ind_${ind.id}`, sys.key));
              });
              p.zones?.forEach((z: any) => {
                if (DEFECT_TERMS.includes(z.status)) foundDefects.push(createDefect(sys.label, p.systemName || 'Panel', `Zone ${z.zoneNo}: ${z.name}`, z.remarks, z.photo, sys.path, 'Major', trackerData, setup, `zone_${z.id}`, sys.key));
              });
            });
          }
          else if (sys.label === 'Gas Suppression') {
            const units = Array.isArray(data) ? data : [data];
            units.forEach((u: any) => {
              u.integrationItems?.forEach((i: any) => {
                if (i.status === 'Faulty' || DEFECT_TERMS.includes(i.status)) {
                  foundDefects.push(createDefect(sys.label, u.zoneName || 'Server Room', i.label, i.remarks, i.photo, sys.path, 'Critical', trackerData, setup, `gas_${u.id}_${i.id}`, sys.key));
                }
              });
            });
          }
          else if (sys.label.includes('Pump')) {
            const pumps = Array.isArray(data) ? data : [data];
            pumps.forEach((u: any) => {
              const checkUnit = (unit: any, ulabel: string) => {
                if (unit && DEFECT_TERMS.includes(unit.status)) {
                  foundDefects.push(createDefect(sys.label, u.systemName || 'Pump Set', ulabel, unit.remarks, unit.photo, sys.path, 'Critical', trackerData, setup, `pump_${u.id}_${ulabel}`, sys.key));
                }
              };
              checkUnit(u.jockeyUnit, 'Jockey Pump');
              checkUnit(u.dutyUnit, 'Duty Pump');
              checkUnit(u.standbyUnit, 'Standby Pump');
              
              if (u.panelLampsStatus === 'Fault') foundDefects.push(createDefect(sys.label, u.systemName || 'Pump Set', 'Indicator Lamps', u.panelLampsRemarks, u.panelLampsPhoto, sys.path, 'Major', trackerData, setup, `plamp_${u.id}`, sys.key));
              if (u.panelWiringStatus === 'Fault') foundDefects.push(createDefect(sys.label, u.systemName || 'Pump Set', 'Internal Wiring', u.panelWiringRemarks, u.panelWiringPhoto, sys.path, 'Critical', trackerData, setup, `pwiring_${u.id}`, sys.key));
            });
          }
          else {
            const items = Array.isArray(data) ? data : (data.items || []);
            items.forEach((item: any) => {
              const unitName = item.serial || item.location || `Asset Unit`;
              Object.entries(item).forEach(([key, value]) => {
                if (typeof value === 'string' && DEFECT_TERMS.includes(value)) {
                  const faultLabel = key.replace('Status', '').replace('Outcome', '').toUpperCase();
                  const specificPhoto = (item.photos && item.photos[key]) || item.photo;
                  foundDefects.push(createDefect(sys.label, 'Inventory', `${unitName} (${faultLabel})`, (item.remarks?.[key] || item.remarks) || 'Defect detected.', specificPhoto, sys.path, 'Minor', trackerData, setup, `item_${item.id}_${key}`, sys.key));
                }
              });
            });
          }
        } catch (e) { console.error("Scanner Error:", e); }
      });
      setDefects(foundDefects);
      setIsLoading(false);
    };

    const createDefect = (sys: string, sec: string, label: string, desc: any, photo: any, path: string, defSeverity: any, tracker: any, setup: any, idSuffix: string, sourceKey: string): DefectEntry => {
      const uid = `${auditId}_${idSuffix}`;
      let finalDesc = 'Field verification required.';
      if (typeof desc === 'string') finalDesc = desc;
      else if (typeof desc === 'object' && desc !== null) finalDesc = Object.values(desc).filter(v => v).join('. ');

      return {
        uid, system: sys, section: sec, itemLabel: label, description: finalDesc, photo, path, 
        dateDetected: setup?.date || new Date().toLocaleDateString(), 
        dossierId: auditId, 
        severity: tracker[uid]?.severity || defSeverity, 
        status: tracker[uid]?.status || 'Open', 
        technician: setup?.techName || 'Lead Auditor', 
        sourceKey, 
        sourceId: idSuffix
      };
    };

    scanSystems();
  }, [auditId]);

  const updateDefect = (uid: string, updates: Partial<DefectEntry>) => {
    const newTracker = { 
      ...tracker, 
      [uid]: { 
        status: updates.status !== undefined ? updates.status : tracker[uid]?.status || defects.find(d => d.uid === uid)?.status,
        severity: updates.severity !== undefined ? updates.severity : tracker[uid]?.severity || defects.find(d => d.uid === uid)?.severity
      } 
    };
    setTracker(newTracker);
    localStorage.setItem(`defect_registry_${auditId}`, JSON.stringify(newTracker));
    setDefects(prev => prev.map(d => d.uid === uid ? { ...d, ...updates } : d));
  };

  const filteredDefects = useMemo(() => {
    if (severityFilter === 'All') return defects;
    return defects.filter(d => d.severity === severityFilter);
  }, [defects, severityFilter]);

  const groupedDefects = useMemo(() => {
    const groups: Record<string, DefectEntry[]> = {};
    filteredDefects.forEach(d => { if (!groups[d.system]) groups[d.system] = []; groups[d.system].push(d); });
    return groups;
  }, [filteredDefects]);

  const stats = useMemo(() => {
    const total = defects.length;
    const rectified = defects.filter(d => d.status === 'Rectified').length;
    return { 
      total, 
      open: total - rectified, 
      rectified, 
      critical: defects.filter(d => d.severity === 'Critical').length, 
      progress: total > 0 ? (rectified / total) * 100 : 100 
    };
  }, [defects]);

  if (isLoading) return <div className="h-full flex flex-col items-center justify-center p-10 bg-background-dark"><div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" /><p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Analyzing Technical Core...</p></div>;

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="Defect Registry" subtitle={`REF: ${auditId}`} showBack />

      <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* Master Header Card */}
        <div className="bg-surface-dark p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
           <div className="flex justify-between items-start mb-6">
              <div className="min-w-0">
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Master Summary</p>
                 <h1 className="text-2xl font-black italic uppercase text-white tracking-tight truncate">{setupData?.clientName || 'SITE AUDIT'}</h1>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-lg border border-primary/20">
                 <span className="material-symbols-outlined text-2xl font-bold">analytics</span>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-background-dark/50 p-3 rounded-2xl flex flex-col items-center border border-white/5"><span className="text-xl font-black text-white">{stats.total}</span><span className="text-[7px] font-black uppercase text-text-muted">Total</span></div>
              <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 flex flex-col items-center"><span className="text-xl font-black text-primary">{stats.critical}</span><span className="text-[7px] font-black uppercase text-primary">Critical</span></div>
              <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 flex flex-col items-center"><span className="text-xl font-black text-emerald-500">{stats.rectified}</span><span className="text-[7px] font-black uppercase text-emerald-500">Fixed</span></div>
           </div>

           <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Rectification Progress</span>
              <span className="text-[10px] font-black text-white italic">{Math.round(stats.progress)}%</span>
           </div>
           <div className="h-2 w-full bg-background-dark rounded-full overflow-hidden border border-white/5">
              <div className={`h-full transition-all duration-1000 ${stats.open === 0 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${stats.progress}%` }} />
           </div>
        </div>

        {/* Severity Filter */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
           {(['All', 'Critical', 'Major', 'Minor'] as const).map(f => (
             <button key={f} onClick={() => setSeverityFilter(f)} className={`px-5 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 border ${severityFilter === f ? 'bg-primary border-primary text-white shadow-lg' : 'bg-surface-dark border-white/5 text-text-muted hover:bg-white/5'}`}>{f}</button>
           ))}
        </div>

        {/* Grouped Defect List */}
        {(Object.entries(groupedDefects) as [string, DefectEntry[]][]).map(([system, items]) => (
          <div key={system} className="flex flex-col gap-4">
             <div className="flex items-center gap-3 px-2">
                <div className="h-4 w-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(236,19,19,0.5)]" />
                <h3 className="text-[11px] font-black uppercase italic text-white tracking-widest">{system}</h3>
                <span className="h-[1px] flex-1 bg-white/5" />
             </div>

             <div className="flex flex-col gap-4">
                {items.map((defect) => (
                   <div key={defect.uid} className={`bg-surface-dark rounded-[2rem] border shadow-xl overflow-hidden group transition-all ${defect.status === 'Rectified' ? 'border-emerald-500/20' : 'border-white/5 hover:border-white/10'}`}>
                      <div className="p-6">
                         <div className="flex justify-between items-start mb-5">
                            <div className="flex flex-col min-w-0 pr-4">
                               <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">{defect.section}</span>
                               <h4 className="text-sm font-bold uppercase text-white tracking-tight truncate leading-tight">{defect.itemLabel}</h4>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                               <select 
                                 value={defect.status} 
                                 onChange={(e) => updateDefect(defect.uid, { status: e.target.value as any })} 
                                 className={`h-7 rounded-lg border-none text-[8px] font-black uppercase px-3 ${defect.status === 'Open' ? 'bg-primary text-white' : defect.status === 'Rectified' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-amber-500 text-white'}`}
                               >
                                  <option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Rectified">Rectified</option>
                               </select>
                               <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border ${defect.severity === 'Critical' ? 'bg-primary/10 text-primary border-primary/20' : defect.severity === 'Major' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>{defect.severity}</span>
                            </div>
                         </div>

                         {defect.photo && (
                           <div className="w-full h-48 bg-background-dark rounded-2xl border border-white/5 overflow-hidden mb-4 shadow-inner group-hover:border-primary/20 transition-colors">
                              <img src={defect.photo} className="w-full h-full object-cover" alt="Defect proof" />
                           </div>
                         )}

                         <div className={`p-4 rounded-2xl mb-5 border border-white/5 ${defect.status === 'Rectified' ? 'bg-emerald-500/5' : 'bg-background-dark/40 shadow-inner'}`}>
                            <p className={`text-[11px] italic leading-relaxed ${defect.status === 'Rectified' ? 'text-emerald-500/60 line-through' : 'text-text-muted font-medium'}`}>"{defect.description}"</p>
                         </div>

                         <div className="flex gap-2">
                            <button onClick={() => navigate(defect.path)} className="flex-1 h-10 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
                               <span className="material-symbols-outlined text-sm">open_in_new</span>
                               <span>Jump to Source</span>
                            </button>
                            <button onClick={() => navigate(defect.path)} className="w-10 h-10 bg-primary/10 border border-primary/20 text-primary rounded-xl flex items-center justify-center transition-all hover:bg-primary hover:text-white">
                               <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        ))}

        {filteredDefects.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center opacity-20 grayscale">
             <span className="material-symbols-outlined text-8xl mb-4">task_alt</span>
             <p className="text-xs font-black uppercase tracking-[0.5em] mt-4">Zero Defects Found</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-background-dark/95 backdrop-blur-xl border-t border-white/5 p-6 pb-12 z-50">
        <button onClick={() => navigate(`/checklist/${auditId}`)} className="w-full h-14 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
           <span className="material-symbols-outlined text-sm">hub</span>
           <span>Return to Systems Hub</span>
        </button>
      </div>
    </div>
  );
};

export default DefectReport;
