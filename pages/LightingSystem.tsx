
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';

interface LightingUnit {
  id: string;
  location: string;
  brand: string;
  model: string;
  chargingLed: 'Normal' | 'Fault';
  housingCondition: 'Good' | 'Damaged';
  mountingStatus: 'Secure' | 'Loose';
  testOutcome: 'Functional' | 'Failed';
  photos: Record<string, string>;
  remarks: Record<string, string>;
}

const LightingSystem: React.FC = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';
  const lightType = type || 'Emergency';

  // Added standardized Profile State
  const [systemDescription, setSystemDescription] = useState(`${lightType} lighting system maintenance and battery discharge verification.`);
  const [systemOverallStatus, setSystemOverallStatus] = useState<'Normal' | 'Faulty' | 'Partial' | 'N/A'>('Normal');
  const [overallRemarks, setOverallRemarks] = useState('');
  const [servicePhotos, setServicePhotos] = useState<string[]>(['', '', '', '']);

  const getDefaultItem = () => ({ 
    id: Date.now().toString(), 
    location: '', 
    brand: '',
    model: '',
    chargingLed: 'Normal' as const,
    housingCondition: 'Good' as const,
    mountingStatus: 'Secure' as const,
    testOutcome: 'Functional' as const,
    remarks: {},
    photos: {}
  });

  const [items, setItems] = useState<LightingUnit[]>(() => {
    const saved = localStorage.getItem(`light_${lightType}_${auditId}`);
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
    const saved = localStorage.getItem(`light_${lightType}_${auditId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.systemDescription) setSystemDescription(parsed.systemDescription);
        if (parsed.systemOverallStatus) setSystemOverallStatus(parsed.systemOverallStatus);
        if (parsed.overallRemarks) setOverallRemarks(parsed.overallRemarks);
        if (parsed.servicePhotos) setServicePhotos(parsed.servicePhotos);
      } catch (e) {}
    }
  }, [auditId, lightType]);

  useEffect(() => {
    const dataToSave = { 
      items, 
      systemDescription, 
      systemOverallStatus, 
      overallRemarks, 
      servicePhotos 
    };
    localStorage.setItem(`light_${lightType}_${auditId}`, JSON.stringify(dataToSave));
  }, [items, systemDescription, systemOverallStatus, overallRemarks, servicePhotos, auditId, lightType]);

  const updateItem = (itemId: string, updates: Partial<LightingUnit>) => {
    setItems(items.map(i => i.id === itemId ? { ...i, ...updates } : i));
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title={`${lightType.toUpperCase()}`} subtitle={`AUDIT #${auditId}`} showBack />

      <div className="p-4 flex flex-col gap-6">
        
        {/* ADDED: System Audit Profile */}
        <section className="bg-primary/10 border border-primary/20 p-5 rounded-2xl flex flex-col gap-4 shadow-lg shadow-primary/5">
           <div className="flex justify-between items-center border-b border-primary/20 pb-3">
              <h3 className="text-[11px] font-black uppercase text-white tracking-widest italic">System Audit Profile</h3>
              <select value={systemOverallStatus} onChange={(e) => setSystemOverallStatus(e.target.value as any)} className="bg-background-dark/50 border border-primary/40 rounded px-2 h-6 text-[8px] font-black uppercase text-white">
                <option value="Normal">Normal</option><option value="Faulty">Faulty</option><option value="Partial">Partial</option><option value="N/A">N/A</option>
              </select>
           </div>
           <textarea value={systemDescription} onChange={(e) => setSystemDescription(e.target.value)} className="bg-background-dark/50 border-white/5 border rounded-xl p-3 text-xs font-medium h-16 text-white" placeholder="Description..." />
        </section>

        <div className="flex justify-between items-center px-1">
           <div className="flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Registry Log</h3>
              <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em]">{items.length} Units Logged</span>
           </div>
           <button onClick={() => setItems([...items, getDefaultItem()])} className="text-[9px] font-black text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">+ Add Unit</button>
        </div>

        <div className="flex flex-col gap-5">
          {items.map((item, idx) => (
            <div key={item.id} className="p-6 rounded-[2.5rem] bg-surface-dark border border-white/5 shadow-2xl relative transition-all animate-in slide-in-from-bottom group overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20" />
                <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="absolute top-6 right-6 text-text-muted hover:text-primary"><span className="material-symbols-outlined text-sm">delete</span></button>
                
                <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-5">
                  <span className="text-[11px] font-black italic uppercase text-primary">Unit #{idx + 1}</span>
                  <input type="text" value={item.location} onChange={(e) => updateItem(item.id, { location: e.target.value })} className="flex-1 bg-transparent border-none text-[11px] font-bold text-white focus:ring-0 placeholder:text-white/5" placeholder="Location Name..." />
                </div>

                <div className="flex flex-col gap-4">
                   <StatusRow label="Discharge Test" value={item.testOutcome} options={['Functional', 'Failed']} onToggle={(v:any) => updateItem(item.id, { testOutcome: v })} 
                     remark={item.remarks.testOutcome} photo={item.photos.testOutcome}
                     onRemark={(txt:string) => updateItem(item.id, { remarks: {...item.remarks, testOutcome: txt} })}
                     onPhoto={(p:string) => updateItem(item.id, { photos: {...item.photos, testOutcome: p} })}
                   />
                   <StatusRow label="Mounting Security" value={item.mountingStatus} options={['Secure', 'Loose']} onToggle={(v:any) => updateItem(item.id, { mountingStatus: v })} 
                     remark={item.remarks.mountingStatus} photo={item.photos.mountingStatus}
                     onRemark={(txt:string) => updateItem(item.id, { remarks: {...item.remarks, mountingStatus: txt} })}
                     onPhoto={(p:string) => updateItem(item.id, { photos: {...item.photos, mountingStatus: p} })}
                   />
                   <StatusRow label="Housing Condition" value={item.housingCondition} options={['Good', 'Damaged']} onToggle={(v:any) => updateItem(item.id, { housingCondition: v })} 
                     remark={item.remarks.housingCondition} photo={item.photos.housingCondition}
                     onRemark={(txt:string) => updateItem(item.id, { remarks: {...item.remarks, housingCondition: txt} })}
                     onPhoto={(p:string) => updateItem(item.id, { photos: {...item.photos, housingCondition: p} })}
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
         <button onClick={() => navigate(`/checklist/${auditId}`)} className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl active:scale-95">Commit Registry</button>
      </div>
    </div>
  );
};

const StatusRow: React.FC<any> = ({ label, value, options, onToggle, remark, photo, onRemark, onPhoto }) => {
  const isOk = ['Functional', 'Good', 'Secure'].includes(value);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase text-white tracking-widest italic">{label}</span>
        <div className="flex gap-1.5">
          {options.map((opt: string) => {
            const isFaultOpt = ['Failed', 'Loose', 'Damaged'].includes(opt);
            const isPositiveOpt = ['Functional', 'Good', 'Secure'].includes(opt);

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

export default LightingSystem;
