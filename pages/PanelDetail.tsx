
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface PanelSpecs {
  model: string;
  location: string;
  totalZones: string;
  batteryVolt: string;
  chargerVolt: string;
  batteryStatus: 'Normal' | 'Defective';
  testLampStatus: 'Normal' | 'Fault';
  testBatteryStatus: 'Normal' | 'Fault';
  batteryRemarks?: string;
  panelRemarks?: string;
  panelPhoto?: string;
  batteryPhoto?: string;
}

interface CardCondition {
  id: string;
  label: string;
  status: 'Normal' | 'Defective';
  remarks?: string;
  photo?: string;
}

interface ZoneDetail {
  id: string;
  zoneNo: string;
  name: string;
  breakglassQty: string;
  smokeQty: string;
  heatQty: string;
  bellQty: string;
  status: 'Normal' | 'Defective';
  remarks?: string;
  photo?: string;
}

interface PanelIndicator {
  id: string;
  label: string;
  category: 'Pump' | 'Gas' | 'Integration';
  status: 'Normal' | 'Fault' | 'N/A';
  remarks?: string;
  photo?: string;
}

const PanelDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';

  const [systemDescription, setSystemDescription] = useState('Main Fire Alarm Control Panel (FACP) maintenance verification.');
  const [systemOverallStatus, setSystemOverallStatus] = useState<'Normal' | 'Faulty' | 'Partial' | 'N/A'>('Normal');
  const [overallRemarks, setOverallRemarks] = useState('');
  const [servicePhotos, setServicePhotos] = useState<string[]>(['', '', '', '']);

  const [panelSpecs, setPanelSpecs] = useState<PanelSpecs>({
    model: 'Morley DXc4',
    location: 'Main Lobby G-Floor',
    totalZones: '4',
    batteryVolt: '26.4',
    chargerVolt: '27.2',
    batteryStatus: 'Normal',
    testLampStatus: 'Normal',
    testBatteryStatus: 'Normal',
    panelRemarks: '',
    batteryRemarks: ''
  });

  const [cardConditions, setCardConditions] = useState<CardCondition[]>([
    { id: 'c1', label: 'Charger Card', status: 'Normal', remarks: '' },
    { id: 'c2', label: 'Zone Card', status: 'Normal', remarks: '' },
    { id: 'c3', label: 'Fault Card', status: 'Normal', remarks: '' },
    { id: 'c4', label: 'Power Card', status: 'Normal', remarks: '' },
  ]);

  const [indicators, setIndicators] = useState<PanelIndicator[]>([
    { id: 'i1', label: 'Jockey Pump Signal', category: 'Pump', status: 'Normal', remarks: '' },
    { id: 'i2', label: 'Duty Pump Signal', category: 'Pump', status: 'Normal', remarks: '' },
    { id: 'i3', label: 'Standby Pump Signal', category: 'Pump', status: 'Normal', remarks: '' },
    { id: 'i4', label: 'Gas System Status', category: 'Gas', status: 'Normal', remarks: '' },
    { id: 'i5', label: 'Gas Discharge Signal', category: 'Gas', status: 'Normal', remarks: '' },
  ]);

  const [zones, setZones] = useState<ZoneDetail[]>([{ 
    id: 'z1', zoneNo: '1', name: 'Main Lobby', breakglassQty: '4', smokeQty: '8', heatQty: '2', bellQty: '4', status: 'Normal', remarks: '' 
  }]);

  useEffect(() => {
    const saved = localStorage.getItem(`checklist_${auditId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.panelSpecs) setPanelSpecs(parsed.panelSpecs);
        if (parsed.cardConditions) setCardConditions(parsed.cardConditions);
        if (parsed.indicators) setIndicators(parsed.indicators);
        if (parsed.zones) setZones(parsed.zones);
        if (parsed.systemDescription) setSystemDescription(parsed.systemDescription);
        if (parsed.systemOverallStatus) setSystemOverallStatus(parsed.systemOverallStatus);
        if (parsed.overallRemarks) setOverallRemarks(parsed.overallRemarks);
        if (parsed.servicePhotos) setServicePhotos(parsed.servicePhotos);
      } catch (e) {}
    }
  }, [auditId]);

  const handleSave = () => {
    const data = { 
      panelSpecs, 
      cardConditions, 
      indicators, 
      zones, 
      systemDescription, 
      systemOverallStatus,
      overallRemarks,
      servicePhotos,
      isNA: false 
    };
    localStorage.setItem(`checklist_${auditId}`, JSON.stringify(data));
    navigate(`/checklist/${auditId}`);
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="Fire Alarm System" subtitle={`REF: ${auditId}`} showBack />

      <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* AUDIT PROFILE HEADER */}
        <section className="bg-primary/10 border border-primary/20 p-5 rounded-2xl flex flex-col gap-4 shadow-lg shadow-primary/5">
           <div className="flex justify-between items-center border-b border-primary/20 pb-3">
              <h3 className="text-[11px] font-black uppercase text-white tracking-widest italic">System Audit Profile</h3>
              <select value={systemOverallStatus} onChange={(e) => setSystemOverallStatus(e.target.value as any)} className="bg-background-dark/50 border border-primary/40 rounded px-2 h-6 text-[8px] font-black uppercase text-white">
                <option value="Normal">Normal</option><option value="Faulty">Faulty</option><option value="Partial">Partial</option><option value="N/A">N/A</option>
              </select>
           </div>
           <textarea value={systemDescription} onChange={(e) => setSystemDescription(e.target.value)} className="bg-background-dark/50 border-white/5 border rounded-xl p-3 text-xs font-medium h-16 text-white" placeholder="Description..." />
        </section>

        {/* PART I: PANEL HARDWARE */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">precision_manufacturing</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part I: Hardware Specifications</h3>
           </div>
           <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1"><label className="text-[7px] font-black text-text-muted uppercase">Model</label><input type="text" value={panelSpecs.model} onChange={(e) => setPanelSpecs({...panelSpecs, model: e.target.value})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-bold text-primary" /></div>
              <div className="flex flex-col gap-1"><label className="text-[7px] font-black text-text-muted uppercase">Total Zones</label><input type="text" value={panelSpecs.totalZones} onChange={(e) => setPanelSpecs({...panelSpecs, totalZones: e.target.value})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-black text-white" /></div>
           </div>
           <div className="flex flex-col gap-1 mb-3"><label className="text-[7px] font-black text-text-muted uppercase">Location</label><input type="text" value={panelSpecs.location} onChange={(e) => setPanelSpecs({...panelSpecs, location: e.target.value})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-bold text-white" /></div>
           <textarea value={panelSpecs.panelRemarks} onChange={(e) => setPanelSpecs({...panelSpecs, panelRemarks: e.target.value})} className="w-full bg-background-dark/30 border-white/5 border rounded-xl p-3 text-[10px] h-14 text-white italic" placeholder="Hardware Remarks..." />
        </section>

        {/* PART II: POWER & BATTERY */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">battery_charging_full</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part II: Power Logistics</h3>
           </div>
           <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1"><label className="text-[7px] font-black text-text-muted uppercase">Batt Volt (V)</label><input type="text" value={panelSpecs.batteryVolt} onChange={(e) => setPanelSpecs({...panelSpecs, batteryVolt: e.target.value})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-black text-emerald-500" /></div>
              <div className="flex flex-col gap-1"><label className="text-[7px] font-black text-text-muted uppercase">Charger Volt (V)</label><input type="text" value={panelSpecs.chargerVolt} onChange={(e) => setPanelSpecs({...panelSpecs, chargerVolt: e.target.value})} className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-xs font-black text-blue-400" /></div>
           </div>
           <div className="bg-background-dark/30 p-3 rounded-xl border border-white/5 mb-3">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-[8px] font-black text-text-muted uppercase">Standby Battery Health</span>
                 <div className="flex gap-1">
                    {['Normal', 'Defective'].map(s => (
                       <button key={s} onClick={() => setPanelSpecs({...panelSpecs, batteryStatus: s as any})} className={`px-3 py-1 rounded text-[8px] font-black uppercase ${panelSpecs.batteryStatus === s ? 'bg-primary text-white' : 'bg-background-dark text-text-muted'}`}>{s}</button>
                    ))}
                 </div>
              </div>
              {panelSpecs.batteryStatus === 'Defective' && (
                <div className="flex gap-2 pt-2 animate-in slide-in-from-top">
                   <PhotoCaptureBox photo={panelSpecs.batteryPhoto} onCapture={(p) => setPanelSpecs({...panelSpecs, batteryPhoto: p})} />
                   <textarea value={panelSpecs.batteryRemarks} onChange={(e) => setPanelSpecs({...panelSpecs, batteryRemarks: e.target.value})} className="flex-1 bg-background-dark border-none rounded-xl p-2 text-[9px] text-white" placeholder="Describe battery fault..." />
                </div>
              )}
           </div>
           {panelSpecs.batteryStatus === 'Normal' && <textarea value={panelSpecs.batteryRemarks} onChange={(e) => setPanelSpecs({...panelSpecs, batteryRemarks: e.target.value})} className="w-full bg-background-dark/30 border-white/5 border rounded-xl p-3 text-[10px] h-14 text-white italic" placeholder="Battery/Charger Remarks..." />}
        </section>

        {/* PART III: PUMP & GAS INDICATORS */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">monitor_heart</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part III: System Integration Signals</h3>
           </div>
           <div className="flex flex-col gap-3">
              {indicators.map((ind, idx) => (
                 <div key={ind.id} className="bg-background-dark/30 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                       <div className="flex flex-col">
                          <span className="text-[7px] font-black text-primary uppercase tracking-widest">{ind.category}</span>
                          <span className="text-[9px] font-bold text-white uppercase">{ind.label}</span>
                       </div>
                       <div className="flex gap-1 h-7">
                          {['Normal', 'Fault', 'N/A'].map(s => (
                             <button key={s} onClick={() => {
                                const ni = [...indicators]; ni[idx].status = s as any; setIndicators(ni);
                             }} className={`px-2 rounded-lg text-[7px] font-black uppercase ${ind.status === s ? (s === 'Normal' ? 'bg-emerald-600' : s === 'Fault' ? 'bg-primary' : 'bg-slate-600') + ' text-white' : 'bg-background-dark text-text-muted'}`}>{s}</button>
                          ))}
                       </div>
                    </div>
                    {ind.status === 'Fault' ? (
                       <div className="flex gap-2 animate-in slide-in-from-top">
                          <PhotoCaptureBox photo={ind.photo} onCapture={(p) => { const ni = [...indicators]; ni[idx].photo = p; setIndicators(ni); }} />
                          <textarea value={ind.remarks} onChange={(e) => { const ni = [...indicators]; ni[idx].remarks = e.target.value; setIndicators(ni); }} className="flex-1 bg-background-dark border-none rounded-lg p-2 text-[8px] text-white" placeholder="Signal fault details..." />
                       </div>
                    ) : (
                       <input value={ind.remarks} onChange={(e) => {
                          const ni = [...indicators]; ni[idx].remarks = e.target.value; setIndicators(ni);
                       }} className="w-full bg-background-dark/50 border-none rounded-lg h-7 px-3 text-[8px] text-white italic" placeholder="Signal Remark..." />
                    )}
                 </div>
              ))}
           </div>
        </section>

        {/* PART IV: CARD REGISTRY */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">memory</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part IV: Card Logic Registry</h3>
           </div>
           <div className="grid grid-cols-1 gap-3">
              {cardConditions.map((card, idx) => (
                 <div key={card.id} className="bg-background-dark/30 p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[9px] font-bold text-white uppercase">{card.label}</span>
                       <div className="flex gap-1">
                          {['Normal', 'Defective'].map(s => (
                             <button key={s} onClick={() => {
                                const nc = [...cardConditions]; nc[idx].status = s as any; setCardConditions(nc);
                             }} className={`px-3 py-1 rounded-lg text-[7px] font-black uppercase ${card.status === s ? 'bg-primary text-white' : 'bg-background-dark text-text-muted'}`}>{s}</button>
                          ))}
                       </div>
                    </div>
                    {card.status === 'Defective' ? (
                      <div className="flex gap-2 animate-in slide-in-from-top">
                        <PhotoCaptureBox photo={card.photo} onCapture={(p) => { const nc = [...cardConditions]; nc[idx].photo = p; setCardConditions(nc); }} />
                        <textarea value={card.remarks} onChange={(e) => { const nc = [...cardConditions]; nc[idx].remarks = e.target.value; setCardConditions(nc); }} className="flex-1 bg-background-dark border-none rounded-lg p-2 text-[8px] text-white" placeholder="Card defect details..." />
                      </div>
                    ) : (
                      <input value={card.remarks} onChange={(e) => {
                         const nc = [...cardConditions]; nc[idx].remarks = e.target.value; setCardConditions(nc);
                      }} className="w-full bg-background-dark/50 border-none rounded-lg h-7 px-3 text-[8px] text-white italic" placeholder="Card Remark..." />
                    )}
                 </div>
              ))}
           </div>
        </section>

        {/* PART V: ZONE REGISTRY */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-primary text-sm">grid_view</span>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part V: Zone Device Registry</h3>
              </div>
              <button onClick={() => setZones([...zones, { id: Date.now().toString(), zoneNo: (zones.length+1).toString(), name: '', breakglassQty:'0', smokeQty:'0', heatQty:'0', bellQty:'0', status:'Normal', remarks: ''}])} className="text-primary text-[8px] font-black uppercase">+ Add Zone</button>
           </div>
           <div className="flex flex-col gap-4">
              {zones.map((zone, zIdx) => (
                <div key={zone.id} className="bg-background-dark/30 rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-primary italic">ZONE {zone.zoneNo}</span>
                      <div className="flex gap-1 h-7">
                        {['Normal', 'Defective'].map(s => (
                          <button key={s} onClick={() => {
                            const nz = [...zones]; nz[zIdx].status = s as any; setZones(nz);
                          }} className={`px-3 rounded-lg text-[8px] font-black uppercase ${zone.status === s ? 'bg-primary text-white' : 'bg-background-dark text-text-muted'}`}>{s}</button>
                        ))}
                      </div>
                   </div>
                   <input value={zone.name} onChange={(e) => {
                     const nz = [...zones]; nz[zIdx].name = e.target.value; setZones(nz);
                   }} className="bg-background-dark/50 border-none rounded-xl h-10 px-4 text-xs font-bold text-white" placeholder="Location Name..." />
                   
                   <div className="grid grid-cols-4 gap-2">
                      {['smokeQty', 'heatQty', 'bellQty', 'breakglassQty'].map(qty => (
                         <div key={qty} className="flex flex-col gap-1">
                            <label className="text-[6px] font-black text-text-muted uppercase text-center">{qty.replace('Qty', '')}</label>
                            <input type="number" value={(zone as any)[qty]} onChange={(e) => {
                               const nz = [...zones]; (nz[zIdx] as any)[qty] = e.target.value; setZones(nz);
                            }} className="bg-background-dark/50 border-none rounded h-7 text-[9px] text-center font-black text-white" />
                         </div>
                      ))}
                   </div>
                   {zone.status === 'Defective' ? (
                      <div className="flex gap-2 animate-in slide-in-from-top">
                        <PhotoCaptureBox photo={zone.photo} onCapture={(p) => { const nz = [...zones]; nz[zIdx].photo = p; setZones(nz); }} />
                        <textarea value={zone.remarks} onChange={(e) => { const nz = [...zones]; nz[zIdx].remarks = e.target.value; setZones(nz); }} className="flex-1 bg-background-dark border-none rounded-lg p-2 text-[8px] text-white" placeholder="Describe zone issue..." />
                      </div>
                   ) : (
                      <textarea value={zone.remarks} onChange={(e) => {
                        const nz = [...zones]; nz[zIdx].remarks = e.target.value; setZones(nz);
                      }} className="bg-background-dark/50 border-white/5 border rounded-xl p-2 text-[9px] h-12 text-white italic" placeholder="Zone Remark..." />
                   )}
                </div>
              ))}
           </div>
        </section>

        {/* PART VI: SERVICE VERIFICATION & OVERALL REMARKS */}
        <section className="bg-surface-dark p-5 rounded-2xl border border-white/5 shadow-xl">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">history_edu</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Part VI: Service Evidence & Remarks</h3>
           </div>
           
           <div className="flex flex-col gap-2 mb-4">
              <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Overall System Remarks</label>
              <textarea 
                value={overallRemarks} 
                onChange={(e) => setOverallRemarks(e.target.value)} 
                className="w-full bg-background-dark/50 border-none rounded-xl p-4 text-xs font-medium text-white h-24 focus:ring-1 focus:ring-primary" 
                placeholder="Summary of all services performed, testing results, and critical findings..." 
              />
           </div>

           <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1 mb-2 block">Service Verification Photos (4)</label>
           <div className="grid grid-cols-4 gap-3">
              {servicePhotos.map((photo, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                   <PhotoCaptureBox 
                     photo={photo} 
                     onCapture={(p) => {
                        const newPhotos = [...servicePhotos];
                        newPhotos[idx] = p;
                        setServicePhotos(newPhotos);
                     }} 
                   />
                   <span className="text-[6px] font-black text-text-muted uppercase text-center">Img {idx+1}</span>
                </div>
              ))}
           </div>
        </section>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-surface-dark border-t border-white/5 p-5 pb-10 z-50">
         <button onClick={handleSave} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span>Commit Technical Data</span>
            <span className="material-symbols-outlined text-sm">verified_user</span>
         </button>
      </div>
    </div>
  );
};

const PhotoCaptureBox: React.FC<{ photo?: string; onCapture: (p: string) => void }> = ({ photo, onCapture }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onCapture(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  return (
    <div onClick={() => fileRef.current?.click()} className="w-16 h-16 bg-background-dark/80 rounded-xl border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50 transition-colors shadow-inner">
      {photo ? (
        <img src={photo} className="w-full h-full object-cover" />
      ) : (
        <span className="material-symbols-outlined text-primary/40 text-lg">add_a_photo</span>
      )}
      <input type="file" ref={fileRef} className="hidden" accept="image/*" capture="environment" onChange={handleFile} />
    </div>
  );
};

export default PanelDetail;
