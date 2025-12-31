
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopBar from '../components/TopBar';

const SubmissionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [setupData, setSetupData] = useState<any>(null);
  const [fullReportData, setFullReportData] = useState<any>({});
  const auditId = location.state?.auditId || 'NEW-AUDIT';

  useEffect(() => {
    const fetchAllData = () => {
      const keys = {
        'Main Fire Alarm System': `checklist_${auditId}`,
        'Gas Suppression System': `gas_suppression_${auditId}`,
        'Hose Reel Pump': `pump_hosereel_${auditId}`,
        'Wet Riser Pump': `pump_wetriser_${auditId}`,
        'Hydrant Pump': `pump_hydrant_${auditId}`,
        'Sprinkler Pump': `pump_sprinkler_${auditId}`,
        'Hose Reel Equipment': `equip_hosereel_${auditId}`,
        'Hydrant Equipment': `equip_hydrant_${auditId}`,
        'Wet Riser Equipment': `equip_wetriser_${auditId}`,
        'Dry Riser Equipment': `equip_dryriser_${auditId}`,
        'Portable Fire Extinguishers': `extinguisher_${auditId}`,
        'Emergency Lighting': `light_emergency_${auditId}`,
        'Keluar Sign System': `light_keluar_${auditId}`
      };

      const aggregated: any = {};
      Object.entries(keys).forEach(([label, key]) => {
        try {
          const data = localStorage.getItem(key);
          if (data) aggregated[label] = JSON.parse(data);
        } catch (e) {}
      });
      setFullReportData(aggregated);

      try {
        const savedSetup = localStorage.getItem(`setup_${auditId}`);
        if (savedSetup) setSetupData(JSON.parse(savedSetup));
      } catch (e) {}
    };

    fetchAllData();
  }, [auditId]);

  const generateFullHtml = () => {
    const site = setupData?.clientName?.toUpperCase() || 'N/A';
    const date = setupData?.date || 'N/A';
    const tech = setupData?.techName || 'N/A';
    
    // Updated "Kemas" Logo for Report Header
    const logoSvg = `<svg width="120" height="60" viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg"><ellipse cx="120" cy="60" rx="110" ry="52" fill="#ec1313" /><text x="100" y="66" font-family="Arial Black, sans-serif" font-size="42" font-weight="900" fill="white" text-anchor="middle" letter-spacing="-1.5">BESTR</text><g transform="translate(178, 55)"><circle cx="0" cy="0" r="17" fill="white" /><path d="M0 -9C0 -9 6 -3 6 3C6 9 0 12 0 12C0 12 -6 9 -6 3C-6 -3 0 -9 0 -9Z" fill="#ec1313" /></g><text x="120" y="88" font-family="Arial, sans-serif" font-size="11" font-weight="800" fill="white" text-anchor="middle" letter-spacing="5">ENGINEERING</text></svg>`;

    const renderDataRows = (data: any) => {
      let rows = '';
      const skip = ['photos', 'photo', 'isNA', 'id', 'remarks', 'integrationItems', 'cardConditions', 'zones', 'panelSpecs', 'items'];
      
      Object.entries(data).forEach(([key, val]) => {
        if (!skip.includes(key) && val !== null && typeof val !== 'object') {
          const label = key.replace(/([A-Z])/g, ' $1').toUpperCase();
          rows += `<tr><td class="p-1 font-bold w-1/2 border-b border-gray-100">${label}</td><td class="p-1 border-b border-gray-100">${val}</td></tr>`;
        }
      });
      return rows;
    };

    const sectionsHtml = Object.entries(fullReportData).map(([label, data]: [string, any]) => {
      if (!data || data.isNA) return '';
      
      let subContent = `<table class="w-full text-[10px] mb-2 border-collapse"><tbody>${renderDataRows(data)}</tbody></table>`;
      
      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
           if (item) {
             subContent += `<div class="bg-gray-50 p-2 mb-1 border border-gray-200 rounded"><p class="text-[9px] font-bold uppercase mb-1">UNIT #${i+1}: ${item.location || 'N/A'}</p><table class="w-full text-[8px] border-collapse">${renderDataRows(item)}</table></div>`;
           }
        });
      }

      let photoHtml = '';
      const allPhotos = [...(data.photos || []), data.photo, data.panelPhoto, data.batteryPhoto].filter(Boolean);
      if (allPhotos.length > 0) {
        photoHtml = `<div class="grid grid-cols-4 gap-2 mt-2">`;
        allPhotos.forEach(p => {
          photoHtml += `<div class="border border-gray-200 rounded overflow-hidden p-0.5 bg-white"><img src="${p}" class="w-full h-16 object-cover" /></div>`;
        });
        photoHtml += `</div>`;
      }

      return `
        <div class="mb-8 break-inside-avoid">
          <div class="bg-[#ec1313] text-white px-3 py-1.5 text-[10px] font-black uppercase mb-2 rounded-sm shadow-sm">${label}</div>
          ${subContent}
          ${photoHtml}
          ${data.remarks || data.overallRemarks ? `<div class="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-[9px] italic font-medium text-gray-700">OBSERVATION: ${data.remarks || data.overallRemarks}</div>` : ''}
        </div>
      `;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>BESTRO_FULL_REPORT_${auditId}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
    body { font-family: 'Inter', sans-serif; padding: 15mm; background: white; color: black; line-height: 1.4; }
    @media print { .no-print { display: none; } body { padding: 0; } .break-inside-avoid { break-inside: avoid; } }
  </style>
</head>
<body class="text-slate-900">
  <div class="max-w-[210mm] mx-auto">
    <!-- COVER PAGE -->
    <div class="flex justify-between items-start border-b-8 border-[#ec1313] pb-8 mb-10">
      <div>
        ${logoSvg}
        <h1 class="text-4xl font-black uppercase mt-6 tracking-tight">Maintenance Service Report</h1>
        <p class="text-[12px] font-bold text-slate-500 tracking-[0.4em] uppercase italic mt-1">Connect & Protect</p>
      </div>
      <div class="text-right">
        <div class="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registry Reference</p>
          <p class="text-2xl font-black text-[#ec1313] tracking-tighter">${auditId}</p>
        </div>
        <p class="text-[12px] font-black mt-6 uppercase">DATE: <span class="text-slate-500">${date}</span></p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-10 mb-12">
      <div class="border-l-4 border-[#ec1313] pl-6">
        <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Site Information</h3>
        <p class="text-xl font-black uppercase text-slate-900 mb-1">${site}</p>
        <p class="text-sm font-bold text-slate-600">${setupData?.location || 'General Site Location'}</p>
      </div>
      <div class="border-l-4 border-slate-200 pl-6">
        <h3 class="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">Service Provider</h3>
        <p class="text-xl font-black uppercase text-slate-900 mb-1">${tech}</p>
        <p class="text-sm font-bold text-slate-600 uppercase">Bestro Engineering Field Team</p>
      </div>
    </div>

    <!-- TECHNICAL DETAILS -->
    <div class="mb-12">
      <h2 class="text-base font-black uppercase border-b-2 border-slate-900 pb-2 mb-6 flex items-center gap-2">
        <span class="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">1</span>
        Detailed Inspection Checklist
      </h2>
      ${sectionsHtml}
    </div>

    <!-- SUMMARY SIGN-OFF -->
    <div class="mt-16 pt-10 border-t-2 border-slate-100 break-inside-avoid">
      <h2 class="text-base font-black uppercase border-b-2 border-slate-900 pb-2 mb-8 flex items-center gap-2">
        <span class="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px]">2</span>
        Certification & Sign-Off
      </h2>
      <div class="grid grid-cols-2 gap-16">
        <div class="text-center">
          <p class="text-[11px] font-black text-slate-400 uppercase mb-6 tracking-widest">Certified By Bestro Technician</p>
          <div class="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl mb-4 bg-slate-50">
            ${setupData?.techSigData ? `<img src="${setupData.techSigData}" class="h-24 object-contain" />` : '<p class="text-[10px] text-slate-300 font-bold uppercase">No Digital Sign</p>'}
          </div>
          <p class="text-sm font-black uppercase text-slate-900">${tech}</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technician Staff ID: ${setupData?.technicianId || '8821'}</p>
        </div>
        <div class="text-center">
          <p class="text-[11px] font-black text-slate-400 uppercase mb-6 tracking-widest">Verified By Client Representative</p>
          <div class="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl mb-4 bg-slate-50">
            ${setupData?.clientSigData ? `<img src="${setupData.clientSigData}" class="h-24 object-contain" />` : '<p class="text-[10px] text-slate-300 font-bold uppercase">No Digital Sign</p>'}
          </div>
          <p class="text-sm font-black uppercase text-slate-900">Authorized Personnel</p>
          <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Site Verification</p>
        </div>
      </div>
    </div>

    <div class="mt-20 text-center opacity-40 border-t border-slate-100 pt-6">
      <p class="text-[10px] font-black uppercase tracking-[0.6em] text-slate-400">Digitally Generated via Bestro Maintenance OS</p>
      <p class="text-[8px] font-bold text-slate-300 uppercase mt-2 italic">Official Document - Proprietary Engineering Record</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  const handleExport = (type: 'pdf' | 'html' | 'whatsapp') => {
    const html = generateFullHtml();
    
    if (type === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 600);
        };
      }
    } else if (type === 'html') {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BESTRO_REPORT_${auditId}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (type === 'whatsapp') {
      const site = setupData?.clientName?.toUpperCase() || 'TAPAK';
      const message = `*BESTRO ENGINEERING REPORT*%0A---------------------------%0A*AUDIT ID:* ${auditId}%0A*SITE:* ${site}%0A*DATE:* ${setupData?.date}%0A*TECH:* ${setupData?.techName}%0A---------------------------%0A_Laporan penyelenggaraan teknikal lengkap telah dijana dan tersedia untuk semakan. Sila semak lampiran sistem Bestro OS._`;
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#181111] overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.05] no-print" style={{ backgroundImage: 'radial-gradient(#ec1313 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      <TopBar title="Submission Finalized" showBack onBack={() => navigate('/')} />

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-10 relative z-10 no-print">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-primary rounded-[35px] flex items-center justify-center shadow-[0_0_50px_rgba(236,19,19,0.4)] animate-bounce">
            <span className="material-symbols-outlined text-white text-6xl">verified</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black italic uppercase text-white tracking-tight">Audit Berjaya!</h1>
            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-2">Dossier ID: {auditId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <button 
            onClick={() => handleExport('pdf')} 
            className="bg-surface-dark border border-white/10 h-28 rounded-[30px] flex flex-col items-center justify-center gap-3 active:scale-95 transition-all text-white hover:bg-white/5"
          >
             <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
               <span className="material-symbols-outlined text-primary text-2xl">picture_as_pdf</span>
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest">Full PDF</span>
          </button>

          <button 
            onClick={() => handleExport('whatsapp')} 
            className="bg-surface-dark border border-white/10 h-28 rounded-[30px] flex flex-col items-center justify-center gap-3 active:scale-95 transition-all text-white hover:bg-white/5"
          >
             <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
               <span className="material-symbols-outlined text-emerald-500 text-2xl">share</span>
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp</span>
          </button>

          <button 
            onClick={() => handleExport('html')} 
            className="bg-surface-dark border border-white/10 h-28 rounded-[30px] flex flex-col items-center justify-center gap-3 active:scale-95 transition-all text-white hover:bg-white/5"
          >
             <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
               <span className="material-symbols-outlined text-blue-500 text-2xl">html</span>
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest">Download HTML</span>
          </button>

          <button 
            onClick={() => navigate('/')} 
            className="bg-white text-black h-28 rounded-[30px] flex flex-col items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
          >
             <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center">
               <span className="material-symbols-outlined text-2xl">home</span>
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest">Dashboard</span>
          </button>
        </div>

        <div className="text-center opacity-20 mt-4">
          <p className="text-[8px] font-black uppercase tracking-[0.5em]">Bestro Engineering Group • Report OS</p>
        </div>
      </div>
    </div>
  );
};

export default SubmissionSuccess;
