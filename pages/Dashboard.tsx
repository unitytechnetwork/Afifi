
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { MOCK_USER, RECENT_INSPECTIONS } from '../constants';
import { InspectionStatus } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);

  // Dynamic counts based on mock data
  const pendingSyncCount = useMemo(() => 
    RECENT_INSPECTIONS.filter(i => i.status === InspectionStatus.PENDING_SYNC || i.status === InspectionStatus.DRAFT).length
  , []);

  const completedCount = useMemo(() => 
    RECENT_INSPECTIONS.filter(i => i.status === InspectionStatus.SUBMITTED || i.status === InspectionStatus.APPROVED).length
  , []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert("Cloud Sync Successful: All local audits updated.");
    }, 1500);
  };

  const getStatusColor = (status: InspectionStatus) => {
    switch(status) {
      case InspectionStatus.PENDING_SYNC: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case InspectionStatus.SUBMITTED: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case InspectionStatus.DRAFT: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-dark pb-24 overflow-y-auto no-scrollbar">
      <TopBar 
        title="Dashboard" 
        onSave={handleSync} 
      />
      
      <div className="p-4 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="animate-in fade-in slide-in-from-left duration-500">
            <h1 className="text-2xl font-bold italic tracking-tight">HELLO,</h1>
            <p className="text-text-muted font-black text-xs uppercase tracking-[0.2em] -mt-1">{MOCK_USER.name} • {MOCK_USER.role}</p>
          </div>
          <div 
            onClick={() => navigate('/settings')}
            className="w-12 h-12 rounded-full border-2 border-primary bg-cover bg-center shadow-lg cursor-pointer active:scale-95 transition-transform"
            style={{ backgroundImage: `url(${MOCK_USER.avatar})` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div 
            onClick={handleSync}
            className="bg-surface-dark p-4 rounded-2xl border border-white/5 flex flex-col gap-1 shadow-xl cursor-pointer active:scale-95 transition-all"
          >
            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Reports Pending</span>
            <div className="flex items-end justify-between">
              <span className={`text-3xl font-black ${pendingSyncCount > 0 ? 'text-amber-500' : 'text-text-muted'}`}>
                {pendingSyncCount.toString().padStart(2, '0')}
              </span>
              <span className={`material-symbols-outlined ${pendingSyncCount > 0 ? 'text-amber-500 animate-pulse' : 'text-text-muted'}`}>
                {isSyncing ? 'sync' : 'sync_problem'}
              </span>
            </div>
          </div>
          <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 flex flex-col gap-1 shadow-xl">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Completed Jobs</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-primary">
                {completedCount.toString().padStart(2, '0')}
              </span>
              <span className="material-symbols-outlined text-primary">verified_user</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black uppercase tracking-widest text-[10px] text-text-muted">Recent Site Audits</h3>
            <button 
              onClick={() => navigate('/inspections')}
              className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
            >
              Archive
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {RECENT_INSPECTIONS.map((insp) => (
              <div 
                key={insp.id}
                onClick={() => navigate(`/inspection-cover/${insp.id}`)}
                className="bg-surface-dark p-4 rounded-2xl border border-white/5 flex flex-col gap-3 active:scale-[0.98] transition-all cursor-pointer group shadow-lg hover:border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-background-dark flex items-center justify-center text-text-muted group-hover:text-primary transition-colors shrink-0">
                      <span className="material-symbols-outlined text-xl">corporate_fare</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate uppercase tracking-tight">{insp.title}</h4>
                      <p className="text-[10px] text-text-muted uppercase tracking-tight">{insp.location}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[8px] font-black border shrink-0 ${getStatusColor(insp.status)}`}>
                    {insp.status}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <span className="text-[9px] text-text-muted font-black">{insp.date}</span>
                  <div className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    {insp.status === InspectionStatus.DRAFT ? 'Resume' : 'Review'}
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button 
        onClick={() => navigate('/inspection-cover/new')}
        className="fixed bottom-24 right-5 w-16 h-16 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-all border-4 border-background-dark hover:rotate-90"
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
