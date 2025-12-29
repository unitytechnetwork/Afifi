
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
  cylinderYear: string; // Year Tong
  pressure: 'Normal' | 'Low';
  pin: 'Intact' | 'Broken';
  cableTie: 'Intact' | 'Broken'; // Cable Tie
  bombaCert: 'Valid' | 'Expired'; // Cert Bomba
  bombaCertExpiry: string; // Tarikh Valid Cert Bomba
  physicalBody: 'Good' | 'Damaged'; // Physical Tong
  photo?: string;
  remarks?: string;
}

const FireExtinguisher: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auditId = id || 'NEW-AUDIT';
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const [items, setItems] = useState<Extinguisher[]>(() => {
    const saved = localStorage.getItem(`extinguisher_${auditId}`);
    return saved ? JSON.parse(saved) : [{ 
      id: '1', 
      serial: '', 
      type: 'ABC Powder', 
      weight: '9kg',
      location: '',
      expiry: '', 
      lastServiceDate: new Date().toISOString().split('T')[0],
      cylinderYear: new Date().getFullYear().toString(),
      pressure: 'Normal', 
      pin: 'Intact',
      cableTie: 'Intact',
      bombaCert: 'Valid',
      bombaCertExpiry: '',
      physicalBody: 'Good'
    }];
  });

  useEffect(() => {
    localStorage.setItem(`extinguisher_${auditId}`, JSON.stringify(items));
  }, [items, auditId]);

  const updateItem = (itemId: string, updates: Partial<Extinguisher>) => {
    setItems(items.map(i => i.id === itemId ? { ...i, ...updates } : i));
  };

  const deleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const addItem = () => {
    setItems([...items, { 
      id: Date.now().toString(), 
      serial: '', 
      type: 'ABC Powder', 
      weight: '9kg',
      location: '',
      expiry: '', 
      lastServiceDate: new Date().toISOString().split('T')[0],
      cylinderYear: new Date().getFullYear().toString(),
      pressure: 'Normal', 
      pin: 'Intact',
      cableTie: 'Intact',
      bombaCert: 'Valid',
      bombaCertExpiry: '',
      physicalBody: 'Good'
    }]);
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
              { text: "Extract the serial number or barcode text from this fire extinguisher. Return ONLY the alphanumeric string. If none found, return 'NOT_FOUND'." }
            ]
          }
        });

        const result = response.text?.trim() || '';
        if (result && result !== 'NOT_FOUND') {
          updateItem(scanningId, { serial: result });
        } else {
          alert("Could not read serial number. Please try again or enter manually.");
        }
        setIsAiProcessing(false);
        setScanningId(null);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Scanning error:", err);
      setIsAiProcessing(false);
      setScanningId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="EXTINGUISHER REGISTRY" subtitle={`AUDIT #${auditId}`} showBack />

      {isAiProcessing && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center animate-in fade-in">
           <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
           <h3 className="text-sm font-black italic uppercase tracking-widest text-white">AI Vision: Extracting Serial...</h3>
        </div>
      )}

      <input 
        type="file" 
        ref={scanInputRef} 
        className="hidden" 
        accept="image/*" 
        capture="environment" 
        onChange={processScan} 
      />

      <div className="p-4 flex flex-col gap-6">
        <div className="flex justify-between items-center px-1">
           <div className="flex flex-col">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Asset Inventory</h3>
              <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em]">{items.length} Units Registered</span>
           </div>
           <button onClick={addItem} className="text-[9px] font-black text-primary bg-primary/10 px-4 py-2 rounded-xl uppercase tracking-widest border border-primary/20 active:scale-95 transition-all shadow-lg shadow-primary/5">+ Add Unit</button>
        </div>

        <div className="flex flex-col gap-4">
          {items.map((item, idx) => {
            const isBombaDateExpired = item.bombaCertExpiry && new Date(item.bombaCertExpiry) < new Date();
            const hasFault = item.pressure === 'Low' || 
                             item.pin === 'Broken' || 
                             item.cableTie === 'Broken' || 
                             item.bombaCert === 'Expired' || 
                             isBombaDateExpired ||
                             item.physicalBody === 'Damaged';

            return (
              <div key={item.id} className={`p-5 rounded-3xl border transition-all animate-in slide-in-from-bottom duration-300 relative group ${hasFault ? 'bg-primary/5 border-primary/20 shadow-2xl' : 'bg-surface-dark border-white/5 shadow-xl'}`}>
                <button onClick={() => deleteItem(item.id)} className="absolute top-5 right-5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary">
                   <span className="material-symbols-outlined text-sm">delete</span>
                </button>
                
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                     <span className="text-[11px] font-black italic uppercase text-primary">Extinguisher #{idx + 1}</span>
                     <div className="h-px flex-1 bg-white/5" />
                  </div>

                  {/* Serial & Type Row */}
                  <div className="grid grid-cols-2 gap-3">
                     <div className="flex flex-col gap-1.5 relative">
                        <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Serial Number</label>
                        <div className="relative group/input">
                          <input 
                            type="text" 
                            value={item.serial}
                            onChange={(e) => updateItem(item.id, { serial: e.target.value })}
                            placeholder="SCAN OR ENTER" 
                            className="w-full bg-background-dark/50 border-none rounded-xl h-11 pl-4 pr-10 text-[11px] font-bold text-white focus:ring-1 focus:ring-primary placeholder:opacity-20" 
                          />
                          <button 
                            onClick={() => handleScanClick(item.id)}
                            className="absolute right-2 top-1.5 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary active:scale-90 transition-all hover:bg-primary hover:text-white"
                          >
                            <span className="material-symbols-outlined text-sm">barcode_scanner</span>
                          </button>
                        </div>
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Extinguisher Type</label>
                        <select 
                          value={item.type}
                          onChange={(e) => updateItem(item.id, { type: e.target.value })}
                          className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-[11px] font-bold text-white focus:ring-1 focus:ring-primary appearance-none"
                        >
                           <option>ABC Powder</option>
                           <option>CO2 Gas</option>
                           <option>Water Mist</option>
                           <option>Wet Chemical</option>
                           <option>Foam</option>
                        </select>
                     </div>
                  </div>

                  {/* Weight & Manufacturing Year */}
                  <div className="grid grid-cols-2 gap-3">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Agent Weight</label>
                        <select 
                          value={item.weight}
                          onChange={(e) => updateItem(item.id, { weight: e.target.value })}
                          className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-[11px] font-bold text-white focus:ring-1 focus:ring-primary"
                        >
                           <option>1kg</option>
                           <option>2kg</option>
                           <option>4.5kg</option>
                           <option>6kg</option>
                           <option>9kg</option>
                           <option>25kg (Mobile)</option>
                           <option>50kg (Mobile)</option>
                        </select>
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Manufacturing Year</label>
                        <input 
                          type="text" 
                          value={item.cylinderYear}
                          onChange={(e) => updateItem(item.id, { cylinderYear: e.target.value })}
                          placeholder="e.g. 2023" 
                          className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-[11px] font-bold text-white focus:ring-1 focus:ring-primary" 
                        />
                     </div>
                  </div>

                  {/* Location & Dates */}
                  <div className="flex flex-col gap-1.5">
                     <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Floor / Room Location</label>
                     <input 
                        type="text" 
                        value={item.location}
                        onChange={(e) => updateItem(item.id, { location: e.target.value })}
                        placeholder="e.g. Lobby G, Block A" 
                        className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-[11px] font-bold text-white focus:ring-1 focus:ring-primary" 
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Last Service</label>
                        <input 
                          type="date" 
                          value={item.lastServiceDate}
                          onChange={(e) => updateItem(item.id, { lastServiceDate: e.target.value })}
                          className="bg-background-dark/50 border-none rounded-xl h-11 px-4 text-[10px] font-bold text-white focus:ring-1 focus:ring-primary" 
                        />
                     </div>
                     <div className="flex flex-col gap-1.5">
                        <label className="text-[8px] font-black text-text-muted uppercase tracking-widest ml-1">Service Expiry Date</label>
                        <input 
                          type="date" 
                          value={item.expiry}
                          onChange={(e) => updateItem(item.id, { expiry: e.target.value })}
                          className={`bg-background-dark/50 border-none rounded-xl h-11 px-4 text-[10px] font-bold focus:ring-1 focus:ring-primary ${new Date(item.expiry) < new Date() ? 'text-primary' : 'text-emerald-500'}`} 
                        />
                     </div>
                  </div>

                  {/* Status Toggles Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                     <StatusToggle 
                        label="Pressure Gauge" 
                        value={item.pressure} 
                        options={['Normal', 'Low']} 
                        onToggle={(v) => updateItem(item.id, { pressure: v as any })} 
                     />
                     <StatusToggle 
                        label="Safety Pin" 
                        value={item.pin} 
                        options={['Intact', 'Broken']} 
                        onToggle={(v) => updateItem(item.id, { pin: v as any })} 
                     />
                     <StatusToggle 
                        label="Cable Tie" 
                        value={item.cableTie} 
                        options={['Intact', 'Broken']} 
                        onToggle={(v) => updateItem(item.id, { cableTie: v as any })} 
                     />
                     
                     {/* Updated Cert Bomba with Date */}
                     <div className="bg-background-dark/30 p-3 rounded-2xl border border-white/5 flex flex-col gap-2">
                        <span className="text-[7px] font-black uppercase text-text-muted tracking-widest text-center">Cert Bomba</span>
                        <div className="flex gap-1 h-7">
                           {(['Valid', 'Expired'] as const).map(v => (
                              <button 
                                 key={v}
                                 onClick={() => updateItem(item.id, { bombaCert: v })}
                                 className={`flex-1 rounded-lg text-[7px] font-black uppercase transition-all ${item.bombaCert === v ? (v === 'Valid' ? 'bg-emerald-600' : 'bg-primary') + ' text-white shadow-lg' : 'bg-background-dark/50 text-text-muted'}`}
                              >
                                 {v}
                              </button>
                           ))}
                        </div>
                        <div className="mt-1">
                           <input 
                             type="date" 
                             value={item.bombaCertExpiry}
                             onChange={(e) => updateItem(item.id, { bombaCertExpiry: e.target.value })}
                             className={`w-full bg-background-dark/80 border-none rounded-lg h-7 px-2 text-[8px] font-black text-center focus:ring-1 focus:ring-primary ${isBombaDateExpired ? 'text-primary' : 'text-emerald-500'}`}
                             placeholder="Expiry Date"
                           />
                        </div>
                     </div>

                     <StatusToggle 
                        label="Physical Body" 
                        value={item.physicalBody} 
                        options={['Good', 'Damaged']} 
                        onToggle={(v) => updateItem(item.id, { physicalBody: v as any })} 
                        className="col-span-2"
                     />
                  </div>

                  {/* Fault Proof Section */}
                  {hasFault && (
                    <div className="flex gap-3 pt-2 animate-in slide-in-from-top duration-300 border-t border-white/5 mt-2">
                      <PhotoCaptureBox 
                        photo={item.photo} 
                        onCapture={(p) => updateItem(item.id, { photo: p })} 
                      />
                      <textarea 
                        value={item.remarks || ''}
                        onChange={(e) => updateItem(item.id, { remarks: e.target.value })}
                        placeholder="Detail the specific deficiency or physical defect..."
                        className="flex-1 bg-background-dark/50 border-none rounded-2xl text-[10px] p-3 h-16 text-white font-bold focus:ring-1 focus:ring-primary placeholder:opacity-20"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <button 
           onClick={addItem}
           className="w-full py-5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-1 text-text-muted hover:text-primary hover:border-primary/30 transition-all active:scale-95 group"
        >
           <span className="material-symbols-outlined text-2xl group-hover:scale-125 transition-transform">add_circle</span>
           <span className="text-[10px] font-black uppercase tracking-[0.3em]">Register New Unit</span>
        </button>
      </div>

      <div className="fixed bottom-0 w-full max-w-md bg-surface-dark/95 backdrop-blur-xl border-t border-white/5 p-5 pb-10 z-50">
         <button onClick={() => navigate(`/checklist/${auditId}`)} className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl active:scale-95 flex items-center justify-center gap-3">
            <span>Commit Extinguisher Log</span>
            <span className="material-symbols-outlined text-sm">verified_user</span>
         </button>
      </div>
    </div>
  );
};

const StatusToggle: React.FC<{ 
  label: string; 
  value: string; 
  options: [string, string]; 
  onToggle: (v: string) => void;
  className?: string;
}> = ({ label, value, options, onToggle, className }) => (
  <div className={`bg-background-dark/30 p-3 rounded-2xl border border-white/5 flex flex-col gap-2 ${className}`}>
     <span className="text-[7px] font-black uppercase text-text-muted tracking-widest text-center">{label}</span>
     <div className="flex gap-1 h-7">
        {options.map(v => {
           const isFaultOption = v === 'Low' || v === 'Broken' || v === 'Expired' || v === 'Damaged';
           return (
              <button 
                 key={v}
                 onClick={() => onToggle(v)}
                 className={`flex-1 rounded-lg text-[7px] font-black uppercase transition-all ${value === v ? (isFaultOption ? 'bg-primary' : 'bg-emerald-600') + ' text-white shadow-lg' : 'bg-background-dark/50 text-text-muted'}`}
              >
                 {v}
              </button>
           );
        })}
     </div>
  </div>
);

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
    <div 
       onClick={() => fileRef.current?.click()} 
       className="w-16 h-16 bg-background-dark rounded-2xl border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-primary/50 transition-colors shadow-inner"
    >
       {photo ? (
         <img src={photo} className="w-full h-full object-cover" />
       ) : (
         <span className="material-symbols-outlined text-primary/40 text-lg">add_a_photo</span>
       )}
       <input type="file" ref={fileRef} className="hidden" accept="image/*" capture="environment" onChange={handleFile} />
    </div>
  );
};

export default FireExtinguisher;
