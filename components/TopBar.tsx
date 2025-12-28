
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TopBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onSave?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, subtitle, showBack, onSave }) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5 px-4 py-4">
      <div className="flex items-center justify-between">
        {showBack ? (
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        ) : (
          <div className="w-10" />
        )}

        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold leading-tight tracking-tight uppercase italic">{title}</h2>
          {subtitle && <span className="text-[9px] text-text-muted font-black uppercase tracking-widest mt-0.5">{subtitle}</span>}
        </div>

        {onSave ? (
          <button 
            onClick={onSave}
            className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-primary/10 transition-all active:scale-90"
          >
            <span className="material-symbols-outlined">sync</span>
          </button>
        ) : (
          <div className="w-10" />
        )}
      </div>
    </div>
  );
};

export default TopBar;
