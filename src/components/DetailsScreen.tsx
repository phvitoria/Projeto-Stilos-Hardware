import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HardwareComponent, HardwareLog } from '../types';
import { ArrowLeft, Edit3, Settings2, ShieldCheck, Thermometer, Database, Check, Cpu } from 'lucide-react';

interface DetailsScreenProps {
  component: HardwareComponent;
  onBack: () => void;
  onUpdateComponent: (updated: HardwareComponent) => void;
  accentColor: string;
}

export default function DetailsScreen({ component, onBack, onUpdateComponent, accentColor }: DetailsScreenProps) {
  // Simulator States
  const [clockOverride, setClockOverride] = useState(component.clockSpeed);
  const [thermalOverride, setThermalOverride] = useState(parseInt(component.thermalState) || 64);
  const [memoryUsageSim, setMemoryUsageSim] = useState(component.memoryUsage);
  const [loadSim, setLoadSim] = useState(component.loadIntensity);

  // New log entry state
  const [newLogAction, setNewLogAction] = useState('');
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [isEditingSpecs, setIsEditingSpecs] = useState(false);

  // Specifications state
  const [specsList, setSpecsList] = useState(component.specs);

  // Add Maintenance Log item
  const handleAddLog = async () => {
    if (!newLogAction.trim()) return;

    const dateToday = new Date().toISOString().substring(0, 10).replace(/-/g, '.');
    const newLogItem: HardwareLog = {
      date: dateToday,
      action: newLogAction.toUpperCase()
    };

    const updatedComponent = {
      ...component,
      maintenanceLogs: [newLogItem, ...component.maintenanceLogs]
    };

    try {
      const res = await fetch(`/api/components/${component.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenanceLogs: updatedComponent.maintenanceLogs })
      });
      if (!res.ok) throw new Error();
      
      onUpdateComponent(updatedComponent);
      setNewLogAction('');
      setIsAddingLog(false);
    } catch (err) {
      alert('Erro ao salvar novo registro de manutenção.');
    }
  };

  // Save the simulated parameters (Overrides)
  const saveTelemetrySim = async () => {
    const updatedComponent = {
      ...component,
      clockSpeed: clockOverride,
      thermalState: `${thermalOverride} °C`,
      memoryUsage: memoryUsageSim,
      loadIntensity: loadSim
    };

    try {
      const res = await fetch(`/api/components/${component.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clockSpeed: clockOverride,
          thermalState: `${thermalOverride} °C`,
          memoryUsage: memoryUsageSim,
          loadIntensity: loadSim
        })
      });
      if (!res.ok) throw new Error();

      onUpdateComponent(updatedComponent);
      alert('Telemetria do componente atualizada com sucesso!');
    } catch (err) {
      alert('Falha ao atualizar parâmetros de telemetria.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none font-sans">
      {/* Back & Breadcrumb bar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 font-bold">
          <span className="hover:text-slate-800 transition cursor-pointer" onClick={onBack}>CATÁLOGO</span>
          <span>/</span>
          <span className="text-slate-600 uppercase font-bold">{component.id}</span>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-mono uppercase bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 px-4 py-2 border border-slate-200 rounded-xl cursor-pointer transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar</span>
          </button>
        </div>
      </div>

      {/* Primary Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch font-sans">
        
        {/* LEFT COLUMN: Large Display visual card (Col span 5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between relative overflow-hidden text-slate-800">
          
          {/* Large image component frame */}
          <div className="space-y-4">
            <div className="relative h-60 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/60 flex items-center justify-center shadow-inner">
              <img
                src={component.image}
                alt={component.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-90 absolute inset-0 filter hover:scale-102 transition duration-300"
              />
              <div className="relative z-10 p-6 flex flex-col justify-end h-full w-full bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent">
                <h3 className="text-xl md:text-2xl font-display font-bold text-white uppercase tracking-tight leading-none drop-shadow-md">
                  {component.name}
                </h3>
                <span className="text-[10px] font-mono mt-2.5 flex items-center gap-1.5 font-bold uppercase text-white/90">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                  STATUS: OPTIMAL_PERFORMANCE
                </span>
              </div>
            </div>

            {/* Quick telemetry parameters indicators (Clock, memory, thermals) */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl shadow-inner text-center">
                <span className="text-[8px] font-mono text-slate-400 font-bold block uppercase">CORE_CLOCK</span>
                <span className="text-sm font-mono font-bold text-slate-800 block mt-1">
                  {clockOverride}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl shadow-inner text-center">
                <span className="text-[8px] font-mono text-slate-400 font-bold block uppercase">MEMORY_VRAM</span>
                <span className="text-sm font-mono font-bold text-slate-800 block mt-1">
                  {component.vram}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl shadow-inner text-center">
                <span className="text-[8px] font-mono text-slate-400 font-bold block uppercase">THERMAL_STATE</span>
                <span className={`text-sm font-mono font-bold block mt-1`} style={{ color: thermalOverride > 75 ? '#ef4444' : '#1e293b' }}>
                  {thermalOverride}°C
                </span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE COMPONENT CUSTOMIZER SECTION (diagnostic) */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5" style={{ color: accentColor }} />
                CONEXÃO AJUSTES DIAGNÓSTICO
              </span>
              <span className="text-[8px] font-mono text-slate-400 font-bold">OVERRIDE CAPABLE</span>
            </div>

            <div className="space-y-3.5">
              {/* Clock input override */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold Pl-1">
                  <span>FREQUÊNCIA DE SINAL</span>
                  <span className="text-slate-800">{clockOverride}</span>
                </div>
                <input
                  type="text"
                  value={clockOverride}
                  onChange={(e) => setClockOverride(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100/50 text-xs px-3 py-2 text-slate-700 rounded-xl font-mono outline-none focus:border-slate-350"
                />
              </div>

              {/* Thermal override slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
                  <span>TEMPERATURA NÚCLEO (°C)</span>
                  <span className={thermalOverride > 75 ? 'text-red-500 font-bold' : 'text-slate-700'}>
                    {thermalOverride} °C
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="105"
                  value={thermalOverride}
                  onChange={(e) => setThermalOverride(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer outline-none"
                  style={{ accentColor: accentColor }}
                />
              </div>

              {/* Apply parameters button */}
              <button
                onClick={saveTelemetrySim}
                className="w-full text-[10px] font-mono uppercase bg-slate-50 hover:bg-slate-100 border text-slate-600 hover:text-slate-800 py-2.5 rounded-xl transition font-bold tracking-widest border-slate-200 cursor-pointer"
              >
                APLICAR ALTERAÇÕES SIMULADAS
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Specifications (Col span 7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm flex flex-col justify-between space-y-6 relative text-slate-800">

          {/* ESPECIFICAÇÕES_PRINCIPAIS table */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                ESPECIFICAÇÕES_PRINCIPAIS
              </h4>
              <span className="text-[10px] font-mono text-slate-400 font-bold">REF_ID: {component.id.toUpperCase()}</span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              {specsList.map((spec, index) => (
                <div key={index} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 px-2 rounded-xl transition">
                  <span className="text-slate-500 font-semibold">{spec.label}</span>
                  <span 
                    className={`font-semibold text-right ${
                      spec.highlight ? 'font-bold' : ''
                    }`}
                    style={{ color: spec.highlight ? accentColor : '#1e293b' }}
                  >
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive core sliders displaying simulation metrics */}
          <div className="space-y-4 pt-4 border-t border-slate-100 bg-slate-50/50 p-5 rounded-2xl">
            {/* Memory Usage Simulator (USD_DE_MEMÓRIA) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                <span className="text-slate-400">USO_DE_MEMÓRIA_ATIVO</span>
                <span style={{ color: accentColor }} className="font-bold">{memoryUsageSim}%</span>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${memoryUsageSim}%`, backgroundColor: accentColor }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={memoryUsageSim}
                  onChange={(e) => setMemoryUsageSim(parseInt(e.target.value))}
                  className="w-20 outline-none cursor-pointer h-1.5"
                  style={{ accentColor: accentColor }}
                />
              </div>
            </div>

            {/* Load Intensity Simulator (INTENSIDADE_DE_CARGA) */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                <span className="text-slate-400">INTENSIDADE_DE_CARGA</span>
                <span className="text-rose-500 font-bold">{loadSim}%</span>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${loadSim}%`, backgroundColor: '#ef4444' }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={loadSim}
                  onChange={(e) => setLoadSim(parseInt(e.target.value))}
                  className="w-20 outline-none cursor-pointer h-1.5"
                  style={{ accentColor: accentColor }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER DIAGNOSTICS: Physical, outputs, Maintenance logs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 font-sans">
        {/* DIMENSOES_FISICAS block */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm relative text-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4">
            <Cpu className="w-4 h-4" style={{ color: accentColor }} />
            <span>DIMENSÕES_FÍSICAS</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Comprimento:</span>
              <span className="text-slate-700 font-semibold">{component.dimensions?.length || '304mm'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Largura:</span>
              <span className="text-slate-700 font-semibold">{component.dimensions?.width || '137mm'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Slots ocupados:</span>
              <span className="text-slate-700 font-semibold">{component.dimensions?.slots || '3.5-Slot'}</span>
            </div>
          </div>
        </div>

        {/* INTERFACES_DE_SAIDA block */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm text-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4">
            <Database className="w-4 h-4" style={{ color: accentColor }} />
            <span>INTERFACES_DE_SAÍDA</span>
          </div>

          <div className="space-y-2.5 text-xs font-mono text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Portas HDMI:</span>
              <span className="text-slate-700 font-semibold">{component.outputs?.hdmi || '1x Port'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Portas DP:</span>
              <span className="text-slate-700 font-semibold">{component.outputs?.dp || '3x Ports'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-bold">Resolução Máxima:</span>
              <span className="text-slate-700 font-semibold">{component.outputs?.maxResolution || '7680x4320'}</span>
            </div>
          </div>
        </div>

        {/* LOG_DE_MANUTENCAO block with live append options! */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between text-slate-800">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span>LOG_DE_MANUTENÇÃO</span>
              </div>
              <button
                onClick={() => setIsAddingLog(!isAddingLog)}
                className="text-[10px] font-mono uppercase hover:text-slate-800 transition cursor-pointer font-bold"
                style={{ color: accentColor }}
              >
                {isAddingLog ? '[ Fechar ]' : '[ Inserir ]'}
              </button>
            </div>

            {isAddingLog ? (
              <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl mb-3">
                <input
                  type="text"
                  placeholder="EX: THERMAL_CHECK"
                  value={newLogAction}
                  onChange={(e) => setNewLogAction(e.target.value)}
                  className="w-full bg-white text-xs text-slate-700 px-3 py-2 rounded-xl border border-slate-200 outline-none font-mono"
                />
                <button
                  onClick={handleAddLog}
                  className="w-full text-[9px] font-mono uppercase font-bold bg-white text-emerald-600 px-2 py-2 rounded-xl hover:bg-emerald-50 border border-slate-200 flex items-center justify-center gap-1 cursor-pointer transition shadow-sm"
                >
                  <Check className="w-3 h-3" />
                  <span>Gravar Evento logs</span>
                </button>
              </div>
            ) : null}

            <div className="space-y-2 h-[84px] overflow-y-auto pr-1 font-mono">
              {component.maintenanceLogs.map((log, listIdx) => (
                <div key={listIdx} className="flex justify-between text-[11px] font-mono border-b border-slate-100 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-slate-400">{log.date}</span>
                  <span className="font-semibold text-slate-700">{log.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
