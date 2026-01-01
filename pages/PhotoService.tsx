
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface EvidenceItem {
  id: string;
  tag: string;
  source: string;
  url: string;
  remarks?: string;
  status?: string;
}

const PhotoService: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const auditId = id || 'NEW-AUDIT';
  
  const [auditData, setAuditData] = useState<any>(null);
  const [setupData, setSetupData] = useState<any>(null);
  const [gasData, setGasData] = useState<any>(null);

  useEffect(() => {
    const savedChecklist = localStorage.getItem(`checklist_${auditId}`);
    const savedSetup = localStorage.getItem(`setup_${auditId}`);
    const savedGas = localStorage.getItem(`gas_suppression_${auditId}`);
    
    if (savedChecklist) setAuditData(JSON.parse(savedChecklist));
    if (savedSetup) setSetupData(JSON.parse(savedSetup));
    if (savedGas) setGasData(JSON.parse(savedGas));
  }, [auditId]);

  const evidence = useMemo(() => {
    const list: EvidenceItem[] = [];

    // Fire Alarm Panel Evidence
    if (auditData) {
      if (auditData.panelSpecs?.batteryPhoto) {
        list.push({ id: 'batt', tag: 'Power', source: 'Standby Battery', url: auditData.panelSpecs.batteryPhoto, remarks: auditData.panelSpecs.batteryRemarks, status: auditData.panelSpecs.batteryStatus });
      }
      auditData.indicators?.forEach((i: any) => { if (i.photo) list.push({ id: i.id, tag: 'Signal', source: i.label, url: i.photo, remarks: i.remarks, status: i.status }); });
      auditData.cardConditions?.forEach((c: any) => { if (c.photo) list.push({ id: c.id, tag: 'Logic', source: c.label, url: c.photo, remarks: c.remarks, status: c.status }); });
      auditData.zones?.forEach((z: any) => { if (z.photo) list.push({ id: z.id, tag: 'Zone', source: `Zone ${z.zoneNo}: ${z.name}`, url: z.photo, remarks: z.remarks, status: z.status }); });
      auditData.servicePhotos?.forEach((p: string, idx: number) => { if (p) list.push({ id: `service_${idx}`, tag: 'Service', source: `Verification Proof #${idx + 1}`, url: p, remarks: 'Service verification conduct' }); });
    }

    // Gas Suppression Evidence
    if (gasData) {
      const gasArr = Array.isArray(gasData) ? gasData : [gasData];
      gasArr.forEach((gas) => {
        gas.integrationItems?.forEach((item: any) => { if (item.photo) list.push({ id: item.id, tag: 'Gas Logic', source: `${gas.zoneName}: ${item.label}`, url: item.photo, remarks: item.remarks, status: item.status }); });
        gas.servicePhotos?.forEach((p: string, idx: number) => { if (p) list.push({ id: `gas_v_${gas.id}_${idx}`, tag: 'Gas Service', source: `${gas.zoneName} Proof #${idx + 1}`, url: p, remarks: gas.overallRemarks }); });
      });
    }

    return list;
  }, [auditData, gasData]);

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="Visual Forensics" subtitle={`AUDIT #${auditId}`} showBack />
      
      <div className="p-4 flex flex-col gap-8 animate-in fade-in duration-500">
        <div className="bg-surface-dark p-6 rounded-3xl border border-white/5 shadow-2xl">
           <div className="flex items-center gap-3 mb-1">
              <span className="material-symbols-outlined text-primary text-xl">camera_outdoor</span>
              <h1 className="text-xl font-black uppercase tracking-tight italic">Evidence Matrix</h1>
           </div>
           <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">{evidence.length} Asset Photos Synchronized</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {evidence.map((item) => (
            <div key={item.id} className="bg-surface-dark rounded-[2rem] overflow-hidden border border-white/5 flex flex-col shadow-xl group transition-all hover:border-primary/30">
              <div className="aspect-square relative bg-background-dark/80 flex items-center justify-center overflow-hidden border-b border-white/5">
                <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={item.source} />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                   <span className="text-[7px] font-black uppercase text-white tracking-widest">{item.tag}</span>
                </div>
              </div>
              
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="text-[10px] font-black uppercase tracking-tight text-white line-clamp-1">{item.source}</h3>
                <div className="flex-1">
                   <p className="text-[8px] italic text-text-muted line-clamp-3 leading-relaxed">
                      "{item.remarks || "Requirement verification captured."}"
                   </p>
                </div>
                {item.status && (
                  <div className={`mt-1 text-[7px] font-black uppercase px-2 py-0.5 rounded-md self-start border ${item.status === 'Normal' || item.status === 'Functional' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    {item.status}
                  </div>
                )}
              </div>
            </div>
          ))}
          {evidence.length === 0 && (
            <div className="col-span-2 py-20 flex flex-col items-center justify-center opacity-10 grayscale">
               <span className="material-symbols-outlined text-7xl">broken_image</span>
               <p className="text-xs font-black uppercase tracking-[0.4em] mt-4">Registry Empty</p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-surface-dark/95 backdrop-blur-xl p-5 pb-10 border-t border-white/5 z-50">
         <button onClick={() => navigate(-1)} className="w-full h-14 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl active:scale-95 transition-all">Close Dossier View</button>
      </div>
    </div>
  );
};

export default PhotoService;
