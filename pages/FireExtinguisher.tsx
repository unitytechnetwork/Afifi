
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import TopBar from '../components/TopBar';

interface Extinguisher {
  id: string;
  serial: string;
  type: string;
  weight: string;
  location: string;
  expiry: string;
  lastServiceDate: string;
  mfgMonth: string;
  mfgYear: string;
  pressure: 'Normal' | 'Low';
  pin: 'Intact' | 'Broken';
  cableTie: 'Intact' | 'Broken';
  bombaCert: 'Valid' | 'Expired';
  bombaCertExpiry: string;
  physicalBody: 'Good' | 'Damaged';
  photos: Record<string, string>;
  remarks: Record<string, string>;
}

const FireExtinguisher: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Updated default technical description as requested
  const [systemDescription, setSystemDescription] = useState('Portable fire extinguishers are provided as first-aid firefighting equipment to control incipient fires. Inspection was carried out to verify unit condition, pressure indication, hose and nozzle integrity, mounting arrangement, and service validity.');
  
  const [systemOverallStatus, setSystemOverallStatus] = useState<'Normal' | 'Faulty' | 'Partial' | 'N/A'>('Normal');
  const [overallRemarks, setOverallRemarks] = useState('');
  const [servicePhotos, setServicePhotos] = useState<string[]>(['', '', '', '']);

  const getDefaultItem = (): Extinguisher => ({ 
    id: Date.now().toString(), 
    serial: '', 
    type: 'ABC Powder', 
    weight: '9kg',
    location: '',
    expiry: '', 
    lastServiceDate: new Date().toISOString().split('T')[0],
    mfgMonth: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    mfgYear: new Date().getFullYear().toString(),
    pressure: 'Normal' as const, 
    pin: 'Intact' as const,
    cableTie: 'Intact' as const,
    bombaCert: 'Valid' as const,
    bombaCertExpiry: '',
    physicalBody: 'Good' as const,
    remarks: {},
    photos: {}
  });

  const [items, setItems] = useState<Extinguisher[]>(() => {
    const saved = localStorage.getItem(`extinguisher_${auditId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedItems = Array.isArray(parsed) ? parsed : (parsed.items || []);
        return savedItems.map((item: any) => ({
          ...getDefaultItem(),
          ...item,
          photos: item.photos || {},
          remarks: item.remarks || {}
        }));
      } catch (e) { console.error(e); }
    }
    return [getDefaultItem()];
  });

  useEffect(() => {
    const saved = localStorage.getItem(`extinguisher_${auditId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.systemDescription) setSystemDescription(parsed.systemDescription);
        if (parsed.systemOverallStatus) setSystemOverallStatus(parsed.systemOverallStatus);
        if (parsed.overallRemarks) setOverallRemarks(parsed.overallRemarks);
        if (parsed.servicePhotos) setServicePhotos(parsed.servicePhotos);
      } catch (e) {}
    }
  }, [auditId]);

  useEffect(() => {
    const dataToSave = { 
      items, 
      systemDescription, 
      systemOverallStatus, 
      overallRemarks, 
      servicePhotos 
    };
    localStorage.setItem(`extinguisher_${auditId}`, JSON.stringify(dataToSave));
  }, [items, systemDescription, systemOverallStatus, overallRemarks, servicePhotos, auditId]);

  const updateItem = (itemId: string, updates: Partial<Extinguisher>) => {
    setItems(items.map(i => i.id === itemId ? { ...i, ...updates } : i));
  };

  const handleScanClick = (itemId: string) => {
    setScanningId(itemId);
    scanInputRef.current?.click();
  };

  const processScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scanningId) return;
    setIsAiProcessing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType: file.type } },
              { text: "Extract the serial number or barcode text. Return ONLY the string." }
            ]
          }
        });
        const result = response.text?.trim() || '';
        if (result && result !== 'NOT_FOUND') updateItem(scanningId, { serial: result });
        setIsAiProcessing(false);
        setScanningId(null);
      };
      reader.readAsDataURL(file);
    } catch (err) { setIsAiProcessing(false); setScanningId(null); }
  };

  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="EXTINGUISHERS" subtitle={`AUDIT #${auditId}`} showBack />

      {isAiProcessing && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center animate-in fade-in">
           <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
           <h3 className="text-sm font-black italic uppercase tracking-widest text-white">AI Vision: Extracting...</h3>
        </div>
      )}

      <input type="file" ref={scanInputRef} className="hidden" accept="image/*" onChange={processScan} />

      <div className="p-4 flex flex-col gap-6">
        
        <section className="bg-primary/10 border border-primary/20 p-5 rounded-2xl flex flex-col gap-4 shadow-lg shadow-primary/5">
           <div className="flex justify-between items-center border-b border-primary/20 pb-3">
              <h3 className="text-[11px] font-black uppercase text-white tracking-widest italic">System Audit Profile</h3>
              <select value={systemOverallStatus} onChange={(e) => setSystemOverallStatus(e.target.value as any)} className="bg-background-dark/50 border border-primary/40 rounded px-2 h-6 text-[8px] font-black uppercase text-white">
                <option value="Normal">Normal</option><option value="Faulty">Faulty</option><option value="Partial">Partial</option><option value="N/A">N/A</option>
              </select>
           </div>
           <textarea value={systemDescription} onChange={(e) => setSystemDescription(e.target.value)} className="bg-background-dark/50 border-white/5 border rounded-xl p-3 text-xs font-medium h-24 text-white leading-relaxed" placeholder="Description..." />
        </section>

        <div className="flex justify-between items-center px-1">
           <div className="flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Inventory Registry</h3>
              <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em]">{items.length} Registered</span>
           </div>
           <button onClick={() => setItems([...items, getDefaultItem()])} className="text-[9px] font-black text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">+ Add Unit</button>
        </div>

        <div className="flex flex-col gap-5">
          {items.map((item, idx) => (
            <div key={item.id} className="p-6 rounded-[2.5rem] bg-surface-dark border border-white/5 shadow-2xl relative transition-all animate-in slide-in-from-bottom group overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
                <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="absolute top-6 right-6 text-text-muted hover:text-primary transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                
                <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-5">
                  <span className="text-[11px] font-black italic uppercase text-primary">Unit #{idx + 1}</span>
                  <input type="text" value={item.location} onChange={(e) => updateItem(item.id, { location: e.target.value })} className="flex-1 bg-transparent border-none text-[11px] font-bold text-white focus:ring-0 placeholder:text-white/5" placeholder="Location..." />
                </div>

                <div className="flex flex-col gap-5 mb-6">
                   <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                         <label className="text-[7px] font-black text-text-muted uppercase mb-1 ml-1 block">Serial Number</label>
                         <input type="text" value={item.serial} onChange={(e) => updateItem(item.id, { serial: e.target.value })} placeholder="SERIAL" className="w-full bg-background-dark/50 border-none rounded-xl h-10 px-3 text-[10px] font-bold text-white focus:ring-1 focus:ring-primary" />
                         <button onClick={() => handleScanClick(item.id)} className="absolute right-1 top-6 w-8 h-8 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-sm">barcode_scanner</span></button>
                      </div>
                      <div>
                        <label className="text-[7px] font-black text-text-muted uppercase mb-1 ml-1 block">Type</label>
                        <select value={item.type} onChange={(e) => updateItem(item.id, { type: e.target.value })} className="w-full bg-background-dark/50 border-none rounded-xl h-10 px-3 text-[10px] font-bold text-white outline-none"><option>ABC Powder</option><option>CO2 Gas</option><option>Water Mist</option></select>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[7px] font-black text-text-muted uppercase mb-1 ml-1 block">Manufacture Date (MM/YYYY)</label>
                        <div className="flex gap-1">
                           <select value={item.mfgMonth} onChange={(e) => updateItem(item.id, { mfgMonth: e.target.value })} className="flex-1 bg-background-dark/50 border-none rounded-xl h-10 px-2 text-[10px] font-bold text-white outline-none">
                              {months.map(m => <option key={m} value={m}>{m}</option>)}
                           </select>
                           <input type="number" value={item.mfgYear} onChange={(e) => updateItem(item.id, { mfgYear: e.target.value })} className="w-20 bg-background-dark/50 border-none rounded-xl h-10 px-2 text-[10px] font-bold text-white" placeholder="2024" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[7px] font-black text-text-muted uppercase mb-1 ml-1 block">Capacity / Weight</label>
                        <input type="text" value={item.weight} onChange={(e) => updateItem(item.id, { weight: e.target.value })} className="w-full bg-background-dark/50 border-none rounded-xl h-10 px-3 text-[10px] font-bold text-white" placeholder="9KG" />
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-4">
                   <StatusRow label="Pressure Gauge" value={item.pressure} options={['Normal', 'Low']} onToggle={(v:any) => updateItem(item.id, { pressure: v })} 
                     remark={item.remarks.pressure} photo={item.photos.pressure} 
                     onRemark={(txt:string) => updateItem(item.id, { remarks: {...item.remarks, pressure: txt} })}
                     onPhoto={(p:string) => updateItem(item.id, { photos: {...item.photos, pressure: p} })}
                   />
                   <StatusRow label="Safety Pin" value={item.pin} options={['Intact', 'Broken']} onToggle={(v:any) => updateItem(item.id, { pin: v })} 
                     remark={item.remarks.pin} photo={item.photos.pin}
                     onRemark={(txt:string) => updateItem(item.id, { remarks: {...item.remarks, pin: txt} })}
                     onPhoto={(p:string) => updateItem(item.id, { photos: {...item.photos, pin: p} })}
                   />
                   <div className="flex flex-col gap-3">
                      <StatusRow label="Bomba Certification" value={item.bombaCert} options={['Valid', 'Expired']} onToggle={(v:any) => updateItem(item.id, { bombaCert: v })} 
                        remark={item.remarks.bombaCert} photo={item.photos.bombaCert}
                        onRemark={(txt:string) => updateItem(item.id, { remarks: {...item.remarks, bombaCert: txt} })}
                        onPhoto={(p:string) => updateItem(item.id, { photos: {...item.photos, bombaCert: p} })}
                      />
                      <div className="flex items-center gap-2 bg-background-dark/30 p-2 rounded-xl">
                         <span className="text-[8px] font-black text-text-muted uppercase ml-2">Cert Expiry:</span>
                         <input 
                           type="date" 
                           value={item.bombaCertExpiry} 
                           onChange={(e) => updateItem(item.id, { bombaCertExpiry: e.target.value })} 
                           className="bg-transparent border-none text-[10px] font-black text-primary p-0 focus:ring-0" 
                         />
                      </div>
                   </div>
                   <StatusRow label="Physical Body" value={item.physicalBody} options={['Good', 'Damaged']} onToggle={(v:any) => updateItem(item.id, { physicalBody: v })} 
                     remark={item.remarks.physicalBody} photo={item.photos.physicalBody}
                     onRemark={(txt:string) => updateItem(item.id, { remarks: {...item.remarks, physicalBody: txt} })}
                     onPhoto={(p:string) => updateItem(item.id, { photos: {...item.photos, physicalBody: p} })}
                   />
                </div>
            </div>
          ))}
        </div>

        <section className="bg-surface-dark p-6 rounded-[2.5rem] border border-white/5 shadow-xl mt-4">
           <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-primary text-sm">history_edu</span>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Final Verification & Remarks</h3>
           </div>
           <textarea value={overallRemarks} onChange={(e) => setOverallRemarks(e.target.value)} className="w-full bg-background-dark/40 border-none rounded-2xl p-4 text-[11px] h-24 mb-6 text-white focus:ring-1 focus:ring-primary" placeholder="Final findings and summary..." />
           <div className="grid grid-cols-4 gap-3">
              {servicePhotos.map((photo, idx) => (
                <PhotoCaptureBox key={idx} photo={photo} onCapture={(p) => {
                  const newPhotos = [...servicePhotos]; newPhotos[idx] = p; setServicePhotos(newPhotos);
                }} />
              ))}
           </div>
        </section>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-background-dark/95 border-t border-white/5 p-6 pb-12 z-50">
         <button onClick={() => navigate(`/checklist/${auditId}`)} className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl active:scale-95">Commit Log</button>
      </div>
    </div>
  );
};

const StatusRow: React.FC<any> = ({ label, value, options, onToggle, remark, photo, onRemark, onPhoto }) => {
  const isOk = ['Normal', 'Good', 'Intact', 'Valid'].includes(value);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase text-white tracking-widest italic">{label}</span>
        <div className="flex gap-1.5">
          {options.map((opt: string) => {
            const isFaultOpt = ['Low', 'Broken', 'Expired', 'Damaged'].includes(opt);
            const isPositiveOpt = ['Normal', 'Good', 'Intact', 'Valid'].includes(opt);
            
            let btnClass = "";
            if (value === opt) {
              if (isPositiveOpt) {
                btnClass = "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20";
              } else if (isFaultOpt) {
                btnClass = "bg-primary text-white shadow-lg shadow-primary/20";
              } else {
                btnClass = "bg-background-dark text-white";
              }
            } else {
              btnClass = "bg-background-dark/50 text-text-muted opacity-40";
            }

            return (
              <button key={opt} onClick={() => onToggle(opt)} className={`px-4 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${btnClass}`}>{opt}</button>
            );
          })}
        </div>
      </div>
      {!isOk && (
        <div className="bg-background-dark/40 rounded-2xl p-3 flex gap-3 animate-in slide-in-from-top duration-300">
           <PhotoCaptureBox photo={photo} onCapture={onPhoto} className="w-16 h-16 shrink-0" />
           <textarea value={remark || ''} onChange={(e) => onRemark(e.target.value)} className="flex-1 bg-transparent border-none text-[10px] h-16 p-0 font-bold text-white italic placeholder:text-white/10 focus:ring-0" placeholder={`Describe ${label.toLowerCase()} fault...`} />
        </div>
      )}
    </div>
  );
};

const PhotoCaptureBox: React.FC<{ photo?: string; onCapture: (p: string) => void; className?: string }> = ({ photo, onCapture, className }) => {
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
    <div onClick={() => fileRef.current?.click()} className={`bg-background-dark rounded-xl border border-primary/20 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors shadow-inner relative group ${className || 'w-full aspect-square'}`}>
      {photo ? <img src={photo} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary text-xl">camera_outdoor</span>}
      <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
    </div>
  );
};

export default FireExtinguisher;
