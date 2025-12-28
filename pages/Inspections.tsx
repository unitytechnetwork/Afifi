
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { RECENT_INSPECTIONS } from '../constants';
import { InspectionStatus } from '../types';

const Inspections: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  const filteredInspections = RECENT_INSPECTIONS.filter(insp => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return insp.status !== InspectionStatus.SUBMITTED;
    if (filter === 'COMPLETED') return insp.status === InspectionStatus.SUBMITTED;
    return true;
  });

  const getStatusColor = (status: InspectionStatus) => {
    switch(status) {
      case InspectionStatus.PENDING_SYNC: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case InspectionStatus.SUBMITTED: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case InspectionStatus.DRAFT: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-dark pb-32 overflow-hidden">
      <TopBar title="Inspections" />
      
      <div className="px-4 py-3 flex gap-2 border-b border-white/5 bg-background-dark">
        {(['ALL', 'PENDING', 'COMPLETED'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all border ${
              filter === f 
                ? 'bg-primary border-primary text-white' 
                : 'bg-surface-dark border-white/5 text-text-muted'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">
        {filteredInspections.length > 0 ? (
          filteredInspections.map((insp) => (
            <div 
              key={insp.id}
              onClick={() => navigate(`/inspection-cover/${insp.id}`)}
              className="bg-surface-dark p-4 rounded-2xl border border-white/5 flex flex-col gap-3 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-background-dark flex items-center justify-center text-text-muted group-hover:text-primary transition-colors shrink-0">
                    <span className="material-symbols-outlined">assignment</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">{insp.title}</h4>
                    <p className="text-[10px] text-text-muted truncate uppercase tracking-tighter">{insp.location}</p>
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded text-[8px] font-black border shrink-0 ${getStatusColor(insp.status)}`}>
                  {insp.status}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="w-5 h-5 rounded-full border border-surface-dark bg-slate-600 bg-cover bg-center" style={{ backgroundImage: `url(https://picsum.photos/id/${60+i}/50/50)` }} />
                    ))}
                  </div>
                  <span className="text-[9px] text-text-muted font-bold">Tech Team</span>
                </div>
                <span className="text-[9px] text-text-muted font-bold">{insp.date}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <span className="material-symbols-outlined text-6xl mb-2">inbox</span>
            <p className="font-bold uppercase tracking-widest text-xs">No inspections found</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Inspections;
