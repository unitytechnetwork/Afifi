
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
        current.forEach((item, index) => recurse(item, item.label || item.name || `${parentLabel} #${index+1}`));
        return;
      }
      if (typeof current === 'object') {
        Object.entries(current).forEach(([key, val]) => {
          if (typeof val === 'string' && defectTerms.includes(val)) {
            defects.push({ label: `${parentLabel || key}: ${val}`, photo: current.photo || (current.photos && current.photos[0]) });
          } else if (typeof val === 'object') { recurse(val, parentLabel || key); }
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

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32 print:bg-white print:h-auto print:overflow-visible">
      <div className="no-print">
        <TopBar title="Certification Review" showBack />
        {isSubmitting ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 bg-[#181111] fixed inset-0 z-[100]">
             <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8" />
             <h2 className="text-xl font-black italic uppercase tracking-widest">Finalizing Report</h2>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-6">
            <div className="bg-surface-dark p-6 rounded-3xl border-l-8 border-primary shadow-2xl">
               <h1 className="text-2xl font-black italic uppercase tracking-tight mb-1">Audit Summary</h1>
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
            <button onClick={() => window.print()} className={`flex-1 h-16 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] border border-white/10 bg-white/5 text-white ${!sigData && 'opacity-20 cursor-not-allowed'}`}>
              <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
              <span>Full Report PDF</span>
            </button>
            <button onClick={() => navigate('/success', { state: { auditId: id } })} className={`flex-[2] h-16 rounded-3xl font-black uppercase tracking-[0.2em] text-sm ${sigData ? 'bg-primary text-white shadow-primary/30' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}>
              <span>Certify Report</span>
              <span className="material-symbols-outlined">verified_user</span>
            </button>
          </div>
        )}
      </div>

      {/* --- PROFESSIONAL BOXED PDF PRINT LAYOUT (A4) --- */}
      <div className="hidden print:block p-8 bg-white text-black font-sans leading-tight">
        {/* 1. COVER HEADER */}
        <div className="w-full border-2 border-black p-4 mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-[10px] text-white font-black italic">BESTRO</span>
            </div>
            <div>
              <h1 className="text-xl font-black uppercase">Fire Alarm Maintenance Report</h1>
              <p className="text-[8px] font-bold text-gray-600 uppercase">Bestro Engineering Group • Fire Protection Specialist</p>
            </div>
          </div>
          <div className="text-right border-l-2 border-black pl-4">
             <p className="text-[9px] font-black">REF NO: <span className="font-bold">{id}</span></p>
             <p className="text-[9px] font-black">DATE: <span className="font-bold">{setupData?.date}</span></p>
          </div>
        </div>

        {/* 2. SITE INFORMATION */}
        <div className="border-2 border-black mb-4">
          <div className="bg-gray-100 px-3 py-1 text-[9px] font-black uppercase border-b-2 border-black text-center">Site Information</div>
          <table className="w-full text-[9px] border-collapse">
            <tbody>
              <tr className="border-b border-black/20">
                <td className="p-2 font-black bg-gray-50 w-1/4 uppercase">Site Name</td>
                <td className="p-2 font-bold uppercase">{setupData?.clientName}</td>
              </tr>
              <tr className="border-b border-black/20">
                <td className="p-2 font-black bg-gray-50 uppercase">Address / Site</td>
                <td className="p-2 font-bold uppercase">{setupData?.location}</td>
              </tr>
              <tr>
                <td className="p-2 font-black bg-gray-50 uppercase">System Type</td>
                <td className="p-2 font-bold uppercase">Comprehensive Fire Safety System</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. JOB DETAILS */}
        <div className="border-2 border-black mb-4">
          <div className="bg-gray-100 px-3 py-1 text-[9px] font-black uppercase border-b-2 border-black text-center">Job Details</div>
          <div className="grid grid-cols-2 divide-x-2 divide-black">
             <table className="w-full text-[9px]">
               <tbody>
                  <tr className="border-b border-black/10"><td className="p-2 font-black bg-gray-50 w-1/2 uppercase">Technician</td><td className="p-2 font-bold uppercase">{setupData?.techName}</td></tr>
                  <tr><td className="p-2 font-black bg-gray-50 uppercase">Staff ID</td><td className="p-2 font-bold">{setupData?.technicianId || '8821'}</td></tr>
               </tbody>
             </table>
             <table className="w-full text-[9px]">
               <tbody>
                  <tr className="border-b border-black/10"><td className="p-2 font-black bg-gray-50 w-1/2 uppercase">Audit Status</td><td className="p-2 font-black text-green-700 uppercase">Certified</td></tr>
                  <tr><td className="p-2 font-black bg-gray-50 uppercase">Approval</td><td className="p-2 font-bold uppercase">Authorized</td></tr>
               </tbody>
             </table>
          </div>
        </div>

        {/* 4. CHECKLIST SUMMARY */}
        <div className="border-2 border-black mb-4">
           <div className="bg-gray-100 px-3 py-1 text-[9px] font-black uppercase border-b-2 border-black text-center">Checklist Summary</div>
           <table className="w-full text-[8px] border-collapse text-center">
              <thead className="bg-gray-50 font-black uppercase border-b border-black">
                 <tr>
                    <th className="p-2 text-left border-r border-black/10">System Component</th>
                    <th className="p-2 border-r border-black/10">Status</th>
                    <th className="p-2">Remark</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                 {Object.keys(allSystemsData).map(sysId => {
                    const sum = getSystemSummary(sysId);
                    return (
                      <tr key={sysId}>
                         <td className="p-2 text-left font-bold uppercase border-r border-black/10">{sysId.replace(/-/g, ' ')}</td>
                         <td className="p-2 border-r border-black/10">{sum.status === 'NORMAL' ? '✔' : sum.status === 'N/A' ? '-' : '✖'}</td>
                         <td className="p-2 text-gray-600 italic">{sum.status === 'N/A' ? 'Not Applicable' : sum.status === 'FAULT' ? 'Defects Detected' : 'Verified OK'}</td>
                      </tr>
                    );
                 })}
              </tbody>
           </table>
        </div>

        {/* 5. DEFECTS & FINDINGS */}
        <div className="border-2 border-black mb-4">
           <div className="bg-gray-100 px-3 py-1 text-[9px] font-black uppercase border-b-2 border-black text-center">Defects & Critical Findings</div>
           <div className="p-3">
              <ul className="list-disc ml-4 text-[9px] font-bold space-y-1">
                 {Object.keys(allSystemsData).some(s => getSystemSummary(s).status === 'FAULT') ? (
                    Object.keys(allSystemsData).map(s => getSystemSummary(s).defects.map((d, i) => (
                       <li key={`${s}-${i}`} className="text-red-700 uppercase">[{s.replace(/-/g, ' ')}] {d.label}</li>
                    )))
                 ) : (
                    <li className="text-green-700">NO CRITICAL SYSTEM DEFECTS DETECTED DURING THIS AUDIT.</li>
                 )}
              </ul>
           </div>
        </div>

        {/* 6. PHOTO EVIDENCE GRID */}
        <div className="border-2 border-black mb-4 break-inside-avoid">
           <div className="bg-gray-100 px-3 py-1 text-[9px] font-black uppercase border-b-2 border-black text-center">Visual Proof Evidence</div>
           <div className="p-4 grid grid-cols-2 gap-4">
              {Object.keys(allSystemsData).map(sysId => {
                 const sum = getSystemSummary(sysId);
                 return sum.defects.map((d, i) => d.photo ? (
                    <div key={`${sysId}-${i}`} className="border border-black p-1 flex flex-col items-center">
                       <img src={d.photo} className="w-full h-32 object-cover border-b border-black mb-1" />
                       <p className="text-[7px] font-black uppercase text-center">[{sysId}] {d.label}</p>
                    </div>
                 ) : null);
              })}
           </div>
        </div>

        {/* 8. SIGNATURE & APPROVAL */}
        <div className="border-2 border-black break-inside-avoid">
           <div className="bg-gray-100 px-3 py-1 text-[9px] font-black uppercase border-b-2 border-black text-center">Authorization & Sign-Off</div>
           <div className="grid grid-cols-2 divide-x-2 divide-black">
              <div className="p-4 flex flex-col items-center">
                 <p className="text-[7px] font-black uppercase text-gray-500 mb-2 italic">Technician Certification</p>
                 {sigData && <img src={sigData} className="h-16 object-contain mb-2" />}
                 <div className="w-full border-t border-black pt-1 text-center font-black uppercase text-[9px]">{setupData?.techName}</div>
              </div>
              <div className="p-4 flex flex-col items-center">
                 <p className="text-[7px] font-black uppercase text-gray-500 mb-2 italic">Supervisor / Client Approval</p>
                 {setupData?.clientSigData && <img src={setupData.clientSigData} className="h-16 object-contain mb-2" />}
                 <div className="w-full border-t border-black pt-1 text-center font-black uppercase text-[9px]">Authorized Representative</div>
              </div>
           </div>
        </div>

        <div className="mt-4 text-center">
           <p className="text-[6px] font-bold text-gray-400 uppercase tracking-widest">Page 1 of 1 • Certified Technical Log • Bestro Maintenance OS</p>
        </div>
      </div>
    </div>
  );
};

export default Summary;
