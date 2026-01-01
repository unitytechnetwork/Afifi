
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { MOCK_USER } from '../constants';
import { InspectionStatus, User } from '../types';

interface SignaturePadProps {
  onSign: (data: string) => void;
  placeholder: string;
  initialData?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSign, placeholder, initialData }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (initialData && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setIsEmpty(false);
        };
        img.src = initialData;
      }
    }
  }, [initialData]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      onSign(canvasRef.current.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ec1313'; 

    if (isEmpty) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsEmpty(false);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSign('');
  };

  return (
    <div className="relative w-full h-32 bg-background-dark/50 rounded-xl border border-white/10 overflow-hidden cursor-crosshair">
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-30">
          <span className="material-symbols-outlined text-3xl">signature</span>
          <span className="text-[8px] font-black uppercase tracking-widest">{placeholder}</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={400}
        height={128}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full touch-none"
      />
      {!isEmpty && (
        <button 
          onClick={(e) => { e.stopPropagation(); clear(); }}
          className="absolute top-2 right-2 p-1 bg-white/5 hover:bg-white/10 rounded text-[8px] font-black uppercase tracking-widest text-text-muted transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
};

const InspectionCover: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [activeId] = useState(id && id !== 'new' ? id : `AUDIT-${Date.now()}`);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [currentUser] = useState<User>(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : MOCK_USER;
  });

  const [clientName, setClientName] = useState('');
  const [clientRepName, setClientRepName] = useState('');
  const [clientAuthDate, setClientAuthDate] = useState(new Date().toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState('Monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientSigData, setClientSigData] = useState('');
  const [techSigData, setTechSigData] = useState('');
  const [clientLogo, setClientLogo] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<InspectionStatus>(InspectionStatus.DRAFT);

  useEffect(() => {
    const saved = localStorage.getItem(`setup_${activeId}`);
    if (saved) {
      const data = JSON.parse(saved);
      setClientName(data.clientName || '');
      setClientRepName(data.clientRepName || '');
      setClientAuthDate(data.clientAuthDate || data.date || new Date().toISOString().split('T')[0]);
      setFrequency(data.frequency || 'Monthly');
      setDate(data.date || new Date().toISOString().split('T')[0]);
      setClientSigData(data.clientSigData || '');
      setTechSigData(data.techSigData || '');
      setClientLogo(data.clientLogo || null);
      setCurrentStatus(data.status || InspectionStatus.DRAFT);
    } else {
      const initialSetup = {
        clientName: '',
        clientRepName: '',
        clientAuthDate: new Date().toISOString().split('T')[0],
        frequency: 'Monthly',
        date: new Date().toISOString().split('T')[0],
        technicianId: currentUser.id,
        techName: currentUser.name,
        status: InspectionStatus.DRAFT
      };
      localStorage.setItem(`setup_${activeId}`, JSON.stringify(initialSetup));
    }
  }, [activeId, currentUser]);

  useEffect(() => {
    const setupData = { 
      clientName, 
      clientRepName,
      clientAuthDate,
      frequency, 
      date, 
      clientSigData, 
      techSigData, 
      clientLogo,
      status: currentStatus,
      technicianId: currentUser.id,
      techName: currentUser.name
    };
    localStorage.setItem(`setup_${activeId}`, JSON.stringify(setupData));
  }, [clientName, clientRepName, clientAuthDate, frequency, date, clientSigData, techSigData, clientLogo, activeId, currentStatus, currentUser]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setClientLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClientLogo(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleStart = () => {
    if (!clientName || !clientSigData || !techSigData || !clientRepName) {
      alert("Please ensure Building Name, Representative Name, and both Signatures are completed.");
      return;
    }
    navigate(`/checklist/${activeId}`);
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="Report Setup" showBack onBack={() => navigate('/')} />
      
      <div className="p-5 flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* Logo Section */}
        <div className="flex flex-col gap-4">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Report Visuals</h3>
              <span className="text-[8px] font-black text-primary uppercase">Identity Verification</span>
           </div>

           <div className="w-full">
              {/* Client Logo Slot */}
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="bg-surface-dark border border-white/5 rounded-3xl h-40 flex flex-col items-center justify-center relative overflow-hidden group transition-all hover:border-primary/40 active:scale-[0.99] cursor-pointer shadow-xl"
              >
                 {clientLogo ? (
                   <>
                    <img src={clientLogo} className="w-full h-full object-contain p-6" alt="Client Logo" />
                    <button 
                      onClick={removePhoto}
                      className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg z-20 hover:scale-110 active:scale-90 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                   </>
                 ) : (
                   <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-4xl">add_photo_alternate</span>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase text-white tracking-widest">Upload Client Logo</span>
                        <span className="text-[8px] font-black uppercase text-text-muted mt-1 opacity-50 tracking-tighter">PNG / JPG / WEBP</span>
                      </div>
                   </div>
                 )}
                 <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-5 mt-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Building Name</label>
              <input 
                type="text" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter building name..."
                className="bg-surface-dark border-none rounded-xl h-12 px-4 text-sm focus:ring-2 focus:ring-primary transition-all font-bold placeholder:font-normal placeholder:opacity-20 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Audit Cycle</label>
              <select 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="bg-surface-dark border-none rounded-xl h-12 px-4 text-sm focus:ring-2 focus:ring-primary transition-all font-bold text-white appearance-none"
              >
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Tarikh (Date)</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-surface-dark border-none rounded-xl h-12 px-4 text-sm focus:ring-2 focus:ring-primary transition-all font-bold text-white"
              />
            </div>
          </div>

          <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 flex flex-col gap-4 shadow-xl">
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">person_pin</span>
                <h3 className="text-[10px] font-black uppercase tracking-widest italic">Client Authorization</h3>
             </div>
             
             <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Representative Name</label>
                  <input 
                    type="text" 
                    value={clientRepName}
                    onChange={(e) => setClientRepName(e.target.value)}
                    placeholder="Nama wakil client..."
                    className="bg-background-dark/50 border-none rounded-xl h-10 px-4 text-xs focus:ring-1 focus:ring-primary transition-all font-bold text-white"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Authorization Date</label>
                  <input 
                    type="date" 
                    value={clientAuthDate}
                    onChange={(e) => setClientAuthDate(e.target.value)}
                    className="bg-background-dark/50 border-none rounded-xl h-10 px-4 text-xs focus:ring-1 focus:ring-primary transition-all font-bold text-white"
                  />
                </div>

                <SignaturePad onSign={setClientSigData} placeholder="Client Signature Required" initialData={clientSigData} />
             </div>
          </div>

          <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 flex flex-col gap-4 shadow-xl">
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">engineering</span>
                <h3 className="text-[10px] font-black uppercase tracking-widest italic">Technician Sign-off</h3>
             </div>
             <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Tech: {currentUser.name}</span>
                <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase tracking-widest">Verified</span>
             </div>
             <SignaturePad onSign={setTechSigData} placeholder="Draw Technician Signature" initialData={techSigData} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-md p-5 pb-10 bg-background-dark/95 backdrop-blur-xl border-t border-white/5 z-50">
        <button 
          onClick={handleStart}
          className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] transition-all group ${
            clientSigData && techSigData && clientName && clientRepName ? 'bg-primary text-white shadow-primary/30' : 'bg-white/5 text-white/20 cursor-not-allowed'
          }`}
        >
          <span className="font-black uppercase tracking-[0.2em] text-sm italic">Begin Checklist</span>
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default InspectionCover;
