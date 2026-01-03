
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopBar from '../components/TopBar';

const SubmissionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [setupData, setSetupData] = useState<any>(null);
  const [fullReportData, setFullReportData] = useState<any>({});
  const auditId = location.state?.auditId || 'NEW-AUDIT';

  const DEFECT_TERMS = ['Defective', 'Fault', 'Faulty', 'Damaged', 'Failed', 'Low', 'Broken', 'Leaking', 'Corroded', 'Loose', 'Blocked', 'Blown', 'Expired', 'High', 'Abnormal', 'Missing'];

  const BESTRO_LOGO_DATA_URI = `data:image/svg+xml;base64,${btoa(`
    <svg viewBox="0 0 450 250" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="225" cy="110" rx="200" ry="100" fill="#ec1313" />
      <text x="50%" y="120" text-anchor="middle" fill="white" style="font: bold 75px Arial, sans-serif; letter-spacing: -2px;">BESTRO</text>
      <text x="50%" y="165" text-anchor="middle" fill="white" style="font: 900 24px Arial, sans-serif; letter-spacing: 8px;">ENGINEERING</text>
      <text x="50%" y="235" text-anchor="middle" fill="#333" style="font: italic bold 26px serif;">Connect &amp; Protect</text>
    </svg>
  `)}`;

  const FIRE_EXT_BG_DATA_URI = `data:image/svg+xml;base64,${btoa(`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" opacity="0.05">
      <path d="M70,30 V25 A5,5 0 0,0 65,20 H35 A5,5 0 0,0 30,25 V30 H25 V85 A5,5 0 0,0 30,90 H70 A5,5 0 0,0 75,85 V30 H70 Z M50,45 A10,10 0 1,1 50,65 A10,10 0 0,1 50,45 M35,10 H65 V15 H35 V10 Z" fill="#ec1313"/>
      <path d="M75,35 L85,25 L88,28 L78,38 Z" fill="#ec1313"/>
    </svg>
  `)}`;

  useEffect(() => {
    const fetchAllData = () => {
      const keys = {
        'Main Fire Alarm System': `checklist_${auditId}`,
        'Gas Suppression System': `gas_suppression_${auditId}`,
        'Hose Reel Pump': `pump_hosereel_${auditId}`,
        'Wet Riser Pump': `pump_wetriser_${auditId}`,
        'Hydrant Pump': `pump_hydrant_${auditId}`,
        'Sprinkler Pump': `pump_sprinkler_${auditId}`,
        'Hose Reel Assets': `equip_hosereel_${auditId}`,
        'Hydrant Assets': `equip_hydrant_${auditId}`,
        'Wet Riser Assets': `equip_wetriser_${auditId}`,
        'Dry Riser Assets': `equip_dryriser_${auditId}`,
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

  const getStatusStyle = (status: any) => {
    if (!status) return 'color: #64748b; font-weight: bold;';
    const s = String(status).toLowerCase();
    const okTerms = ['normal', 'good', 'functional', 'ok', 'valid', 'secure', 'intact', 'clean', 'maintained', 'full', 'active', 'ready'];
    if (okTerms.includes(s)) return 'color: #059669; font-weight: 900; background: #f0fdf4;'; 
    if (DEFECT_TERMS.some(t => s.includes(t.toLowerCase()))) return 'color: #dc2626; font-weight: 900; background: #fef2f2;'; 
    return 'color: #1e293b; font-weight: bold;'; 
  };

  const renderImg = (photoUrl: string | undefined, caption: string, isSmall = false) => {
    if (!photoUrl || !photoUrl.startsWith('data:')) return '';
    const height = isSmall ? '120px' : '180px';
    return `
      <tr>
        <td colspan="6" align="center" style="background-color: #f8fafc; padding: 10px; border: 1pt solid #cbd5e1;">
          <div style="width: 100%; height: ${height}; display: flex; align-items: center; justify-content: center; background: #e2e8f0; border-radius: 4px; overflow: hidden; border: 1pt solid #cbd5e1;">
            <img src="${photoUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
          </div>
          <div style="font-size: 6.5pt; font-weight: 900; color: #64748b; text-transform: uppercase; margin-top: 5px;">${caption}</div>
        </td>
      </tr>
    `;
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    const site = setupData?.clientName?.toUpperCase() || 'N/A';
    const date = setupData?.date || 'N/A';
    const tech = setupData?.techName || 'N/A';
    const cycle = setupData?.frequency || 'Monthly';

    const renderImageGrid = (photos: string[]) => {
      let gridHtml = '';
      const validPhotos = photos.filter(p => p && p.startsWith('data:'));
      if (validPhotos.length === 0) return '';
      for (let i = 0; i < validPhotos.length; i += 2) {
        const p1 = validPhotos[i];
        const p2 = validPhotos[i + 1];
        gridHtml += `
          <tr>
            <td colspan="3" align="center" style="background-color: #f8fafc; padding: 10px; border: 1pt solid #cbd5e1;">
              <div style="width: 100%; height: 160px; display: flex; align-items: center; justify-content: center; background: #e2e8f0; border: 1pt solid #cbd5e1;">
                <img src="${p1}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
              </div>
              <div style="font-size: 6.5pt; font-weight: bold; color: #94a3b8; margin-top: 4px;">Service Photo #${i+1}</div>
            </td>
            <td colspan="3" align="center" style="background-color: #f8fafc; padding: 10px; border: 1pt solid #cbd5e1;">
              ${p2 ? `
                <div style="width: 100%; height: 160px; display: flex; align-items: center; justify-content: center; background: #e2e8f0; border: 1pt solid #cbd5e1;">
                  <img src="${p2}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
                </div>
                <div style="font-size: 6.5pt; font-weight: bold; color: #94a3b8; margin-top: 4px;">Service Photo #${i+2}</div>
              ` : ''}
            </td>
          </tr>
        `;
      }
      return gridHtml;
    };

    let reportSections = '';
    let faultSummaryRows = '';
    let inventorySectionHtml = '';

    const addFaultRow = (label: string, section: string, item: string, desc: string, status: string, photo?: string) => {
      faultSummaryRows += `
        <tr>
          <td style="font-weight:900; font-size:7pt; color:#ec1313; border: 1pt solid #cbd5e1;">${label.toUpperCase()}</td>
          <td style="font-weight:bold; font-size:7pt; border: 1pt solid #cbd5e1;">${section}</td>
          <td style="font-weight:black; font-size:8pt; border: 1pt solid #cbd5e1;">${item}</td>
          <td style="font-style:italic; font-size:8pt; border: 1pt solid #cbd5e1;">${desc || 'Fault detected.'}</td>
          <td style="${getStatusStyle(status)}; border: 1pt solid #cbd5e1; text-align:center;">${status}</td>
        </tr>
        ${photo ? renderImg(photo, `Fault Proof: ${item}`, true) : ''}
      `;
    };

    Object.entries(fullReportData).forEach(([label, data]: [string, any]) => {
      if (!data) return;

      // --- 1. INVENTORY MAPPING ---
      let systemInventoryRows = '';
      if (label.includes('Main Fire Alarm')) {
        data.zones?.forEach((z: any) => {
          const counts = [`Smoke: ${z.smokeQty||0}`, `Heat: ${z.heatQty||0}`, `Bell: ${z.bellQty||0}`, `BG: ${z.breakglassQty||0}`];
          systemInventoryRows += `<tr><td style="font-weight:bold; border:1pt solid #cbd5e1;">${z.name} (Zone ${z.zoneNo})</td><td colspan="5" style="border:1pt solid #cbd5e1;">${counts.join(' | ')}</td></tr>`;
        });
      } else if (label.includes('Gas Suppression')) {
        const gasSys = Array.isArray(data) ? data : [data];
        gasSys.forEach((s: any) => {
          const counts = [`Smoke: ${s.smokeQty||0}`, `Heat: ${s.heatQty||0}`, `Bell: ${s.bellQty||0}`, `Flash: ${s.flashingLightQty||0}`];
          systemInventoryRows += `<tr><td style="font-weight:bold; border:1pt solid #cbd5e1;">${s.zoneName || 'Server Room'}</td><td colspan="5" style="border:1pt solid #cbd5e1;">${counts.join(' | ')}</td></tr>`;
        });
      } else if (label.includes('Pump')) {
        const units = [];
        if (data.jockeyUnit) units.push('Jockey Pump');
        if (data.dutyUnit) units.push('Duty Pump');
        if (data.standbyUnit) units.push('Standby Pump');
        systemInventoryRows += `<tr><td style="font-weight:bold; border:1pt solid #cbd5e1;">${data.location || 'Pump Room'}</td><td colspan="5" style="border:1pt solid #cbd5e1;">${units.join(' | ')}</td></tr>`;
      } else {
        const items = Array.isArray(data) ? data : (data.items || []);
        const locMap: Record<string, Record<string, number>> = {};
        items.forEach((item: any) => {
          const loc = item.location || 'Unspecified';
          const type = item.type || item.brand || label.replace(' Assets', '');
          if (!locMap[loc]) locMap[loc] = {};
          locMap[loc][type] = (locMap[loc][type] || 0) + 1;
        });
        Object.entries(locMap).forEach(([loc, types]) => {
          const counts = Object.entries(types).map(([t, c]) => `${t}: ${c}`);
          systemInventoryRows += `<tr><td style="font-weight:bold; border:1pt solid #cbd5e1;">${loc}</td><td colspan="5" style="border:1pt solid #cbd5e1;">${counts.join(' | ')}</td></tr>`;
        });
      }
      if (systemInventoryRows) {
        inventorySectionHtml += `<tr style="background:#f1f5f9;"><td colspan="6" style="font-weight:900; font-size:7.5pt; color:#1e293b; padding:8px; border:1.5pt solid #000;">${label.toUpperCase()}</td></tr>${systemInventoryRows}`;
      }

      // --- 2. TECHNICAL DETAIL PROCESSING ---
      let tableRows = `<tr class="page-break"><td colspan="6" class="section-header" style="background:#ec1313; text-align:center; padding:12px;">SYSTEM TECHNICAL CHECK SHEET: ${label}</td></tr>`;
      
      // Header Info with technical description
      tableRows += `<tr style="background:#f8fafc;"><td class="label">OVERALL STATUS</td><td style="${getStatusStyle(data.systemOverallStatus || 'Normal')}">${data.systemOverallStatus || 'Normal'}</td><td class="label">TECHNICAL DESCRIPTION</td><td colspan="3" style="font-size:7.5pt; font-style:italic;">${data.systemDescription || 'As per field log.'}</td></tr>`;

      if (label.includes('Main Fire Alarm')) {
        tableRows += `<tr><td colspan="6" class="section-header" style="background:#475569; font-size:7.5pt;">PART I: PANEL HARDWARE & POWER</td></tr>`;
        tableRows += `<tr><td class="label">MODEL</td><td>${data.panelSpecs?.model}</td><td class="label">TOTAL ZONES</td><td>${data.panelSpecs?.totalZones}</td><td class="label">LOCATION</td><td>${data.panelSpecs?.location}</td></tr>`;
        tableRows += `<tr><td class="label">BATT VOLT</td><td style="${getStatusStyle(data.panelSpecs?.batteryVolt)}">${data.panelSpecs?.batteryVolt}V</td><td class="label">CHARGER</td><td style="${getStatusStyle(data.panelSpecs?.chargerVolt)}">${data.panelSpecs?.chargerVolt}V</td><td class="label">BATT STATUS</td><td style="${getStatusStyle(data.panelSpecs?.batteryStatus)}">${data.panelSpecs?.batteryStatus}</td></tr>`;
        if (data.panelSpecs?.batteryPhoto) tableRows += renderImg(data.panelSpecs.batteryPhoto, 'Standby Battery Proof', true);
        
        if (DEFECT_TERMS.some(t => String(data.panelSpecs?.batteryStatus).includes(t))) addFaultRow(label, 'Panel', 'Battery', data.panelSpecs.batteryRemarks, data.panelSpecs.batteryStatus, data.panelSpecs.batteryPhoto);
        
        if (data.indicators) {
           tableRows += `<tr><td colspan="6" class="section-header" style="background:#1e293b; font-size:7.5pt;">PART II: INTEGRATION SIGNALS</td></tr>`;
           data.indicators.forEach((ind: any) => {
              tableRows += `<tr><td class="label">${ind.category}</td><td colspan="3">${ind.label}</td><td class="label">STATUS</td><td style="${getStatusStyle(ind.status)}">${ind.status}</td></tr>`;
              if (DEFECT_TERMS.some(t => String(ind.status).includes(t))) {
                addFaultRow(label, 'Signal', ind.label, ind.remarks, ind.status, ind.photo);
                if (ind.photo) tableRows += renderImg(ind.photo, `${ind.label} Fault`, true);
              }
           });
        }
        
        if (data.zones) {
           tableRows += `<tr><td colspan="6" class="section-header" style="background:#1e293b; font-size:7.5pt;">PART III: ZONE REGISTRY</td></tr>`;
           data.zones.forEach((z: any) => {
              tableRows += `<tr><td class="label">ZONE ${z.zoneNo}</td><td>${z.name}</td><td class="label">STATUS</td><td style="${getStatusStyle(z.status)}">${z.status}</td><td class="label">DEVICES</td><td>S:${z.smokeQty} H:${z.heatQty} B:${z.bellQty} BG:${z.breakglassQty}</td></tr>`;
              if (DEFECT_TERMS.some(t => String(z.status).includes(t))) {
                addFaultRow(label, `Zone ${z.zoneNo}`, z.name, z.remarks, z.status, z.photo);
                if (z.photo) tableRows += renderImg(z.photo, `Zone ${z.zoneNo} Defect`, true);
              }
           });
        }
      } 
      else if (label.includes('Gas Suppression')) {
        const gasSys = Array.isArray(data) ? data : [data];
        gasSys.forEach((s: any) => {
          tableRows += `<tr><td colspan="6" class="section-header" style="background:#475569; font-size:7.5pt;">GAS UNIT: ${s.zoneName}</td></tr>`;
          tableRows += `<tr><td class="label">VOLT</td><td>${s.batteryVolt}V</td><td class="label">CHG</td><td>${s.chargerVolt}V</td><td class="label">TIMER</td><td>${s.dischargeTimer}</td></tr>`;
          if (s.integrationItems) {
            s.integrationItems.forEach((i: any) => {
               tableRows += `<tr><td class="label">LOGIC</td><td colspan="3">${i.label}</td><td class="label">STATUS</td><td style="${getStatusStyle(i.status)}">${i.status}</td></tr>`;
               if (DEFECT_TERMS.some(t => String(i.status).includes(t))) {
                  addFaultRow(label, s.zoneName, i.label, i.remarks, i.status, i.photo);
                  if (i.photo) tableRows += renderImg(i.photo, `${i.label} Proof`, true);
               }
            });
          }
          if (s.servicePhotos) tableRows += renderImageGrid(s.servicePhotos);
        });
      }
      else if (label.includes('Pump')) {
        tableRows += `<tr><td class="label">LOCATION</td><td colspan="2" style="font-weight:900;">${data.location || 'Pump Room'}</td><td class="label">HEADER PRES.</td><td colspan="2" style="font-size:12pt; font-weight:900; color:#059669;">${data.headerPressure} BAR</td></tr>`;
        const units = [{ n: 'JOCKEY', u: data.jockeyUnit }, { n: 'DUTY', u: data.dutyUnit }, { n: 'STANDBY', u: data.standbyUnit }].filter(x => x.u);

        units.forEach(p => {
          tableRows += `<tr><td colspan="6" class="section-header" style="background:#475569; font-size:7.5pt;">${p.n} PUMP (${p.u.type})</td></tr>`;
          tableRows += `<tr><td class="label">MODE</td><td>${p.u.mode}</td><td class="label">STATUS</td><td style="${getStatusStyle(p.u.status)}">${p.u.status}</td><td class="label">${p.u.type === 'Electric' ? 'AMP' : 'FUEL'}</td><td style="font-weight:900;">${p.u.loadValue}${p.u.type === 'Electric' ? 'A' : '%'}</td></tr>`;
          tableRows += `<tr><td class="label">CUT-IN</td><td>${p.u.cutIn} BAR</td><td class="label">CUT-OUT</td><td>${p.u.cutOut} BAR</td><td class="label">REMARKS</td><td style="font-size:7pt;">${p.u.remarks || 'Normal'}</td></tr>`;
          if (p.u.photo) tableRows += renderImg(p.u.photo, `${p.n} Pump Proof`, true);
          if (DEFECT_TERMS.some(t => String(p.u.status).includes(t))) {
            addFaultRow(label, 'Mechanical', `${p.n} Pump`, p.u.remarks, p.u.status, p.u.photo);
          }
        });

        tableRows += `<tr><td colspan="6" class="section-header" style="background:#1e293b; font-size:7.5pt;">PUMP CONTROL PANEL INTEGRITY</td></tr>`;
        tableRows += `<tr><td class="label">INCOMING</td><td style="font-weight:bold;">${data.panelIncomingVolt}V</td><td class="label">LAMPS</td><td style="${getStatusStyle(data.panelLampsStatus)}">${data.panelLampsStatus}</td><td class="label">WIRING</td><td style="${getStatusStyle(data.panelWiringStatus)}">${data.panelWiringStatus}</td></tr>`;
        
        if (data.panelLampsStatus === 'Fault') {
          addFaultRow(label, 'Panel', 'Indication Lamps', data.panelLampsRemarks, 'Fault', data.panelLampsPhoto);
          tableRows += renderImg(data.panelLampsPhoto, 'Lamp Fault Proof', true);
        }
        if (data.panelWiringStatus === 'Fault') {
          addFaultRow(label, 'Panel', 'Internal Wiring', data.panelWiringRemarks, 'Fault', data.panelWiringPhoto);
          tableRows += renderImg(data.panelWiringPhoto, 'Wiring Fault Proof', true);
        }
        if (data.selectorSwitchStatus === 'Fault') {
          addFaultRow(label, 'Panel', 'Selector Switch', data.selectorSwitchRemarks, 'Fault', data.selectorSwitchPhoto);
          tableRows += renderImg(data.selectorSwitchPhoto, 'Switch Fault Proof', true);
        }
      }
      else {
        const items = Array.isArray(data) ? data : (data.items || []);
        items.forEach((item: any, idx: number) => {
          const itemName = item.serial || item.brand || item.location || `UNIT #${idx+1}`;
          tableRows += `<tr><td colspan="6" class="section-header" style="background:#475569; font-size:7.5pt;">ASSET UNIT: ${itemName.toUpperCase()}</td></tr>`;
          
          const details = Object.entries(item).filter(([k]) => !['id', 'photos', 'remarks', 'location', 'serial', 'brand', 'type', 'mfgMonth', 'mfgYear', 'weight', 'bombaCertExpiry'].includes(k));
          for (let i = 0; i < details.length; i += 3) {
            tableRows += `<tr>`;
            for (let j = 0; j < 3; j++) {
              if (details[i + j]) {
                const k = details[i+j][0].replace('Status', '').replace(/([A-Z])/g, ' $1').toUpperCase();
                tableRows += `<td class="label">${k}</td><td style="${getStatusStyle(details[i+j][1])}">${details[i+j][1]}</td>`;
              } else tableRows += `<td colspan="2"></td>`;
            }
            tableRows += `</tr>`;
          }

          if (item.remarks && typeof item.remarks === 'object') {
            Object.entries(item.remarks).forEach(([key, msg]) => {
              if (msg && DEFECT_TERMS.some(t => String(msg).toLowerCase().includes(t.toLowerCase()))) {
                const faultPhoto = item.photos?.[key];
                const faultLabel = key.replace('Status', '').replace('Outcome', '').toUpperCase();
                addFaultRow(label, 'Inventory', `${itemName} (${faultLabel})`, String(msg), 'FAULT', faultPhoto);
                if (faultPhoto) tableRows += renderImg(faultPhoto, `Defect: ${itemName} (${faultLabel})`, true);
              }
            });
          }
        });
      }

      if (data.overallRemarks || (data.servicePhotos && data.servicePhotos.some((p:string) => p))) {
        tableRows += `<tr><td colspan="6" class="section-header" style="background:#1e293b; font-size:7.5pt; text-align:center;">SERVICE COMPLETION PROOF</td></tr>`;
        if (data.overallRemarks) tableRows += `<tr><td class="label">SUMMARY REMARKS</td><td colspan="5" style="font-size:7.5pt; padding:10px; font-style:italic;">"${data.overallRemarks}"</td></tr>`;
        if (data.servicePhotos) tableRows += renderImageGrid(data.servicePhotos);
      }
      reportSections += `<table class="main-table">${tableRows}</table>`;
    });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>BESTRO OS - Service Maintenance Report ${auditId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          @page { size: A4; margin: 10mm; }
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #1e293b; background: #ffffff; -webkit-print-color-adjust: exact; }
          .a4-container { width: 210mm; margin: 0 auto; background: white; padding: 15mm; box-sizing: border-box; }
          .main-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; border: 1.5pt solid #000; table-layout: fixed; }
          .main-table td { padding: 6px; border: 1pt solid #cbd5e1; font-size: 7.5pt; vertical-align: middle; word-wrap: break-word; }
          .label { background: #f1f5f9; font-weight: 900; font-size: 6pt; text-transform: uppercase; color: #475569; width: 85px; }
          .section-header { background: #1e293b; color: white; padding: 8px; font-weight: 900; font-size: 8pt; text-transform: uppercase; border: 1pt solid #000; }
          .company-header-container { display: flex; justify-content: flex-start; align-items: center; border-bottom: 2.5pt solid #ec1313; padding-bottom: 12px; margin-bottom: 25px; position: relative; z-index: 10; }
          .header-text-area { flex: 1; text-align: center; }
          .company-name { font-size: 20pt; font-weight: 900; color: #ec1313; margin: 0; }
          .company-address { font-size: 7.5pt; font-weight: 600; color: #1e293b; margin: 3px 0; }
          .cover-page { border: 10pt solid #ec1313; padding: 40px; height: 260mm; box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; text-align:center; position: relative; overflow: hidden; }
          .cover-bg-logo { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 450px; height: 450px; z-index: 1; opacity: 1; pointer-events: none; }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <div class="a4-container">
          <div class="cover-page">
             <img src="${FIRE_EXT_BG_DATA_URI}" class="cover-bg-logo" />
             <div style="position: relative; z-index: 10;">
                <div class="company-header-container">
                   <div style="width: 160px; flex-shrink: 0; margin-right: 20px;">
                      <img src="${BESTRO_LOGO_DATA_URI}" style="width: 100%; height: auto; display: block;" />
                   </div>
                   <div class="header-text-area">
                     <div class="company-name">BESTRO ENG SDN BHD</div>
                     <div class="company-address">NO. 26, JALAN URANUS AK U5/AK, TAMAN SUBANG IMPIAN, 40150 SHAH ALAM, SELANGOR DARUL EHSAN</div>
                   </div>
                   <div style="width:130px; flex-shrink: 0; text-align: right;">${setupData?.clientLogo ? `<img src="${setupData.clientLogo}" style="max-height:55px; max-width:110px; object-fit:contain;" />` : ''}</div>
                </div>
                <h1 style="font-size:30pt; font-weight:900; margin: 35px 0 8px 0;">SERVICE MAINTENANCE REPORT</h1>
                <p style="text-transform:uppercase; font-weight:900; color:#ec1313; letter-spacing:4px; font-size:10pt;">Engineering Excellence • Since 2008</p>
             </div>
             <div style="flex:1; display:flex; align-items:center; justify-content:center; position: relative; z-index: 10;">
                <table style="width:100%; border:2.5pt solid #000; border-collapse:collapse; background: rgba(255,255,255,0.85);">
                   <tr><td style="padding:15px; font-weight:900; background:#f8fafc; border:1pt solid #000; width:30%;">SITE NAME</td><td style="padding:15px; font-weight:900; font-size:16pt; border:1pt solid #000;">${site}</td></tr>
                   <tr><td style="padding:15px; font-weight:900; background:#f8fafc; border:1pt solid #000;">REPORT REF</td><td style="padding:15px; font-weight:900; color:#ec1313; border:1pt solid #000;">${auditId}</td></tr>
                   <tr><td style="padding:15px; font-weight:900; background:#f8fafc; border:1pt solid #000;">SERVICE CYCLE</td><td style="padding:15px; font-weight:900; border:1pt solid #000;">${cycle} Assessment</td></tr>
                   <tr><td style="padding:15px; font-weight:900; background:#f8fafc; border:1pt solid #000;">REPORT DATE</td><td style="padding:15px; font-weight:bold; border:1pt solid #000;">${date}</td></tr>
                   <tr><td style="padding:15px; font-weight:900; background:#f8fafc; border:1pt solid #000;">LEAD AUDITOR</td><td style="padding:15px; font-weight:bold; border:1pt solid #000;">${tech.toUpperCase()}</td></tr>
                </table>
             </div>
             <div style="font-size:7.5pt; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:2px; position: relative; z-index: 10;">OFFICIAL ENGINEERING VERIFICATION RECORD</div>
          </div>

          <div style="padding-top:20px;">
             <h2 style="border-bottom:2.5pt solid #ec1313; padding-bottom:8px; font-weight:900; font-size:13pt;">I. DEFICIENCY SUMMARY</h2>
             <table class="main-table">
                <tr style="background:#1e293b; color:white;">
                   <th style="padding:8px; font-size:7pt; border:1pt solid #000; width:20%;">SYSTEM</th>
                   <th style="padding:8px; font-size:7pt; border:1pt solid #000; width:15%;">SECTION</th>
                   <th style="padding:8px; font-size:7pt; border:1pt solid #000; width:20%;">UNIT/PART</th>
                   <th style="padding:8px; font-size:7pt; border:1pt solid #000;">FAULT DESCRIPTION</th>
                   <th style="padding:8px; font-size:7pt; border:1pt solid #000; width:12%;">STATUS</th>
                </tr>
                ${faultSummaryRows || '<tr><td colspan="5" style="text-align:center; padding:35px; color:#059669; font-weight:bold; font-size:9pt; font-style:italic; line-height:1.5;">Based on the inspection conducted, all fire protection systems were found to be functional and compliant with the required standards.</td></tr>'}
             </table>

             <h2 style="border-bottom:2.5pt solid #ec1313; padding-bottom:8px; font-weight:900; margin-top:35px; font-size:13pt;">II. ASSET INVENTORY CENSUS</h2>
             <table class="main-table">${inventorySectionHtml || '<tr><td style="padding:15px; text-align:center;">No assets recorded in registry.</td></tr>'}</table>

             <h2 style="border-bottom:2.5pt solid #ec1313; padding-bottom:8px; font-weight:900; margin-top:35px; font-size:13pt;">III. FULL TECHNICAL LOGS</h2>
             ${reportSections}

             <div style="margin-top:50px; border:1.5pt solid #000; padding:25px; background:#f8fafc;">
                <h3 style="font-weight:900; text-transform:uppercase; border-bottom:1pt solid #000; padding-bottom:8px; font-size:10pt;">Final Certification</h3>
                <div style="display:flex; justify-content:space-between; margin-top:50px;">
                   <div style="text-align:center; width:40%;">${setupData?.techSigData ? `<img src="${setupData.techSigData}" style="max-height:75px;" />` : '<div style="height:75px;"></div>'}<div style="border-top:1pt solid #000; font-weight:900; font-size:7pt; padding-top:5px;">LEAD AUDITOR SIGN-OFF</div><div style="font-size:7pt;">${tech.toUpperCase()}</div></div>
                   <div style="text-align:center; width:40%;">${setupData?.clientSigData ? `<img src="${setupData.clientSigData}" style="max-height:75px;" />` : '<div style="height:75px;"></div>'}<div style="border-top:1pt solid #000; font-weight:900; font-size:7pt; padding-top:5px;">CLIENT AUTHORIZATION</div><div style="font-size:7pt;">${setupData?.clientRepName?.toUpperCase() || 'N/A'}</div></div>
                </div>
             </div>
          </div>
        </div>
      </body>
      </html>
    `;

    if (type === 'excel') {
      const boundary = "----=_Part_Boundary_" + Date.now();
      let mhtml = `MIME-Version: 1.0\nContent-Type: multipart/related; boundary="${boundary}"\n\n--${boundary}\nContent-Type: text/html; charset="UTF-8"\nContent-Transfer-Encoding: base64\n\n${btoa(unescape(encodeURIComponent(fullHtml)))}\n\n`;
      mhtml += `--${boundary}--`;
      const blob = new Blob([mhtml], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `BESTRO_SERVICE_REPORT_${auditId}.xls`);
      link.click();
    } else {
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(fullHtml);
        printWin.document.close();
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#181111] overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.05] no-print" style={{ backgroundImage: 'radial-gradient(#ec1313 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <TopBar title="Technical Finalization" showBack onBack={() => navigate('/')} />
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-10 relative z-10 no-print">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-primary rounded-[35px] flex items-center justify-center shadow-[0_0_50px_rgba(236,19,19,0.4)] animate-bounce"><span className="material-symbols-outlined text-white text-6xl">verified</span></div>
          <div className="text-center"><h1 className="text-3xl font-black italic uppercase text-white tracking-tight">Technical Data Locked</h1><p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-2">Dossier Sequence: {auditId}</p></div>
        </div>
        <div className="flex flex-col gap-4 w-full max-w-sm pb-10">
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleExport('pdf')} className="bg-surface-dark border border-white/10 h-32 rounded-[35px] flex flex-col items-center justify-center gap-3 text-white transition-all active:scale-95 group shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -mr-8 -mt-8" />
               <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors shadow-inner"><span className="material-symbols-outlined text-primary group-hover:text-white text-3xl">picture_as_pdf</span></div>
               <span className="text-[10px] font-black uppercase tracking-widest">Full Technical PDF</span>
            </button>
            <button onClick={() => handleExport('excel')} className="bg-surface-dark border border-emerald-600/30 h-32 rounded-[35px] flex flex-col items-center justify-center gap-3 text-white transition-all active:scale-95 group shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-600/5 rounded-full -mr-8 -mt-8" />
               <div className="w-12 h-12 bg-emerald-600/20 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors shadow-inner"><span className="material-symbols-outlined text-emerald-600 group-hover:text-white text-3xl">table_view</span></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Master Data XLS</span>
            </button>
          </div>
          <button onClick={() => navigate('/')} className="w-full bg-white text-black h-16 rounded-[2rem] flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.1)] active:scale-95 font-black uppercase tracking-[0.2em] text-xs mt-2 border-b-4 border-slate-300">
             <span>Return to Terminal</span>
             <span className="material-symbols-outlined">terminal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionSuccess;
