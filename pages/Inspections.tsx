
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { InspectionStatus, Inspection, User } from '../types';
import { MOCK_USER } from '../constants';

const Inspections: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = useMemo(() => {
    const saved = localStorage.getItem('current_user');
    try {
      return saved ? JSON.parse(saved) : MOCK_USER;
    } catch {
      return MOCK_USER;
    }
  }, []);

  useEffect(() => {
    const loadInspections = () => {
      setIsLoading(true);
      const audits: Inspection[] = [];
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('setup_AUDIT-')) {
          try {
            const rawData = localStorage.getItem(key);
            if (!rawData) return;
            
            const setupData = JSON.parse(rawData);
            const auditId = key.replace('setup_', '');
            
            // Calculate progress for UI
            const checklistKey = `checklist_${auditId}`;
            const checklistData = localStorage.getItem(checklistKey);
            let itemsCompleted = 0;
            if (checklistData) {
              try {
                const parsed = JSON.parse(checklistData);
                // Count systems that are not N/A or empty
                itemsCompleted = Object.keys(parsed).filter(k => k !== 'panelSpecs' && k !== 'isNA').length;
              } catch { itemsCompleted = 0; }
            }

            audits.push({
              id: auditId,
              title: setupData.clientName || 'Unnamed Report',
              location: setupData.location || 'Unknown Location',
              date: setupData.date || 'No Date',
              status: setupData.status || InspectionStatus.DRAFT,
              itemsCompleted: itemsCompleted,
              totalItems: 13,
              technician: setupData.techName || 'Unknown Tech',
              technicianId: setupData.technicianId
            });
          } catch (e) {
            console.error("Error parsing audit:", key, e);
          }
        }
      });

      // Filter: Technicians only see their own, Admins/Supervisors see all
      const isSupervisor = currentUser.role === 'Supervisor' || currentUser.role === 'Admin';
      const visibleAudits = audits.filter(a => {
        if (isSupervisor) return true;
        return String(a.technicianId) === String(currentUser.id);
      });

      setInspections(visibleAudits.sort((a, b) => b.id.localeCompare(a.id)));
      setIsLoading(false);
    };

    loadInspections();
  }, [currentUser]);

  const filteredInspections = useMemo(() => {
    return inspections.filter(insp => {
      if (filter === 'ALL') return true;
      if (filter === 'PENDING') {
        return insp.status === InspectionStatus.DRAFT || insp.status === InspectionStatus.PENDING_SYNC;
      }
      if (filter === 'COMPLETED') {
        return insp.status === InspectionStatus.SUBMITTED || insp.status === InspectionStatus.APPROVED;
      }
      return true;
    });
  }, [inspections, filter]);

  const getStatusStyles = (status: InspectionStatus) => {
    switch(status) {
      case InspectionStatus.PENDING_SYNC: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case InspectionStatus.SUBMITTED: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case InspectionStatus.DRAFT: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case InspectionStatus.APPROVED: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-dark pb-32 overflow-hidden">
      <TopBar title="Inspections" subtitle="Audit Logs & History" />
      
      {/* Search & Filter Bar */}
      <div className="px-4 py-4 flex flex-col gap-4 bg-background-dark/80 backdrop-blur-sm border-b border-white/5">
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'COMPLETED'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2.5 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all border ${
                filter === f 
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                  : 'bg-surface-dark border-white/5 text-text-muted hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 animate-pulse">
            <span className="material-symbols-outlined text-6xl mb-2">sync</span>
            <p className="text-[10px] font-black uppercase tracking-widest">Accessing Registry...</p>
          </div>
        ) : filteredInspections.length > 0 ? (
          filteredInspections.map((insp) => (
            <div 
              key={insp.id}
              onClick={() => navigate(`/inspection-cover/${insp.id}`)}
              className="bg-surface-dark p-5 rounded-[2rem] border border-white/5 flex flex-col gap-4 active:scale-[0.98] transition-all cursor-pointer group shadow-xl hover:border-white/10 relative overflow-hidden"
            >
              {/* Status Indicator Bar */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-20 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start">
                <div className="flex gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-background-dark flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors shrink-0 shadow-inner">
                    <span className="material-symbols-outlined text-2xl">corporate_fare</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate uppercase tracking-tight">{insp.title}</h4>
                    <p className="text-[10px] text-text-muted truncate uppercase tracking-[0.1em] font-medium mt-0.5 italic">{insp.location}</p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black border shrink-0 uppercase tracking-widest ${getStatusStyles(insp.status)}`}>
                  {insp.status}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-2">
                     <span className="text-[9px] text-text-muted font-black uppercase tracking-widest">ID: {insp.id.replace('AUDIT-', '')}</span>
                     <span className="w-1 h-1 rounded-full bg-white/10" />
                     <span className="text-[9px] text-text-muted font-black uppercase tracking-widest">{insp.date}</span>
                   </div>
                   <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-24 h-1 bg-background-dark rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-primary transition-all duration-500" 
                           style={{ width: `${(insp.itemsCompleted / insp.totalItems) * 100}%` }}
                         />
                      </div>
                      <span className="text-[8px] font-black text-primary uppercase">{insp.itemsCompleted}/{insp.totalItems} Systems</span>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Technician</span>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-white uppercase">{insp.technician}</span>
                      <span className="material-symbols-outlined text-primary text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
                   </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 opacity-10 text-center">
            <span className="material-symbols-outlined text-7xl mb-4">inventory_2</span>
            <p className="font-black uppercase tracking-[0.4em] text-xs">Registry Empty</p>
            <p className="text-[8px] font-bold uppercase mt-2 tracking-widest">No matching audits found in this category</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Inspections;
