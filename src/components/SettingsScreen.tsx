import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SystemConfig } from '../types';
import { Settings, Sparkles, Sliders, RotateCcw, Save } from 'lucide-react';

interface SettingsScreenProps {
  config: SystemConfig;
  onUpdateConfig: (newConfig: SystemConfig) => void;
  onResetDatabase: () => void;
  accentColor: string;
}

export default function SettingsScreen({ config, onUpdateConfig, onResetDatabase, accentColor }: SettingsScreenProps) {
  const [brandingName, setBrandingName] = useState(config.brandingName);
  const [themeAccent, setThemeAccent] = useState(config.accentColor);
  const [targetTemp, setTargetTemp] = useState(config.targetTemp);
  const [activeQueue, setActiveQueue] = useState(config.activeQueueCount);
  const [maxEnergy, setMaxEnergy] = useState(config.energyFluxMax);
  const [showLogs, setShowLogs] = useState(config.showSystemLogs);
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const themeColors = [
    { id: 'green', name: 'Esmeralda Hacker (Green)', value: '#10b981' },
    { id: 'cyan', name: 'Cyberpunk Neon (Cyan)', value: '#06b6d4' },
    { id: 'blue', name: 'Azure Computacional (Blue)', value: '#3b82f6' },
    { id: 'amber', name: 'Alerta Âmbar (Amber)', value: '#f59e0b' },
    { id: 'red', name: 'Perigo Vermelho (Red)', value: '#ef4444' },
    { id: 'purple', name: 'Carbon High-Tech (Purple)', value: '#a855f7' },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SystemConfig = {
      brandingName,
      accentColor: themeAccent as any,
      targetTemp: Number(targetTemp),
      activeQueueCount: Number(activeQueue),
      energyFluxMax: Number(maxEnergy),
      showSystemLogs: showLogs
    };

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!res.ok) throw new Error();
      onUpdateConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert('Erro ao guardar configurações de customização.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none font-sans">
      <div className="flex flex-col gap-1 pb-4 border-b border-slate-200/85">
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: accentColor }}>
          PAINEL DE CONFIGURAÇÕES
        </span>
        <h2 className="text-3xl font-display font-semibold tracking-tight text-slate-800">
          Configurações de Customização das Telas
        </h2>
        <p className="text-slate-500 text-xs tracking-wide">
          Atenda o requisito de telas dinamicamente customizáveis parametrizando logos, fluxos, cores de destaque e restaurando registros de simulação.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Form panel (Col span 8) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
              <Sliders className="w-4 h-4" style={{ color: accentColor }} />
              <span>Customização do Sistema</span>
            </div>

            {saveSuccess && (
              <div className="text-xs font-mono bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-xl">
                ✓ Configurações de layout sincronizadas no servidor com sucesso!
              </div>
            )}

            {/* Rename Branding */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                Nome do Portal (Branding)
              </label>
              <input
                type="text"
                value={brandingName}
                onChange={(e) => setBrandingName(e.target.value)}
                placeholder="Exemplo: Stilos Hardware"
                className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/10 transition-all duration-200"
              />
            </div>

            {/* Accent Theme Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                Paleta de Cores de Destaque das Telas (Visual Bento)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {themeColors.map((color) => {
                  const isSelected = themeAccent === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setThemeAccent(color.id)}
                      className={`flex items-center justify-between p-4 rounded-2xl border text-xs font-mono transition text-left cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'bg-slate-50 text-slate-800 font-bold' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50/50 hover:text-slate-800'
                      }`}
                      style={{ 
                        borderWidth: isSelected ? '2px' : '1px',
                        borderColor: isSelected ? color.value : '#e2e8f0',
                        boxShadow: isSelected ? `0 0 12px ${color.value}15` : 'none'
                      }}
                    >
                      <span className="font-semibold">{color.name}</span>
                      <span 
                        className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: color.value }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom bottom stats setup */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                Parâmetros e Métricas de Estado de Carga das Telas
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider pl-1">
                    Temperatura de Alvo Core (°C)
                  </span>
                  <input
                    type="number"
                    value={targetTemp}
                    onChange={(e) => setTargetTemp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-700 outline-none focus:border-slate-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider pl-1 font-sans">
                    Carga Ativa de Energia (Watts)
                  </span>
                  <input
                    type="number"
                    value={maxEnergy}
                    onChange={(e) => setMaxEnergy(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-700 outline-none focus:border-slate-300 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider pl-1">
                    Fila de implantação (Un.)
                  </span>
                  <input
                    type="number"
                    value={activeQueue}
                    onChange={(e) => setActiveQueue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-700 outline-none focus:border-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* BUTTON SUBMIT */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl transition duration-200 hover:scale-102 active:scale-98 flex items-center gap-2 cursor-pointer shadow-md"
                style={{ 
                  backgroundColor: accentColor,
                  boxShadow: `0 4px 14px ${accentColor}30`
                }}
              >
                <Save className="w-4 h-4" />
                <span>SALVAR OPÇÕES CUSTOMIZADAS</span>
              </button>
            </div>
          </form>
        </div>

        {/* Database diagnostic resets panel (Col span 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: accentColor }} />
              CONTROLE DE INVENTÁRIO
            </h3>
            <p className="text-xs text-slate-550 font-light mb-6 tracking-wide leading-relaxed">
              Deseja redefinir todo o inventário de hardware para as sementes da fábrica do Stilos Hardware? Isto restaurará todos os componentes operacionais padrão (RTX 4090, AMD Ryzen 7 7800X3D, etc.).
            </p>

            <button
              onClick={() => {
                if (window.confirm('Tem certeza de que deseja redefinir os dados para o padrão de sementes? Registros customizados serão perdidos.')) {
                  onResetDatabase();
                }
              }}
              className="w-full text-[10px] font-mono uppercase bg-rose-50 hover:bg-rose-100/60 border border-rose-200 text-rose-600 py-3.5 rounded-xl transition duration-200 font-bold tracking-widest flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTAURAR DATABASE COMPONENTE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
