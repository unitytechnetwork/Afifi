
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
            if (parsed) {
               if (parsed.isNA) return; 
               aggregated[label] = parsed;
            }
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

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace('Status', '')
      .replace('Outcome', '')
      .replace('mfg', 'MFG')
      .toUpperCase()
      .trim();
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    const site = setupData?.clientName?.toUpperCase() || 'N/A';
    const date = setupData?.date || 'N/A';
    const tech = setupData?.techName || 'N/A';
    const cycle = setupData?.frequency || 'N/A';
    
    // Sign-off data
    const clientRep = setupData?.clientRepName || 'N/A';
    const clientAuthDate = setupData?.clientAuthDate || date;
    const clientSig = setupData?.clientSigData;
    const techSig = setupData?.techSigData;

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

    Object.entries(fullReportData).forEach(([label, systemData]: [string, any]) => {
      if (!systemData) return;

      const isPump = label.includes('Pump');
      const isGas = label.includes('Gas');
      const isFireAlarm = label.includes('Fire Alarm');

      if (isFireAlarm) {
        const panels = Array.isArray(systemData) ? systemData : [systemData];
        panels.forEach((unit: any, unitIdx: number) => {
          const unitName = unit.systemName || `PANEL #${unitIdx + 1}`;
          let tableRows = `<tr class="page-break"><td colspan="6" class="section-header" style="background:#ec1313; text-align:center; padding:20px; font-size:16pt !important; border: 2pt solid #000;">SYSTEM TECHNICAL CHECK SHEET: ${label.toUpperCase()} (${unitName.toUpperCase()})</td></tr>`;
          tableRows += `<tr style="background:#f8fafc;"><td class="label">OVERALL STATUS</td><td style="${getStatusStyle(unit.systemOverallStatus || 'Normal')}">${unit.systemOverallStatus || 'Normal'}</td><td class="label">TECHNICAL DESCRIPTION</td><td colspan="3" style="font-size:7.5pt; font-style:italic;">${unit.systemDescription || 'Standard maintenance verify.'}</td></tr>`;
          
          const specs = unit.panelSpecs || {};
          tableRows += `<tr><td colspan="6" class="section-header" style="background:#475569; font-size:7.5pt;">PART I: PANEL HARDWARE & POWER</td></tr>`;
          tableRows += `<tr><td class="label">MODEL</td><td>${specs.model}</td><td class="label">TOTAL ZONES</td><td>${specs.totalZones}</td><td class="label">LOCATION</td><td>${specs.location}</td></tr>`;
          tableRows += `<tr><td class="label">BATT VOLT</td><td style="${getStatusStyle(specs.batteryVolt)}">${specs.batteryVolt}V</td><td class="label">CHARGER</td><td style="${getStatusStyle(specs.chargerVolt)}">${specs.chargerVolt}V</td><td class="label">BATT STATUS</td><td style="${getStatusStyle(specs.batteryStatus)}">${specs.batteryStatus}</td></tr>`;
          if (specs.batteryPhoto) tableRows += renderImg(specs.batteryPhoto, 'Standby Battery Proof', true);
          
          if (unit.indicators) {
             tableRows += `<tr><td colspan="6" class="section-header" style="background:#1e293b; font-size:7.5pt;">PART II: INTEGRATION SIGNALS</td></tr>`;
             unit.indicators.forEach((ind: any) => {
                tableRows += `<tr><td class="label">${ind.category}</td><td colspan="3">${ind.label}</td><td class="label">STATUS</td><td style="${getStatusStyle(ind.status)}">${ind.status}</td></tr>`;
             });
          }
          if (unit.zones) {
             tableRows += `<tr><td colspan="6" class="section-header" style="background:#1e293b; font-size:7.5pt;">PART III: ZONE REGISTRY</td></tr>`;
             unit.zones.forEach((z: any) => {
                tableRows += `<tr><td class="label">ZONE ${z.zoneNo}</td><td>${z.name}</td><td class="label">STATUS</td><td style="${getStatusStyle(z.status)}">${z.status}</td><td class="label">DEVICES</td><td>S:${z.smokeQty} H:${z.heatQty} B:${z.bellQty} BG:${z.breakglassQty}</td></tr>`;
             });
          }
          if (unit.overallRemarks) tableRows += `<tr><td class="label">SUMMARY</td><td colspan="5" style="font-size:7.5pt; padding:10px;">${unit.overallRemarks}</td></tr>`;
          if (unit.servicePhotos) tableRows += renderImageGrid(unit.servicePhotos);
          reportSections += `<table class="main-table">${tableRows}</table>`;
        });
      } 
      else if (isGas) {
        const gasUnits = Array.isArray(systemData) ? systemData : [systemData];
        gasUnits.forEach((unit: any) => {
          let tableRows = `<tr class="page-break"><td colspan="6" class="section-header" style="background:#ec1313; text-align:center; padding:20px; font-size:16pt !important; border: 2pt solid #000;">SYSTEM TECHNICAL CHECK SHEET: ${label.toUpperCase()} (${(unit.zoneName || 'Server Room').toUpperCase()})</td></tr>`;
          tableRows += `<tr><td class="label">MODEL</td><td>${unit.panelModel}</td><td class="label">VOLT</td><td>${unit.batteryVolt}V</td><td class="label">CHG</td><td>${unit.chargerVolt}V</td></tr>`;
          tableRows += `<tr><td class="label">TIMER</td><td>${unit.dischargeTimer}</td><td class="label">CYL QTY</td><td>${unit.cylinderQty}</td><td class="label">AGENT</td><td>${unit.agentType}</td></tr>`;
          if (unit.integrationItems) {
            tableRows += `<tr><td colspan="6" class="section-header" style="background:#1e293b; font-size:7.5pt;">PART II: INTEGRATION LOGIC</td></tr>`;
            unit.integrationItems.forEach((i: any) => {
               tableRows += `<tr><td class="label">LOGIC</td><td colspan="3">${i.label}</td><td class="label">STATUS</td><td style="${getStatusStyle(i.status)}">${i.status}</td></tr>`;
            });
          }
          if (unit.overallRemarks) tableRows += `<tr><td class="label">SUMMARY</td><td colspan="5" style="font-size:7.5pt; padding:10px;">${unit.overallRemarks}</td></tr>`;
          if (unit.servicePhotos) tableRows += renderImageGrid(unit.servicePhotos);
          reportSections += `<table class="main-table">${tableRows}</table>`;
        });
      }
      else if (isPump) {
        const pumps = Array.isArray(systemData) ? systemData : [systemData];
        pumps.forEach((unit: any) => {
          let tableRows = `<tr class="page-break"><td colspan="6" class="section-header" style="background:#ec1313; text-align:center; padding:20px; font-size:16pt !important; border: 2pt solid #000;">SYSTEM TECHNICAL CHECK SHEET: ${label.toUpperCase()} (${(unit.systemName || 'Pump Set').toUpperCase()})</td></tr>`;
          tableRows += `<tr><td class="label">LOCATION</td><td colspan="2" style="font-weight:bold;">${unit.location || 'Pump Room'}</td><td class="label">HEADER PRES.</td><td colspan="2" style="font-size:12pt; font-weight:900; color:#059669;">${unit.headerPressure} BAR</td></tr>`;
          tableRows += `<tr><td colspan="6" class="section-header" style="background:#475569; font-size:7.5pt;">PART I: EQUIPMENT RATINGS</td></tr>`;
          tableRows += `<tr><td class="label">JOCKEY</td><td>${unit.jockeyRating || 'N/A'}</td><td class="label">MOTOR</td><td>${unit.motorRating || 'N/A'}</td><td class="label">ENGINE</td><td>${unit.engineRating || 'N/A'}</td></tr>`;
          const pumpUnits = [{ n: 'JOCKEY', u: unit.jockeyUnit }, { n: 'DUTY', u: unit.dutyUnit }, { n: 'STANDBY', u: unit.standbyUnit }].filter(x => x.u);
          pumpUnits.forEach(p => {
            tableRows += `<tr><td colspan="6" class="section-header" style="background:#1e293b; font-size:7.5pt;">${p.n} PUMP UNIT (${p.u.type.toUpperCase()})</td></tr>`;
            tableRows += `<tr><td class="label">MODE</td><td>${p.u.mode}</td><td class="label">STATUS</td><td style="${getStatusStyle(p.u.status)}">${p.u.status}</td><td class="label">${p.u.type === 'Electric' ? 'LOAD (AMP)' : 'FUEL (%)'}</td><td style="font-weight:900;">${p.u.loadValue}${p.u.type === 'Electric' ? 'A' : '%'}</td></tr>`;
            tableRows += `<tr><td class="label">CUT-IN</td><td style="color:#ec1313; font-weight:bold;">${p.u.cutIn} BAR</td><td class="label">CUT-OUT</td><td style="color:#059669; font-weight:bold;">${p.u.cutOut} BAR</td><td colspan="2"></td></tr>`;
            if (p.u.type === 'Diesel') tableRows += `<tr><td class="label">BATT VOLT</td><td>${p.u.batteryVolt}V</td><td class="label">CHG VOLT</td><td>${p.u.chargerVolt}V</td><td colspan="2"></td></tr>`;
            if (p.u.photo) tableRows += renderImg(p.u.photo, `${p.n} Unit Proof`, true);
          });
          tableRows += `<tr><td colspan="6" class="section-header" style="background:#475569; font-size:7.5pt;">PART III: MECHANICAL INTEGRITY</td></tr>`;
          tableRows += `<tr><td class="label">VIBRATION</td><td style="${getStatusStyle(unit.pumpVibration)}">${unit.pumpVibration}</td><td class="label">NOISE</td><td style="${getStatusStyle(unit.pumpNoise)}">${unit.pumpNoise}</td><td class="label">GLAND PACK</td><td style="${getStatusStyle(unit.glandPacking)}">${unit.glandPacking}</td></tr>`;
          tableRows += `<tr><td class="label">PUMP COND</td><td style="${getStatusStyle(unit.pumpCondition)}">${unit.pumpCondition}</td><td class="label">VALVE COND</td><td style="${getStatusStyle(unit.valveCondition)}">${unit.valveCondition}</td><td class="label">TANK LEVEL</td><td style="font-weight:bold;">${unit.tankLevel}</td></tr>`;
          if (unit.overallRemarks) tableRows += `<tr><td class="label">SYSTEM SUMMARY</td><td colspan="5" style="font-size:7.5pt; padding:10px; font-style:italic;">"${unit.overallRemarks}"</td></tr>`;
          if (unit.servicePhotos) tableRows += renderImageGrid(unit.servicePhotos);
          reportSections += `<table class="main-table">${tableRows}</table>`;
        });
      }
      else {
        const assets = Array.isArray(systemData) ? systemData : (systemData.items || [systemData]);
        let tableRows = `<tr class="page-break"><td colspan="6" class="section-header" style="background:#ec1313; text-align:center; padding:20px; font-size:16pt !important; border: 2pt solid #000;">TECHNICAL REGISTRY: ${label.toUpperCase()}</td></tr>`;
        tableRows += `<tr style="background:#f8fafc;"><td class="label">OVERALL STATUS</td><td style="${getStatusStyle(systemData.systemOverallStatus || 'Normal')}">${systemData.systemOverallStatus || 'Normal'}</td><td class="label">DESCRIPTION</td><td colspan="3" style="font-size:7.5pt; font-style:italic;">${systemData.systemDescription || 'Standard component verification.'}</td></tr>`;
        assets.forEach((item: any, idx: number) => {
          const itemName = item.serial || item.brand || item.location || `UNIT #${idx+1}`;
          tableRows += `<tr><td colspan="6" class="section-header" style="background:#475569; font-size:7.5pt; padding:10px;">UNIT #${idx+1}: ${itemName.toUpperCase()}</td></tr>`;
          const details = Object.entries(item).filter(([k]) => !['id', 'photos', 'remarks'].includes(k));
          for (let i = 0; i < details.length; i += 3) {
            tableRows += `<tr>`;
            for (let j = 0; j < 3; j++) {
              if (details[i + j]) {
                const k = formatKey(details[i+j][0]);
                const v = details[i+j][1];
                tableRows += `<td class="label">${k}</td><td style="${getStatusStyle(v)}">${v || 'N/A'}</td>`;
              } else tableRows += `<td colspan="2"></td>`;
            }
            tableRows += `</tr>`;
          }
        });
        if (systemData.overallRemarks) tableRows += `<tr><td class="label">CATEGORY SUMMARY</td><td colspan="5" style="font-size:7.5pt; padding:10px;">${systemData.overallRemarks}</td></tr>`;
        if (systemData.servicePhotos) tableRows += renderImageGrid(systemData.servicePhotos);
        reportSections += `<table class="main-table">${tableRows}</table>`;
      }
    });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
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
          .sign-area { border: 1pt solid #cbd5e1; height: 120px; display: flex; align-items: center; justify-content: center; background: #f8fafc; border-radius: 8px; overflow: hidden; margin-bottom: 10px; }
          .sign-img { max-height: 100px; max-width: 90%; object-fit: contain; }
          .sign-label { font-size: 8pt; font-weight: 900; color: #475569; text-transform: uppercase; margin-bottom: 8px; }
          .no-sign { color: #cbd5e1; font-size: 8pt; font-weight: bold; text-transform: uppercase; }
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
                </div>
                <h1 style="font-size:30pt; font-weight:900; margin: 35px 0 8px 0;">SERVICE MAINTENANCE REPORT</h1>
                <p style="text-transform:uppercase; font-weight:900; color:#ec1313; letter-spacing:4px; font-size:10pt;">Engineering Excellence • Since 2008</p>
             </div>
             <div style="flex:1; display:flex; align-items:center; justify-content:center; position: relative; z-index: 10;">
                <table style="width:100%; border:2.5pt solid #000; border-collapse:collapse; background: rgba(255,255,255,0.85);">
                   <tr><td style="padding:15px; font-weight:900; background:#f8fafc; border:1pt solid #000; width:30%;">SITE NAME</td><td style="padding:15px; font-weight:900; font-size:16pt; border:1pt solid #000;">${site}</td></tr>
                   <tr><td style="padding:15px; font-weight:900; background:#f8fafc; border:1pt solid #000;">AUDIT CYCLE</td><td style="padding:15px; font-weight:900; color:#1e293b; border:1pt solid #000;">${cycle.toUpperCase()}</td></tr>
                   <tr><td style="padding:15px; font-weight:900; background:#f8fafc; border:1pt solid #000;">REPORT REF</td><td style="padding:15px; font-weight:900; color:#ec1313; border:1pt solid #000;">${auditId}</td></tr>
                   <tr><td style="padding:15px; font-weight:900; background:#f8fafc; border:1pt solid #000;">REPORT DATE</td><td style="padding:15px; font-weight:bold; border:1pt solid #000;">${date}</td></tr>
                   <tr><td style="padding:15px; font-weight:900; background:#f8fafc; border:1pt solid #000;">LEAD AUDITOR</td><td style="padding:15px; font-weight:bold; border:1pt solid #000;">${tech.toUpperCase()}</td></tr>
                </table>
             </div>
          </div>
          
          <div style="padding-top:20px;">
             <h2 style="border-bottom:2.5pt solid #ec1313; padding-bottom:8px; font-weight:900; margin-top:35px; font-size:13pt;">III. FULL TECHNICAL LOGS</h2>
             ${reportSections}
          </div>

          <div class="page-break" style="padding-top:40px; page-break-inside: avoid;">
             <h2 style="border-bottom:2.5pt solid #ec1313; padding-bottom:8px; font-weight:900; font-size:13pt; margin-bottom:30px;">IV. AUTHORIZATION & SIGN-OFF</h2>
             <table style="width: 100%; border-collapse: collapse;">
                <tr>
                   <td style="width: 50%; padding-right: 25px; vertical-align: top;">
                      <div class="sign-label">Authorized Client Representative</div>
                      <div class="sign-area">
                         ${clientSig ? `<img src="${clientSig}" class="sign-img" />` : '<span class="no-sign">No Signature Recorded</span>'}
                      </div>
                      <div style="font-size: 9pt; font-weight: 900; margin-top: 5px;">${clientRep.toUpperCase()}</div>
                      <div style="font-size: 7pt; color: #64748b; font-weight: bold; margin-top: 2px;">Date: ${clientAuthDate}</div>
                   </td>
                   <td style="width: 50%; padding-left: 25px; vertical-align: top;">
                      <div class="sign-label">Lead Technical Auditor</div>
                      <div class="sign-area">
                         ${techSig ? `<img src="${techSig}" class="sign-img" />` : '<span class="no-sign">No Signature Recorded</span>'}
                      </div>
                      <div style="font-size: 9pt; font-weight: 900; margin-top: 5px;">${tech.toUpperCase()}</div>
                      <div style="font-size: 7pt; color: #64748b; font-weight: bold; margin-top: 2px;">Date: ${date}</div>
                   </td>
                </tr>
             </table>
             <div style="margin-top: 50px; padding: 15px; border: 1pt dashed #cbd5e1; background: #f8fafc; border-radius: 8px; text-align: center;">
                <p style="font-size: 7.5pt; color: #64748b; font-weight: 600; margin: 0; line-height: 1.5;">
                   This report is generated digitally via Bestro Maintenance OS. The signatures above certify that the field inspection and technical census were conducted in accordance with engineering safety standards.
                </p>
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
      link.setAttribute("download", `BESTRO_REPORT_${auditId}.xls`);
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
