
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
  const [auditData, setAuditData] = useState<any>(null);
  const [setupData, setSetupData] = useState<any>(null);
  const [gasData, setGasData] = useState<any>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const auditId = id || 'NEW-AUDIT';
    const savedChecklist = localStorage.getItem(`checklist_${auditId}`);
    const savedSetup = localStorage.getItem(`setup_${auditId}`);
    const savedGas = localStorage.getItem(`gas_suppression_${auditId}`);
    
    if (savedChecklist) setAuditData(JSON.parse(savedChecklist));
    if (savedSetup) setSetupData(JSON.parse(savedSetup));
    if (savedGas) setGasData(JSON.parse(savedGas));
  }, [id]);

  const evidence = useMemo(() => {
    const list: EvidenceItem[] = [];

    // 0. Fire Alarm Panel Evidence
    if (auditData?.panelSpecs) {
      const { panelSpecs, cardConditions, zones } = auditData;
      
      if (panelSpecs.panelPhoto) {
        list.push({
          id: 'panel_general',
          tag: 'Main Control Unit',
          source: 'Panel Physical Condition',
          url: panelSpecs.panelPhoto,
          remarks: panelSpecs.panelRemarks,
          status: 'Normal'
        });
      }

      if (panelSpecs.batteryPhoto) {
        list.push({
          id: 'batt',
          tag: 'Power Supply Module',
          source: 'Standby Battery',
          url: panelSpecs.batteryPhoto,
          remarks: panelSpecs.batteryRemarks,
          status: panelSpecs.batteryStatus
        });
      }

      cardConditions?.forEach((c: any) => {
        if (c && c.photo) {
          list.push({
            id: c.id,
            tag: 'Logic Module',
            source: c.label,
            url: c.photo,
            remarks: c.remarks,
            status: c.status
          });
        }
      });

      zones?.forEach((z: any) => {
        if (z && z.photo) {
          list.push({
            id: z.id,
            tag: `Zone Registry: ${z.name}`,
            source: z.location || 'General Area',
            url: z.photo,
            remarks: z.remarks,
            status: z.status === 'DEFECT' ? 'Faulty' : 'Normal'
          });
        }
      });
    }

    // 1. Gas Suppression Evidence
    if (Array.isArray(gasData)) {
      gasData.forEach((gas, idx) => {
        if (!gas) return;
        if (Array.isArray(gas.photos)) {
          gas.photos.forEach((pUrl: string, pIdx: number) => {
            if (pUrl) {
              list.push({
                id: `gas_proof_${gas.id}_photo_${pIdx}`,
                tag: 'Gas Suppression Unit',
                source: `${gas.zoneName || `Zone ${idx + 1}`} - Evidence #${pIdx + 1}`,
                url: pUrl,
                remarks: gas.remarks,
                status: gas.acDcStatus === 'Normal' ? 'Normal' : 'Fault'
              });
            }
          });
        }
        
        if (Array.isArray(gas.integrationItems)) {
           gas.integrationItems.forEach((item: any) => {
              if (item && item.photo) {
                list.push({
                  id: `gas_item_${item.id}`,
                  tag: 'Gas Logic Output',
                  source: `${gas.zoneName || 'System'} - ${item.label}`,
                  url: item.photo,
                  remarks: item.remarks,
                  status: item.status
                });
              }
           });
        }
      });
    }

    return list;
  }, [auditData, gasData]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  if (!auditData && !gasData) return null;

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32 relative print:bg-white print:pb-0">
      <div className="no-print">
        <TopBar title="Visual Evidence" subtitle={`AUDIT #${id}`} showBack />
      </div>
      
      <div className="p-6 flex flex-col gap-8 animate-in fade-in duration-500 print:p-0">
        <div className="flex justify-between items-end no-print">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight italic leading-none">Asset Log</h1>
            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mt-2">Compliance Forensic Registry</p>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-primary/20 hover:bg-red-600"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Export Log
          </button>
        </div>

        <div className="print-only hidden text-black border-b-2 border-black pb-4 mb-8">
           <svg width="80" height="40" viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg"><ellipse cx="120" cy="60" rx="110" ry="52" fill="#ec1313" /><text x="100" y="66" font-family="Arial Black, sans-serif" font-size="42" font-weight="900" fill="white" text-anchor="middle" letter-spacing="-1.5">BESTR</text><g transform="translate(178, 55)"><circle cx="0" cy="0" r="17" fill="white" /><path d="M0 -9C0 -9 6 -3 6 3C6 9 0 12 0 12C0 12 -6 9 -6 3C-6 -3 0 -9 0 -9Z" fill="#ec1313" /></g><text x="120" y="88" font-family="Arial, sans-serif" font-size="11" font-weight="800" fill="white" text-anchor="middle" letter-spacing="5">ENGINEERING</text></svg>
           <h1 className="text-2xl font-black uppercase italic mt-2">Visual Evidence Report</h1>
           <div className="grid grid-cols-2 gap-4 mt-2 text-[10px] font-bold uppercase">
              <p>Site: ${setupData?.clientName}</p>
              <p>Registry ID: ${id}</p>
           </div>
        </div>

        {evidence.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 print:gap-4">
            {evidence.map((item) => (
              <div key={item.id} className="bg-surface-dark rounded-3xl overflow-hidden border border-white/5 shadow-2xl flex flex-col md:flex-row group transition-all hover:border-white/10 print:border-black print:bg-white print:shadow-none print:rounded-none print:break-inside-avoid print:flex-row">
                <div className="w-full md:w-1/2 aspect-video relative overflow-hidden bg-black/40 shrink-0 print:w-1/3">
                  <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={item.source} />
                </div>
                
                <div className="flex-1 p-6 flex flex-col justify-between print:text-black print:p-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[9px] font-black text-primary uppercase tracking-widest print:text-black">${item.tag}</span>
                       <div className="h-px flex-1 bg-white/5 print:bg-black/10" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight leading-tight mb-4 print:text-sm print:mb-2">${item.source}</h3>
                    
                    <div className="bg-background-dark/50 p-4 rounded-xl border border-white/5 print:bg-gray-100 print:border-black/10 print:p-2">
                       <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 print:text-gray-500">Technician Remarks</p>
                       <p className="text-xs italic font-medium leading-relaxed print:text-[10px]">
                          "${item.remarks || "No additional commentary recorded."}"
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-20 text-center">
            <span className="material-symbols-outlined text-6xl">no_photography</span>
            <p className="font-black uppercase tracking-[0.3em] text-sm">No Assets Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoService;
