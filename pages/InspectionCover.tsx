
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

  // Load existing signature onto canvas
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
  
  // Ensure we have a valid ID. If somehow accessed via /new, it generates one once.
  const [activeId] = useState(id && id !== 'new' ? id : `AUDIT-${Date.now()}`);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser] = useState<User>(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : MOCK_USER;
  });

  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientSigData, setClientSigData] = useState('');
  const [techSigData, setTechSigData] = useState('');
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<InspectionStatus>(InspectionStatus.DRAFT);

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem(`setup_${activeId}`);
    if (saved) {
      const data = JSON.parse(saved);
      setClientName(data.clientName || '');
      setLocation(data.location || '');
      setFrequency(data.frequency || 'Monthly');
      setDate(data.date || new Date().toISOString().split('T')[0]);
      setClientSigData(data.clientSigData || '');
      setTechSigData(data.techSigData || '');
      setCoverPhoto(data.coverPhoto || null);
      setCurrentStatus(data.status || InspectionStatus.DRAFT);
    } else {
      // If it's a completely new audit, initialize it with current technician info
      // so it appears on the dashboard immediately
      const initialSetup = {
        clientName: '',
        location: '',
        frequency: 'Monthly',
        date: new Date().toISOString().split('T')[0],
        technicianId: currentUser.id,
        techName: currentUser.name,
        status: InspectionStatus.DRAFT
      };
      localStorage.setItem(`setup_${activeId}`, JSON.stringify(initialSetup));
    }
  }, [activeId, currentUser]);

  // Auto-save data on every change
  useEffect(() => {
    const setupData = { 
      clientName, 
      location, 
      frequency, 
      date, 
      clientSigData, 
      techSigData, 
      coverPhoto,
      status: currentStatus,
      technicianId: currentUser.id, // Keep tech ID persistent
      techName: currentUser.name
    };
    localStorage.setItem(`setup_${activeId}`, JSON.stringify(setupData));
  }, [clientName, location, frequency, date, clientSigData, techSigData, coverPhoto, activeId, currentStatus, currentUser]);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStart = () => {
    if (!clientName || !location || !clientSigData || !techSigData) {
      alert("Please ensure Building Name, Location, and both Signatures are completed.");
      return;
    }
    navigate(`/checklist/${activeId}`);
  };

  return (
    <div className="flex flex-col h-full bg-background-dark overflow-y-auto no-scrollbar pb-32">
      <TopBar title="Report Setup" showBack onBack={() => navigate('/')} />
      
      <div className="p-5 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom duration-500">
        <div className="flex flex-col items-center gap-3 text-center py-2">
          <div 
            onClick={handlePhotoClick}
            className="w-24 h-24 bg-surface-dark rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden cursor-pointer group hover:border-primary/50 transition-all active:scale-95"
          >
            {coverPhoto ? (
              <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-4xl text-primary material-symbols-filled">add_a_photo</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[8px] font-black uppercase text-white tracking-widest">Change Photo</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight italic leading-none">Job Initiation</h1>
            <p className="text-text-muted text-[9px] font-black uppercase tracking-[0.2em] mt-2">Ref: {activeId}</p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Building / Client Name</label>
              <input 
                type="text" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name..."
                className="bg-surface-dark border-none rounded-xl h-12 px-4 text-sm focus:ring-2 focus:ring-primary transition-all font-bold placeholder:font-normal placeholder:opacity-20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Location / Zone</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Level 3, Wing B"
                className="bg-surface-dark border-none rounded-xl h-12 px-4 text-sm focus:ring-2 focus:ring-primary transition-all font-bold placeholder:font-normal placeholder:opacity-20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Audit Cycle</label>
              <select 
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="bg-surface-dark border-none rounded-xl h-12 px-4 text-sm focus:ring-2 focus:ring-primary transition-all font-bold"
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
                className="bg-surface-dark border-none rounded-xl h-12 px-4 text-sm focus:ring-2 focus:ring-primary transition-all font-bold"
              />
            </div>
          </div>

          <div className="bg-surface-dark p-5 rounded-2xl border border-white/5 flex flex-col gap-4 shadow-xl">
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">person_pin</span>
                <h3 className="text-[10px] font-black uppercase tracking-widest italic">Client Authorization</h3>
             </div>
             <SignaturePad onSign={setClientSigData} placeholder="Client Signature Required" initialData={clientSigData} />
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
            clientSigData && techSigData && clientName && location ? 'bg-primary text-white shadow-primary/30' : 'bg-white/5 text-white/20 cursor-not-allowed'
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
