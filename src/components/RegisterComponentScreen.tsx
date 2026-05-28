import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HardwareComponent, HardwareSpec } from '../types';
import { Save, HelpCircle, HardDrive, Cpu, Layers } from 'lucide-react';

interface RegisterComponentScreenProps {
  components: HardwareComponent[];
  onComponentAdded: (newComp: HardwareComponent) => void;
  accentColor: string;
}

export default function RegisterComponentScreen({ components, onComponentAdded, accentColor }: RegisterComponentScreenProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Processadores');
  const [marketValue, setMarketValue] = useState(0.00);
  const [observation, setObservation] = useState('');
  const [clockSpeed, setClockSpeed] = useState('');
  const [vram, setVram] = useState('');
  const [thermalState, setThermalState] = useState('52 °C');

  // Custom spec rows created dynamically by the user
  const [customSpecs, setCustomSpecs] = useState<HardwareSpec[]>([
    { label: 'Arquitetura', value: 'Padrão' },
    { label: 'TDP (Power Draw)', value: '150W' }
  ]);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Take the last 3 registered items in database to show in "Registros Recentes"
  const recentRecords = components.slice(-3).reverse();

  const addCustomSpec = () => {
    if (!newLabel || !newValue) return;
    setCustomSpecs([...customSpecs, { label: newLabel, value: newValue, highlight: false }]);
    setNewLabel('');
    setNewValue('');
  };

  const removeCustomSpec = (index: number) => {
    setCustomSpecs(customSpecs.filter((_, i) => i !== index));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do componente é obrigatório.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const dataPayload: Partial<HardwareComponent> = {
      name,
      category,
      marketValue: Number(marketValue) || 0,
      technicalObservation: observation,
      status: 'EM ESTOQUE',
      // Dynamic random high-tech background representation
      image: category === 'Placas de Vídeo' 
        ? 'https://images.unsplash.com/photo-1587202372496-e32a61a02c2d?auto=format&fit=crop&q=80&w=400' 
        : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
      clockSpeed: clockSpeed || '3.50 GHz',
      vram: vram || 'N/A',
      thermalState: thermalState || '48 °C',
      specs: customSpecs,
      dimensions: { length: '290mm', width: '130mm', slots: '2.5-Slot' },
      outputs: { hdmi: '1x Port', dp: '3x Ports', maxResolution: '7680x4320' },
      maintenanceLogs: [
        { date: new Date().toISOString().substring(0, 10).replace(/-/g, '.'), action: 'REGISTRO_CRIME_ESTÁVEL' }
      ],
      memoryUsage: Math.floor(Math.random() * 50) + 10,
      loadIntensity: Math.floor(Math.random() * 40) + 20
    };

    try {
      const res = await fetch('/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataPayload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Falha ao registrar componente.');
      }
      setSuccess('Componente registrado com sucesso no ecossistema!');
      
      // Clear fields
      setName('');
      setObservation('');
      setMarketValue(0.00);
      setClockSpeed('');
      setVram('');
      setCustomSpecs([
        { label: 'Arquitetura', value: 'Padrão' },
        { label: 'TDP (Power Draw)', value: '150W' }
      ]);

      onComponentAdded(data.component);
    } catch (err: any) {
      setError(err.message || 'Erro de comunicação backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none font-sans">
      <div className="flex flex-col gap-1 pb-4 border-b border-slate-200/85">
        <span className="text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: accentColor }}>
          PAINEL DE REGISTRO
        </span>
        <h2 className="text-3xl font-display font-semibold tracking-tight text-slate-800">
          Adicionar Componente de Hardware
        </h2>
        <p className="text-slate-500 text-xs tracking-wide">
          Registre novos ativos de hardware para as especificações técnicas da rede e monitoramento de carga.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main form (Col span 2) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm relative">
          <form onSubmit={handleRegister} className="space-y-6">
            {error && (
              <div className="text-xs font-mono bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-2xl">
                <strong>Erro:</strong> {error}
              </div>
            )}
            {success && (
              <div className="text-xs font-mono bg-emerald-50 border border-emerald-200 text-emerald-600 p-4 rounded-2xl">
                {success}
              </div>
            )}

            {/* IDENTIDADE_DA_PECA */}
            <div className="space-y-1.55">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                Nome do Componente
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: NVIDIA RTX 5090 Super X"
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/10 transition-all duration-200"
                required
              />
            </div>

            {/* Two cols: Categoria & Valor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Categoria Técnica
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 outline-none focus:border-slate-400 cursor-pointer appearance-none focus:ring-2 focus:ring-slate-400/10 transition-all duration-200"
                >
                  <option value="Processadores">Processadores</option>
                  <option value="Placas de Vídeo">Placas de Vídeo</option>
                  <option value="Memória RAM">Memória RAM</option>
                  <option value="Armazenamento">Armazenamento</option>
                  <option value="Placas Mãe">Placas Mãe</option>
                  <option value="Fontes de Alimentação">Fontes de Alimentação</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Valor de Mercado (USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-mono text-sm font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={marketValue}
                    onChange={(e) => setMarketValue(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl py-3 pl-9 pr-4 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/10 transition-all duration-200 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Simulated hardware state parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider pl-1">
                  Velocidade de Processamento
                </label>
                <input
                  type="text"
                  value={clockSpeed}
                  onChange={(e) => setClockSpeed(e.target.value)}
                  placeholder="e.g. 3.80 GHz"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-700 outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300/10"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider pl-1 font-sans">
                  VRAM Dedicada
                </label>
                <input
                  type="text"
                  value={vram}
                  onChange={(e) => setVram(e.target.value)}
                  placeholder="e.g. 16 GB GDDR6X"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-700 outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300/10"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider pl-1">
                  Temperatura Nominal Inicial
                </label>
                <input
                  type="text"
                  value={thermalState}
                  onChange={(e) => setThermalState(e.target.value)}
                  placeholder="e.g. 48 °C"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-xs text-slate-700 outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300/10"
                />
              </div>
            </div>

            {/* Custom Specifications Engine */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                Especificações Técnicas
              </label>
              
              <div className="space-y-2">
                {customSpecs.map((spec, i) => (
                  <div key={i} className="flex justify-between items-center text-xs font-mono bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-xl">
                    <div>
                      <span className="text-slate-400 font-bold mr-1">{spec.label}:</span>{' '}
                      <span className="text-slate-700 font-semibold">{spec.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustomSpec(i)}
                      className="text-rose-500 hover:text-rose-600 text-[10px] uppercase tracking-wider font-bold transition duration-150 cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Chave (ex: TDP)"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-700 outline-none flex-1 focus:border-slate-300"
                />
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Valor (ex: 220W)"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-700 outline-none flex-1 focus:border-slate-300"
                />
                <button
                  type="button"
                  onClick={addCustomSpec}
                  className="bg-slate-100 hover:bg-slate-200 text-[10px] font-mono uppercase text-slate-700 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Adicionar
                </button>
              </div>
            </div>

            {/* OBSERVACOES_TECNICAS */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                Observações Técnicas / Anotações
              </label>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Especificações adicionais importantes..."
                className="w-full h-24 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/10 transition-all duration-200 resize-none"
              />
            </div>

            {/* SUBMIT */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-[10px] font-mono text-slate-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                CONEXÃO OPERACIONAL ATIVA
              </span>

              <button
                type="submit"
                disabled={loading}
                className="text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl transition duration-200 hover:scale-102 active:scale-98 flex items-center gap-2 cursor-pointer shadow-md"
                style={{ 
                  backgroundColor: accentColor,
                  boxShadow: `0 4px 14px ${accentColor}30`
                }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>SALVAR REGISTRO</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right guidelines and recent entries (Col span 1) */}
        <div className="space-y-6">
          {/* DIRETRIZES_DO_SISTEMA */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: accentColor }}>
              <HelpCircle className="w-4 h-4" />
              Diretrizes de Registro
            </h3>
            
            <ul className="space-y-3.5 text-xs text-slate-500 font-light tracking-wide font-sans leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-emerald-500">✓</span>
                <span>Insira o nome exatamente como consta no número de série.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-emerald-500">✓</span>
                <span>Os preços devem ser especificados em moeda corrente (USD).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="font-bold text-emerald-500">✓</span>
                <span>Os ativos registrados são disponibilizados imediatamente no catálogo geral.</span>
              </li>
            </ul>
          </div>

          {/* REGISTROS RECENTES per Screenshot 1 */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-4">
              REGISTROS RECENTES
            </h3>

            <div className="space-y-3">
              {recentRecords.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-2xl p-3.5"
                >
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-44">
                    {item.name}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest font-bold">
                    ATIVO
                  </span>
                </div>
              ))}

              {recentRecords.length === 0 && (
                <p className="text-xs font-mono text-slate-400">Nenhum registro recente encontrado.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
