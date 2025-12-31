
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { InspectionStatus } from '../types';

const BestroLogo = () => (
  <svg width="120" height="60" viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_10px_rgba(236,19,19,0.3)]">
    <ellipse cx="120" cy="60" rx="110" ry="52" fill="#ec1313" />
    <text x="100" y="66" fontFamily="Arial Black, sans-serif" fontSize="42" fontWeight="900" fill="white" textAnchor="middle" letterSpacing="-1.5">BESTR</text>
    <g transform="translate(178, 55)">
      <circle cx="0" cy="0" r="17" fill="white" />
      <path d="M0 -9C0 -9 6 -3 6 3C6 9 0 12 0 12C0 12 -6 9 -6 3C-6 -3 0 -9 0 -9Z" fill="#ec1313" />
    </g>
    <text x="120" y="88" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="800" fill="white" textAnchor="middle" letterSpacing="5">ENGINEERING</text>
  </svg>
);

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
    ctx.strokeStyle = '#000000';
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
    <div className="relative w-full h-32 bg-background-dark/50 rounded-xl border border-white/10 overflow-hidden cursor-crosshair print:border-black print:bg-white print:h-24">
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20 print:hidden">
          <span className="material-symbols-outlined text-4xl animate-pulse">draw</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] mt-2">{placeholder}</span>
        </div>
      )}
      <canvas ref={canvasRef} width={400} height={128} onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing} onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing} className="w-full h-full touch-none" />
      {!isEmpty && <button onClick={(e) => { e.stopPropagation(); clear(); }} className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-primary hover:text-white rounded text-[8px] font-black uppercase no-print">Reset</button>}
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

  useEffect(() => {
    const auditId = id || 'NEW-AUDIT';
    const systems = ['fire-alarm', 'gas-suppression', 'hosereel-pump', 'wetriser-pump', 'hydrant-pump', 'sprinkler-pump', 'hosereel-equip', 'hydrant-equip', 'wetriser-equip', 'dryriser-equip', 'fire-ext', 'em-light', 'keluar-sign'];
    const aggregated: any = {};
    systems.forEach(sys => {
      let key = '';
      if (sys === 'fire-alarm') key = `checklist_${auditId}`;
      else if (sys === 'gas-suppression') key = `gas_suppression_${auditId}`;
      else if (sys.includes('pump')) key = `pump_${sys.split('-')[0]}_${auditId}`;
      else if (sys.includes('equip')) key = `equip_${sys.split('-')[0]}_${auditId}`;
      else if (sys === 'fire-ext') key = `extinguisher_${auditId}`;
      else if (sys.includes('light') || sys.includes('sign')) key = `light_${sys.includes('light') ? 'emergency' : 'keluar'}_${auditId}`;
      try {
        const data = localStorage.getItem(key);
        aggregated[sys] = data ? JSON.parse(data) : { isNA: true };
      } catch (e) { aggregated[sys] = { isNA: true }; }
    });
    const savedSetup = localStorage.getItem(`setup_${auditId}`);
    if (savedSetup) try { setSetupData(JSON.parse(savedSetup)); } catch (e) {}
    setAllSystemsData(aggregated);
  }, [id]);

  const findDefects = (obj: any): { label: string; photo?: string }[] => {
    if (!obj || obj.isNA) return [];
    const defectTerms = ['Defective', 'Fault', 'Faulty', 'Damaged', 'Failed', 'Low', 'Broken', 'Leaking', 'Corroded', 'Loose', 'Blocked', 'Blown'];
    const defects: { label: string; photo?: string }[] = [];
    const recurse = (current: any, parentLabel?: string) => {
      if (!current) return;
      if (Array.isArray(current)) {
        current.forEach((item, index) => {
          if (item) {
             recurse(item, item.label || item.name || `${parentLabel} #${index+1}`);
          }
        });
        return;
      }
      if (typeof current === 'object') {
        Object.entries(current).forEach(([key, val]) => {
          if (typeof val === 'string' && defectTerms.includes(val)) {
            defects.push({ label: `${parentLabel || key}: ${val}`, photo: current.photo || (current.photos && current.photos[0]) });
          } else if (typeof val === 'object' && val !== null) { 
            recurse(val, parentLabel || key); 
          }
        });
      }
    };
    recurse(obj);
    return defects;
  };

  const getSystemSummary = (sysId: string) => {
    const data = allSystemsData[sysId];
    if (!data || data.isNA) return { status: 'N/A', defects: [] };
    const defects = findDefects(data);
    return { status: defects.length > 0 ? 'FAULT' : 'NORMAL', defects };
  };

  const handleFinalize = () => {
    if (!sigData) return;
    setIsSubmitting(true);
    setTimeout(() => {
      navigate('/success', { state: { auditId: id } });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="Certification Review" showBack />
      
      {isSubmitting ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 bg-[#181111] fixed inset-0 z-[100]">
           <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8" />
           <h2 className="text-xl font-black italic uppercase tracking-widest text-white">Finalizing Report</h2>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-6">
          <div className="bg-surface-dark p-6 rounded-3xl border-l-8 border-primary shadow-2xl">
             <BestroLogo />
             <h1 className="text-2xl font-black italic uppercase tracking-tight mt-4 mb-1">Audit Summary</h1>
             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{setupData?.clientName || 'SITE AUDIT'}</p>
          </div>
          
          <div className="flex flex-col gap-2">
             {Object.keys(allSystemsData).map(sysId => {
               const summary = getSystemSummary(sysId);
               return (
                 <div key={sysId} className={`flex flex-col p-4 rounded-2xl border ${summary.status === 'FAULT' ? 'bg-primary/5 border-primary/20' : summary.status === 'N/A' ? 'opacity-50' : 'bg-background-dark/50 border-white/5'}`}>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase opacity-70">{sysId.replace(/-/g, ' ')}</span>
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${summary.status === 'NORMAL' ? 'text-emerald-500 bg-emerald-500/10' : summary.status === 'FAULT' ? 'text-primary bg-primary/10' : 'text-text-muted bg-white/5'}`}>{summary.status}</span>
                    </div>
                 </div>
               );
             })}
          </div>

          <div className="bg-surface-dark p-6 rounded-3xl border border-white/5 flex flex-col gap-6 shadow-2xl mb-20">
             <h3 className="font-black uppercase tracking-[0.2em] text-[10px] italic">Technician Sign-off</h3>
             <SignaturePad onSign={setSigData} placeholder="Technician Certification" />
          </div>
        </div>
      )}

      {!isSubmitting && (
        <div className="fixed bottom-0 w-full max-w-md bg-background-dark/95 backdrop-blur-xl border-t border-white/5 p-5 pb-10 z-50 flex gap-3">
          <button 
            onClick={handleFinalize} 
            className={`flex-1 h-16 rounded-3xl font-black uppercase tracking-[0.2em] text-sm ${sigData ? 'bg-primary text-white shadow-primary/30' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
          >
            <span>Certify Report</span>
            <span className="material-symbols-outlined ml-2">verified_user</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Summary;
