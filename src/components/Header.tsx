import { Search, Bell, Monitor, Activity, Network } from 'lucide-react';
import { SystemConfig } from '../types';

interface HeaderProps {
  config: SystemConfig;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  accentColor: string;
  showCategoryDropdown?: boolean;
}

export default function Header({
  config,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  accentColor,
  showCategoryDropdown = true,
}: HeaderProps) {
  return (
    <header className="h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 font-sans sticky top-0 z-20">
      {/* Brand Title with slant styling per prototype */}
      <div className="flex items-center gap-8">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">
          Admin Panel
        </h1>

        {/* Top Hub links */}
        <div className="hidden md:flex items-center gap-6 text-[11px] font-mono tracking-widest text-slate-500 uppercase">
          <button className="flex items-center gap-1.5 text-slate-800 font-medium border-b-2 py-5 cursor-pointer" style={{ borderBottomColor: accentColor }}>
            <Monitor className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>Inventário</span>
          </button>
          <button onClick={() => alert('Uplink de análise de rede gerado. Todos os drivers operando em estado nominal.')} className="flex items-center gap-1.5 hover:text-slate-800 transition cursor-pointer">
            <Activity className="w-3.5 h-3.5" />
            <span>Análise</span>
          </button>
          <button onClick={() => alert('Análise de redundância e topologia de rede em dia.')} className="flex items-center gap-1.5 hover:text-slate-800 transition cursor-pointer">
            <Network className="w-3.5 h-3.5" />
            <span>Rede</span>
          </button>
        </div>
      </div>

      {/* Action panel & search */}
      <div className="flex items-center gap-4">
        {/* Search bar input */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar no catálogo..."
            className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-700 placeholder-slate-400 font-mono outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 transition-all duration-200"
          />
        </div>

        {/* Category filter option (Optional) */}
        {showCategoryDropdown && (
          <div className="flex flex-col text-left">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-mono outline-none cursor-pointer focus:border-slate-400 transition-all duration-200"
            >
              <option value="Todos">Todos os Componentes</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Bells notification */}
        <button 
          onClick={() => alert('Nenhuma notificação crítica registrada nos registros core.')} 
          className="p-1.5 rounded-xl bg-transparent border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-800 transition cursor-pointer"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* IMPLANTAR / DEPLOY tag badge */}
        <button
          onClick={() => alert('Ação de Implantação iniciada para os nós de hardware pendentes.')}
          className="text-[10px] uppercase font-mono tracking-widest px-4 py-1.5 font-bold rounded-xl cursor-pointer transition-all duration-200 hover:scale-102 filter hover:brightness-105 active:scale-98 shadow-md"
          style={{ 
            backgroundColor: accentColor, 
            color: '#ffffff',
            boxShadow: `0 4px 12px ${accentColor}40`
          }}
        >
          IMPLANTAR
        </button>
      </div>
    </header>
  );
}
