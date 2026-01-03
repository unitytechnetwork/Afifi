
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { InspectionStatus } from '../types';

interface DefectEntry {
  uid: string;
  system: string;
  section: string;
  itemLabel: string;
  description: string;
  photo?: string;
  path: string;
  dateDetected: string;
  dossierId: string;
  severity: 'Critical' | 'Major' | 'Minor';
  status: 'Open' | 'In Progress' | 'Rectified';
  technician: string;
  sourceKey: string; 
  sourceId: string;  
}

const DefectReport: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoUid, setActivePhotoUid] = useState<string | null>(null);

  const [defects, setDefects] = useState<DefectEntry[]>([]);
  const [tracker, setTracker] = useState<Record<string, { status: any, severity: any }>>({});
  const [setupData, setSetupData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'Major' | 'Minor'>('All');

  const DEFECT_TERMS = ['Defective', 'Fault', 'Faulty', 'Damaged', 'Failed', 'Low', 'Broken', 'Leaking', 'Corroded', 'Loose', 'Blocked', 'Blown', 'Expired', 'High', 'Abnormal', 'Missing'];

  const BESTRO_LOGO_DATA_URI = `data:image/svg+xml;base64,${btoa(`
    <svg viewBox="0 0 450 250" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="225" cy="110" rx="200" ry="100" fill="#ec1313" />
      <text x="50%" y="120" text-anchor="middle" fill="white" style="font: bold 75px Arial, sans-serif; letter-spacing: -2px;">BESTRO</text>
      <text x="50%" y="165" text-anchor="middle" fill="white" style="font: 900 24px Arial, sans-serif; letter-spacing: 8px;">ENGINEERING</text>
      <text x="50%" y="235" text-anchor="middle" fill="#333" style="font: italic bold 26px serif;">Connect &amp; Protect</text>
    </svg>
  `)}`;

  useEffect(() => {
    const scanSystems = () => {
      setIsLoading(true);
      const foundDefects: DefectEntry[] = [];
      
      const savedSetup = localStorage.getItem(`setup_${auditId}`);
      const setup = savedSetup ? JSON.parse(savedSetup) : null;
      setSetupData(setup);

      const savedTracker = localStorage.getItem(`defect_registry_${auditId}`);
      const trackerData = savedTracker ? JSON.parse(savedTracker) : {};
      setTracker(trackerData);

      const config = [
        { key: `checklist_${auditId}`, label: 'Main Fire Alarm', path: `/checklist/${auditId}/panel` },
        { key: `gas_suppression_${auditId}`, label: 'Gas Suppression', path: `/checklist/${auditId}/gas` },
        { key: `pump_hosereel_${auditId}`, label: 'Hose Reel Pump', path: `/checklist/${auditId}/pump/hosereel` },
        { key: `pump_wetriser_${auditId}`, label: 'Wet Riser Pump', path: `/checklist/${auditId}/pump/wetriser` },
        { key: `pump_hydrant_${auditId}`, label: 'Hydrant Pump', path: `/checklist/${auditId}/pump/hydrant` },
        { key: `pump_sprinkler_${auditId}`, label: 'Sprinkler Pump', path: `/checklist/${auditId}/pump/sprinkler` },
        { key: `equip_hosereel_${auditId}`, label: 'Hose Reel Assets', path: `/checklist/${auditId}/equip/hosereel` },
        { key: `equip_hydrant_${auditId}`, label: 'Hydrant Assets', path: `/checklist/${auditId}/equip/hydrant` },
        { key: `equip_wetriser_${auditId}`, label: 'Wet Riser Assets', path: `/checklist/${auditId}/equip/wetriser` },
        { key: `equip_dryriser_${auditId}`, label: 'Dry Riser Assets', path: `/checklist/${auditId}/equip/dryriser` },
        { key: `extinguisher_${auditId}`, label: 'Fire Extinguishers', path: `/checklist/${auditId}/extinguisher` },
        { key: `light_emergency_${auditId}`, label: 'Emergency Lighting', path: `/checklist/${auditId}/light/emergency` },
        { key: `light_keluar_${auditId}`, label: 'Keluar Signs', path: `/checklist/${auditId}/light/keluar` },
      ];

      config.forEach(sys => {
        try {
          const raw = localStorage.getItem(sys.key);
          if (!raw) return;
          const data = JSON.parse(raw);
          if (data.isNA) return;

          if (sys.label === 'Main Fire Alarm') {
            if (DEFECT_TERMS.includes(data.panelSpecs?.batteryStatus)) {
              foundDefects.push(createDefect(sys.label, 'Panel', 'Battery', data.panelSpecs.batteryRemarks, data.panelSpecs.batteryPhoto, sys.path, 'Critical', trackerData, setup, 'batt', sys.key));
            }
            data.cardConditions?.forEach((c: any) => {
              if (DEFECT_TERMS.includes(c.status)) foundDefects.push(createDefect(sys.label, 'Internal Card', c.label, c.remarks, c.photo, sys.path, 'Critical', trackerData, setup, `card_${c.id}`, sys.key));
            });
            data.indicators?.forEach((ind: any) => {
              if (DEFECT_TERMS.includes(ind.status)) foundDefects.push(createDefect(sys.label, 'Signals', ind.label, ind.remarks, ind.photo, sys.path, 'Major', trackerData, setup, `ind_${ind.id}`, sys.key));
            });
          }
          else if (sys.label.includes('Pump')) {
            if (data.dutyUnit && DEFECT_TERMS.includes(data.dutyUnit.status)) foundDefects.push(createDefect(sys.label, 'Mechanical', 'Duty Pump', data.dutyUnit.remarks, data.dutyUnit.photo, sys.path, 'Critical', trackerData, setup, 'pump_Duty Pump', sys.key));
            if (data.standbyUnit && DEFECT_TERMS.includes(data.standbyUnit.status)) foundDefects.push(createDefect(sys.label, 'Mechanical', 'Standby Pump', data.standbyUnit.remarks, data.standbyUnit.photo, sys.path, 'Critical', trackerData, setup, 'pump_Standby Pump', sys.key));
            if (data.jockeyUnit && DEFECT_TERMS.includes(data.jockeyUnit.status)) foundDefects.push(createDefect(sys.label, 'Mechanical', 'Jockey Pump', data.jockeyUnit.remarks, data.jockeyUnit.photo, sys.path, 'Major', trackerData, setup, 'pump_Jockey Pump', sys.key));
            if (data.panelLampsStatus === 'Fault') foundDefects.push(createDefect(sys.label, 'Panel', 'Indication Lamps', data.panelLampsRemarks, data.panelLampsPhoto, sys.path, 'Major', trackerData, setup, 'p_lamps', sys.key));
            if (data.panelWiringStatus === 'Fault') foundDefects.push(createDefect(sys.label, 'Panel', 'Wiring Logic', data.panelWiringRemarks, data.panelWiringPhoto, sys.path, 'Critical', trackerData, setup, 'p_wiring', sys.key));
          }
          else {
            const items = Array.isArray(data) ? data : (data.items || []);
            items.forEach((item: any) => {
              const unitName = item.serial || item.location || `Asset Unit`;
              Object.entries(item).forEach(([key, value]) => {
                if (typeof value === 'string' && DEFECT_TERMS.includes(value)) {
                  const faultLabel = key.replace('Status', '').replace('Outcome', '').toUpperCase();
                  const specificPhoto = item.photo || (item.photos && item.photos[key]);
                  foundDefects.push(createDefect(sys.label, 'Asset Inventory', `${unitName} (${faultLabel})`, item.remarks?.[key] || 'Defect detected.', specificPhoto, sys.path, 'Minor', trackerData, setup, `item_${item.id}_${key}`, sys.key));
                }
              });
            });
          }
        } catch (e) {}
      });
      setDefects(foundDefects);
      setIsLoading(false);
    };

    const createDefect = (sys: string, sec: string, label: string, desc: string, photo: string, path: string, defSeverity: any, tracker: any, setup: any, idSuffix: string, sourceKey: string): DefectEntry => {
      const uid = `${auditId}_${idSuffix}`;
      return {
        uid, system: sys, section: sec, itemLabel: label, description: desc || 'Field verification required.', photo, path, dateDetected: setup?.date || new Date().toLocaleDateString(), dossierId: auditId, severity: tracker[uid]?.severity || defSeverity, status: tracker[uid]?.status || 'Open', technician: setup?.techName || 'Lead Auditor', sourceKey, sourceId: idSuffix
      };
    };

    scanSystems();
  }, [auditId]);

  const handleExportPDF = () => {
    const site = setupData?.clientName?.toUpperCase() || 'N/A';
    const tech = setupData?.techName || 'N/A';
    const date = new Date().toLocaleDateString();

    let defectRowsHtml = '';
    defects.forEach((d, idx) => {
      const severityColor = d.severity === 'Critical' ? '#ec1313' : d.severity === 'Major' ? '#f59e0b' : '#3b82f6';
      const statusColor = d.status === 'Rectified' ? '#059669' : '#ec1313';
      
      defectRowsHtml += `
        <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          <td style="padding: 12px; border: 1pt solid #cbd5e1; font-weight: 900; font-size: 8.5pt; width: 130px; color: #1e293b;">${d.system.toUpperCase()}</td>
          <td style="padding: 12px; border: 1pt solid #cbd5e1; font-size: 8.5pt;">
            <div style="font-weight: 900; color: #ec1313; margin-bottom: 4px; text-transform: uppercase;">${d.itemLabel} (${d.section})</div>
            <div style="font-style: italic; color: #475569; line-height: 1.4;">"${d.description}"</div>
            <div style="margin-top: 8px; font-size: 7pt; color: #94a3b8; font-weight: bold;">RECORDED: ${d.dateDetected}</div>
          </td>
          <td style="padding: 12px; border: 1pt solid #cbd5e1; text-align: center; font-weight: 900; font-size: 7.5pt; color: white; width: 90px;">
            <div style="background: ${severityColor}; padding: 4px; border-radius: 4px;">${d.severity.toUpperCase()}</div>
          </td>
          <td style="padding: 12px; border: 1pt solid #cbd5e1; text-align: center; font-weight: 900; font-size: 7.5pt; color: white; width: 95px;">
            <div style="background: ${statusColor}; padding: 4px; border-radius: 4px;">${d.status.toUpperCase()}</div>
          </td>
        </tr>
        ${d.photo ? `
        <tr>
          <td colspan="4" style="padding: 20px; border: 1pt solid #cbd5e1; background: #f1f5f9; text-align: center;">
            <div style="max-width: 500px; margin: 0 auto; background: white; padding: 10px; border-radius: 8px; border: 1pt solid #cbd5e1; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
               <img src="${d.photo}" style="max-height: 350px; max-width: 100%; object-fit: contain;" />
            </div>
            <div style="font-size: 7pt; font-weight: 900; color: #64748b; text-transform: uppercase; margin-top: 10px; letter-spacing: 1px;">FORENSIC EVIDENCE PHOTO #${idx+1}: ${d.itemLabel}</div>
          </td>
        </tr>
        ` : ''}
      `;
    });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.5; margin: 0; background: white; }
          .header-container { display: flex; justify-content: flex-start; align-items: center; border-bottom: 4pt solid #ec1313; padding-bottom: 20px; margin-bottom: 30px; }
          .logo-area { width: 140px; flex-shrink: 0; margin-right: 20px; }
          .title-area { flex: 1; text-align: right; }
          .main-title { font-size: 24pt; font-weight: 900; color: #ec1313; text-transform: uppercase; margin: 0; line-height: 1; }
          .sub-title { font-size: 9pt; font-weight: 800; color: #64748b; margin-top: 5px; letter-spacing: 2px; text-transform: uppercase; }
          
          .summary-box { width: 100%; border-collapse: collapse; margin-bottom: 35px; border-radius: 12px; overflow: hidden; }
          .summary-box td { padding: 12px 15px; border: 1pt solid #e2e8f0; font-size: 9.5pt; }
          .summary-box .label { font-weight: 900; color: #475569; width: 180px; text-transform: uppercase; font-size: 7.5pt; background: #f8fafc; }
          
          .table-header { background: #1e293b; color: white; text-transform: uppercase; font-size: 7.5pt; font-weight: 900; letter-spacing: 1px; }
          .defect-table { width: 100%; border-collapse: collapse; border: 1pt solid #cbd5e1; }
          .defect-table th { padding: 12px; text-align: left; }
          
          .footer { margin-top: 60px; border-top: 1pt solid #cbd5e1; padding-top: 25px; text-align: center; }
          .footer-text { font-size: 7.5pt; color: #94a3b8; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div class="logo-area">
            <img src="${BESTRO_LOGO_DATA_URI}" style="width: 100%; height: auto;" />
          </div>
          <div class="title-area">
            <h1 class="main-title">DEFICIENCY REGISTER</h1>
            <div class="sub-title">Audit Record: ${auditId}</div>
          </div>
        </div>

        <table class="summary-box">
          <tr><td class="label">Site / Facility Name</td><td style="font-weight: 900; font-size: 13pt; color: #1e293b;">${site}</td></tr>
          <tr><td class="label">Lead Technical Auditor</td><td style="font-weight: 700;">${tech.toUpperCase()}</td></tr>
          <tr><td class="label">Report Generation Date</td><td style="font-weight: 700;">${date}</td></tr>
          <tr><td class="label">Total Deficiencies Found</td><td style="font-weight: 900; color: #ec1313;">${defects.length} ACTIVE RECORDS</td></tr>
        </table>

        <div style="background: #ec1313; color: white; padding: 10px 15px; font-weight: 900; font-size: 10pt; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 0;">
          Operational Deficiencies Matrix
        </div>
        <table class="defect-table">
          <thead>
            <tr class="table-header">
              <th style="width: 130px;">System Module</th>
              <th>Description & Technical Remarks</th>
              <th style="text-align: center; width: 90px;">Severity</th>
              <th style="text-align: center; width: 95px;">Current Status</th>
            </tr>
          </thead>
          <tbody>
            ${defectRowsHtml || '<tr><td colspan="4" style="text-align: center; padding: 60px; font-style: italic; color: #64748b; font-weight: bold; font-size: 11pt;">ZERO DEFICIENCIES DETECTED IN CURRENT REGISTRY.</td></tr>'}
          </tbody>
        </table>

        <div class="footer">
          <div class="footer-text">
            © BESTRO ENGINEERING SDN BHD • CONFIDENTIAL TECHNICAL DOCUMENT
          </div>
          <div style="font-size: 6pt; color: #cbd5e1; margin-top: 5px;">This document is generated digitally and serves as an official engineering verification record.</div>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(fullHtml);
      printWin.document.close();
      setTimeout(() => {
        printWin.focus();
        printWin.print();
      }, 500);
    }
  };

  const onPhotoCaptured = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePhotoUid) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const defect = defects.find(d => d.uid === activePhotoUid);
      if (!defect) return;

      setDefects(prev => prev.map(d => d.uid === activePhotoUid ? { ...d, photo: base64 } : d));

      try {
        const raw = localStorage.getItem(defect.sourceKey);
        if (raw) {
          let sourceData = JSON.parse(raw);
          const sid = defect.sourceId;
          if (defect.sourceKey.includes('pump')) {
            if (sid === 'pump_Duty Pump') sourceData.dutyUnit.photo = base64;
            else if (sid === 'pump_Standby Pump') sourceData.standbyUnit.photo = base64;
            else if (sid === 'pump_Jockey Pump') sourceData.jockeyUnit.photo = base64;
            else if (sid === 'p_lamps') sourceData.panelLampsPhoto = base64;
            else if (sid === 'p_wiring') sourceData.panelWiringPhoto = base64;
          } else if (defect.sourceKey.includes('checklist')) {
            if (sid === 'batt') sourceData.panelSpecs.batteryPhoto = base64;
          } else if (sid.startsWith('item_')) {
            const sidParts = sid.split('_');
            const itemId = sidParts[1];
            const field = sidParts[2];
            const items = sourceData.items || [];
            sourceData.items = items.map((it: any) => {
              if (it.id === itemId) {
                if (it.photos) it.photos[field] = base64;
                else it.photo = base64;
              }
              return it;
            });
          }
          localStorage.setItem(defect.sourceKey, JSON.stringify(sourceData));
        }
      } catch (err) {}
    };
    reader.readAsDataURL(file);
  };

  const updateDefect = (uid: string, updates: Partial<DefectEntry>) => {
    const newTracker = { 
      ...tracker, 
      [uid]: { 
        status: updates.status !== undefined ? updates.status : tracker[uid]?.status || defects.find(d => d.uid === uid)?.status,
        severity: updates.severity !== undefined ? updates.severity : tracker[uid]?.severity || defects.find(d => d.uid === uid)?.severity
      } 
    };
    setTracker(newTracker);
    localStorage.setItem(`defect_registry_${auditId}`, JSON.stringify(newTracker));
    setDefects(prev => prev.map(d => d.uid === uid ? { ...d, ...updates } : d));
  };

  const filteredDefects = useMemo(() => {
    if (severityFilter === 'All') return defects;
    return defects.filter(d => d.severity === severityFilter);
  }, [defects, severityFilter]);

  const groupedDefects = useMemo(() => {
    const groups: Record<string, DefectEntry[]> = {};
    filteredDefects.forEach(d => { if (!groups[d.system]) groups[d.system] = []; groups[d.system].push(d); });
    return groups;
  }, [filteredDefects]);

  const stats = useMemo(() => {
    const total = defects.length;
    const rectified = defects.filter(d => d.status === 'Rectified').length;
    return { total, open: total - rectified, rectified, critical: defects.filter(d => d.severity === 'Critical').length, progress: total > 0 ? (rectified / total) * 100 : 100 };
  }, [defects]);

  const handleFinalizeClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (setupData) {
        const updatedSetup = { ...setupData, status: InspectionStatus.APPROVED };
        localStorage.setItem(`setup_${auditId}`, JSON.stringify(updatedSetup));
      }
      setIsClosing(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="Defect Registry" subtitle={`SYNC ID: ${auditId}`} showBack />
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={onPhotoCaptured} />

      <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="bg-surface-dark p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
           <div className="flex justify-between items-start mb-6">
              <div className="min-w-0">
                 <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Operational Deficiency Matrix</p>
                 <h1 className="text-2xl font-black italic uppercase text-white tracking-tight truncate">{setupData?.clientName || 'SITE AUDIT'}</h1>
              </div>
              <button 
                onClick={handleExportPDF}
                className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary active:scale-90 transition-all hover:bg-primary hover:text-white shrink-0 shadow-lg border border-primary/20"
                title="Export Defect PDF"
              >
                <span className="material-symbols-outlined text-2xl font-bold">picture_as_pdf</span>
              </button>
           </div>
           <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-background-dark/50 p-3 rounded-2xl flex flex-col items-center border border-white/5"><span className="text-xl font-black text-white">{stats.total}</span><span className="text-[7px] font-black uppercase text-text-muted">Faults</span></div>
              <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20 flex flex-col items-center"><span className="text-xl font-black text-primary">{stats.critical}</span><span className="text-[7px] font-black uppercase text-primary">Critical</span></div>
              <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 flex flex-col items-center"><span className="text-xl font-black text-emerald-500">{stats.rectified}</span><span className="text-[7px] font-black uppercase text-emerald-500">Fixed</span></div>
           </div>
           <div className="h-1.5 w-full bg-background-dark rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${stats.open === 0 ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${stats.progress}%` }} /></div>
        </div>

        {/* Severity Filter Bar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
           {(['All', 'Critical', 'Major', 'Minor'] as const).map(f => (
             <button 
               key={f} 
               onClick={() => setSeverityFilter(f)}
               className={`px-4 h-9 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0 border ${
                 severityFilter === f 
                   ? 'bg-primary border-primary text-white shadow-lg' 
                   : 'bg-surface-dark border-white/5 text-text-muted hover:text-white'
               }`}
             >
                {f}
             </button>
           ))}
        </div>

        {(Object.entries(groupedDefects) as [string, DefectEntry[]][]).map(([system, items]) => (
          <div key={system} className="flex flex-col gap-4">
             <div className="flex items-center gap-3 px-2">
                <div className="h-4 w-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(236,19,19,0.5)]" />
                <h3 className="text-[11px] font-black uppercase italic text-white tracking-widest">{system}</h3>
                <span className="h-[1px] flex-1 bg-white/5" />
             </div>
             <div className="flex flex-col gap-4">
                {items.map((defect) => (
                   <div key={defect.uid} className={`bg-surface-dark rounded-[2.5rem] border shadow-xl overflow-hidden group transition-all ${defect.status === 'Rectified' ? 'border-emerald-500/20' : 'border-white/5'}`}>
                      <div className="p-6">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col min-w-0 pr-4">
                               <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">{defect.section}</span>
                               <h4 className="text-sm font-bold uppercase text-white tracking-tight truncate">{defect.itemLabel}</h4>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                               <select 
                                 value={defect.status} 
                                 onChange={(e) => updateDefect(defect.uid, { status: e.target.value as any })} 
                                 className={`h-7 rounded-lg border-none text-[8px] font-black uppercase px-2 ${defect.status === 'Open' ? 'bg-primary text-white' : defect.status === 'Rectified' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`}
                               >
                                  <option value="Open">Open</option><option value="In Progress">In Progress</option><option value="Rectified">Rectified</option>
                               </select>
                               <select 
                                 value={defect.severity} 
                                 onChange={(e) => updateDefect(defect.uid, { severity: e.target.value as any })} 
                                 className={`h-7 rounded-lg border-none text-[8px] font-black uppercase px-2 ${defect.severity === 'Critical' ? 'bg-red-900/50 text-red-400 border border-red-500/30' : defect.severity === 'Major' ? 'bg-amber-900/50 text-amber-400 border border-amber-500/30' : 'bg-blue-900/50 text-blue-400 border border-blue-500/30'}`}
                               >
                                  <option value="Critical">Critical</option><option value="Major">Major</option><option value="Minor">Minor</option>
                               </select>
                            </div>
                         </div>
                         <div className="flex gap-4 mb-4">
                            <div className="w-20 h-20 bg-background-dark rounded-2xl border border-white/5 shrink-0 overflow-hidden flex items-center justify-center">
                               {defect.photo ? <img src={defect.photo} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-white/10">no_photography</span>}
                            </div>
                            <div className="flex-1 min-w-0"><p className={`text-[10px] italic leading-relaxed line-clamp-3 ${defect.status === 'Rectified' ? 'text-emerald-500/60 line-through' : 'text-text-muted'}`}>"{defect.description}"</p></div>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => navigate(defect.path)} className="flex-1 h-9 bg-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2">Source</button>
                            <button onClick={() => { setActivePhotoUid(defect.uid); fileInputRef.current?.click(); }} className="flex-1 h-9 bg-primary/10 border border-primary/20 rounded-xl text-[9px] font-black uppercase text-primary flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all">
                               <span className="material-symbols-outlined text-xs">add_a_photo</span>
                               <span>{defect.photo ? 'Retake' : 'Attach'}</span>
                            </button>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        ))}
        {filteredDefects.length === 0 && !isLoading && (
          <div className="py-20 flex flex-col items-center justify-center opacity-20 grayscale">
             <span className="material-symbols-outlined text-7xl">rule</span>
             <p className="text-xs font-black uppercase tracking-[0.4em] mt-4">No {severityFilter !== 'All' ? severityFilter : ''} Deficiencies Found</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-background-dark/95 backdrop-blur-xl border-t border-white/5 p-6 pb-12 z-50 flex flex-col gap-3">
        {stats.open === 0 && (
          <button onClick={handleFinalizeClose} disabled={isClosing} className="w-full h-14 bg-emerald-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-lg flex items-center justify-center gap-3">
            {isClosing ? 'Closing Dossier...' : 'Approve & Close Audit'}
          </button>
        )}
        <button onClick={() => navigate(`/checklist/${auditId}`)} className="w-full h-12 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl flex items-center justify-center gap-3">Return to Hub</button>
      </div>
    </div>
  );
};

export default DefectReport;
