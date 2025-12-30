
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
    
    const logoSvg = `<svg width="120" height="60" viewBox="0 0 240 120" xmlns="http://www.w3.org/2000/svg"><ellipse cx="120" cy="60" rx="110" ry="52" fill="#ec1313" /><text x="100" y="66" font-family="Arial Black, sans-serif" font-size="42" font-weight="900" fill="white" text-anchor="middle" letter-spacing="-1.5">BESTR</text><g transform="translate(178, 55)"><circle cx="0" cy="0" r="17" fill="white" /><path d="M0 -9C0 -9 6 -3 6 3C6 9 0 12 0 12C0 12 -6 9 -6 3C-6 -3 0 -9 0 -9Z" fill="#ec1313" /></g><text x="120" y="88" font-family="Arial, sans-serif" font-size="11" font-weight="800" fill="white" text-anchor="middle" letter-spacing="5">ENGINEERING</text></svg>`;

    // Detailed renderers for different data types
    const renderDataRows = (data: any) => {
      let rows = '';
      const skip = ['photos', 'photo', 'isNA', 'id', 'remarks', 'integrationItems', 'cardConditions', 'zones', 'panelSpecs', 'items'];
      
      Object.entries(data).forEach(([key, val]) => {
        if (!skip.includes(key) && typeof val !== 'object') {
          const label = key.replace(/([A-Z])/g, ' $1').toUpperCase();
          rows += `<tr><td class="p-1 font-bold w-1/2">${label}</td><td class="p-1">${val}</td></tr>`;
        }
      });
      return rows;
    };

    const sectionsHtml = Object.entries(fullReportData).map(([label, data]: [string, any]) => {
      if (!data || data.isNA) return '';
      
      let subContent = `<table class="w-full text-[10px] mb-2 border-collapse border border-slate-200"><tbody>${renderDataRows(data)}</tbody></table>`;
      
      // Handle special nested arrays (like Fire Extinguisher items or Pump units)
      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item: any, i: number) => {
           subContent += `<div class="bg-slate-50 p-2 mb-1 border border-slate-200"><p class="text-[9px] font-bold">UNIT #${i+1}: ${item.location || 'N/A'}</p><table class="w-full text-[8px]">${renderDataRows(item)}</table></div>`;
        });
      }

      // Handle photos in this section
      let photoHtml = '';
      const allPhotos = [...(data.photos || []), data.photo, data.panelPhoto, data.batteryPhoto].filter(Boolean);
      if (allPhotos.length > 0) {
        photoHtml = `<div class="grid grid-cols-4 gap-2 mt-2">`;
        allPhotos.forEach(p => {
          photoHtml += `<div class="border border-slate-200 p-1"><img src="${p}" class="w-full h-16 object-cover" /></div>`;
        });
        photoHtml += `</div>`;
      }

      return `
        <div class="mb-6 break-inside-avoid">
          <div class="bg-[#ec1313] text-white px-3 py-1 text-[10px] font-black uppercase mb-2">${label}</div>
          ${subContent}
          ${photoHtml}
          ${data.remarks || data.overallRemarks ? `<p class="text-[9px] italic mt-1 font-medium text-slate-600">REMARKS: ${data.remarks || data.overallRemarks}</p>` : ''}
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
    body { font-family: 'Inter', sans-serif; padding: 15mm; background: white; color: black; }
    table tr { border-bottom: 1px solid #eee; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body class="text-slate-900">
  <div class="max-w-[210mm] mx-auto border-2 border-slate-100 p-8 shadow-sm">
    <!-- COVER PAGE -->
    <div class="flex justify-between items-start border-b-4 border-[#ec1313] pb-6 mb-8">
      <div>
        ${logoSvg}
        <h1 class="text-3xl font-black uppercase mt-4">Maintenance Service Report</h1>
        <p class="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase italic">Connect & Protect</p>
      </div>
      <div class="text-right">
        <div class="bg-slate-100 p-4 rounded-xl">
          <p class="text-[10px] font-black text-slate-400 uppercase">Registry Reference</p>
          <p class="text-xl font-black text-[#ec1313]">${auditId}</p>
        </div>
        <p class="text-[10px] font-bold mt-4">DATE: ${date}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-8 mb-10">
      <div class="border-l-4 border-slate-200 pl-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Site Information</h3>
        <p class="text-lg font-black uppercase">${site}</p>
        <p class="text-xs font-bold text-slate-600">${setupData?.location || 'N/A'}</p>
      </div>
      <div class="border-l-4 border-slate-200 pl-4">
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Provider</h3>
        <p class="text-lg font-black uppercase">${tech}</p>
        <p class="text-xs font-bold text-slate-600">Bestro Engineering Field Team</p>
      </div>
    </div>

    <!-- TECHNICAL DETAILS -->
    <div class="mb-10">
      <h2 class="text-sm font-black uppercase border-b-2 border-slate-900 pb-1 mb-4">Detailed Inspection Checklist</h2>
      ${sectionsHtml}
    </div>

    <!-- SIGNATURES -->
    <div class="mt-12 pt-8 border-t-2 border-slate-100 break-inside-avoid">
      <div class="grid grid-cols-2 gap-12">
        <div class="text-center">
          <p class="text-[10px] font-black text-slate-400 uppercase mb-4">Certified By Juruteknik</p>
          <div class="h-24 flex items-center justify-center border border-dashed border-slate-200 mb-2">
            ${setupData?.techSigData ? `<img src="${setupData.techSigData}" class="h-full object-contain" />` : '<p class="text-[10px] text-slate-200">No Signature</p>'}
          </div>
          <p class="text-xs font-black uppercase">${tech}</p>
        </div>
        <div class="text-center">
          <p class="text-[10px] font-black text-slate-400 uppercase mb-4">Verified By Client / Rep</p>
          <div class="h-24 flex items-center justify-center border border-dashed border-slate-200 mb-2">
            ${setupData?.clientSigData ? `<img src="${setupData.clientSigData}" class="h-full object-contain" />` : '<p class="text-[10px] text-slate-200">No Signature</p>'}
          </div>
          <p class="text-xs font-black uppercase">Authorized Representative</p>
        </div>
      </div>
    </div>

    <div class="mt-10 text-center opacity-30">
      <p class="text-[8px] font-black uppercase tracking-[0.5em]">Digitally Generated via Bestro Maintenance OS</p>
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
          }, 500);
        };
      }
    } else if (type === 'html') {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BESTRO_REPORT_${auditId}.html`;
      a.click();
    } else if (type === 'whatsapp') {
      const site = setupData?.clientName?.toUpperCase() || 'TAPAK';
      const message = `*BESTRO ENGINEERING REPORT*%0A---------------------------%0A*ID:* ${auditId}%0A*SITE:* ${site}%0A*DATE:* ${setupData?.date}%0A*TECH:* ${setupData?.techName}%0A---------------------------%0A_Laporan lengkap telah dijana dan sedia untuk disemak._`;
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
