
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { MOCK_USER, USERS_LIST } from '../constants';
import { InspectionStatus, User, Inspection } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Reactive User State
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('current_user');
    try {
      return saved ? JSON.parse(saved) : MOCK_USER;
    } catch {
      return MOCK_USER;
    }
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [localAudits, setLocalAudits] = useState<Inspection[]>([]);

  const isSupervisor = currentUser?.role === 'Supervisor' || currentUser?.role === 'Admin';

  // Load Users
  useEffect(() => {
    const registry = JSON.parse(localStorage.getItem('users_registry') || '[]');
    const combined = [...registry, ...USERS_LIST];
    const unique = Array.from(new Map(combined.map(u => [String(u.id), u])).values());
    setAllUsers(unique);
  }, [refreshTrigger]);

  // Load Audits Logic
  useEffect(() => {
    const loadAudits = () => {
      const audits: Inspection[] = [];
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        if (key.startsWith('setup_AUDIT-')) {
          try {
            const rawData = localStorage.getItem(key);
            if (!rawData) return;
            
            const setupData = JSON.parse(rawData);
            if (!setupData) return;

            const auditId = key.replace('setup_', '');
            
            // Calculate progress
            const checklistKey = `checklist_${auditId}`;
            const checklistData = localStorage.getItem(checklistKey);
            let itemsCompleted = 0;
            if (checklistData) {
              try {
                const parsed = JSON.parse(checklistData);
                itemsCompleted = Object.keys(parsed).filter(k => k !== 'panelSpecs' && k !== 'isNA').length;
              } catch { itemsCompleted = 0; }
            }

            audits.push({
              id: auditId,
              title: setupData.clientName || 'Draft Inspection',
              location: setupData.location || 'Location Not Set',
              date: setupData.date || 'No Date',
              status: setupData.status || InspectionStatus.DRAFT,
              itemsCompleted: itemsCompleted,
              totalItems: 13,
              technician: setupData.techName || 'Unassigned',
              technicianId: setupData.technicianId ? String(setupData.technicianId) : undefined
            });
          } catch (e) {
            console.error("Error loading audit:", key, e);
          }
        }
      });

      // Filter based on role
      const filtered = audits.filter(a => {
        if (isSupervisor) return true;
        return String(a.technicianId) === String(currentUser?.id);
      });

      setLocalAudits(filtered.sort((a, b) => b.id.localeCompare(a.id)));
    };

    loadAudits();
  }, [currentUser, isSupervisor, refreshTrigger]);

  // Form State
  const [assignForm, setAssignForm] = useState({
    clientName: '',
    location: '',
    techId: '',
    date: new Date().toISOString().split('T')[0]
  });

  const pendingSyncCount = useMemo(() => 
    localAudits.filter(i => i.status === InspectionStatus.PENDING_SYNC || i.status === InspectionStatus.DRAFT).length
  , [localAudits]);

  const completedCount = useMemo(() => 
    localAudits.filter(i => i.status === InspectionStatus.SUBMITTED || i.status === InspectionStatus.APPROVED).length
  , [localAudits]);

  const handleSync = () => {
    if (pendingSyncCount === 0) {
      alert("System Status: All reports are synchronized.");
      return;
    }
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert(`Success: ${pendingSyncCount} reports synced to cloud.`);
      setRefreshTrigger(prev => prev + 1);
    }, 1500);
  };

  const handleNewReport = () => {
    // Generate unique ID and go to setup
    const newId = `AUDIT-${Date.now()}`;
    navigate(`/inspection-cover/${newId}`);
  };

  const handleAssignJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.clientName || !assignForm.techId) {
      alert("Action Denied: Required fields are missing.");
      return;
    }

    const selectedTech = allUsers.find(u => String(u.id) === String(assignForm.techId));
    const newAuditId = `AUDIT-${Date.now()}`;
    
    const setupData = {
      clientName: assignForm.clientName,
      location: assignForm.location,
      date: assignForm.date,
      technicianId: String(assignForm.techId),
      techName: selectedTech?.name || 'Assigned Tech',
      status: InspectionStatus.DRAFT,
      frequency: 'Monthly'
    };

    try {
      localStorage.setItem(`setup_${newAuditId}`, JSON.stringify(setupData));
      
      // Reset Modal & Form
      setShowAssignModal(false);
      setAssignForm({ clientName: '', location: '', techId: '', date: new Date().toISOString().split('T')[0] });
      
      // Update UI Reactively
      setRefreshTrigger(prev => prev + 1);
      
      // Feedback
      console.log("Job Dispatched Successfully:", newAuditId);
    } catch (err) {
      alert("System Error: Storage capacity reached.");
    }
  };

  const getStatusColor = (status: InspectionStatus) => {
    switch(status) {
      case InspectionStatus.PENDING_SYNC: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case InspectionStatus.SUBMITTED: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case InspectionStatus.DRAFT: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  if (!currentUser) return <div className="p-20 text-center animate-pulse uppercase font-black text-[10px] tracking-widest text-text-muted">Loading System Core...</div>;

  return (
    <div className="flex flex-col h-full bg-background-dark pb-24 overflow-y-auto no-scrollbar">
      <TopBar title="Dashboard" onSave={handleSync} />
      
      <div className="p-4 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold italic tracking-tight uppercase">SYSTEMS ACTIVE,</h1>
            <p className="text-text-muted font-black text-xs uppercase tracking-[0.2em] -mt-1">
              {currentUser.name} • <span className="text-primary">{currentUser.role}</span>
            </p>
          </div>
          <div 
            onClick={() => navigate('/settings')}
            className="w-12 h-12 rounded-full border-2 border-primary bg-surface-dark bg-cover bg-center shadow-lg cursor-pointer active:scale-95 transition-all overflow-hidden"
            style={{ backgroundImage: `url(${currentUser.avatar})` }}
          >
            {!currentUser.avatar && <span className="material-symbols-outlined text-white/20 flex items-center justify-center h-full">person</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 flex flex-col gap-1 shadow-xl">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{isSupervisor ? 'Team Tasks' : 'My Queue'}</span>
            <div className="flex items-end justify-between">
              <span className={`text-3xl font-black ${pendingSyncCount > 0 ? 'text-amber-500' : 'text-text-muted'}`}>
                {pendingSyncCount.toString().padStart(2, '0')}
              </span>
              <span className="material-symbols-outlined text-amber-500">pending_actions</span>
            </div>
          </div>
          <div className="bg-surface-dark p-4 rounded-2xl border border-white/5 flex flex-col gap-1 shadow-xl">
            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Completed</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-black text-emerald-500">
                {completedCount.toString().padStart(2, '0')}
              </span>
              <span className="material-symbols-outlined text-emerald-500">verified</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black uppercase tracking-widest text-[10px] text-text-muted">
              {isSupervisor ? 'Regional Dispatch Log' : 'Personal Task Registry'}
            </h3>
          </div>

          <div className="flex flex-col gap-3">
            {localAudits.length > 0 ? localAudits.map((insp) => (
              <div 
                key={insp.id}
                onClick={() => navigate(`/inspection-cover/${insp.id}`)}
                className="bg-surface-dark p-4 rounded-2xl border border-white/5 flex flex-col gap-3 active:scale-[0.98] transition-all cursor-pointer group shadow-lg hover:border-white/10"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-background-dark flex items-center justify-center text-primary shrink-0">
                      <span className="material-symbols-outlined text-xl">corporate_fare</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate uppercase tracking-tight">{insp.title}</h4>
                      <p className="text-[10px] text-text-muted uppercase tracking-tight truncate">{insp.location}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[8px] font-black border shrink-0 ${getStatusColor(insp.status)}`}>
                    {insp.status}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">
                      {isSupervisor ? `Assignee: ${insp.technician}` : `Audit ID: ${insp.id}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-primary text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                    {insp.status === InspectionStatus.DRAFT ? 'Continue' : 'Review'}
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-16 text-center bg-surface-dark/40 rounded-3xl border border-dashed border-white/5 flex flex-col items-center justify-center opacity-30">
                <span className="material-symbols-outlined text-4xl mb-3">inventory_2</span>
                <p className="text-[9px] font-black uppercase tracking-[0.3em]">No jobs found in registry</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button 
        onClick={() => isSupervisor ? setShowAssignModal(true) : handleNewReport()}
        className="fixed bottom-24 right-5 w-16 h-16 bg-primary text-white rounded-2xl shadow-[0_10px_40px_rgba(236,19,19,0.3)] flex flex-col items-center justify-center z-40 active:scale-90 transition-all border-4 border-background-dark"
      >
        <span className="material-symbols-outlined text-2xl">{isSupervisor ? 'assignment_ind' : 'add'}</span>
        <span className="text-[7px] font-black uppercase tracking-widest">{isSupervisor ? 'Dispatch' : 'New'}</span>
      </button>

      {/* Reactive Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-end justify-center animate-in slide-in-from-bottom duration-300">
          <div className="bg-surface-dark w-full max-w-md rounded-t-[40px] border-t border-white/10 p-8 flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest italic">Dispatch New Job</h3>
                <p className="text-[9px] text-text-muted font-black uppercase mt-1 tracking-widest">Resource Allocation System</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAssignJob} className="flex flex-col gap-4 pb-10">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Building / Project Name</label>
                <input 
                  type="text" 
                  required
                  value={assignForm.clientName}
                  onChange={(e) => setAssignForm({...assignForm, clientName: e.target.value})}
                  className="bg-background-dark/50 border-white/5 border rounded-2xl h-14 px-5 text-sm font-bold focus:ring-1 focus:ring-primary text-white"
                  placeholder="e.g. Petronas Twin Towers"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Site Location</label>
                <input 
                  type="text" 
                  value={assignForm.location}
                  onChange={(e) => setAssignForm({...assignForm, location: e.target.value})}
                  className="bg-background-dark/50 border-white/5 border rounded-2xl h-14 px-5 text-sm font-bold focus:ring-1 focus:ring-primary text-white"
                  placeholder="e.g. KLCC, Kuala Lumpur"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Select Field Technician</label>
                <select 
                  required
                  value={assignForm.techId}
                  onChange={(e) => setAssignForm({...assignForm, techId: e.target.value})}
                  className="bg-background-dark/50 border-white/5 border rounded-2xl h-14 px-5 text-sm font-bold focus:ring-1 focus:ring-primary text-white appearance-none"
                >
                  <option value="" className="bg-surface-dark">Select Resource...</option>
                  {allUsers.filter(u => u.role === 'Technician').map(u => (
                    <option key={u.id} value={u.id} className="bg-surface-dark">
                      {u.name} (ID: {u.id})
                    </option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl active:scale-[0.98] transition-all mt-4 border border-white/10"
              >
                Dispatch Job Now
              </button>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Dashboard;
