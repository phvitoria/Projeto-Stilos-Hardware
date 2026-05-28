import React from 'react';
import { LayoutDashboard, Component, PlusSquare, Settings, HelpCircle, FileText, Power, UserCheck } from 'lucide-react';
import { SystemConfig } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config: SystemConfig;
  user: { fullName: string; email: string } | null;
  onLogout: () => void;
  accentColor: string;
}

export default function Sidebar({ activeTab, setActiveTab, config, user, onLogout, accentColor }: SidebarProps) {
  const menuItems = [
    { id: 'catalog', label: 'Painel', icon: LayoutDashboard },
    { id: 'inventory', label: 'Catálogo', icon: Component },
    { id: 'register', label: 'Cadastro', icon: PlusSquare },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 font-sans select-none">
      {/* Top Brand Block */}
      <div>
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span 
              className="text-lg font-bold tracking-tight text-white flex items-center gap-1 transition-all duration-300"
              style={{ 
                textShadow: `0 0 8px ${accentColor}15`
              }}
            >
              {config.brandingName}
            </span>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0" style={{ backgroundColor: accentColor }} />
          </div>
          <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-widest">
            V2.0.4 ACTIVE STATE
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon
                  className="w-4 h-4 transition-transform duration-200 group-hover:scale-105"
                  style={{ color: isActive ? accentColor : 'inherit' }}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Segment */}
      <div className="border-t border-slate-800">
        {/* Active Operator Block */}
        {user && (
          <div className="p-4 border-b border-slate-800/60 bg-slate-850/40 flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm"
              style={{ backgroundColor: accentColor }}
            >
              {user.fullName.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold text-slate-200 truncate font-mono">
                {user.fullName}
              </p>
              <p className="text-[9px] text-slate-500 truncate font-mono">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {/* Quick Utilities */}
        <div className="p-4 space-y-1">
          <button
            onClick={() => {
              alert('Uplink de suporte ativo. Redundância em operação nominal.');
            }}
            className="w-full text-left flex items-center gap-2.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wide text-slate-500 hover:text-slate-300 transition cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Suporte</span>
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className="w-full text-left flex items-center gap-2.5 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wide text-slate-500 hover:text-slate-300 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Registros</span>
          </button>
        </div>

        {/* Shutdown Button */}
        <div className="p-4 pt-1">
          <button
            onClick={onLogout}
            className="w-full border border-red-900/30 bg-red-950/10 hover:bg-red-900/40 hover:border-red-500/40 text-[10px] font-mono uppercase text-red-400 tracking-widest text-center py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 hover:shadow-[0_0_12px_rgba(239,68,68,0.15)] cursor-pointer"
          >
            <Power className="w-3.5 h-3.5" />
            <span>DESLIGAR_SISTEMA</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
