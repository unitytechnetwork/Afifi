
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface SystemCategory {
  id: string;
  label: string;
  icon: string;
  path: string;
  storageKey: string;
}

const Checklist: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentId = id || 'NEW-AUDIT';
  
  const categories: SystemCategory[] = [
    { id: 'fire-alarm', label: 'Main Fire Alarm System', icon: 'notifications_active', path: `/checklist/${currentId}/panel`, storageKey: `checklist_${currentId}` },
    { id: 'gas-suppression', label: 'Gas Suppression System', icon: 'gas_meter', path: `/checklist/${currentId}/gas`, storageKey: `gas_suppression_${currentId}` },
    { id: 'hosereel-pump', label: 'Hose Reel Pump System', icon: 'water_pump', path: `/checklist/${currentId}/pump/hosereel`, storageKey: `pump_hosereel_${currentId}` },
    { id: 'wetriser-pump', label: 'Wet Riser Pump System', icon: 'waves', path: `/checklist/${currentId}/pump/wetriser`, storageKey: `pump_wetriser_${currentId}` },
    { id: 'hydrant-pump', label: 'Hydrant Pump System', icon: 'fire_hydrant', path: `/checklist/${currentId}/pump/hydrant`, storageKey: `pump_hydrant_${currentId}` },
    { id: 'sprinkler-pump', label: 'Sprinkler Pump System', icon: 'shower', path: `/checklist/${currentId}/pump/sprinkler`, storageKey: `pump_sprinkler_${currentId}` },
    { id: 'hosereel-equip', label: 'Hose Reel Equipment', icon: 'settings_input_hdmi', path: `/checklist/${currentId}/equip/hosereel`, storageKey: `equip_hosereel_${currentId}` },
    { id: 'hydrant-equip', label: 'Hydrant Equipment', icon: 'water_drop', path: `/checklist/${currentId}/equip/hydrant`, storageKey: `equip_hydrant_${currentId}` },
    { id: 'wetriser-equip', label: 'Wet Riser Equipment', icon: 'vertical_align_top', path: `/checklist/${currentId}/equip/wetriser`, storageKey: `equip_wetriser_${currentId}` },
    { id: 'dryriser-equip', label: 'Dry Riser Equipment', icon: 'vertical_align_center', path: `/checklist/${currentId}/equip/dryriser`, storageKey: `equip_dryriser_${currentId}` },
    { id: 'fire-ext', label: 'Fire Extinguisher', icon: 'fire_extinguisher', path: `/checklist/${currentId}/extinguisher`, storageKey: `extinguisher_${currentId}` },
    { id: 'em-light', label: 'Emergency Light', icon: 'light', path: `/checklist/${currentId}/light/emergency`, storageKey: `light_emergency_${currentId}` },
    { id: 'keluar-sign', label: 'Keluar Sign', icon: 'exit_to_app', path: `/checklist/${currentId}/light/keluar`, storageKey: `light_keluar_${currentId}` },
  ];

  const [refresh, setRefresh] = useState(0);

  const scanForDefects = (obj: any): boolean => {
    if (!obj) return false;
    const defectTerms = ['Defective', 'Fault', 'Faulty', 'Damaged', 'Failed', 'Low', 'Broken', 'Leaking', 'Corroded', 'Loose', 'Blocked', 'Blown'];
    if (Array.isArray(obj)) return obj.some(item => scanForDefects(item));
    if (typeof obj === 'object') {
      return Object.values(obj).some(val => {
        if (typeof val === 'string' && defectTerms.includes(val)) return true;
        if (typeof val === 'object') return scanForDefects(val);
        return false;
      });
    }
    return typeof obj === 'string' && defectTerms.includes(obj);
  };

  const systemStatusMap = useMemo(() => {
    const statuses: Record<string, 'PENDING' | 'COMPLETED' | 'FAULT' | 'N/A'> = {};
    categories.forEach(cat => {
      const dataStr = localStorage.getItem(cat.storageKey);
      if (!dataStr) {
        statuses[cat.id] = 'PENDING';
      } else {
        try {
          const data = JSON.parse(dataStr);
          if (data && data.isNA) {
            statuses[cat.id] = 'N/A';
          } else {
            const hasDefect = scanForDefects(data);
            statuses[cat.id] = hasDefect ? 'FAULT' : 'COMPLETED';
          }
        } catch (e) {
          console.error("Storage error:", e);
          statuses[cat.id] = 'PENDING';
        }
      }
    });
    return statuses;
  }, [currentId, refresh]);

  const toggleNA = (e: React.MouseEvent, cat: SystemCategory) => {
    e.stopPropagation();
    const dataStr = localStorage.getItem(cat.storageKey);
    let data: any = {};
    try {
      data = dataStr ? JSON.parse(dataStr) : {};
    } catch (err) {
      data = {};
    }
    
    // Toggle the isNA flag
    data.isNA = !data.isNA;
    
    localStorage.setItem(cat.storageKey, JSON.stringify(data));
    setRefresh(prev => prev + 1);
  };

  const completedCount = useMemo(() => {
    return Object.values(systemStatusMap).filter(s => s !== 'PENDING').length;
  }, [systemStatusMap]);

  const allComplete = completedCount === categories.length;
  const progress = (completedCount / categories.length) * 100;

  const getStatusBadgeStyles = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'FAULT': return 'text-primary bg-primary/10 border-primary/20 animate-pulse';
      case 'N/A': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      default: return 'text-text-muted bg-white/5 border-white/5';
    }
  };

  const handleSystemClick = (cat: SystemCategory, isNA: boolean) => {
    if (isNA) {
      return;
    }
    navigate(cat.path);
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar 
        title="System Technical Hub" 
        subtitle={`AUDIT #${currentId}`} 
        showBack 
        onBack={() => navigate(`/inspection-cover/${currentId}`)}
        onSave={() => navigate('/')} 
      />

      <div className="p-4 flex flex-col gap-6">
        
        {/* Hub Header */}
        <div className="bg-surface-dark p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-end mb-3 relative z-10">
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Maintenance Sheet</p>
              <h1 className="text-xl font-black italic uppercase tracking-tight">Audit Directory</h1>
            </div>
            <span className="text-lg font-black text-primary italic">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden relative z-10">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-4 text-[9px] font-bold text-text-muted uppercase tracking-widest relative z-10">
            {completedCount} of {categories.length} Systems Handled
          </p>
        </div>

        {/* System Grid */}
        <div className="grid grid-cols-1 gap-3">
          {categories.map((cat) => {
            const status = systemStatusMap[cat.id];
            const isNA = status === 'N/A';
            const isFault = status === 'FAULT';
            const isCompleted = status === 'COMPLETED';

            return (
              <div 
                key={cat.id}
                onClick={() => handleSystemClick(cat, isNA)}
                className={`bg-surface-dark p-4 rounded-2xl border flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer shadow-lg 
                  ${isNA ? 'border-white/5 opacity-50 grayscale cursor-default' : 
                    isFault ? 'border-primary/40 bg-primary/5' : 
                    isCompleted ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40' :
                    'border-primary/30 bg-primary/5 hover:border-primary'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-background-dark flex items-center justify-center transition-all shadow-inner 
                    ${status !== 'PENDING' ? 'text-primary' : 'text-primary/20'}`}>
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <h4 className={`font-bold text-xs uppercase tracking-tight transition-colors 
                      ${isNA ? 'text-text-muted' : (isFault || status === 'PENDING') ? 'text-primary' : 'group-hover:text-primary'}`}>
                      {cat.label}
                    </h4>
                    <span className="text-[8px] font-black uppercase text-text-muted tracking-widest">
                        {status === 'PENDING' ? 'Action Required' : 
                         isNA ? 'System Not Present' : 
                         isFault ? 'Repair / Review Needed' :
                         'Inspection Verified'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                   <button 
                     onClick={(e) => toggleNA(e, cat)}
                     className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all 
                       ${isNA ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 
                       'bg-background-dark text-text-muted border-white/5 hover:border-white/20'}`}
                     title="Toggle N/A"
                   >
                      <span className="text-[10px] font-black">N/A</span>
                   </button>

                   <div className="flex items-center gap-2">
                      <div className={`text-[8px] font-black px-2 py-1 rounded-full border ${getStatusBadgeStyles(status)} transition-all uppercase tracking-widest min-w-[65px] text-center`}>
                         {status === 'COMPLETED' ? 'OK' : status}
                      </div>
                      {!isNA && (
                        <span className={`material-symbols-outlined text-primary text-xl transition-all opacity-20 group-hover:opacity-100 group-hover:translate-x-1`}>
                          {isCompleted || isFault ? 'edit_note' : 'chevron_right'}
                        </span>
                      )}
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Action */}
      <div className="fixed bottom-0 w-full max-w-md bg-surface-dark/95 backdrop-blur-xl border-t border-white/5 p-5 pb-10 z-40">
        <button 
          onClick={() => allComplete && navigate(`/summary/${currentId}`)} 
          disabled={!allComplete}
          className={`w-full h-14 font-black uppercase tracking-[0.2em] text-sm rounded-2xl shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all 
            ${allComplete ? 'bg-primary text-white shadow-primary/30' : 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5'}`}
        >
          <span>{allComplete ? 'Generate Full Report' : 'Incomplete Registry'}</span>
          <span className="material-symbols-outlined">{allComplete ? 'description' : 'lock'}</span>
        </button>
      </div>
    </div>
  );
};

export default Checklist;
