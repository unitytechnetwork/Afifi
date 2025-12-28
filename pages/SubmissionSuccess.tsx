
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SubmissionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [reportData, setReportData] = useState<any>({});
  const [setupData, setSetupData] = useState<any>(null);

  const auditId = location.state?.auditId || 'NEW-AUDIT';

  useEffect(() => {
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
    setReportData(aggregated);
  }, [auditId]);

  const deviceTotals = useMemo(() => {
    const alarmData = reportData['fire-alarm'];
    if (!alarmData || alarmData.isNA) return { breakglass: 0, smoke: 0, heat: 0, bell: 0 };
    
    const zones = alarmData.zones || [];
    const totals = { breakglass: 0, smoke: 0, heat: 0, bell: 0 };
    zones.forEach((z: any) => {
      totals.breakglass += parseInt(z.breakglassQty || '0');
      totals.smoke += parseInt(z.smokeQty || '0');
      totals.heat += parseInt(z.heatQty || '0');
      totals.bell += parseInt(z.bellQty || '0');
    });
    return totals;
  }, [reportData]);

  const generateTechnicalSummary = () => {
    const totals = deviceTotals;
    const grandTotal = totals.breakglass + totals.smoke + totals.heat + totals.bell;

    let text = `🚨 *BESTRO TECHNICAL REPORT: ${auditId}*\n`;
    text += `📍 *Site:* ${setupData?.clientName || 'N/A'}\n`;
    text += `🏢 *Loc:* ${setupData?.location || 'N/A'}\n`;
    text += `📅 *Date:* ${setupData?.date || 'N/A'}\n\n`;
    
    text += `*--- DEVICE REGISTRY ---*\n`;
    text += `Total Units: ${grandTotal}\n`;
    text += `• Breakglass: ${totals.breakglass}\n`;
    text += `• Smoke Det: ${totals.smoke}\n`;
    text += `• Heat Det: ${totals.heat}\n`;
    text += `• Bell/Sounder: ${totals.bell}\n\n`;

    text += `*--- SYSTEM STATUS ---*\n`;
    Object.keys(reportData).forEach(sys => {
        const data = reportData[sys];
        let status = '⚪ PENDING';
        if (data) {
           if (data.isNA) {
              status = '➖ N/A';
           } else {
              const hasDefect = scanForDefects(data);
              status = hasDefect ? '❌ FAULT' : '✅ NORMAL';
           }
        }
        text += `${sys.replace(/-/g, ' ').toUpperCase()}: ${status}\n`;
    });
    
    text += `\n_Generated via Bestro Engineering Portal_`;
    return text;
  };

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

  const handlePdfExport = () => {
    setIsExporting(true);
    setExportMessage('Generating Full PDF...');
    setTimeout(() => {
      setIsExporting(false);
      window.print();
    }, 1500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateTechnicalSummary());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Fire Protection Audit - ${setupData?.clientName || auditId}`);
    const body = encodeURIComponent(generateTechnicalSummary().replace(/\*/g, ''));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#181111] overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.05] no-print" 
        style={{ backgroundImage: 'radial-gradient(#ec1313 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {isExporting && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-10 text-center animate-in fade-in">
           <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
           <h3 className="text-xl font-black italic uppercase tracking-widest text-white">{exportMessage}</h3>
        </div>
      )}

      {/* Main UI */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8 relative z-10 no-print">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(236,19,19,0.4)] animate-bounce">
          <span className="material-symbols-outlined text-white text-5xl material-symbols-filled">verified</span>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-1">Audit<br/>Certified</h1>
          <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.4em]">ID: {auditId}</p>
        </div>

        <div className="w-full flex flex-col gap-3 px-4">
           <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] text-center mb-2">Share Technical Report</h3>
           
           <div className="grid grid-cols-2 gap-3">
              <button onClick={handlePdfExport} className="bg-surface-dark border border-white/5 p-5 rounded-3xl flex flex-col items-center gap-3 active:scale-95 transition-all group hover:border-primary/50">
                 <span className="material-symbols-outlined text-primary group-hover:scale-125 transition-transform text-3xl">picture_as_pdf</span>
                 <span className="text-[8px] font-black uppercase tracking-widest">Full PDF Report</span>
              </button>
              <button onClick={handleWhatsAppShare} className="bg-surface-dark border border-white/5 p-5 rounded-3xl flex flex-col items-center gap-3 active:scale-95 transition-all group hover:border-emerald-500/50">
                 <span className="material-symbols-outlined text-emerald-500 group-hover:scale-125 transition-transform text-3xl">send</span>
                 <span className="text-[8px] font-black uppercase tracking-widest">WhatsApp Share</span>
              </button>
              <button onClick={handleEmailShare} className="bg-surface-dark border border-white/5 p-5 rounded-3xl flex flex-col items-center gap-3 active:scale-95 transition-all group hover:border-blue-500/50 col-span-2">
                 <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-blue-500 text-3xl">mail</span>
                    <span className="text-[8px] font-black uppercase tracking-widest">Forward to Client via Email</span>
                 </div>
              </button>
           </div>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="mt-4 w-full h-14 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span>Return to Dashboard</span>
          <span className="material-symbols-outlined text-sm">home</span>
        </button>
      </div>

      {/* PRINT-ONLY COMPREHENSIVE REPORT */}
      <div className="hidden print:block p-8 bg-white text-black min-h-screen font-sans">
        <header className="flex justify-between items-start border-b-4 border-black pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-black italic uppercase leading-none">Bestro Engineering</h1>
            <p className="text-sm font-bold tracking-widest mt-1">FIRE PROTECTION MAINTENANCE REPORT</p>
          </div>
          <div className="text-right">
            <div className="bg-black text-white px-4 py-1 text-xs font-black uppercase mb-1">REGISTRY ID: {auditId}</div>
            <p className="text-[10px] font-bold">DATE: {setupData?.date || new Date().toLocaleDateString()}</p>
          </div>
        </header>

        <section className="mb-10">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-xs font-black uppercase border-b-2 border-black mb-3 pb-1">Client / Building Site</h2>
              <p className="text-xl font-bold uppercase">{setupData?.clientName || 'N/A'}</p>
              <p className="text-sm mt-1">{setupData?.location || 'N/A'}</p>
            </div>
            <div>
              <h2 className="text-xs font-black uppercase border-b-2 border-black mb-3 pb-1">Audit Details</h2>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[8px] font-bold text-gray-500">CYCLE</p>
                  <p className="font-bold">{setupData?.frequency || 'Monthly'}</p>
                </div>
                <div>
                  <p className="text-[8px] font-bold text-gray-500">AUDITOR</p>
                  <p className="font-bold">Lead Technician</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10 page-break">
          <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-2 mb-4">Device Registry & Load Inventory</h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Breakglass', val: deviceTotals.breakglass },
              { label: 'Smoke Detectors', val: deviceTotals.smoke },
              { label: 'Heat Sensors', val: deviceTotals.heat },
              { label: 'Alarm Bells', val: deviceTotals.bell }
            ].map(item => (
              <div key={item.label} className="border-2 border-black p-4 text-center">
                <span className="text-2xl font-black">{item.val}</span>
                <p className="text-[8px] font-black uppercase mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-2 mb-4">System Operating Index</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 text-[10px] font-black uppercase">System Component</th>
                <th className="text-center py-2 text-[10px] font-black uppercase">Status</th>
                <th className="text-right py-2 text-[10px] font-black uppercase">Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Object.keys(reportData).map(sysId => {
                const data = reportData[sysId];
                if (!data) return null;
                const isNA = data.isNA;
                const hasDefect = scanForDefects(data);
                return (
                  <tr key={sysId} className="align-top">
                    <td className="py-4 font-bold text-sm uppercase">{sysId.replace(/-/g, ' ')}</td>
                    <td className="py-4 text-center">
                      <span className={`px-2 py-0.5 text-[8px] font-black uppercase border ${isNA ? 'border-gray-300 text-gray-400' : hasDefect ? 'border-red-600 text-red-600 bg-red-50' : 'border-green-600 text-green-600 bg-green-50'}`}>
                        {isNA ? 'N/A' : hasDefect ? 'FAULT' : 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-4 text-right text-[10px] italic text-gray-600 max-w-[300px]">
                      {isNA ? 'System not present at site.' : hasDefect ? 'Critical defect identified. See technical findings below.' : 'Verified functional during inspection.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {/* Detailed Findings with Photos */}
        <section className="mb-10 page-break">
          <h2 className="text-sm font-black uppercase bg-black text-white px-3 py-2 mb-6">Technical Findings & Evidence Archive</h2>
          <div className="flex flex-col gap-10">
            {Object.keys(reportData).map(sysId => {
              const data = reportData[sysId];
              if (!data || data.isNA) return null;

              // Extracting relevant defects and photos for each system type
              const defects: { label: string; remarks?: string; photo?: string }[] = [];
              
              if (sysId === 'fire-alarm') {
                data.cardConditions?.forEach((c: any) => c.status === 'Defective' && defects.push({ label: c.label, remarks: c.remarks, photo: c.photo }));
                data.zones?.forEach((z: any) => z.status === 'Defective' && defects.push({ label: `Zone ${z.zoneNo}: ${z.name}`, remarks: z.remarks, photo: z.photo }));
              } else if (sysId === 'gas-suppression') {
                data.forEach((gas: any) => gas.integrationItems?.forEach((i: any) => i.status === 'Faulty' && defects.push({ label: `${gas.zoneName} - ${i.label}`, remarks: i.remarks, photo: i.photo })));
              } else if (sysId.includes('pump')) {
                ['jockeyUnit', 'dutyUnit', 'standbyUnit'].forEach(u => data[u]?.status === 'Fault' && defects.push({ label: data[u].label, remarks: data[u].remarks, photo: data[u].photo }));
              } else if (sysId.includes('equip')) {
                data.items?.forEach((i: any) => (i.condition === 'Damaged' || scanForDefects(i)) && defects.push({ label: `Unit at ${i.location}`, remarks: i.remarks, photo: i.photo }));
              }

              if (defects.length === 0) return null;

              return (
                <div key={sysId} className="border-l-4 border-black pl-6">
                  <h3 className="text-xl font-black uppercase mb-4 italic">{sysId.replace(/-/g, ' ')}</h3>
                  <div className="grid grid-cols-2 gap-8">
                    {defects.map((def, idx) => (
                      <div key={idx} className="flex flex-col gap-2 break-inside-avoid">
                        {def.photo && (
                          <div className="aspect-square bg-gray-100 border border-black mb-2 overflow-hidden">
                            <img src={def.photo} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <p className="text-[10px] font-black uppercase tracking-widest">{def.label}</p>
                        <p className="text-xs italic text-gray-700">"{def.remarks || 'No technician commentary provided.'}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-auto pt-10 border-t-2 border-black page-break-after-avoid">
          <div className="grid grid-cols-2 gap-16">
            <div className="text-center">
              <h4 className="text-[8px] font-black uppercase tracking-[0.2em] mb-4">Technician Certification</h4>
              {setupData?.techSigData && (
                <div className="h-24 flex items-center justify-center mb-2">
                  <img src={setupData.techSigData} className="max-h-full" alt="Tech Signature" />
                </div>
              )}
              <div className="border-t border-black pt-2">
                <p className="text-xs font-bold uppercase">Bestro Authorized Tech</p>
                <p className="text-[8px] font-bold text-gray-500">DIGITAL SIGNATURE VERIFIED</p>
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-[8px] font-black uppercase tracking-[0.2em] mb-4">Facility Verification</h4>
              {setupData?.clientSigData && (
                <div className="h-24 flex items-center justify-center mb-2">
                  <img src={setupData.clientSigData} className="max-h-full" alt="Client Signature" />
                </div>
              )}
              <div className="border-t border-black pt-2">
                <p className="text-xs font-bold uppercase">Authorized Representative</p>
                <p className="text-[8px] font-bold text-gray-500">CLIENT ACKNOWLEDGEMENT</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-center">
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
            This document is a certified technical audit generated via the Bestro Engineering Maintenance Portal v2.4.0.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default SubmissionSuccess;
