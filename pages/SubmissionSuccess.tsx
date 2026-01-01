
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

  const BESTRO_LOGO_DATA = `
    <div style="width:120px; display:inline-block; text-align:center;">
      <svg width="120" height="60" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="120" cy="60" rx="110" ry="52" fill="#ec1313" />
        <path d="M45 28C75 18 165 18 195 28" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.3" />
        <path d="M45 92C75 102 165 102 195 92" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.3" />
        <text x="100" y="68" font-family="Arial Black, sans-serif" font-size="44" font-weight="900" fill="white" text-anchor="middle" letter-spacing="-2">BESTR</text>
        <g transform="translate(180, 56)">
          <circle cx="0" cy="0" r="18" fill="white" />
          <path d="M0 -10C0 -10 7 -3 7 4C7 11 0 14 0 14C0 14 -7 11 -7 4C-7 -3 0 -10 0 -10Z" fill="#ec1313" />
          <path d="M0 -5C0 -5 3 -2 3 2C3 6 0 8 0 8C0 8 -3 6 -3 2C-3 -2 0 -5 0 -5Z" fill="white" fill-opacity="0.4" />
        </g>
        <text x="120" y="92" font-family="Arial, sans-serif" font-size="12" font-weight="800" fill="white" text-anchor="middle" letter-spacing="6">ENGINEERING</text>
      </svg>
      <div style="font-family: serif; font-style: italic; font-size: 5pt; color: #64748b; margin-top: 2px; font-weight: bold; letter-spacing: 1px;">'Connect & Protect'</div>
    </div>
  `;

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
    const okTerms = ['normal', 'good', 'functional', 'ok', 'valid', 'secure', 'intact', 'clean', 'maintained', 'full', 'active', 'ready', 'secure', 'functional', 'intact', 'clean'];
    if (okTerms.includes(s)) 
      return 'color: #059669; font-weight: 900; background: #f0fdf4;'; 
    if (DEFECT_TERMS.some(t => s.includes(t.toLowerCase()))) 
      return 'color: #dc2626; font-weight: 900; background: #fef2f2;'; 
    return 'color: #1e293b; font-weight: bold;'; 
  };

  const handleExport = (type: 'pdf' | 'excel' | 'whatsapp') => {
    const site = setupData?.clientName?.toUpperCase() || 'N/A';
    const date = setupData?.date || 'N/A';
    const tech = setupData?.techName || 'N/A';
    const cycle = setupData?.frequency || 'Monthly';
    const isExcel = type === 'excel';

    const renderImg = (photoUrl: string | undefined, caption: string, isSmall = false) => {
      if (!photoUrl || !photoUrl.startsWith('data:')) return '';
      const height = isSmall ? '120px' : '200px';
      const width = isExcel ? (isSmall ? '140' : '260') : '100%';
      return `
        <tr>
          <td colspan="6" align="center" style="background-color: #f8fafc; padding: 10px; border: 1pt solid #cbd5e1;">
            <div style="width: ${width}; height: ${height}; display: flex; align-items: center; justify-content: center; background: #e2e8f0; border-radius: 4px; overflow: hidden; border: 1pt solid #cbd5e1;">
              <img src="${photoUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
            </div>
            <div style="font-size: 7pt; font-weight: 900; color: #64748b; text-transform: uppercase; margin-top: 5px;">${caption}</div>
          </td>
        </tr>
      `;
    };

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

    Object.entries(fullReportData).forEach(([label, data]: [string, any]) => {
      if (!data) return;

      const addFaultRow = (section: string, item: string, desc: string, status: string, photo?: string) => {
        faultSummaryRows += `
          <tr>
            <td style="font-weight:900; font-size:7pt; color:#ec1313; border: 1pt solid #cbd5e1;">${label.toUpperCase()}</td>
            <td style="font-weight:bold; font-size:7pt; border: 1pt solid #cbd5e1;">${section}</td>
            <td style="font-weight:black; font-size:8pt; border: 1pt solid #cbd5e1;">${item}</td>
            <td style="font-style:italic; font-size:8pt; border: 1pt solid #cbd5e1;">${desc || 'Requirement not met.'}</td>
            <td style="${getStatusStyle(status)}; border: 1pt solid #cbd5e1; text-align:center;">${status}</td>
          </tr>
          ${photo ? renderImg(photo, `Defect: ${item}`, true) : ''}
        `;
      };

      // Inventory Data
      let systemInventoryRows = '';
      if (label.includes('Main Fire Alarm')) {
        data.zones?.forEach((z: any) => {
          const counts = [];
          if (parseInt(z.smokeQty) > 0) counts.push(`Smoke: ${z.smokeQty}`);
          if (parseInt(z.heatQty) > 0) counts.push(`Heat: ${z.heatQty}`);
          if (parseInt(z.bellQty) > 0) counts.push(`Bell: ${z.bellQty}`);
          if (parseInt(z.breakglassQty) > 0) counts.push(`BG: ${z.breakglassQty}`);
          if (counts.length > 0) {
            systemInventoryRows += `<tr><td style="font-weight:bold; border:1pt solid #cbd5e1;">${z.name} (Zone ${z.zoneNo})</td><td colspan="5" style="border:1pt solid #cbd5e1;">${counts.join(' | ')}</td></tr>`;
          }
        });
      } else if (label.includes('Gas Suppression')) {
        const systems = Array.isArray(data) ? data : [data];
        systems.forEach((s: any) => {
          const counts = [];
          if (parseInt(s.smokeQty) > 0) counts.push(`Smoke: ${s.smokeQty}`);
          if (parseInt(s.heatQty) > 0) counts.push(`Heat: ${s.heatQty}`);
          if (parseInt(s.bellQty) > 0) counts.push(`Bell: ${s.bellQty}`);
          if (parseInt(s.flashingLightQty) > 0) counts.push(`Flash: ${s.flashingLightQty}`);
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
        inventorySectionHtml += `
          <tr style="background:#f1f5f9;"><td colspan="6" style="font-weight:900; font-size:7.5pt; color:#1e293b; padding:8px; border:1.5pt solid #000;">${label.toUpperCase()}</td></tr>
          ${systemInventoryRows}
        `;
      }

      // Detailed Technical Section
      let tableRows = `<tr class="page-break"><td colspan="6" class="section-header" style="text-align:center; padding:15px; font-size:12pt; background:#ec1313;">TECHNICAL REPORT: ${label}</td></tr>`;

      // NEW: Standard System Profile for ALL modules
      if (data.systemDescription || data.systemOverallStatus) {
        tableRows += `
          <tr style="background:#f8fafc;">
            <td class="label">OVERALL STATUS</td>
            <td style="${getStatusStyle(data.systemOverallStatus || 'Normal')}">${data.systemOverallStatus || 'Normal'}</td>
            <td class="label">TECHNICAL DESCRIPTION</td>
            <td colspan="3" style="font-size:7.5pt; font-style:italic;">${data.systemDescription || 'As per field maintenance log.'}</td>
          </tr>
        `;
      }

      if (label.includes('Main Fire Alarm')) {
        tableRows += `<tr><td colspan="6" class="section-header" style="background:#475569;">PART I: PANEL HARDWARE</td></tr>`;
        tableRows += `<tr><td class="label">MODEL</td><td>${data.panelSpecs?.model}</td><td class="label">TOTAL ZONES</td><td>${data.panelSpecs?.totalZones}</td><td class="label">LOCATION</td><td>${data.panelSpecs?.location}</td></tr>`;
        tableRows += `<tr><td class="label">BATT VOLT</td><td style="${getStatusStyle(data.panelSpecs?.batteryVolt)}">${data.panelSpecs?.batteryVolt}V</td><td class="label">CHARGER</td><td style="${getStatusStyle(data.panelSpecs?.chargerVolt)}">${data.panelSpecs?.chargerVolt}V</td><td class="label">BATT STATUS</td><td style="${getStatusStyle(data.panelSpecs?.batteryStatus)}">${data.panelSpecs?.batteryStatus}</td></tr>`;
        if (data.panelSpecs?.batteryPhoto) tableRows += renderImg(data.panelSpecs.batteryPhoto, 'Battery Condition');

        if (data.indicators) {
           tableRows += `<tr><td colspan="6" class="section-header" style="background:#1e293b; font-size:7.5pt;">PART II: SYSTEM INTEGRATION SIGNALS</td></tr>`;
           data.indicators.forEach((ind: any) => {
              tableRows += `<tr><td class="label">${ind.category}</td><td colspan="3">${ind.label}</td><td class="label">STATUS</td><td style="${getStatusStyle(ind.status)}">${ind.status}</td></tr>`;
              if (ind.status === 'Fault' || ind.status === 'Faulty') addFaultRow('SIGNAL', ind.label, ind.remarks, ind.status, ind.photo);
           });
        }
        if (data.cardConditions) {
           tableRows += `<tr><td colspan="6" class="section-header" style="background:#1e293b; font-size:7.5pt;">PART III: CARD LOGIC REGISTRY</td></tr>`;
           data.cardConditions.forEach((card: any) => {
              tableRows += `<tr><td class="label" colspan="3">${card.label}</td><td class="label">STATUS</td><td colspan="2" style="${getStatusStyle(card.status)}">${card.status}</td></tr>`;
              if (card.status === 'Defective') addFaultRow('CARD', card.label, card.remarks, card.status, card.photo);
           });
        }
      } 
      else if (label.includes('Gas Suppression')) {
        const gasSystems = Array.isArray(data) ? data : [data];
        gasSystems.forEach((gas, gIdx) => {
          tableRows += `<tr><td colspan="6" class="section-header" style="background:#475569;">ZONE ${gIdx + 1}: ${gas.zoneName}</td></tr>`;
          tableRows += `<tr><td class="label">MODEL</td><td>${gas.panelModel}</td><td class="label">AGENT</td><td>${gas.agentType}</td><td class="label">STATUS</td><td style="${getStatusStyle(gas.systemOverallStatus || gas.status)}">${gas.systemOverallStatus || gas.status}</td></tr>`;
          tableRows += `<tr><td class="label">BATT VOLT</td><td>${gas.batteryVolt}V</td><td class="label">CHARGER</td><td>${gas.chargerVolt}V</td><td class="label">TIMER</td><td>${gas.dischargeTimer}</td></tr>`;
          gas.integrationItems?.forEach((item: any) => {
            tableRows += `<tr><td class="label" colspan="4">${item.label}</td><td class="label">STATUS</td><td style="${getStatusStyle(item.status)}">${item.status}</td></tr>`;
            if (item.status === 'Faulty') addFaultRow(gas.zoneName, item.label, item.remarks, item.status, item.photo);
          });
        });
      }
      else if (label.includes('Pump')) {
        tableRows += `<tr><td class="label">LOCATION</td><td colspan="2" style="font-weight:900;">${data.location || 'Pump Room'}</td><td class="label">HEADER PRES.</td><td colspan="2" style="font-size:12pt; font-weight:900; color:#059669;">${data.headerPressure} BAR</td></tr>`;
        tableRows += `<tr><td class="label">TANK LEVEL</td><td colspan="5" style="font-weight:900;">${data.tankLevel}</td></tr>`;
        const units = [
          { n: 'JOCKEY', u: data.jockeyUnit },
          { n: 'DUTY', u: data.dutyUnit },
          { n: 'STANDBY', u: data.standbyUnit }
        ].filter(x => x.u);

        units.forEach(p => {
          tableRows += `<tr><td colspan="6" class="section-header" style="background:#475569;">${p.n} PUMP (${p.u.type})</td></tr>`;
          tableRows += `<tr><td class="label">MODE</td><td>${p.u.mode}</td><td class="label">STATUS</td><td style="${getStatusStyle(p.u.status)}">${p.u.status}</td><td class="label">${p.u.type === 'Electric' ? 'AMP' : 'FUEL'}</td><td style="font-weight:900;">${p.u.loadValue}${p.u.type === 'Electric' ? 'A' : '%'}</td></tr>`;
          tableRows += `<tr><td class="label">CUT-IN</td><td>${p.u.cutIn} BAR</td><td class="label">CUT-OUT</td><td>${p.u.cutOut} BAR</td><td class="label">REMARKS</td><td style="font-size:7pt;">${p.u.remarks || 'Normal'}</td></tr>`;
          if (p.u.status === 'Fault' || p.u.status === 'Faulty') addFaultRow(label, p.n, p.u.remarks, p.u.status, p.u.photo);
        });
      }
      else {
        // Shared Assets (Hose Reel, Hydrant, Riser, Extinguisher, Lights)
        const items = Array.isArray(data) ? data : (data.items || []);
        items.forEach((item: any, idx: number) => {
          const itemName = item.serial || item.brand || item.location || `UNIT #${idx+1}`;
          tableRows += `<tr><td colspan="6" class="section-header" style="background:#475569;">${itemName.toUpperCase()}</td></tr>`;
          
          // Custom render for Extinguisher with MFG Date and Cert Expiry
          if (label.includes('Extinguishers')) {
            tableRows += `
              <tr>
                <td class="label">LOCATION</td><td>${item.location || 'N/A'}</td>
                <td class="label">SERIAL</td><td>${item.serial || 'N/A'}</td>
                <td class="label">TYPE / WT</td><td>${item.type} (${item.weight})</td>
              </tr>
              <tr>
                <td class="label">MFG DATE</td><td>${item.mfgMonth}/${item.mfgYear}</td>
                <td class="label">BOMBA CERT</td><td style="${getStatusStyle(item.bombaCert)}">${item.bombaCert}</td>
                <td class="label">CERT EXPIRY</td><td style="font-weight:900; color:#ec1313;">${item.bombaCertExpiry || 'N/A'}</td>
              </tr>
              <tr>
                <td class="label">PRESSURE</td><td style="${getStatusStyle(item.pressure)}">${item.pressure}</td>
                <td class="label">SAFETY PIN</td><td style="${getStatusStyle(item.pin)}">${item.pin}</td>
                <td class="label">BODY</td><td style="${getStatusStyle(item.physicalBody)}">${item.physicalBody}</td>
              </tr>
            `;
          } else {
            const details = Object.entries(item).filter(([k]) => !['id', 'photos', 'remarks', 'location', 'serial', 'brand', 'type'].includes(k));
            for (let i = 0; i < details.length; i += 3) {
              tableRows += `<tr>`;
              for (let j = 0; j < 3; j++) {
                if (details[i + j]) {
                  const k = details[i+j][0].replace('Status', '').replace(/([A-Z])/g, ' $1').toUpperCase();
                  tableRows += `<td class="label">${k}</td><td style="${getStatusStyle(details[i+j][1])}">${details[i+j][1]}</td>`;
                }
                else tableRows += `<td colspan="2"></td>`;
              }
              tableRows += `</tr>`;
            }
          }

          // Handle defect remarks and photos for units that use Record<string, string>
          if (item.remarks && typeof item.remarks === 'object') {
            Object.entries(item.remarks).forEach(([key, msg]) => {
              if (msg && msg !== 'Normal' && msg !== 'Good' && msg !== 'Intact' && String(msg).trim() !== '') {
                const faultPhoto = item.photos?.[key];
                const faultLabel = key.replace('Status', '').replace('Outcome', '').toUpperCase();
                addFaultRow(label, `${itemName} (${faultLabel})`, String(msg), 'FAULT', faultPhoto);
                
                if (faultPhoto) {
                  tableRows += renderImg(faultPhoto, `Defect Proof: ${faultLabel}`, true);
                }
              }
            });
          }
          // For single-key status (e.g. extinguisher)
          const singleStatus = item.condition || item.pressure || item.testOutcome;
          if (DEFECT_TERMS.some(t => String(singleStatus).includes(t))) {
             if (item.photo) tableRows += renderImg(item.photo, `Defect Proof: UNIT #${idx+1}`, true);
          }
        });
      }

      // Add Overall Verification Section for the system
      if (data.overallRemarks || (data.servicePhotos && data.servicePhotos.some((p:string) => p))) {
        tableRows += `<tr><td colspan="6" class="section-header" style="background:#1e293b; font-size:7.5pt; text-align:center;">VERIFICATION & SERVICE PROOF</td></tr>`;
        if (data.overallRemarks) {
          tableRows += `<tr><td class="label">SUMMARY REMARKS</td><td colspan="5" style="font-size:8pt; padding:12px; border:1pt solid #cbd5e1; font-style:italic;">"${data.overallRemarks}"</td></tr>`;
        }
        if (data.servicePhotos) {
          tableRows += renderImageGrid(data.servicePhotos);
        }
      }

      reportSections += `<table class="main-table">${tableRows}</table>`;
    });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>BESTRO OS - Maintenance Report ${auditId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          @page { size: A4; margin: 10mm; }
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; color: #1e293b; background: #cbd5e1; -webkit-print-color-adjust: exact; }
          .a4-container { width: 210mm; margin: 40px auto; background: white; padding: 15mm; box-sizing: border-box; border-radius: 4px; box-shadow: 0 25px 60px rgba(0,0,0,0.4); }
          @media print { body { background: white; } .a4-container { width: 100%; margin: 0; padding: 0; box-shadow: none; } .page-break { page-break-before: always; } }
          .main-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1.5pt solid #000; }
          .main-table td { padding: 8px; border: 1pt solid #cbd5e1; font-size: 8pt; vertical-align: middle; }
          .label { background: #f1f5f9; font-weight: 900; font-size: 6.5pt; text-transform: uppercase; color: #475569; width: 100px; }
          .section-header { background: #1e293b; color: white; padding: 10px; font-weight: 900; font-size: 9pt; text-transform: uppercase; border: 1pt solid #000; }
          .company-header-container { display: flex; justify-content: space-between; align-items: center; border-bottom: 3pt solid #ec1313; padding-bottom: 15px; margin-bottom: 30px; }
          .header-center { flex: 1; text-align: center; }
          .company-name { font-size: 22pt; font-weight: 900; color: #ec1313; margin: 0; }
          .company-address { font-size: 8pt; font-weight: 600; color: #1e293b; margin: 5px 0; }
          .btn-print { position: fixed; top: 30px; right: 30px; padding: 15px 35px; background: #ec1313; color: white; border: none; border-radius: 50px; font-weight: 900; cursor: pointer; z-index: 100; box-shadow: 0 10px 30px rgba(236,19,19,0.5); }
        </style>
      </head>
      <body>
        <button class="btn-print" onclick="window.print()">DOWNLOAD REPORT</button>
        <div class="a4-container">
          <div style="border: 12pt solid #ec1313; padding: 40px; height: 260mm; box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; text-align:center;">
             <div>
                <div class="company-header-container">
                   <div style="width:140px;">${BESTRO_LOGO_DATA}</div>
                   <div class="header-center">
                      <div class="company-name">BESTRO ENG SDN BHD</div>
                      <div class="company-address">4, Jalan Utarid U5/28 U5, 40150 Shah Alam, Selangor Darul Ehsan</div>
                      <div style="font-size:7pt; color:#64748b;">Tel: 03-7832 6922 | Email: sales@bestro.com.my</div>
                   </div>
                   <div style="width:140px;">${setupData?.clientLogo ? `<img src="${setupData.clientLogo}" style="max-height:60px; max-width:120px; object-fit:contain;" />` : ''}</div>
                </div>
                <h1 style="font-size:32pt; font-weight:900; margin: 40px 0 10px 0;">SERVICE MAINTENANCE REPORT</h1>
                <div style="width:100px; height:4pt; background:#ec1313; margin:10px auto;"></div>
                <p style="text-transform:uppercase; font-weight:900; color:#ec1313; letter-spacing:4px;">Fire Safety Engineering Division</p>
             </div>

             <div style="flex:1; display:flex; align-items:center; justify-content:center;">
                <table style="width:100%; border:3pt solid #000; border-collapse:collapse;">
                   <tr><td style="padding:20px; font-weight:900; background:#f8fafc; border:1pt solid #000;">SITE NAME</td><td style="padding:20px; font-weight:900; font-size:18pt; border:1pt solid #000;">${site}</td></tr>
                   <tr><td style="padding:20px; font-weight:900; background:#f8fafc; border:1pt solid #000;">REF NUMBER</td><td style="padding:20px; font-weight:900; color:#ec1313; border:1pt solid #000;">${auditId}</td></tr>
                   <tr><td style="padding:20px; font-weight:900; background:#f8fafc; border:1pt solid #000;">AUDIT CYCLE</td><td style="padding:20px; font-weight:900; border:1pt solid #000;">${cycle} Service</td></tr>
                   <tr><td style="padding:20px; font-weight:900; background:#f8fafc; border:1pt solid #000;">REPORT DATE</td><td style="padding:20px; font-weight:bold; border:1pt solid #000;">${date}</td></tr>
                   <tr><td style="padding:20px; font-weight:900; background:#f8fafc; border:1pt solid #000;">AUDITOR</td><td style="padding:20px; font-weight:bold; border:1pt solid #000;">${tech.toUpperCase()}</td></tr>
                </table>
             </div>

             <div style="font-size:8pt; color:#94a3b8; font-weight:600; text-transform:uppercase; letter-spacing:2px;">
                CONFIDENTIAL • OFFICIAL MAINTENANCE RECORD • &copy; ${new Date().getFullYear()}
             </div>
          </div>

          <div class="page-break" style="padding-top:20px;">
             <h2 style="border-bottom:3pt solid #ec1313; padding-bottom:10px; font-weight:900;">I. DEFICIENCY SUMMARY</h2>
             <table class="main-table">
                <tr style="background:#1e293b; color:white;">
                   <th style="padding:10px; font-size:7pt; border:1pt solid #000;">SYSTEM</th>
                   <th style="padding:10px; font-size:7pt; border:1pt solid #000;">SECTION</th>
                   <th style="padding:10px; font-size:7pt; border:1pt solid #000;">UNIT/PART</th>
                   <th style="padding:10px; font-size:7pt; border:1pt solid #000;">FAULT DESCRIPTION</th>
                   <th style="padding:10px; font-size:7pt; border:1pt solid #000;">STATUS</th>
                </tr>
                ${faultSummaryRows || '<tr><td colspan="5" style="text-align:center; padding:40px; color:#059669; font-weight:bold;">CERTIFIED: NO DEFECTS DETECTED</td></tr>'}
             </table>

             <h2 style="border-bottom:3pt solid #ec1313; padding-bottom:10px; font-weight:900; margin-top:40px;">II. ASSET INVENTORY</h2>
             <table class="main-table">
                ${inventorySectionHtml || '<tr><td style="padding:20px; text-align:center;">No assets recorded.</td></tr>'}
             </table>

             <h2 class="page-break" style="border-bottom:3pt solid #ec1313; padding-bottom:10px; font-weight:900;">III. TECHNICAL LOGS</h2>
             ${reportSections}

             <div style="margin-top:60px; border:2pt solid #000; padding:30px; background:#f8fafc;">
                <h3 style="font-weight:900; text-transform:uppercase; border-bottom:1pt solid #000; padding-bottom:10px;">Audit Certification</h3>
                <p style="font-size:8.5pt;">Technical records verified against Bestro Quality Protocol. Deficiencies require immediate rectification to ensure facility safety compliance.</p>
                <div style="display:flex; justify-content:space-between; margin-top:60px;">
                   <div style="text-align:center; width:40%;">
                      ${setupData?.techSigData ? `<img src="${setupData.techSigData}" style="max-height:80px;" />` : '<div style="height:80px;"></div>'}
                      <div style="border-top:1pt solid #000; font-weight:900; font-size:7pt;">TECHNICIAN SIGN-OFF</div>
                      <div style="font-size:7pt;">${tech.toUpperCase()}</div>
                   </div>
                   <div style="text-align:center; width:40%;">
                      ${setupData?.clientSigData ? `<img src="${setupData.clientSigData}" style="max-height:80px;" />` : '<div style="height:80px;"></div>'}
                      <div style="border-top:1pt solid #000; font-weight:900; font-size:7pt;">CLIENT AUTHORIZATION</div>
                      <div style="font-size:7pt;">${setupData?.clientRepName?.toUpperCase() || 'N/A'}</div>
                   </div>
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
      link.setAttribute("download", `BESTRO_OS_REPORT_${auditId}.xls`);
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
      <TopBar title="Report Finalization" showBack onBack={() => navigate('/')} />
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-10 relative z-10 no-print">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-primary rounded-[35px] flex items-center justify-center shadow-[0_0_50px_rgba(236,19,19,0.4)] animate-bounce"><span className="material-symbols-outlined text-white text-6xl">verified</span></div>
          <div className="text-center"><h1 className="text-3xl font-black italic uppercase text-white tracking-tight">Data Committed</h1><p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-2">Dossier ID: {auditId}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm pb-10">
          <button onClick={() => handleExport('pdf')} className="bg-surface-dark border border-white/10 h-28 rounded-[30px] flex flex-col items-center justify-center gap-3 text-white transition-all active:scale-95 group shadow-2xl"><div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary transition-colors"><span className="material-symbols-outlined text-primary group-hover:text-white text-2xl">picture_as_pdf</span></div><span className="text-[9px] font-black uppercase tracking-widest">Master PDF</span></button>
          <button onClick={() => handleExport('excel')} className="bg-surface-dark border border-white/10 h-28 rounded-[30px] flex flex-col items-center justify-center gap-3 text-white transition-all active:scale-95 group shadow-2xl"><div className="w-10 h-10 bg-emerald-600/20 rounded-full flex items-center justify-center group-hover:bg-emerald-600 transition-colors"><span className="material-symbols-outlined text-emerald-600 group-hover:text-white text-2xl">table_view</span></div><span className="text-[9px] font-black uppercase tracking-widest">Excel Sheets</span></button>
          <button onClick={() => navigate('/')} className="col-span-2 bg-white text-black h-14 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 font-black uppercase tracking-widest text-xs">Return to Terminal</button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionSuccess;
