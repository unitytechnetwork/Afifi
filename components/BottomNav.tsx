
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/' },
    { label: 'Inspections', icon: 'assignment', path: '/inspections' },
    { label: 'Users', icon: 'group', path: '/admin/users' },
    { label: 'Settings', icon: 'settings', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-background-dark/90 backdrop-blur-xl border-t border-white/5 pb-8 pt-3 px-6 z-50">
      <ul className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path} className="flex-1">
              <button 
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 w-full transition-colors ${isActive ? 'text-primary' : 'text-text-muted hover:text-white'}`}
              >
                <span className={`material-symbols-outlined text-[26px] ${isActive ? 'material-symbols-filled' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;
