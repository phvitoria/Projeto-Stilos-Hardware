import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SystemConfig, HardwareComponent } from './types';

// Importing Custom Components
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CatalogScreen from './components/CatalogScreen';
import RegisterComponentScreen from './components/RegisterComponentScreen';
import DetailsScreen from './components/DetailsScreen';
import SettingsScreen from './components/SettingsScreen';

export default function App() {
  // Session authentication state
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(() => {
    const saved = localStorage.getItem('stilos_user');
    return saved ? JSON.parse(saved) : null;
  });

  // DB Data States
  const [components, setComponents] = useState<HardwareComponent[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    brandingName: 'Stilos Hardware',
    accentColor: 'green',
    targetTemp: 42,
    activeQueueCount: 12,
    energyFluxMax: 780,
    showSystemLogs: true,
  });

  // Navigation state (e.g. 'catalog' stands for dashboard panels list, 'inventory' for grid catalog, 'register' for creator form, 'settings' for configurations)
  const [activeTab, setActiveTab] = useState<string>('catalog');
  const [selectedComponent, setSelectedComponent] = useState<HardwareComponent | null>(null);

  // Search/Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Load components and config on boot mount
  useEffect(() => {
    fetchComponents();
    fetchConfig();
  }, []);

  const fetchComponents = async () => {
    try {
      const res = await fetch('/api/components');
      if (res.ok) {
        const data = await res.json();
        setComponents(data);
      }
    } catch (err) {
      console.error('Falha ao sincronizar inventário do banco de dados local.', err);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setSystemConfig(data);
      }
    } catch (err) {
      console.error('Falha ao carregar parâmetros de layout customizáveis.', err);
    }
  };

  // Login handler
  const handleLoginSuccess = (userData: { fullName: string; email: string }) => {
    localStorage.setItem('stilos_user', JSON.stringify(userData));
    setUser(userData);
  };

  // Sign out / Shutdown
  const handleLogout = () => {
    localStorage.removeItem('stilos_user');
    setUser(null);
    setSelectedComponent(null);
    setActiveTab('catalog');
  };

  // Resets component database back to factory standard
  const handleResetDatabase = async () => {
    try {
      // We trigger a database overhaul via our seed data override mechanisms
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandingName: 'Stilos Hardware',
          accentColor: 'green',
          targetTemp: 42,
          activeQueueCount: 12,
          energyFluxMax: 780,
          showSystemLogs: true
        })
      });
      if (res.ok) {
        localStorage.clear();
        // Since seed defaults are built-in server database initializes on process reload
        alert('Banco de dados revertido ao padrão operacional de fábrica do Stilos Hardware. Central reiniciando.');
        window.location.reload();
      }
    } catch (err) {
      alert('Falha crítica ao redefinir banco de dados.');
    }
  };

  // Get active HEX color token
  const getAccentHex = () => {
    switch (systemConfig.accentColor) {
      case 'green': return '#10b981';
      case 'cyan': return '#06b6d4';
      case 'blue': return '#3b82f6';
      case 'amber': return '#f59e0b';
      case 'red': return '#ef4444';
      case 'purple': return '#a855f7';
      default: return '#10b981';
    }
  };

  const getAccentClass = () => {
    switch (systemConfig.accentColor) {
      case 'green': return 'glow-green text-emerald-400';
      case 'cyan': return 'glow-cyan text-cyan-400';
      case 'blue': return 'glow-blue text-blue-400';
      case 'amber': return 'glow-amber text-amber-500';
      case 'red': return 'glow-red text-red-500';
      case 'purple': return 'glow-purple text-purple-400';
      default: return 'glow-green text-emerald-400';
    }
  };

  const activeColorHex = getAccentHex();

  // Categories extraction
  const categoriesList: string[] = Array.from(new Set(components.map(c => c.category)));

  // Filter components list
  const filteredComponents = components.filter((comp) => {
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          comp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          comp.technicalObservation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todos' || comp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // If user is not authenticated, render Login gating screen
  if (!user) {
    return (
      <AuthScreen 
        onLoginSuccess={handleLoginSuccess} 
        accentClass={getAccentClass()}
        accentColor={activeColorHex}
      />
    );
  }

  // Render main core layout dashboard
  return (
    <div className="flex h-screen bg-[#f1f5f9] text-slate-800 font-sans overflow-hidden select-none">
      
      {/* Dynamic Left Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedComponent(null); // Clear active detail view selection
        }} 
        config={systemConfig} 
        user={user}
        onLogout={handleLogout}
        accentColor={activeColorHex}
      />

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#f1f5f9] relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(100,116,139,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,139,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Global sticky Header */}
        <Header 
          config={systemConfig} 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categoriesList}
          accentColor={activeColorHex}
          showCategoryDropdown={activeTab === 'catalog' || activeTab === 'inventory'}
        />

        {/* Main interactive Tab panels with fading layout animation triggers */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedComponent ? `details-${selectedComponent.id}` : activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.18 }}
            className="flex-1 flex flex-col min-h-0 relative"
          >
            {/* If a hardware details item is selected, render details card simulator */}
            {selectedComponent ? (
              <DetailsScreen 
                component={selectedComponent}
                onBack={() => {
                  setSelectedComponent(null);
                  fetchComponents(); // Pull fresh updates
                }}
                onUpdateComponent={(updated) => {
                  setSelectedComponent(updated);
                  fetchComponents();
                }}
                accentColor={activeColorHex}
              />
            ) : (
              <>
                {/* Catalog Tab (Telemetry and List Overview) */}
                {activeTab === 'catalog' && (
                  <CatalogScreen 
                    components={filteredComponents}
                    onSelectComponent={(comp) => setSelectedComponent(comp)}
                    config={systemConfig}
                    accentColor={activeColorHex}
                  />
                )}

                {/* Inventory / Just Catalog grid */}
                {activeTab === 'inventory' && (
                  <CatalogScreen 
                    components={filteredComponents}
                    onSelectComponent={(comp) => setSelectedComponent(comp)}
                    config={systemConfig}
                    accentColor={activeColorHex}
                  />
                )}

                {/* Creator Registrar Gating Form */}
                {activeTab === 'register' && (
                  <RegisterComponentScreen 
                    components={components}
                    onComponentAdded={(newComp) => {
                      fetchComponents();
                      setActiveTab('catalog'); // Return to catalog view after registering
                    }}
                    accentColor={activeColorHex}
                  />
                )}

                {/* Settings customizer panels */}
                {activeTab === 'settings' && (
                  <SettingsScreen 
                    config={systemConfig}
                    onUpdateConfig={(newConf) => setSystemConfig(newConf)}
                    onResetDatabase={handleResetDatabase}
                    accentColor={activeColorHex}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
