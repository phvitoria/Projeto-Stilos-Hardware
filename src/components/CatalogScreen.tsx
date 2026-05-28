import React from 'react';
import { motion } from 'motion/react';
import { HardwareComponent, SystemConfig } from '../types';
import { Zap, Thermometer, ShieldCheck, ClipboardList, Eye } from 'lucide-react';

interface CatalogScreenProps {
  components: HardwareComponent[];
  onSelectComponent: (comp: HardwareComponent) => void;
  config: SystemConfig;
  accentColor: string;
}

export default function CatalogScreen({ components, onSelectComponent, config, accentColor }: CatalogScreenProps) {
  // Helpers for badge styles in clean Bento layout colors
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'EM ESTOQUE':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200/80';
      case 'ESTOQUE BAIXO':
        return 'bg-amber-50 text-amber-600 border border-amber-200/80';
      case 'ESGOTADO':
        return 'bg-rose-50 text-rose-600 border border-rose-200/80';
      default:
        return 'bg-slate-50 text-slate-500 border border-slate-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none">
      {/* Intro Hero banner */}
      <div className="flex flex-col gap-1.5 pb-4 border-b border-slate-200/80">
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: accentColor }}>
          PORTAL DE HARDWARE ATIVO
        </span>
        <h2 className="text-3xl font-display font-semibold tracking-tight text-slate-800">
          Catálogo Geral de Hardware
        </h2>
        <p className="text-slate-500 text-xs tracking-wide max-w-2xl">
          Fornecendo componentes computacionais de alta performance para a próxima geração. Gerencie o inventário e diagnostique estados de carga operacional.
        </p>
      </div>

      {/* Grid of hardware items in Bento Grid structures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {components.map((comp, index) => (
          <motion.div
            key={comp.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-slate-200/80 rounded-[2rem] overflow-hidden hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
          >
            {/* Top Image area */}
            <div className="relative h-44 bg-slate-50 group overflow-hidden">
              <img
                src={comp.image}
                alt={comp.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
              />
              {/* Badge */}
              <div className="absolute top-4 left-4">
                <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-lg tracking-wider uppercase border ${getBadgeStyle(comp.status)}`}>
                  {comp.status}
                </span>
              </div>
            </div>

            {/* Content info block */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 font-semibold">
                  {comp.category}
                </span>
                <h3 className="text-base font-bold text-slate-800 tracking-tight mt-0.5 truncate">
                  {comp.name}
                </h3>
                <p className="text-slate-500 text-xs mt-1.5 tracking-wide line-clamp-2 h-8 font-light leading-relaxed">
                  {comp.technicalObservation}
                </p>
              </div>

              {/* Price Tag and CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                    PREÇO ATUAL
                  </span>
                  <span className="text-lg font-mono font-bold text-slate-800">
                    ${comp.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {comp.status === 'ESGOTADO' ? (
                  <button
                    onClick={() => alert(`Você inscrito nos alertas de reposição para: ${comp.name}`)}
                    className="text-[10px] uppercase font-mono tracking-wider border border-slate-200 hover:bg-slate-50 text-slate-500 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    AVISE-ME
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectComponent(comp)}
                    className="text-[10px] uppercase font-mono tracking-wider font-bold px-3 py-1.5 rounded-xl transition shadow-sm hover:scale-103 active:scale-97 flex items-center gap-1.5 cursor-pointer text-white"
                    style={{ 
                      backgroundColor: accentColor,
                      boxShadow: `0 3px 8px ${accentColor}30`
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>VER DETALHES</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {components.length === 0 && (
          <div className="col-span-full text-center py-12 border border-dashed border-slate-300 bg-white/50 rounded-[2rem]">
            <p className="text-xs font-mono text-slate-400 uppercase">
              // Nenhum componente encontrado com a consulta atual.
            </p>
          </div>
        )}
      </div>

      {/* Systems telemetry bottom block representing Bento Blocks */}
      <div className="border-t border-slate-200/80 pt-6">
        <h3 className="text-[11px] font-mono tracking-widest uppercase mb-4 font-bold" style={{ color: accentColor }}>
          // ESTADO GLOBAL DO ECOSSISTEMA
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ENERGY FLUX */}
          <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 relative overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                FLUXO DE ENERGIA
              </span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-500">
                <Zap className="w-4 h-4 animate-pulse" />
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-slate-800">
                IDEAL
              </span>
              <span className="text-xs font-mono text-slate-500">
                Carga Ativa: {config.energyFluxMax}W
              </span>
            </div>

            {/* Custom static power bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ width: '85%', backgroundColor: accentColor }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-[9px] font-mono text-slate-400 uppercase font-bold">
              <span>Sincronizado</span>
              <span>100% CAP</span>
            </div>
          </div>

          {/* SYSTEM TEMP */}
          <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                TEMPERATURA DO NÚCLEO
              </span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-500">
                <Thermometer className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-slate-800 font-mono">
                {config.targetTemp}°C
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide font-mono" style={{ color: config.targetTemp > 65 ? '#ef4444' : accentColor }}>
                {config.targetTemp > 65 ? 'SOBREAQUECIMENTO' : 'ESTÁVEL EM OPERAÇÃO'}
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300" 
                style={{ 
                  width: `${(config.targetTemp / 100) * 100}%`,
                  backgroundColor: config.targetTemp > 65 ? '#ef4444' : accentColor
                }}
              />
            </div>

            <div className="flex justify-between items-center mt-2 text-[9px] font-mono text-slate-400 uppercase font-bold">
              <span>Sensor Termo</span>
              <span>Uplink Ativo</span>
            </div>
          </div>

          {/* RECENT STATS */}
          <div className="bg-white border border-slate-200/80 rounded-[2rem] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                FILA DE IMPLANTAÇÃO
              </span>
              <span className="p-1.5 rounded-lg bg-indigo-50" style={{ color: accentColor }}>
                <ClipboardList className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-slate-800 font-mono">
                {config.activeQueueCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Unidades em espera de alocação
              </span>
            </div>

            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ width: '40%', backgroundColor: accentColor }}
              />
            </div>

            <div className="flex justify-between items-center mt-2 text-[9px] font-mono text-slate-400 uppercase font-bold">
              <span>Aguardando Host</span>
              <span>Loop Interno</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
