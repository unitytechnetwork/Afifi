
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { InspectionStatus } from '../types';

const SignaturePad: React.FC<{ onSign: (data: string) => void; placeholder: string }> = ({ onSign, placeholder }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      onSign(canvasRef.current.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ec1313'; 

    if (isEmpty) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsEmpty(false);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSign('');
  };

  return (
    <div className="relative w-full h-32 bg-background-dark/50 rounded-xl border border-white/10 overflow-hidden cursor-crosshair shadow-inner transition-all hover:border-white/20 print:border-black print:bg-white">
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 print:hidden">
          <span className="material-symbols-outlined text-4xl animate-pulse">draw</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] mt-2">{placeholder}</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={400}
        height={128}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full touch-none"
      />
      {!isEmpty && (
        <button 
          onClick={(e) => { e.stopPropagation(); clear(); }}
          className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-primary hover:text-white rounded text-[8px] font-black uppercase tracking-widest text-text-muted transition-all active:scale-90 no-print"
        >
          Reset
        </button>
      )}
    </div>
  );
};

const Summary: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sigData, setSigData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allSystemsData, setAllSystemsData] = useState<any>({});
  const [setupData, setSetupData] = useState<any>(null);
  const [expandedSystem, setExpandedSystem] = useState<string | null>(null);

  useEffect(() => {
    const auditId = id || 'NEW-AUDIT';
    const systems = [
      'fire-alarm', 'gas-suppression', 'hosereel-pump', 'wetriser-pump', 
      'hydrant-pump', 'sprinkler-pump', 'hosereel-equip', 'hydrant-equip', 
      'wetriser-equip', 'dryriser-equip', 'fire-ext', 'em-light', 'keluar-sign'
    ];
    
    const aggregated: any = {};
    systems.forEach(sys => {
      let key = '';
      if (sys === 'fire-alarm') key = `checklist_${auditId}`;
      else if (sys === 'gas-suppression') key = `gas_suppression_${auditId}`;
      else if (sys.includes('pump')) key = `pump_${sys.split('-')[0]}_${auditId}`;
      else if (sys.includes('equip')) key = `equip_${sys.split('-')[0]}_${auditId}`;
      else if (sys === 'fire-ext') key = `extinguisher_${auditId}`;
      else if (sys.includes('light') || sys.includes('sign')) key = `light_${sys.includes('light') ? 'emergency' : 'keluar'}_${auditId}`;

      const data = localStorage.getItem(key);
      aggregated[sys] = data ? JSON.parse(data) : null;
    });

    const savedSetup = localStorage.getItem(`setup_${auditId}`);
    if (savedSetup) setSetupData(JSON.parse(savedSetup));
    setAllSystemsData(aggregated);
  }, [id]);

  const deviceTotals = useMemo(() => {
    const alarmData = allSystemsData['fire-alarm'];
    if (alarmData?.isNA) return { breakglass: 0, smoke: 0, heat: 0, bell: 0 };
    
    const zones = alarmData?.zones || [];
    const totals = { breakglass: 0, smoke: 0, heat: 0, bell: 0 };
    zones.forEach((z: any) => {
      totals.breakglass += parseInt(z.breakglassQty || '0');
      totals.smoke += parseInt(z.smokeQty || '0');
      totals.heat += parseInt(z.heatQty || '0');
      totals.bell += parseInt(z.bellQty || '0');
    });
    return totals;
  }, [allSystemsData]);

  const handleExportPDF = () => {
    if (!sigData) {
      alert("Technician signature is required for certification.");
      return;
    }
    window.print();
  };

  const handleFinalSubmit = async () => {
    if (!sigData) {
      alert("Technician signature is required for certification.");
      return;
    }
    setIsSubmitting(true);
    
    // Save status as SUBMITTED to setup data
    const auditId = id || 'NEW-AUDIT';
    const savedSetup = localStorage.getItem(`setup_${auditId}`);
    if (savedSetup) {
      const data = JSON.parse(savedSetup);
      data.status = InspectionStatus.SUBMITTED;
      localStorage.setItem(`setup_${auditId}`, JSON.stringify(data));
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    navigate('/success', { state: { auditId: id || 'NEW-AUDIT' } });
  };

  const findDefects = (obj: any): { label: string; photo?: string }[] => {
    if (!obj || obj.isNA) return [];
    
    const defectTerms = [
      'Defective', 'Fault', 'Faulty', 'Damaged', 'Failed', 
      'Low', 'Broken', 'Leaking', 'Corroded', 'Loose', 'Blocked', 'Blown'
    ];

    const defects: { label: string; photo?: string }[] = [];

    const recurse = (current: any, parentLabel?: string) => {
      if (!current) return;

      if (Array.isArray(current)) {
        current.forEach((item, index) => {
          const itemLabel = item.label || item.name || item.location || item.zoneName || `Item #${index + 1}`;
          recurse(item, itemLabel);
        });
        return;
      }

      if (typeof current === 'object') {
        Object.entries(current).forEach(([key, val]) => {
          if (typeof val === 'string' && defectTerms.includes(val)) {
            const label = parentLabel || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            defects.push({ 
              label: `${label}: ${val}`,
              photo: current.photo || (current.photos && current.photos[0])
            });
          } else if (typeof val === 'object') {
            recurse(val, parentLabel);
          }
        });
      }
    };

    recurse(obj);
    return defects;
  };

  const getSystemSummary = (sysId: string) => {
    const data = allSystemsData[sysId];
    if (!data) return { status: 'PENDING', defects: [] };
    if (data.isNA) return { status: 'N/A', defects: [] };
    
    const defects = findDefects(data);
    return {
      status: defects.length > 0 ? 'FAULT' : 'NORMAL',
      defects: defects
    };
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32 print:bg-white print:pb-0">
      <div className="no-print">
        <TopBar title="Certification Review" showBack />
      </div>

      {isSubmitting ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-[#181111] fixed inset-0 z-[100]">
           <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8" />
           <h2 className="text-xl font-black italic uppercase tracking-widest">Finalizing Report</h2>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom duration-700 print:p-0 print:text-black print:gap-4">
          
          {/* Print Header */}
          <div className="hidden print:flex justify-between items-center border-b-2 border-black pb-4 mb-4">
            <div className="flex flex-col">
              <h1 className="text-2xl font-black italic uppercase">Bestro Engineering Report</h1>
              <p className="text-[10px] font-bold">Fire Protection Maintenance Certification</p>
            </div>
            <div className="text-right text-[10px] font-bold">
              <p>Registry ID: {id}</p>
              <p>Print Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-surface-dark p-6 rounded-3xl border-l-8 border-primary shadow-2xl print:bg-white print:border-black print:shadow-none print:p-4">
             <h1 className="text-2xl font-black italic uppercase tracking-tight leading-none mb-1 print:text-black">Audit Summary</h1>
             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] print:text-gray-600">{setupData?.clientName || 'SITE AUDIT'}</p>
             <div className="mt-4 pt-4 border-t border-white/5 flex justify-between print:border-black/10">
                <div className="flex flex-col">
                   <span className="text-[8px] font-black text-text-muted uppercase tracking-widest print:text-gray-500">Registry ID</span>
                   <span className="text-xs font-bold">{id}</span>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[8px] font-black text-text-muted uppercase tracking-widest print:text-gray-500">Audit Date</span>
                   <span className="text-xs font-bold">{setupData?.date}</span>
                </div>
             </div>
          </div>

          {/* DEVICE QUANTITY SUMMARY (AUTO) */}
          <div className="bg-surface-dark p-5 rounded-3xl border border-white/5 shadow-xl print:bg-white print:border-black/10 print:shadow-none">
             <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black">
                <span className="material-symbols-outlined text-sm text-primary no-print">inventory</span>
                Auto Inventory Totals
             </h3>
             <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Breakglass', val: deviceTotals.breakglass, icon: 'smart_button' },
                  { label: 'Smoke', val: deviceTotals.smoke, icon: 'detector_smoke' },
                  { label: 'Heat', val: deviceTotals.heat, icon: 'heat' },
                  { label: 'Bell', val: deviceTotals.bell, icon: 'notifications' }
                ].map(item => (
                   <div key={item.label} className="bg-background-dark/50 p-2 rounded-xl flex flex-col items-center border border-white/5 print:bg-gray-100 print:border-black/5">
                      <span className="material-symbols-outlined text-xs text-primary/40 mb-1 no-print">{item.icon}</span>
                      <span className="text-[14px] font-black text-white print:text-black">{item.val}</span>
                      <span className="text-[6px] font-black uppercase text-text-muted tracking-tighter print:text-gray-500">{item.label}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* SYSTEM DASHBOARD WITH DEFECT DRILL-DOWN */}
          <div className="bg-surface-dark p-5 rounded-3xl border border-white/5 shadow-xl print:bg-white print:border-black/10 print:shadow-none">
             <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black">
                <span className="material-symbols-outlined text-sm text-primary no-print">analytics</span>
                System Readiness Index
             </h3>
             <div className="grid grid-cols-1 gap-2">
                {Object.keys(allSystemsData).map(sysId => {
                  const summary = getSystemSummary(sysId);
                  const isExpanded = expandedSystem === sysId;

                  return (
                    <div key={sysId} className={`flex flex-col p-3 rounded-2xl border transition-all print:break-inside-avoid ${summary.status === 'FAULT' ? 'bg-primary/5 border-primary/20 print:border-black print:bg-white' : summary.status === 'N/A' ? 'opacity-50 grayscale print:bg-white print:border-black/5' : 'bg-background-dark/50 border-white/5 print:bg-white print:border-black/5'}`}>
                       <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase tracking-tight opacity-70">
                             {sysId.replace(/-/g, ' ')}
                          </span>
                          <div className="flex items-center gap-2">
                             {summary.status === 'FAULT' && (
                               <button 
                                 onClick={() => setExpandedSystem(isExpanded ? null : sysId)}
                                 className="text-[7px] font-black uppercase tracking-widest text-primary border border-primary/20 px-2 py-0.5 rounded-md hover:bg-primary hover:text-white transition-all no-print"
                               >
                                 {isExpanded ? 'Hide' : 'Details'}
                               </button>
                             )}
                             <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${summary.status === 'NORMAL' ? 'text-emerald-500 bg-emerald-500/10 print:text-green-600' : summary.status === 'FAULT' ? 'text-primary bg-primary/10 print:text-red-600' : summary.status === 'N/A' ? 'text-text-muted bg-white/5' : 'text-text-muted bg-white/5'}`}>
                                {summary.status}
                             </span>
                          </div>
                       </div>
                       
                       {(isExpanded || true) && summary.defects.length > 0 && (
                         <div className="mt-3 pt-3 border-t border-primary/10 print:border-black/10">
                            <p className="text-[7px] font-black uppercase tracking-widest text-primary mb-2 opacity-60 italic print:text-black">Identified Deficiencies:</p>
                            <div className="flex flex-col gap-2">
                               {summary.defects.map((defect, dIdx) => (
                                 <div key={dIdx} className="flex flex-col gap-2 bg-primary/5 p-2 rounded-lg border border-primary/10 print:bg-white print:border-black/10">
                                    <div className="flex items-center gap-2">
                                       <span className="material-symbols-outlined text-[10px] text-primary no-print">error</span>
                                       <span className="text-[9px] font-bold text-primary/90 print:text-black">{defect.label}</span>
                                    </div>
                                    {defect.photo && (
                                       <div className="w-20 h-20 rounded-lg overflow-hidden border border-primary/20 print:border-black/10 print:w-32 print:h-32">
                                          <img src={defect.photo} className="w-full h-full object-cover" />
                                       </div>
                                    )}
                                 </div>
                               ))}
                            </div>
                         </div>
                       )}
                    </div>
                  );
                })}
             </div>
          </div>

          {/* SIGNATURE SECTION */}
          <div className="bg-surface-dark p-6 rounded-3xl border border-white/5 flex flex-col gap-6 shadow-2xl print:bg-white print:border-black/10 print:shadow-none print:p-4">
             <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                   <h3 className="font-black uppercase tracking-[0.2em] text-[10px] italic print:text-black">Technician Sign-off</h3>
                   <SignaturePad onSign={setSigData} placeholder="Technician Certification" />
                   <p className="text-[8px] font-bold text-text-muted uppercase text-center print:text-black">Bestro Authorized Tech</p>
                </div>
                <div className="flex flex-col gap-3">
                   <h3 className="font-black uppercase tracking-[0.2em] text-[10px] italic print:text-black">Client Verification</h3>
                   {setupData?.clientSigData ? (
                      <div className="h-32 bg-background-dark/50 rounded-xl border border-white/10 flex items-center justify-center print:bg-white print:border-black/10">
                         <img src={setupData.clientSigData} className="max-h-full" alt="Client Signature" />
                      </div>
                   ) : (
                      <div className="h-32 bg-background-dark/50 rounded-xl border border-white/10 flex items-center justify-center print:bg-white print:border-black/10">
                         <p className="text-[8px] font-black uppercase text-text-muted">Not Signed</p>
                      </div>
                   )}
                   <p className="text-[8px] font-bold text-text-muted uppercase text-center print:text-black">Facility Representative</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {!isSubmitting && (
        <div className="fixed bottom-0 w-full max-w-md bg-background-dark/95 backdrop-blur-xl border-t border-white/5 p-5 pb-10 z-50 flex gap-3 no-print">
          <button 
            onClick={handleExportPDF}
            className={`flex-1 h-16 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl flex flex-col items-center justify-center gap-1 active:scale-[0.98] transition-all border border-white/10 bg-white/5 text-white ${!sigData && 'opacity-20 cursor-not-allowed'}`}
          >
            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
            <span>Export PDF</span>
          </button>
          <button 
            onClick={handleFinalSubmit}
            className={`flex-[2] h-16 rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] transition-all ${
              sigData ? 'bg-primary text-white shadow-primary/30' : 'bg-white/10 text-white/20 cursor-not-allowed border border-white/5'
            }`}
          >
            <span>Certify Report</span>
            <span className="material-symbols-outlined">verified_user</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Summary;
