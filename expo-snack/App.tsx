import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';

// Interfaces for Hardware System
interface HardwareSpec {
  label: string;
  value: string;
  highlight?: boolean;
}

interface HardwareLog {
  date: string;
  action: string;
}

interface HardwareComponent {
  id: string;
  name: string;
  category: string;
  marketValue: number;
  technicalObservation: string;
  status: string;
  image: string;
  clockSpeed: string;
  vram: string;
  thermalState: string;
  specs: HardwareSpec[];
  dimensions?: { length: string; width: string; slots: string };
  outputs?: { hdmi: string; dp: string; maxResolution: string };
  maintenanceLogs: HardwareLog[];
  memoryUsage: number;
  loadIntensity: number;
}

interface SystemConfig {
  brandingName: string;
  accentColor: 'green' | 'cyan' | 'blue' | 'amber' | 'red' | 'purple';
  targetTemp: number;
  activeQueueCount: number;
  energyFluxMax: number;
  showSystemLogs: boolean;
}

// Initial Seed Data for offline database
const DEFAULT_SEED_COMPONENTS: HardwareComponent[] = [
  {
    id: 'cpu_7800x3d',
    name: 'Ryzen 7 7800X3D',
    category: 'Processadores',
    marketValue: 399.00,
    technicalObservation: 'Processador de jogos de alto desempenho com tecnologia 3D V-Cache.',
    status: 'EM ESTOQUE',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=400',
    clockSpeed: '4.20 GHz',
    vram: 'N/A',
    thermalState: '58 °C',
    specs: [
      { label: 'Arquitetura', value: 'Zen 4' },
      { label: 'Núcleos / Threads', value: '8 / 16', highlight: true },
      { label: 'Cache L3', value: '96 MB' },
      { label: 'TDP (Power Draw)', value: '120W' },
      { label: 'Socket', value: 'AM5' },
    ],
    dimensions: { length: '40mm', width: '40mm', slots: 'Socket AM5' },
    outputs: { hdmi: '1x Port', dp: '0x Ports', maxResolution: '3840x2160' },
    maintenanceLogs: [
      { date: '2026.05.15', action: 'THERMAL_PASTE_REPLACEMENT' },
      { date: '2026.04.10', action: 'MICROCODE_UPDATE' }
    ],
    memoryUsage: 25,
    loadIntensity: 72
  },
  {
    id: 'gpu_4080_super',
    name: 'GeForce RTX 4080 Super',
    category: 'Placas de Vídeo',
    marketValue: 999.00,
    technicalObservation: 'GPU Ada Lovelace de alto rendimento para traçado de raio em tempo real e DLSS 3.',
    status: 'ESTOQUE BAIXO',
    image: 'https://images.unsplash.com/photo-1587202372496-e32a61a02c2d?auto=format&fit=crop&q=80&w=400',
    clockSpeed: '2.55 GHz',
    vram: '16 GB GDDR6X',
    thermalState: '61 °C',
    specs: [
      { label: 'Arquitetura', value: 'Ada Lovelace' },
      { label: 'CUDA Cores', value: '10240', highlight: true },
      { label: 'Barramento de Memória', value: '256-bit' },
      { label: 'TDP (Power Draw)', value: '320W' },
    ],
    dimensions: { length: '310mm', width: '140mm', slots: '3.0-Slot' },
    outputs: { hdmi: '1x Port', dp: '3x Ports', maxResolution: '7680x4320' },
    maintenanceLogs: [
      { date: '2026.05.01', action: 'VOLTAGE_STABILIZATION' }
    ],
    memoryUsage: 55,
    loadIntensity: 85
  },
  {
    id: 'ram_ddr5_32gb',
    name: '32GB DDR5 6000MHz',
    category: 'Memória RAM',
    marketValue: 129.50,
    technicalObservation: 'Kit de memória dual-channel otimizado para perfis AMD EXPO.',
    status: 'EM ESTOQUE',
    image: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?auto=format&fit=crop&q=80&w=400',
    clockSpeed: '6000 MHz',
    vram: 'N/A',
    thermalState: '45 °C',
    specs: [
      { label: 'Tipo', value: 'DDR5 SDRAM' },
      { label: 'Capacidade Total', value: '32 GB (2x16GB)', highlight: true },
      { label: 'Latência Cas', value: 'CL30' },
    ],
    dimensions: { length: '133mm', width: '42mm', slots: 'DIMM 288-Pin' },
    outputs: { hdmi: 'N/A', dp: 'N/A', maxResolution: 'N/A' },
    maintenanceLogs: [
      { date: '2026.05.10', action: 'EXPO_PROFILE_ACTIVATION' }
    ],
    memoryUsage: 12,
    loadIntensity: 30
  }
];

const DEFAULT_CONFIG: SystemConfig = {
  brandingName: 'Stilos Hardware',
  accentColor: 'green',
  targetTemp: 42,
  activeQueueCount: 12,
  energyFluxMax: 780,
  showSystemLogs: true,
};

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function App() {
  // Authentication State
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');

  // Active Screen / Navigation Tab
  // 'catalog' | 'register' | 'settings' | 'details'
  const [activeTab, setActiveTab] = useState<'catalog' | 'register' | 'settings'>('catalog');
  const [selectedComponent, setSelectedComponent] = useState<HardwareComponent | null>(null);

  // App States
  const [components, setComponents] = useState<HardwareComponent[]>([]);
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Loading indicator states
  const [ready, setReady] = useState(false);

  // Load persistence configurations on initialization
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('stilos_user');
      const savedConfig = await AsyncStorage.getItem('stilos_config');
      const savedComponents = await AsyncStorage.getItem('stilos_components');

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig));
      } else {
        await AsyncStorage.setItem('stilos_config', JSON.stringify(DEFAULT_CONFIG));
      }

      if (savedComponents) {
        setComponents(JSON.parse(savedComponents));
      } else {
        setComponents(DEFAULT_SEED_COMPONENTS);
        await AsyncStorage.setItem('stilos_components', JSON.stringify(DEFAULT_SEED_COMPONENTS));
      }
    } catch (e) {
      console.log('Error booting AsyncStorage', e);
    } finally {
      setReady(true);
    }
  };

  // Helper for Theme Customization Hex Colors
  const getThemeColor = () => {
    switch (config.accentColor) {
      case 'green': return '#10b981';
      case 'cyan': return '#06b6d4';
      case 'blue': return '#3b82f6';
      case 'amber': return '#f59e0b';
      case 'red': return '#ef4444';
      case 'purple': return '#a855f7';
      default: return '#10b981';
    }
  };

  const themeHex = getThemeColor();

  // Authentication Submission
  const handleAuth = async () => {
    if (isLogin) {
      if (!loginEmail || !loginPassword) {
        Alert.alert('Erro', 'Por favor preencha todos os campos.');
        return;
      }
      const userData = { fullName: 'Operador VIP', email: loginEmail };
      await AsyncStorage.setItem('stilos_user', JSON.stringify(userData));
      setUser(userData);
    } else {
      if (!registerName || !loginEmail || !loginPassword) {
        Alert.alert('Erro', 'Por favor preencha todos os campos do cadastro.');
        return;
      }
      const userData = { fullName: registerName, email: loginEmail };
      await AsyncStorage.setItem('stilos_user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  // Logout Event Trigger
  const handleLogout = async () => {
    await AsyncStorage.removeItem('stilos_user');
    setUser(null);
    setSelectedComponent(null);
    setActiveTab('catalog');
  };

  // Factory Database Reset
  const handleDatabaseReset = async () => {
    await AsyncStorage.removeItem('stilos_components');
    await AsyncStorage.removeItem('stilos_config');
    setComponents(DEFAULT_SEED_COMPONENTS);
    setConfig(DEFAULT_CONFIG);
    await AsyncStorage.setItem('stilos_components', JSON.stringify(DEFAULT_SEED_COMPONENTS));
    await AsyncStorage.setItem('stilos_config', JSON.stringify(DEFAULT_CONFIG));
    Alert.alert('Sucesso', 'Banco de dados restaurado ao padrão de sementes da Stilos Hardware!');
  };

  // Update existing component in catalog
  const handleUpdateComponentInList = async (updated: HardwareComponent) => {
    const updatedList = components.map(c => c.id === updated.id ? updated : c);
    setComponents(updatedList);
    await AsyncStorage.setItem('stilos_components', JSON.stringify(updatedList));
  };

  // Save Config custom changes
  const saveSystemConfig = async (newConfig: SystemConfig) => {
    setConfig(newConfig);
    await AsyncStorage.setItem('stilos_config', JSON.stringify(newConfig));
    Alert.alert('Sucesso', 'Configurações de layout sincronizadas no celular!');
  };

  if (!ready) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  // Auth Screen Layout
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />
        <ScrollView contentContainerStyle={styles.authScrollView}>
          <View style={styles.authHeaderWrapper}>
            <View style={[styles.glowIndicator, { backgroundColor: themeHex }]} />
            <Text style={styles.brandTitleText}>Stilos Hardware</Text>
            <Text style={styles.brandSubText}>PAINEL DE AUTENTICAÇÃO EXPONENCIAL</Text>
          </View>

          <View style={styles.cardContainer}>
            <Text style={styles.cardHeaderTitle}>{isLogin ? 'Login de Operador' : 'Registrar Operador'}</Text>

            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome Completo</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputText}
                    placeholder="Seu nome"
                    value={registerName}
                    onChangeText={setRegisterName}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-mail de Identificação</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputText}
                  placeholder="operador@stilos.com.br"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={loginEmail}
                  onChangeText={setLoginEmail}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Chave de Acesso</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={18} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputText}
                  placeholder="••••••••••••"
                  secureTextEntry
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: themeHex }]} onPress={handleAuth}>
              <Text style={styles.primaryButtonText}>
                {isLogin ? 'Acessar Central' : 'Cadastrar Operador'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleAuthModeBtn} onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleAuthModeText}>
                {isLogin ? '→ Não possui cadastro? Criar uma conta' : '→ Já possui cadastro? Fazer login'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerProtocolText}>
            PROTOCOL: REGISTRATION_WIZARD_V1 // CORP SECURITY UPLINK ACTIVE
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Active Detail View Router
  if (selectedComponent) {
    return (
      <DetailsScreen
        component={selectedComponent}
        accentColor={themeHex}
        onBack={() => setSelectedComponent(null)}
        onUpdateComponent={(updated) => {
          setSelectedComponent(updated);
          handleUpdateComponentInList(updated);
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />
      
      {/* Dynamic Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitleSubText}>PORTAL DE CONTROLE</Text>
          <Text style={styles.headerTitleText}>Admin Panel</Text>
        </View>
        <View style={styles.headerActionContainer}>
          <TouchableOpacity onPress={() => Alert.alert('Uplink', 'Conexão ativa com nó de servidores.')} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={20} color="#475569" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Ionicons name="power" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Views rendering tabs */}
      <View style={{ flex: 1 }}>
        {activeTab === 'catalog' && (
          <CatalogScreen
            components={components}
            config={config}
            accentColor={themeHex}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSelectComponent={setSelectedComponent}
          />
        )}

        {activeTab === 'register' && (
          <RegisterScreen
            accentColor={themeHex}
            components={components}
            onComponentAdded={async (newComp) => {
              const newList = [...components, newComp];
              setComponents(newList);
              await AsyncStorage.setItem('stilos_components', JSON.stringify(newList));
              setActiveTab('catalog');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            config={config}
            accentColor={themeHex}
            onSave={saveSystemConfig}
            onReset={handleDatabaseReset}
          />
        )}
      </View>

      {/* Elegant Native Bottom Navigation Tab Bar with Customizable Hex highlights */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            setSelectedComponent(null);
            setActiveTab('catalog');
          }}
        >
          <Ionicons
            name="cube-outline"
            size={22}
            color={activeTab === 'catalog' ? themeHex : '#94a3b8'}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'catalog' ? themeHex : '#94a3b8' }]}>
            Inventário
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            setSelectedComponent(null);
            setActiveTab('register');
          }}
        >
          <Ionicons
            name="add-circle-outline"
            size={22}
            color={activeTab === 'register' ? themeHex : '#94a3b8'}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'register' ? themeHex : '#94a3b8' }]}>
            Registrar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            setSelectedComponent(null);
            setActiveTab('settings');
          }}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={activeTab === 'settings' ? themeHex : '#94a3b8'}
          />
          <Text style={[styles.tabLabel, { color: activeTab === 'settings' ? themeHex : '#94a3b8' }]}>
            Ajustes
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// CATALOG SCREEN SUBCOMPONENT (React Native)
// -------------------------------------------------------------
interface CatalogScreenProps {
  components: HardwareComponent[];
  config: SystemConfig;
  accentColor: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onSelectComponent: (comp: HardwareComponent) => void;
}

function CatalogScreen({
  components,
  config,
  accentColor,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onSelectComponent,
}: CatalogScreenProps) {
  const categories = ['Todos', 'Processadores', 'Placas de Vídeo', 'Memória RAM', 'Armazenamento'];

  const filtered = components.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.technicalObservation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Todos' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Search Input */}
      <View style={styles.searchBoxContainer}>
        <Ionicons name="search-outline" size={16} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar no catálogo..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Horizontal categories selectors pills row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
        {categories.map((cat, idx) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.categoryPill,
                isSelected && { backgroundColor: accentColor, borderColor: accentColor },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryPillText, isSelected && { color: '#ffffff', fontWeight: 'bold' }]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Hardware Bento Cards */}
      <View style={styles.gridContainer}>
        {filtered.map((item) => {
          const isOutOfStock = item.status === 'ESGOTADO';
          const isLowStock = item.status === 'ESTOQUE BAIXO';
          
          return (
            <View key={item.id} style={styles.bentoCard}>
              <Image source={{ uri: item.image }} style={styles.bentoCardImage} />
              
              {/* Overlay badges */}
              <View style={styles.statusBadgeContainer}>
                <View style={[
                  styles.statusBadge,
                  isOutOfStock ? { backgroundColor: '#ffe4e6', borderColor: '#fda4af' } :
                  isLowStock ? { backgroundColor: '#fef3c7', borderColor: '#fde047' } :
                  { backgroundColor: '#dcfce7', borderColor: '#86efac' }
                ]}>
                  <Text style={[
                    styles.statusBadgeText,
                    isOutOfStock ? { color: '#e11d48' } :
                    isLowStock ? { color: '#d97706' } :
                    { color: '#16a34a' }
                  ]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardCategoryText}>{item.category.toUpperCase()}</Text>
                <Text style={styles.cardTitleText} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardObservationText} numberOfLines={2}>
                  {item.technicalObservation}
                </Text>

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.priceLabel}>PREÇO USD</Text>
                    <Text style={styles.priceText}>
                      ${item.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.detailsBtn, { backgroundColor: accentColor }]}
                    onPress={() => onSelectComponent(item)}
                  >
                    <Ionicons name="eye-outline" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                    <Text style={styles.detailsBtnText}>VER</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>// Nenhum hardware ativo no momento.</Text>
          </View>
        )}
      </View>

      {/* Bottom Telemetry widgets */}
      <View style={styles.telemetryWrapper}>
        <Text style={[styles.sectionTitle, { color: accentColor }]}>// ESTADO GLOBAL DO ECOSSISTEMA</Text>
        
        <View style={styles.telemetryWidgetsGrid}>
          {/* Energy Widget */}
          <View style={styles.widgetCard}>
            <View style={styles.widgetHeader}>
              <Text style={styles.widgetLabel}>FLUXO ENERGIA</Text>
              <Ionicons name="flash" size={16} color="#10b981" />
            </View>
            <Text style={styles.widgetValue}>IDEAL</Text>
            <Text style={styles.widgetSubValue}>Max: {config.energyFluxMax}W</Text>
            <View style={styles.widgetProgressBarContainer}>
              <View style={[styles.widgetProgressBar, { width: '85%', backgroundColor: accentColor }]} />
            </View>
          </View>

          {/* Temperature Widget */}
          <View style={styles.widgetCard}>
            <View style={styles.widgetHeader}>
              <Text style={styles.widgetLabel}>TEMP DO NÚCLEO</Text>
              <Ionicons name="thermometer-outline" size={16} color="#f59e0b" />
            </View>
            <Text style={styles.widgetValue}>{config.targetTemp}°C</Text>
            <Text style={styles.widgetSubValue}>ESTÁVEL EM OPERAÇÃO</Text>
            <View style={styles.widgetProgressBarContainer}>
              <View style={[styles.widgetProgressBar, { width: '45%', backgroundColor: accentColor }]} />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// -------------------------------------------------------------
// REGISTER SCREEN SUBCOMPONENT (React Native)
// -------------------------------------------------------------
interface RegisterScreenProps {
  accentColor: string;
  components: HardwareComponent[];
  onComponentAdded: (newComp: HardwareComponent) => void;
}

function RegisterScreen({ accentColor, components, onComponentAdded }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Processadores');
  const [marketValue, setMarketValue] = useState('');
  const [observation, setObservation] = useState('');
  
  const [specLabel, setSpecLabel] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [specs, setSpecs] = useState<HardwareSpec[]>([
    { label: 'Arquitetura', value: 'Padrão' },
    { label: 'TDP (Power Draw)', value: '150W' }
  ]);

  const addSpec = () => {
    if (!specLabel || !specValue) return;
    setSpecs([...specs, { label: specLabel, value: specValue }]);
    setSpecLabel('');
    setSpecValue('');
  };

  const removeSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor declare o nome do hardware.');
      return;
    }

    const valueNum = parseFloat(marketValue) || 0;

    const newComponent: HardwareComponent = {
      id: 'hw_' + Date.now(),
      name,
      category,
      marketValue: valueNum,
      technicalObservation: observation || 'Ativo computacional devidamente provisionado e catalogado no ecossistema.',
      status: 'EM ESTOQUE',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
      clockSpeed: '3.60 GHz',
      vram: 'N/A',
      thermalState: '52 °C',
      specs: specs,
      dimensions: { length: '280mm', width: '120mm', slots: '2.0-Slot' },
      outputs: { hdmi: '1x', dp: '3x', maxResolution: '7680x4320' },
      maintenanceLogs: [{ date: '2026.05.28', action: 'REGISTRO_INICIAL_ESTAVEL' }],
      memoryUsage: 15,
      loadIntensity: 35
    };

    onComponentAdded(newComponent);
    Alert.alert('Sucesso', 'Componente registrado com sucesso!');
  };

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.formContainer}>
        <Text style={styles.faintLabelTitle}>Adicionar Componente de Hardware</Text>
        
        <View style={styles.formInputGroup}>
          <Text style={styles.inputLabelNative}>Nome do Ativo</Text>
          <TextInput
            style={styles.formInput}
            placeholder="RTX 5090 Super X"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.formInputGroup}>
          <Text style={styles.inputLabelNative}>Categoria Técnica</Text>
          <View style={styles.categoryPickerPills}>
            {['Processadores', 'Placas de Vídeo', 'Memória RAM', 'Armazenamento'].map((cat) => {
              const isSel = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.smallPill, isSel && { backgroundColor: accentColor }]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.smallPillText, isSel && { color: '#fff', fontWeight: 'bold' }]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.formInputGroup}>
          <Text style={styles.inputLabelNative}>Valor de Mercado (USD)</Text>
          <TextInput
            style={styles.formInput}
            placeholder="0.00"
            keyboardType="numeric"
            value={marketValue}
            onChangeText={setMarketValue}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Technical specs key values manager */}
        <View style={styles.specsManager}>
          <Text style={styles.inputLabelNative}>Especificações Técnicas</Text>
          
          <View style={styles.specsDraftList}>
            {specs.map((item, id) => (
              <View key={id} style={styles.specDraftRow}>
                <Text style={styles.specDraftText}>
                  {item.label}: <Text style={{ fontWeight: 'bold' }}>{item.value}</Text>
                </Text>
                <TouchableOpacity onPress={() => removeSpec(id)}>
                  <Ionicons name="trash-outline" size={14} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.addSpecRowInput}>
            <TextInput
              style={[styles.formInput, { flex: 1, marginRight: 8 }]}
              placeholder="Chave (TDP)"
              value={specLabel}
              onChangeText={setSpecLabel}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              style={[styles.formInput, { flex: 1, marginRight: 8 }]}
              placeholder="Valor (240W)"
              value={specValue}
              onChangeText={setSpecValue}
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity style={[styles.inlineAddBtn, { backgroundColor: accentColor }]} onPress={addSpec}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>ADD</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formInputGroup}>
          <Text style={styles.inputLabelNative}>Observações Técnicas</Text>
          <TextInput
            style={[styles.formInput, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Anotações cruciais sobre a peça..."
            multiline
            value={observation}
            onChangeText={setObservation}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: accentColor }]} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>SALVAR REGISTRO ATIVO</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// -------------------------------------------------------------
// SETTINGS SCREEN SUBCOMPONENT (React Native)
// -------------------------------------------------------------
interface SettingsScreenProps {
  config: SystemConfig;
  accentColor: string;
  onSave: (config: SystemConfig) => void;
  onReset: () => void;
}

function SettingsScreen({ config, accentColor, onSave, onReset }: SettingsScreenProps) {
  const [branding, setBranding] = useState(config.brandingName);
  const [accentKey, setAccentKey] = useState(config.accentColor);
  const [watts, setWatts] = useState(String(config.energyFluxMax));
  const [temp, setTemp] = useState(String(config.targetTemp));

  const colorPalettes: Array<{ id: 'green' | 'cyan' | 'blue' | 'amber' | 'red' | 'purple', val: string }> = [
    { id: 'green', val: '#10b981' },
    { id: 'cyan', val: '#06b6d4' },
    { id: 'blue', val: '#3b82f6' },
    { id: 'amber', val: '#f59e0b' },
    { id: 'red', val: '#ef4444' },
    { id: 'purple', val: '#a855f7' },
  ];

  const handleUpdate = () => {
    onSave({
      brandingName: branding,
      accentColor: accentKey,
      energyFluxMax: Number(watts) || 780,
      targetTemp: Number(temp) || 42,
      activeQueueCount: config.activeQueueCount,
      showSystemLogs: config.showSystemLogs
    });
  };

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={{ paddingBottom: 24 }}>
      <View style={styles.formContainer}>
        <Text style={styles.faintLabelTitle}>Customização das Telas</Text>

        <View style={styles.formInputGroup}>
          <Text style={styles.inputLabelNative}>Nome do Portal (Branding)</Text>
          <TextInput
            style={styles.formInput}
            value={branding}
            onChangeText={setBranding}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.formInputGroup}>
          <Text style={styles.inputLabelNative}>Selecione Cor de Destaque</Text>
          <View style={styles.colorAccentRow}>
            {colorPalettes.map((item) => {
              const isSelected = accentKey === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.colorBall,
                    { backgroundColor: item.val },
                    isSelected && { borderColor: '#1e293b', borderWidth: 3 }
                  ]}
                  onPress={() => setAccentKey(item.id)}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.formInputGroup}>
          <Text style={styles.inputLabelNative}>Calibrar Carga Watts Máxima</Text>
          <TextInput
            style={styles.formInput}
            keyboardType="numeric"
            value={watts}
            onChangeText={setWatts}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <View style={styles.formInputGroup}>
          <Text style={styles.inputLabelNative}>Calibrar Temperatura Core Alvo (°C)</Text>
          <TextInput
            style={styles.formInput}
            keyboardType="numeric"
            value={temp}
            onChangeText={setTemp}
            placeholderTextColor="#94a3b8"
          />
        </View>

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: accentColor }]} onPress={handleUpdate}>
          <Text style={styles.primaryButtonText}>SALVAR CONFIGURAÇÃO</Text>
        </TouchableOpacity>

        <View style={styles.resetSettingsBlock}>
          <Text style={styles.resetBlockTitle}>REVERT COMPONENT DATABASE</Text>
          <Text style={styles.resetBlockSub}>
            Redefinir as estatísticas, registros, e sementes de hardware de volta ao padrão inicial de fábrica.
          </Text>
          <TouchableOpacity style={styles.dangerResetBtn} onPress={onReset}>
            <Ionicons name="refresh" size={16} color="#ffffff" style={{ marginRight: 6 }} />
            <Text style={styles.dangerResetText}>RESTAURAR DATABASE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// -------------------------------------------------------------
// HARDWARE DETAILS SCREEN SUBCOMPONENT (React Native)
// -------------------------------------------------------------
interface DetailsScreenProps {
  component: HardwareComponent;
  accentColor: string;
  onBack: () => void;
  onUpdateComponent: (updated: HardwareComponent) => void;
}

function DetailsScreen({ component, accentColor, onBack, onUpdateComponent }: DetailsScreenProps) {
  const [clock, setClock] = useState(component.clockSpeed);
  const [temp, setTemp] = useState(parseInt(component.thermalState) || 52);
  const [load, setLoad] = useState(component.loadIntensity);
  const [newLogEvent, setNewLogEvent] = useState('');

  const appendLog = () => {
    if (!newLogEvent.trim()) return;
    const todayStr = new Date().toISOString().substring(0, 10).replace(/-/g, '.');
    const newLogItem = { date: todayStr, action: newLogEvent.toUpperCase() };

    onUpdateComponent({
      ...component,
      maintenanceLogs: [newLogItem, ...component.maintenanceLogs]
    });
    setNewLogEvent('');
    Alert.alert('Sucesso', 'Evento gravado nos logs de manutenção!');
  };

  const handleApplySimulator = () => {
    onUpdateComponent({
      ...component,
      clockSpeed: clock,
      thermalState: `${temp} °C`,
      loadIntensity: load
    });
    Alert.alert('Simulação', 'Parâmetros de telemetria atualizados com sucesso!');
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>{component.name}</Text>
        </View>
      </View>

      <ScrollView style={styles.screenScroll} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Banner Card */}
        <View style={styles.detailsHeroCard}>
          <Image source={{ uri: component.image }} style={styles.detailsHeroImage} />
          <View style={styles.detailsHeroOverlay}>
            <Text style={styles.heroOverlayTitle}>{component.name}</Text>
            <Text style={styles.heroOverlaySub}>STATUS: OPTIMAL_PERFORMANCE</Text>
          </View>
        </View>

        {/* Dynamic Telemetry Deck Overrides */}
        <View style={styles.cardContainerLocal}>
          <Text style={styles.cardHeaderTitleLocal}>CONEXÃO AJUSTES DIAGNÓSTICO</Text>

          <View style={styles.telemetrySliderRow}>
            <Text style={styles.sliderLabel}>Frequência Core Sinal: {clock}</Text>
            <TextInput
              style={styles.overrideInput}
              value={clock}
              onChangeText={setClock}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.telemetrySliderRow}>
            <Text style={styles.sliderLabel}>Temperatura Núcleo: {temp}°C</Text>
            <View style={styles.sliderMockContainer}>
              <TouchableOpacity onPress={() => setTemp(Math.max(20, temp - 5))} style={styles.sliderBtn}>
                <Text style={{ fontSize: 18, color: '#475569' }}>-</Text>
              </TouchableOpacity>
              <View style={styles.sliderProgressTrack}>
                <View style={[styles.sliderProgressBarActive, { width: `${(temp/110)*100}%`, backgroundColor: accentColor }]} />
              </View>
              <TouchableOpacity onPress={() => setTemp(Math.min(105, temp + 5))} style={styles.sliderBtn}>
                <Text style={{ fontSize: 18, color: '#475569' }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.telemetrySliderRow}>
            <Text style={styles.sliderLabel}>Carga Simulada Intensidade: {load}%</Text>
            <View style={styles.sliderMockContainer}>
              <TouchableOpacity onPress={() => setLoad(Math.max(0, load - 10))} style={styles.sliderBtn}>
                <Text style={{ fontSize: 18, color: '#475569' }}>-</Text>
              </TouchableOpacity>
              <View style={styles.sliderProgressTrack}>
                <View style={[styles.sliderProgressBarActive, { width: `${load}%`, backgroundColor: '#ef4444' }]} />
              </View>
              <TouchableOpacity onPress={() => setLoad(Math.min(100, load + 10))} style={styles.sliderBtn}>
                <Text style={{ fontSize: 18, color: '#475569' }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: accentColor }]} onPress={handleApplySimulator}>
            <Text style={styles.primaryButtonText}>APLICAR TELEMETRIA SIMULADA</Text>
          </TouchableOpacity>
        </View>

        {/* Specifications List */}
        <View style={styles.cardContainerLocal}>
          <Text style={styles.cardHeaderTitleLocal}>ESPECIFICAÇÕES PRINCIPAIS</Text>
          {component.specs.map((spec, i) => (
            <View key={i} style={styles.specDisplayRow}>
              <Text style={styles.specDisplayLabel}>{spec.label}</Text>
              <Text style={[styles.specDisplayValue, spec.highlight && { color: accentColor }]}>
                {spec.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Live Manual Event Log Additions */}
        <View style={styles.cardContainerLocal}>
          <Text style={styles.cardHeaderTitleLocal}>GRAVAÇÃO LOG DE MANUTENÇÃO</Text>
          
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <TextInput
              style={[styles.formInput, { flex: 1, marginRight: 8 }]}
              placeholder="Ex: OVERCLOCK_CHECK"
              value={newLogEvent}
              onChangeText={setNewLogEvent}
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity style={[styles.primaryButton, { width: 100, marginTop: 0, backgroundColor: accentColor }]} onPress={appendLog}>
              <Text style={styles.primaryButtonText}>SALVAR</Text>
            </TouchableOpacity>
          </View>

          {/* Table display */}
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#94a3b8', marginBottom: 8 }}>HISTÓRICO RECENTE</Text>
          {component.maintenanceLogs.map((log, listId) => (
            <View key={listId} style={styles.specDisplayRow}>
              <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>{log.date}</Text>
              <Text style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 'bold', color: '#1e293b' }}>{log.action}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// EXPOSTATUS COMPATIBLE ACTIVITY INDICATOR
// -------------------------------------------------------------
import { ActivityIndicator } from 'react-native';

const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  authScrollView: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  authHeaderWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  glowIndicator: {
    width: 24,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  brandTitleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  brandSubText: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 2,
    color: '#64748b',
    marginTop: 6,
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#94a3b8',
    letterSpacing: 1,
    fontWeight: 'bold',
    marginBottom: 6,
    paddingLeft: 4,
  },
  inputLabelNative: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputText: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#334155',
  },
  primaryButton: {
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  toggleAuthModeBtn: {
    marginTop: 16,
    alignItems: 'center',
  },
  toggleAuthModeText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  footerProtocolText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 24,
  },
  header: {
    height: 64,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitleSubText: {
    fontSize: 8,
    fontFamily: 'monospace',
    letterSpacing: 1,
    color: '#94a3b8',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerActionContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  bottomTabBar: {
    height: 60,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
  },
  screenScroll: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 13,
    color: '#1e293b',
  },
  categoriesRow: {
    paddingHorizontal: 16,
    marginTop: 12,
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 8,
    height: 34,
  },
  categoryPillText: {
    fontSize: 11,
    color: '#64748b',
  },
  gridContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  bentoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  bentoCardImage: {
    height: 140,
    width: '100%',
    backgroundColor: '#f1f5f9',
  },
  statusBadgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 16,
  },
  cardCategoryText: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#94a3b8',
    letterSpacing: 1,
    fontWeight: '700',
  },
  cardTitleText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 2,
  },
  cardObservationText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginTop: 12,
    paddingTop: 12,
  },
  priceLabel: {
    fontSize: 7,
    fontFamily: 'monospace',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  priceText: {
    fontSize: 15,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#1e293b',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailsBtnText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#94a3b8',
  },
  telemetryWrapper: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'monospace',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 12,
  },
  telemetryWidgetsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  widgetCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 4,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  widgetLabel: {
    fontSize: 8,
    fontFamily: 'monospace',
    color: '#94a3b8',
    fontWeight: '700',
  },
  widgetValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  widgetSubValue: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2,
  },
  widgetProgressBarContainer: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  widgetProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  formContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    margin: 16,
  },
  faintLabelTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#1e293b',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
  },
  formInputGroup: {
    marginBottom: 16,
  },
  formInput: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 13,
    color: '#1e293b',
  },
  categoryPickerPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  smallPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  smallPillText: {
    fontSize: 10,
    color: '#475569',
  },
  specsManager: {
    marginBottom: 16,
  },
  specsDraftList: {
    marginBottom: 10,
  },
  specDraftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
    borderColor: '#f1f5f9',
    borderWidth: 1,
  },
  specDraftText: {
    fontSize: 11,
    color: '#475569',
  },
  addSpecRowInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineAddBtn: {
    width: 48,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  colorAccentRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 6,
  },
  colorBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  resetSettingsBlock: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  resetBlockTitle: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#e11d48',
    marginBottom: 4,
  },
  resetBlockSub: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 12,
  },
  dangerResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fecdd3',
    borderColor: '#fda4af',
    borderWidth: 1,
    borderRadius: 12,
    height: 44,
    width: '100%',
  },
  dangerResetText: {
    color: '#be123c',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  detailsHeroCard: {
    height: 200,
    backgroundColor: '#1e293b',
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  detailsHeroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.45,
  },
  detailsHeroOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  heroOverlayTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  heroOverlaySub: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#34d399',
    marginTop: 4,
    fontWeight: '700',
  },
  cardContainerLocal: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardHeaderTitleLocal: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  telemetrySliderRow: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  overrideInput: {
    height: 38,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 12,
    color: '#1e293b',
  },
  sliderMockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderProgressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  sliderProgressBarActive: {
    height: 6,
    borderRadius: 3,
  },
  specDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  specDisplayLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  specDisplayValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '700',
  },
});
