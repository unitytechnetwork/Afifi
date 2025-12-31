
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
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed && !parsed.isNA) aggregated[label] = parsed;
          }
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

  const getStatusHexColor = (status: any) => {
    if (!status) return '#1e293b';
    const s = String(status).toLowerCase();
    if (['normal', 'good', 'functional', 'ok', 'valid', 'secure', 'intact', 'clean'].includes(s)) return '#059669'; 
    if (['defective', 'fault', 'faulty', 'damaged', 'failed', 'low', 'expired', 'broken', 'blown', 'leaking', 'loose'].includes(s)) return '#dc2626'; 
    return '#1e293b'; 
  };

  const generateImageReference = (photoUrl: string | undefined, imageMap: Map<string, { data: string; mime: string }>) => {
    if (!photoUrl || !photoUrl.startsWith('data:')) return null;
    const id = `img_${Math.random().toString(36).substr(2, 9)}`;
    const parts = photoUrl.split(',');
    if (parts.length < 2) return null;
    const base64Data = parts[1];
    const mimeType = parts[0].split(';')[0].split(':')[1];
    imageMap.set(id, { data: base64Data, mime: mimeType });
    return id;
  };

  const handleExport = (type: 'pdf' | 'excel' | 'whatsapp') => {
    const site = setupData?.clientName?.toUpperCase() || 'N/A';
    const date = setupData?.date || 'N/A';
    const tech = setupData?.techName || 'N/A';
    const imageMap = new Map<string, { data: string, mime: string }>();
    const isExcel = type === 'excel';

    const renderImg = (photoUrl: string | undefined, caption: string) => {
      if (!photoUrl) return '';
      let src = photoUrl;
      if (isExcel) {
        const cid = generateImageReference(photoUrl, imageMap);
        if (cid) src = `cid:${cid}`;
      }
      return `
        <tr>
          <td colspan="6" align="center" style="background-color: #f8fafc; padding: 15px; border: 1pt solid #cbd5e1;">
            <img src="${src}" width="${isExcel ? '300' : '100%'}" style="max-height: 250px; object-fit: contain; border: 1pt solid #cbd5e1;" /><br/>
            <span style="font-size: 8pt; font-weight: bold; color: #64748b; text-transform: uppercase;">Bukti Visual: ${caption}</span>
          </td>
        </tr>
      `;
    };

    let reportHtml = '';
    Object.entries(fullReportData).forEach(([label, data]: [string, any]) => {
      if (!data) return;
      
      let sectionContent = `
        <tr><td colspan="6" style="background-color: #ec1313; color: white; padding: 12px; font-weight: 900; font-size: 13pt; text-transform: uppercase; border: 1pt solid #000000;">${label}</td></tr>
      `;

      if (label.includes('Main Fire Alarm')) {
        // PANEL SPECS
        sectionContent += `<tr><td colspan="6" style="background-color: #1e293b; color: white; font-weight: bold; font-size: 10pt; border: 1pt solid #000000;">1.0 SPESIFIKASI PANEL</td></tr>`;
        sectionContent += `<tr><td colspan="2" style="background:#f1f5f9; font-weight:bold; border: 1pt solid #000000;">MODEL PANEL</td><td colspan="4" style="border: 1pt solid #000000;">${data?.panelSpecs?.model || 'N/A'}</td></tr>`;
        sectionContent += `<tr><td colspan="2" style="background:#f1f5f9; font-weight:bold; border: 1pt solid #000000;">STATUS BATERI</td><td colspan="4" style="color:${getStatusHexColor(data?.panelSpecs?.batteryStatus)}; font-weight:bold; border: 1pt solid #000000;">${data?.panelSpecs?.batteryStatus || 'N/A'}</td></tr>`;
        sectionContent += renderImg(data?.panelSpecs?.panelPhoto, "Fizikal Panel");
        sectionContent += renderImg(data?.panelSpecs?.batteryPhoto, "Keadaan Bateri");

        // CARDS
        if (data?.cardConditions && Array.isArray(data.cardConditions)) {
          sectionContent += `<tr><td colspan="6" style="background-color: #1e293b; color: white; font-weight: bold; font-size: 10pt; border: 1pt solid #000000;">2.0 STATUS KAD MODUL</td></tr>`;
          data.cardConditions.filter(Boolean).forEach((c: any) => {
            sectionContent += `<tr><td colspan="3" style="border: 1pt solid #000000; font-weight:bold;">${c?.label || 'Unknown Card'}</td><td colspan="3" style="color:${getStatusHexColor(c?.status)}; font-weight:bold; border: 1pt solid #000000;">${c?.status || 'N/A'}</td></tr>`;
            if (c?.remarks) sectionContent += `<tr><td colspan="6" style="font-size:9pt; color:#64748b; border: 1pt solid #000000; font-style:italic;">Nota: ${c.remarks}</td></tr>`;
            sectionContent += renderImg(c?.photo, c?.label || 'Card Photo');
          });
        }

        // ZONES
        if (data?.zones && Array.isArray(data.zones)) {
          sectionContent += `<tr><td colspan="6" style="background-color: #1e293b; color: white; font-weight: bold; font-size: 10pt; border: 1pt solid #000000;">3.0 REKOD ZON</td></tr>`;
          data.zones.filter(Boolean).forEach((z: any) => {
            sectionContent += `<tr><td style="border: 1pt solid #000000; font-weight:bold;">ZON ${z?.zoneNo || '?'}</td><td colspan="3" style="border: 1pt solid #000000;">${z?.name || 'Unnamed Zone'}</td><td colspan="2" style="color:${getStatusHexColor(z?.status)}; font-weight:bold; border: 1pt solid #000000;">${z?.status || 'N/A'}</td></tr>`;
            if (z?.remarks) sectionContent += `<tr><td colspan="6" style="font-size:9pt; color:#64748b; border: 1pt solid #000000; font-style:italic;">Zon Nota: ${z.remarks}</td></tr>`;
            sectionContent += renderImg(z?.photo, `Zon ${z?.zoneNo || ''}`);
          });
        }
      }
      else if (label.includes('Pump')) {
        sectionContent += `<tr><td colspan="6" style="background-color: #1e293b; color: white; font-weight: bold; font-size: 10pt; border: 1pt solid #000000;">DATA TEKNIKAL PAM</td></tr>`;
        sectionContent += `<tr><td colspan="3" style="background:#f1f5f9; font-weight:bold; border: 1pt solid #000000;">TEKANAN HEADER</td><td colspan="3" style="font-weight:bold; border: 1pt solid #000000;">${data?.headerPressure || '0'} BAR</td></tr>`;
        
        const units = [
          {n:'JOCKEY', u:data?.jockeyUnit}, 
          {n:'DUTY', u:data?.dutyUnit}, 
          {n:'STANDBY', u:data?.standbyUnit}
        ].filter(x => x.u);

        units.forEach(unit => {
          sectionContent += `<tr><td colspan="6" style="background:#334155; color:white; font-size:9pt; font-weight:bold; border: 1pt solid #000000;">UNIT: ${unit.n} PUMP</td></tr>`;
          sectionContent += `<tr><td colspan="2" style="border: 1pt solid #000000; font-weight:bold;">MODE</td><td style="border: 1pt solid #000000;">${unit.u?.mode || 'N/A'}</td><td style="border: 1pt solid #000000; font-weight:bold;">STATUS</td><td colspan="2" style="color:${getStatusHexColor(unit.u?.status)}; font-weight:bold; border: 1pt solid #000000;">${unit.u?.status || 'N/A'}</td></tr>`;
          sectionContent += `<tr><td colspan="2" style="border: 1pt solid #000000; font-weight:bold;">LOAD</td><td style="border: 1pt solid #000000;">${unit.u?.loadValue || '0'}</td><td style="border: 1pt solid #000000; font-weight:bold;">PRESSURE</td><td colspan="2" style="border: 1pt solid #000000;">${unit.u?.cutIn || '0'}/${unit.u?.cutOut || '0'} BAR</td></tr>`;
          if (unit.u?.remarks) sectionContent += `<tr><td colspan="6" style="font-size:9pt; color:#64748b; border: 1pt solid #000000; font-style:italic;">Remark: ${unit.u.remarks}</td></tr>`;
          sectionContent += renderImg(unit.u?.photo, `${unit.n} Pump`);
        });
      }
      else if (data?.items && Array.isArray(data.items)) {
        // PERALATAN (Extinguisher, Lighting, etc)
        data.items.filter(Boolean).forEach((item: any, idx: number) => {
          const status = item?.status || item?.testOutcome || item?.condition || 'Normal';
          const title = item?.type ? `${item.weight || ''} ${item.type}` : item?.brand ? `${item.brand} ${item.model || ''}` : `Unit #${idx+1}`;
          
          sectionContent += `<tr><td colspan="6" style="background:#334155; color:white; font-size:9pt; font-weight:bold; border: 1pt solid #000000;">ITEM #${idx+1}: ${title}</td></tr>`;
          sectionContent += `<tr><td colspan="2" style="background:#f8fafc; font-weight:bold; border: 1pt solid #000000;">LOKASI</td><td colspan="2" style="border: 1pt solid #000000;">${item?.location || 'N/A'}</td><td style="background:#f8fafc; font-weight:bold; border: 1pt solid #000000;">STATUS</td><td style="color:${getStatusHexColor(status)}; font-weight:bold; border: 1pt solid #000000;">${status.toUpperCase()}</td></tr>`;
          
          if (item?.serial) sectionContent += `<tr><td colspan="2" style="font-size:8pt; border: 1pt solid #000000;">SERIAL NO</td><td colspan="4" style="font-size:8pt; border: 1pt solid #000000;">${item.serial}</td></tr>`;
          if (item?.remarks) sectionContent += `<tr><td colspan="2" style="font-size:8pt; border: 1pt solid #000000; font-weight:bold;">REMARK</td><td colspan="4" style="font-size:8pt; border: 1pt solid #000000; font-style:italic;">${item.remarks}</td></tr>`;
          
          sectionContent += renderImg(item?.photo || (item?.photos && item.photos[0]), title);
        });
      }

      const sectionRemarks = data?.generalRemarks || data?.remarks || data?.overallRemarks;
      if (sectionRemarks) {
        sectionContent += `<tr><td colspan="2" style="font-weight:bold; background:#f1f5f9; vertical-align:top; border: 1pt solid #000000;">OVERALL OBS.</td><td colspan="4" style="font-style:italic; color:#475569; border: 1pt solid #000000;">${sectionRemarks}</td></tr>`;
      }

      if (data?.photos && Array.isArray(data.photos)) {
        data.photos.filter(Boolean).forEach((p: string, pIdx: number) => {
          sectionContent += renderImg(p, `${label} GENERAL VIEW #${pIdx + 1}`);
        });
      }

      reportHtml += `<table style="width:100%; border-collapse:collapse; margin-bottom:30px; border: 1.5pt solid #000000;">${sectionContent}</table>`;
    });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20pt; color: #1e293b; }
          .header-box { border: 10pt solid #ec1313; padding: 30pt; margin-bottom: 40pt; text-align: center; }
          .logo-text { font-size: 40pt; font-weight: 900; color: #ec1313; margin: 0; }
          .info-table { width: 100%; border-collapse: collapse; margin-bottom: 40pt; border: 1pt solid #000000; }
          .info-table td { padding: 10pt; border: 1pt solid #000000; }
          .label { background: #f1f5f9; font-weight: 900; width: 120pt; font-size: 9pt; }
          @media print { table { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h1 class="logo-text">BESTRO ENGINEERING</h1>
          <h2 style="text-transform: uppercase; letter-spacing: 5pt; margin-top: 10pt;">Laporan Audit Teknikal Penyelenggaraan</h2>
        </div>

        <table class="info-table">
          <tr><td class="label">NAMA KLIEN</td><td style="font-size: 14pt; font-weight: bold;">${site}</td><td class="label">ID AUDIT</td><td>${auditId}</td></tr>
          <tr><td class="label">LOKASI TAPAK</td><td>${setupData?.location || 'N/A'}</td><td class="label">TARIKH</td><td>${date}</td></tr>
          <tr><td class="label">KETUA JURUTEKNIK</td><td>${tech}</td><td class="label">STATUS</td><td style="color:#059669; font-weight:bold;">SIAP (COMPLETED)</td></tr>
        </table>

        ${reportHtml}

        <div style="margin-top: 50pt; page-break-inside: avoid;">
          <h3 style="border-bottom: 2pt solid #000000; padding-bottom: 5pt;">PENGESAHAN AKHIR</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20pt;">
            <tr>
              <td align="center" style="width: 50%; border: none;">
                <p style="font-size: 8pt; font-weight:bold; color:#64748b;">Disediakan Oleh (Juruteknik):</p>
                <div style="height: 100pt; border: 1pt dashed #cbd5e1; background: #f8fafc; margin: 10pt 0; display: flex; align-items: center; justify-content: center;">
                  ${setupData?.techSigData ? (isExcel ? `<img src="cid:${generateImageReference(setupData.techSigData, imageMap)}" width="150" />` : `<img src="${setupData.techSigData}" style="height: 80pt;" />`) : 'Tandatangan Digital'}
                </div>
                <p style="font-weight: 900;">${tech}</p>
              </td>
              <td align="center" style="width: 50%; border: none;">
                <p style="font-size: 8pt; font-weight:bold; color:#64748b;">Disahkan Oleh (Klien):</p>
                <div style="height: 100pt; border: 1pt dashed #cbd5e1; background: #f8fafc; margin: 10pt 0; display: flex; align-items: center; justify-content: center;">
                  ${setupData?.clientSigData ? (isExcel ? `<img src="cid:${generateImageReference(setupData.clientSigData, imageMap)}" width="150" />` : `<img src="${setupData.clientSigData}" style="height: 80pt;" />`) : 'Tandatangan / Cop Rasmi'}
                </div>
                <p style="font-weight: 900;">WAKIL BERKUASA TAPAK</p>
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    if (type === 'excel') {
      try {
        const boundary = "----=_Part_Boundary_" + Date.now();
        let mhtml = `MIME-Version: 1.0\nContent-Type: multipart/related; boundary="${boundary}"\n\n`;
        mhtml += `--${boundary}\nContent-Type: text/html; charset="UTF-8"\nContent-Transfer-Encoding: base64\n\n`;
        mhtml += btoa(unescape(encodeURIComponent(fullHtml))) + "\n\n";
        imageMap.forEach((img, id) => {
          mhtml += `--${boundary}\nContent-Type: ${img.mime}\nContent-Transfer-Encoding: base64\nContent-ID: <${id}>\n\n`;
          mhtml += img.data + "\n\n";
        });
        mhtml += `--${boundary}--`;
        const blob = new Blob([mhtml], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `BESTRO_REPORT_${auditId}.xls`);
        link.click();
      } catch (err) {
        console.error("Excel Export Error:", err);
        alert("Gagal mengeksport fail Excel. Sila cuba lagi.");
      }
    } else if (type === 'pdf') {
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(fullHtml);
        printWin.document.close();
        setTimeout(() => printWin.print(), 1000);
      }
    } else if (type === 'whatsapp') {
      const msg = `*LAPORAN AUDIT TEKNIKAL BESTRO*%0A*Site:* ${site}%0A*ID:* ${auditId}%0A*Tarikh:* ${date}%0A_Laporan lengkap merangkumi butiran checksheet dan bukti visual telah dijana._`;
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#181111] overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.05] no-print" style={{ backgroundImage: 'radial-gradient(#ec1313 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <TopBar title="Technical Handover" showBack onBack={() => navigate('/')} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-10 relative z-10 no-print overflow-y-auto no-scrollbar">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-primary rounded-[35px] flex items-center justify-center shadow-[0_0_50px_rgba(236,19,19,0.4)] animate-bounce">
            <span className="material-symbols-outlined text-white text-6xl">verified</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black italic uppercase text-white tracking-tight">Audit Handover</h1>
            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-2">Dossier ID: {auditId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm pb-10">
          <button onClick={() => handleExport('pdf')} className="bg-surface-dark border border-white/10 h-28 rounded-[30px] flex flex-col items-center justify-center gap-3 text-white">
             <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-primary text-2xl">picture_as_pdf</span></div>
             <span className="text-[9px] font-black uppercase tracking-widest">Formal PDF</span>
          </button>
          
          <button onClick={() => handleExport('excel')} className="bg-surface-dark border border-white/10 h-28 rounded-[30px] flex flex-col items-center justify-center gap-3 text-white">
             <div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-emerald-600 text-2xl">table_view</span></div>
             <span className="text-[9px] font-black uppercase tracking-widest">Embedded XLS</span>
          </button>
          
          <button onClick={() => handleExport('whatsapp')} className="bg-surface-dark border border-white/10 h-28 rounded-[30px] flex flex-col items-center justify-center gap-3 text-white">
             <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-emerald-500 text-2xl">share</span></div>
             <span className="text-[9px] font-black uppercase tracking-widest">WhatsApp Log</span>
          </button>

          <button onClick={() => navigate('/')} className="col-span-1 bg-white text-black h-28 rounded-[30px] flex flex-col items-center justify-center gap-3 shadow-xl">
             <div className="w-10 h-10 bg-black/5 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-black text-2xl">home</span></div>
             <span className="text-[9px] font-black uppercase tracking-widest">Dashboard</span>
          </button>
        </div>

        <div className="text-center opacity-20 mt-4">
          <p className="text-[8px] font-black uppercase tracking-[0.5em]">Bestro Engineering Group • Compliance Record</p>
        </div>
      </div>
    </div>
  );
};

export default SubmissionSuccess;
