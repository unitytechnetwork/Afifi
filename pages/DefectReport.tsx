
import React, { useState, useEffect, useMemo } from 'react';
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
}

const DefectReport: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';

  const [defects, setDefects] = useState<DefectEntry[]>([]);
  const [tracker, setTracker] = useState<Record<string, { status: any, severity: any }>>({});
  const [setupData, setSetupData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

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
            if (DEFECT_TERMS.includes(data.panelSpecs?.batteryStatus)) {
              foundDefects.push(createDefect(sys.label, 'Panel', 'Battery', data.panelSpecs.batteryRemarks, data.panelSpecs.batteryPhoto, sys.path, 'Critical', trackerData, setup, 'batt'));
            }
            data.cardConditions?.forEach((c: any) => {
              if (DEFECT_TERMS.includes(c.status)) {
                foundDefects.push(createDefect(sys.label, 'Internal Card', c.label, c.remarks, c.photo, sys.path, 'Critical', trackerData, setup, `card_${c.id}`));
              }
            });
            data.indicators?.forEach((ind: any) => {
              if (DEFECT_TERMS.includes(ind.status)) {
                foundDefects.push(createDefect(sys.label, 'Signals', ind.label, ind.remarks, ind.photo, sys.path, 'Major', trackerData, setup, `ind_${ind.id}`));
              }
            });
            data.zones?.forEach((z: any) => {
              if (DEFECT_TERMS.includes(z.status)) {
                foundDefects.push(createDefect(sys.label, `Zone ${z.zoneNo}`, z.name, z.remarks, z.photo, sys.path, 'Major', trackerData, setup, `zone_${z.id}`));
              }
            });
          }
          else if (sys.label === 'Gas Suppression') {
            const systems = Array.isArray(data) ? data : [data];
            systems.forEach((s: any) => {
              s.integrationItems?.forEach((i: any) => {
                if (DEFECT_TERMS.includes(i.status)) {
                  foundDefects.push(createDefect(sys.label, s.zoneName, i.label, i.remarks, i.photo, sys.path, 'Critical', trackerData, setup, `gas_${i.id}`));
                }
              });
            });
          }
          else if (sys.label.includes('Pump')) {
            const checkUnit = (unit: any, label: string) => {
              if (DEFECT_TERMS.includes(unit?.status)) {
                foundDefects.push(createDefect(sys.label, 'Mechanical', label, unit.remarks, unit.photo, sys.path, 'Critical', trackerData, setup, `pump_${label}`));
              }
            };
            checkUnit(data.dutyUnit, 'Duty Pump');
            checkUnit(data.standbyUnit, 'Standby Pump');
            checkUnit(data.jockeyUnit, 'Jockey Pump');
            if (data.panelLampsStatus === 'Fault') foundDefects.push(createDefect(sys.label, 'Panel', 'Indication Lamps', data.panelLampsRemarks, data.panelLampsPhoto, sys.path, 'Major', trackerData, setup, 'p_lamps'));
            if (data.panelWiringStatus === 'Fault') foundDefects.push(createDefect(sys.label, 'Panel', 'Wiring Logic', data.panelWiringRemarks, data.panelWiringPhoto, sys.path, 'Critical', trackerData, setup, 'p_wiring'));
          }
          else {
            const items = Array.isArray(data) ? data : (data.items || []);
            items.forEach((item: any, idx: number) => {
              const unitName = item.serial || item.location || `UNIT #${idx+1}`;
              Object.entries(item).forEach(([key, value]) => {
                if (['id', 'location', 'serial', 'remarks', 'photos', 'brand', 'model', 'type', 'weight', 'expiry', 'lastServiceDate', 'cylinderYear', 'bombaCertExpiry'].includes(key)) return;
                if (typeof value === 'string' && DEFECT_TERMS.includes(value)) {
                  const faultLabel = key.replace('Status', '').replace('Outcome', '').replace('Condition', '').toUpperCase();
                  const specificRemark = item.remarks?.[key] || 'Deficiency verified in assembly.';
                  const specificPhoto = item.photos?.[key];
                  foundDefects.push(createDefect(sys.label, 'Asset Inventory', `${unitName} (${faultLabel})`, specificRemark, specificPhoto, sys.path, 'Minor', trackerData, setup, `item_${item.id}_${key}`));
                }
              });
            });
          }
        } catch (e) {
          console.error("Scanning Error:", e);
        }
      });

      setDefects(foundDefects);
      setIsLoading(false);
    };

    const createDefect = (sys: string, sec: string, label: string, desc: string, photo: string, path: string, defSeverity: any, tracker: any, setup: any, idSuffix: string): DefectEntry => {
      const uid = `${auditId}_${idSuffix}`;
      return {
        uid,
        system: sys,
        section: sec,
        itemLabel: label,
        description: desc || 'Field verification required.',
        photo,
        path,
        dateDetected: setup?.date || new Date().toLocaleDateString(),
        dossierId: auditId,
        severity: tracker[uid]?.severity || defSeverity,
        status: tracker[uid]?.status || 'Open',
        technician: setup?.techName || 'Lead Auditor'
      };
    };

    scanSystems();
  }, [auditId]);

  const updateDefect = (uid: string, updates: Partial<DefectEntry>) => {
    const newTracker = { ...tracker, [uid]: { ...tracker[uid], ...updates } };
    setTracker(newTracker);
    localStorage.setItem(`defect_registry_${auditId}`, JSON.stringify(newTracker));
    setDefects(prev => prev.map(d => d.uid === uid ? { ...d, ...updates } : d));
  };

  const groupedDefects = useMemo(() => {
    const groups: Record<string, DefectEntry[]> = {};
    defects.forEach(d => {
      if (!groups[d.system]) groups[d.system] = [];
      groups[d.system].push(d);
    });
    return groups;
  }, [defects]);

  const stats = useMemo(() => {
    const total = defects.length;
    const rectified = defects.filter(d => d.status === 'Rectified').length;
    const open = total - rectified;
    const progress = total > 0 ? (rectified / total) * 100 : 100;
    return {
      total,
      open,
      rectified,
      critical: defects.filter(d => d.severity === 'Critical').length,
      progress
    };
  }, [defects]);

  const canFinalize = useMemo(() => {
    // Audit can be finalized if:
    // 1. There are no defects at all (total === 0)
    // 2. OR all existing defects are marked as Rectified (progress === 100)
    return stats.total === 0 || stats.progress === 100;
  }, [stats]);

  const handleFinalizeClose = () => {
    if (stats.open > 0) {
      alert(`Peringatan: Terdapat ${stats.open} item kerosakan yang belum dibaiki.`);
      return;
    }

    setIsClosing(true);
    setTimeout(() => {
      if (setupData) {
        // Update setup status to APPROVED
        const updatedSetup = { ...setupData, status: InspectionStatus.APPROVED };
        localStorage.setItem(`setup_${auditId}`, JSON.stringify(updatedSetup));
        
        // Also clear any temporary session locks if any
        console.log(`Audit ${auditId} finalized as APPROVED`);
      }
      setIsClosing(false);
      alert("Tahniah! Laporan audit telah diselesaikan (APPROVED). Status akan dikemaskini di Dashboard.");
      navigate('/');
    }, 1500);
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    alert(`Generating ${type.toUpperCase()} report...`);
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="Defect Registry" subtitle={`SYNC ID: ${auditId}`} showBack />

      <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* Metric Overview with Progress Bar */}
        <div className="bg-surface-dark p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
           <div className="flex justify-between items-start mb-6">
              <div className="min-w-0">
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Operational Deficiency Matrix</p>
                 <h1 className="text-2xl font-black italic uppercase text-white tracking-tight truncate">{setupData?.clientName || 'SITE AUDIT'}</h1>
              </div>
              <div className="flex flex-col items-end shrink-0">
                 <span className={`text-[10px] font-black uppercase ${canFinalize ? 'text-emerald-500' : 'text-primary animate-pulse'}`}>
                   {canFinalize ? 'Integrity Verified' : 'Action Required'}
                 </span>
                 <span className="text-[8px] font-bold text-text-muted uppercase mt-1">{new Date().toLocaleDateString()}</span>
              </div>
           </div>

           <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-background-dark/50 p-3 rounded-2xl flex flex-col items-center border border-white/5">
                 <span className="text-xl font-black text-white">{stats.total}</span>
                 <span className="text-[7px] font-black uppercase text-text-muted">Faults</span>
              </div>
              <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 flex flex-col items-center">
                 <span className="text-xl font-black text-primary">{stats.critical}</span>
                 <span className="text-[7px] font-black uppercase text-primary">Critical</span>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 flex flex-col items-center">
                 <span className="text-xl font-black text-emerald-500">{stats.rectified}</span>
                 <span className="text-[7px] font-black uppercase text-emerald-500">Fixed</span>
              </div>
           </div>

           {/* Progress Tracker */}
           <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                 <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Rectification Status</span>
                 <span className={`text-[10px] font-black italic ${canFinalize ? 'text-emerald-500' : 'text-primary'}`}>{Math.round(stats.progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-1000 ${canFinalize ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-primary'}`} 
                   style={{ width: `${stats.progress}%` }} 
                 />
              </div>
           </div>
        </div>

        {/* Status Messaging */}
        {canFinalize && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-4 animate-in zoom-in duration-300">
             <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <span className="material-symbols-outlined">verified</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest italic">Ready for Finalization</span>
                <span className="text-[8px] font-black text-text-muted uppercase mt-1">Sila tekan butang hijau di bawah untuk menutup laporan.</span>
             </div>
          </div>
        )}

        {/* Grouped Defect List */}
        <div className="flex flex-col gap-8">
           {isLoading ? (
             <div className="py-20 text-center animate-pulse">
                <span className="material-symbols-outlined text-4xl text-primary mb-2">sync</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Analyzing Site Sensors...</p>
             </div>
           ) : Object.keys(groupedDefects).length > 0 ? (Object.entries(groupedDefects) as [string, DefectEntry[]][]).map(([system, items]) => (
              <div key={system} className="flex flex-col gap-4">
                 <div className="flex items-center gap-3 px-2">
                    <div className="h-4 w-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(236,19,19,0.5)]" />
                    <h3 className="text-[11px] font-black uppercase italic text-white tracking-widest">{system}</h3>
                    <span className="h-[1px] flex-1 bg-white/5" />
                    <span className="text-[8px] font-black text-text-muted uppercase">{items.length} Points</span>
                 </div>

                 <div className="flex flex-col gap-4">
                    {items.map((defect) => (
                       <div key={defect.uid} className={`bg-surface-dark rounded-[2.5rem] border shadow-xl relative overflow-hidden group transition-all ${defect.status === 'Rectified' ? 'border-emerald-500/20' : 'border-white/5'}`}>
                          <div className={`absolute top-0 left-0 w-1.5 h-full ${defect.status === 'Rectified' ? 'bg-emerald-500' : (defect.severity === 'Critical' ? 'bg-primary' : defect.severity === 'Major' ? 'bg-amber-500' : 'bg-blue-500')}`} />
                          
                          <div className="p-6">
                             <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col min-w-0 pr-4">
                                   <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[8px] font-black text-text-muted uppercase tracking-widest truncate">{defect.section}</span>
                                      <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0 ${defect.status === 'Rectified' ? 'bg-emerald-600 text-white' : (defect.severity === 'Critical' ? 'bg-primary text-white' : 'bg-background-dark text-text-muted')}`}>
                                        {defect.status === 'Rectified' ? 'RESOLVED' : defect.severity}
                                      </span>
                                   </div>
                                   <h4 className="text-sm font-bold uppercase text-white tracking-tight truncate">{defect.itemLabel}</h4>
                                </div>
                                <select 
                                   value={defect.status} 
                                   onChange={(e) => updateDefect(defect.uid, { status: e.target.value as any })}
                                   className={`h-8 rounded-lg border-none text-[9px] font-black uppercase px-3 shadow-inner shrink-0 ${defect.status === 'Open' ? 'bg-primary text-white' : defect.status === 'Rectified' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}
                                >
                                   <option value="Open">Open</option>
                                   <option value="In Progress">In Progress</option>
                                   <option value="Rectified">Rectified</option>
                                </select>
                             </div>

                             <div className="flex gap-4 mb-4">
                                <div className="w-20 h-20 bg-background-dark rounded-2xl border border-white/5 shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                                   {defect.photo ? <img src={defect.photo} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-white/10">no_photography</span>}
                                </div>
                                <div className="flex-1 flex flex-col justify-center min-w-0">
                                   <p className={`text-[10px] italic leading-relaxed line-clamp-3 ${defect.status === 'Rectified' ? 'text-emerald-500/60 line-through' : 'text-text-muted'}`}>"{defect.description}"</p>
                                   <div className="mt-3 flex items-center gap-2">
                                      <span className="text-[7px] font-black text-text-muted uppercase opacity-40">Tech: {defect.technician}</span>
                                      <span className="w-1 h-1 rounded-full bg-white/10" />
                                      <span className="text-[7px] font-black text-text-muted uppercase opacity-40">{defect.dateDetected}</span>
                                   </div>
                                </div>
                             </div>

                             <div className="flex gap-2">
                                <button onClick={() => navigate(defect.path)} className="flex-1 h-9 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors border border-white/5">Go to Source</button>
                                <div className="flex h-9 bg-background-dark/50 rounded-xl border border-white/5 px-2 gap-2 items-center">
                                   <span className="text-[7px] font-black text-text-muted uppercase ml-1">Grade:</span>
                                   {(['Critical', 'Major', 'Minor'] as const).map(s => (
                                      <button 
                                         key={s} 
                                         disabled={defect.status === 'Rectified'}
                                         onClick={() => updateDefect(defect.uid, { severity: s })}
                                         className={`w-4 h-4 rounded-full border border-white/10 transition-all ${defect.status === 'Rectified' ? 'opacity-20 cursor-not-allowed' : ''} ${defect.severity === s ? (s === 'Critical' ? 'bg-primary' : s === 'Major' ? 'bg-amber-500' : 'bg-blue-500') : 'bg-transparent'}`} 
                                         title={`Set as ${s}`} 
                                      />
                                   ))}
                                </div>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )) : (
              <div className="py-24 flex flex-col items-center justify-center text-center px-10 animate-in fade-in zoom-in duration-500">
                 <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                    <span className="material-symbols-outlined text-5xl text-emerald-500">verified</span>
                 </div>
                 <h2 className="text-lg font-black uppercase tracking-[0.4em] text-white">Registry Clear</h2>
                 <p className="text-[9px] font-black mt-2 tracking-widest italic leading-relaxed text-text-muted">Semua kerosakan telah dibaiki atau tiada kegagalan dikesan. Sistem kini dalam keadaan selamat (INTEGRITY VERIFIED).</p>
                 <div className="mt-8 flex flex-col items-center gap-2">
                    <div className="h-10 w-[1px] bg-gradient-to-b from-emerald-500 to-transparent opacity-30" />
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Sila 'Finalize' di bawah</span>
                 </div>
              </div>
           )}
        </div>

        {/* Export Dossier Controls */}
        <div className="bg-surface-dark p-6 rounded-3xl border border-white/5 flex flex-col gap-4 shadow-xl mt-4 mb-4">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic border-b border-white/5 pb-3">Technical Output</h3>
           <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleExport('pdf')} className="h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center gap-2 text-primary active:scale-95 transition-all">
                 <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                 <span className="text-[9px] font-black uppercase tracking-widest">Defect PDF</span>
              </button>
              <button onClick={() => handleExport('excel')} className="h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-2 text-emerald-500 active:scale-95 transition-all">
                 <span className="material-symbols-outlined text-lg">table_view</span>
                 <span className="text-[9px] font-black uppercase tracking-widest">Data Link</span>
              </button>
           </div>
        </div>

      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-background-dark/95 backdrop-blur-xl border-t border-white/5 p-6 pb-12 z-50 flex flex-col gap-3">
        {canFinalize && (
          <button 
            onClick={handleFinalizeClose}
            disabled={isClosing}
            className="w-full h-14 bg-emerald-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3 active:scale-95 transition-all animate-in slide-in-from-bottom"
          >
            {isClosing ? <span className="animate-spin material-symbols-outlined text-sm">sync</span> : <span className="material-symbols-outlined text-sm">verified_user</span>}
            <span>{isClosing ? 'Closing Dossier...' : (stats.total === 0 ? 'Approve & Close Audit' : 'Rectify & Close Dossier')}</span>
          </button>
        )}
        <button onClick={() => navigate(`/checklist/${auditId}`)} className="w-full h-12 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl active:scale-[0.98] flex items-center justify-center gap-3">
          <span>Return to Hub</span>
          <span className="material-symbols-outlined text-sm">hub</span>
        </button>
      </div>
    </div>
  );
};

export default DefectReport;
