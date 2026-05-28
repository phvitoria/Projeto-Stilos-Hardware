import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Set up directory for local file storage database
const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COMPONENTS_FILE = path.join(DATA_DIR, 'components.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Ensure database files and directory exist with default seed data
function initializeDatabase() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Seed Users
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUsers = [
      {
        fullName: 'Operador Admin',
        email: 'operator@techcore.io',
        accessKey: 'techcore4090'
      }
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2), 'utf-8');
  }

  // Seed Layout Config
  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultConfig = {
      brandingName: 'Stilos Hardware',
      accentColor: 'green',
      targetTemp: 42,
      activeQueueCount: 12,
      energyFluxMax: 780,
      showSystemLogs: true
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2), 'utf-8');
  }

  // Seed Hardware Components
  if (!fs.existsSync(COMPONENTS_FILE)) {
    const defaultComponents = [
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
          { label: 'Versão do Microcode', value: '0x08F2A [LATEST]' }
        ],
        dimensions: { length: '40mm', width: '40mm', slots: 'Socket AM5' },
        outputs: { hdmi: '1x Port', dp: '0x Ports', maxResolution: '3840x2160' },
        maintenanceLogs: [
          { date: '2023.11.15', action: 'THERMAL_PASTE_REPLACEMENT' },
          { date: '2023.08.10', action: 'MICROCODE_UPDATE' }
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
          { label: 'Interface', value: 'PCIe 4.0 x16' },
          { label: 'Versão do Driver', value: '551.86 [LATEST]' }
        ],
        dimensions: { length: '310mm', width: '140mm', slots: '3.0-Slot' },
        outputs: { hdmi: '1x Port', dp: '3x Ports', maxResolution: '7680x4320' },
        maintenanceLogs: [
          { date: '2023.12.01', action: 'VOLTAGE_STABILIZATION' },
          { date: '2023.10.12', action: 'STRESS_TEST_PASSED' }
        ],
        memoryUsage: 55,
        loadIntensity: 85
      },
      {
        id: 'ram_ddr5_32gb',
        name: '32GB DDR5 6000MHz',
        category: 'Memória RAM',
        marketValue: 129.50,
        technicalObservation: 'Kit de memória dual-channel otimizado para perfis AMD EXPO e Intel XMP 3.0.',
        status: 'EM ESTOQUE',
        image: 'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?auto=format&fit=crop&q=80&w=400',
        clockSpeed: '6000 MHz',
        vram: 'N/A',
        thermalState: '45 °C',
        specs: [
          { label: 'Tipo', value: 'DDR5 SDRAM' },
          { label: 'Capacidade Total', value: '32 GB (2x16GB)', highlight: true },
          { label: 'Latência Cas', value: 'CL30' },
          { label: 'Voltagem Operacional', value: '1.35V' },
          { label: 'Suporte de Perfil', value: 'EXPO / XMP' },
          { label: 'Registro ECC', value: 'On-Die ECC' }
        ],
        dimensions: { length: '133mm', width: '42mm', slots: 'DIMM 288-Pin' },
        outputs: { hdmi: 'N/A', dp: 'N/A', maxResolution: 'N/A' },
        maintenanceLogs: [
          { date: '2024.01.10', action: 'EXPO_PROFILE_ACTIVATION' }
        ],
        memoryUsage: 12,
        loadIntensity: 30
      },
      {
        id: 'ssd_nvme_2tb',
        name: '2TB NVMe Gen4 SSD',
        category: 'Armazenamento',
        marketValue: 185.00,
        technicalObservation: 'Armazenamento de estado sólido ultra veloz com velocidade de leitura de até 7450 MB/s.',
        status: 'EM ESTOQUE',
        image: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?auto=format&fit=crop&q=80&w=400',
        clockSpeed: '7450 MB/s',
        vram: 'N/A',
        thermalState: '39 °C',
        specs: [
          { label: 'Interface', value: 'PCIe Gen 4.0 x4 M.2' },
          { label: 'Capacidade', value: '2000 GB', highlight: true },
          { label: 'Leitura Sequencial', value: '7450 MB/s' },
          { label: 'Escrita Sequencial', value: '6900 MB/s' },
          { label: 'Form Factor', value: 'M.2 2280' },
          { label: 'Dissipador de Calor', value: 'Alumínio Integrado' }
        ],
        dimensions: { length: '80mm', width: '22mm', slots: 'M.2 Slot M-Key' },
        outputs: { hdmi: 'N/A', dp: 'N/A', maxResolution: 'N/A' },
        maintenanceLogs: [
          { date: '2023.09.22', action: 'CONTROLLER_COOLING_MONITOR' }
        ],
        memoryUsage: 89,
        loadIntensity: 45
      },
      {
        id: 'mb_x670e',
        name: 'ROG Crosshair X670E',
        category: 'Placas Mãe',
        marketValue: 499.00,
        technicalObservation: 'Placa-mãe gamer topo de linha com robusto VRM de 18+2 fases, suporte PCIe 5.0 integral e Wi-Fi 6E.',
        status: 'ESGOTADO',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
        clockSpeed: 'PCIe 5.0 Link',
        vram: 'N/A',
        thermalState: '52 °C',
        specs: [
          { label: 'Chipset', value: 'AMD X670E' },
          { label: 'Fases de Energia', value: '18+2 VRM Power Stage', highlight: true },
          { label: 'Portas de Expansão', value: '2x PCIe 5.0 x16 Slots' },
          { label: 'Canais de Áudio', value: 'ROG SupremeFX AGL4082' },
          { label: 'BIOS Versão', value: '1807 [LATEST]' },
          { label: 'Rede Integrada', value: '10Gb + Intel 2.5Gb Ethernet' }
        ],
        dimensions: { length: '305mm', width: '244mm', slots: 'ATX Form Factor' },
        outputs: { hdmi: '1x Port', dp: '2x USB4 Ports', maxResolution: '7680x4320' },
        maintenanceLogs: [
          { date: '2023.11.05', action: 'BIOS_FLASH_v1807' },
          { date: '2023.07.12', action: 'POST_HEX_DEBUGGER' }
        ],
        memoryUsage: 10,
        loadIntensity: 15
      },
      {
        id: 'psu_1000w_plat',
        name: '1000W Platinum Modular',
        category: 'Fontes de Alimentação',
        marketValue: 210.00,
        technicalObservation: 'Fonte modular compacta de alta eficiência com certificação Platinum e ventoinha silenciosa de 135mm.',
        status: 'EM ESTOQUE',
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=400',
        clockSpeed: 'ATX 3.0 / PCIe 5.0',
        vram: 'N/A',
        thermalState: '36 °C',
        specs: [
          { label: 'Potência Nominal', value: '1000 Watts', highlight: true },
          { label: 'Certificação', value: '80 Plus Platinum' },
          { label: 'Modularidade', value: 'Totalmente Modular' },
          { label: 'Padrão Suportado', value: 'Intel ATX 3.0' },
          { label: 'Conector de GPU', value: '12VHPWR 600W Capable' },
          { label: 'MTBF (Vida Útil)', value: '100.000 Horas' }
        ],
        dimensions: { length: '150mm', width: '150mm', slots: 'Standard ATX' },
        outputs: { hdmi: 'N/A', dp: 'N/A', maxResolution: 'N/A' },
        maintenanceLogs: [
          { date: '2023.10.15', action: 'POWER_FACTOR_CALIBRATION' }
        ],
        memoryUsage: 0,
        loadIntensity: 42
      },
      {
        id: 'gpu_rtx_4090',
        name: 'NVIDIA GeForce RTX 4090',
        category: 'Placas de Vídeo',
        marketValue: 1599.00,
        technicalObservation: 'Processadora gráfica sem precedentes. Oferece um salto massivo em desempenho, eficiência e inteligência gráfica baseada em IA.',
        status: 'EM ESTOQUE',
        image: 'https://images.unsplash.com/photo-1587202372496-e32a61a02c2d?auto=format&fit=crop&q=80&w=400',
        clockSpeed: '2.52 GHz',
        vram: '24 GB GDDR6X',
        thermalState: '64 °C',
        specs: [
          { label: 'Arquitetura', value: 'Ada Lovelace' },
          { label: 'CUDA Cores', value: '16384', highlight: true },
          { label: 'Barramento de Memória', value: '384-bit' },
          { label: 'TDP (Power Draw)', value: '450W' },
          { label: 'Interface', value: 'PCIe 4.0 x16' },
          { label: 'Versão do Driver', value: '536.23 [LATEST]' }
        ],
        dimensions: { length: '304mm', width: '137mm', slots: '3.5-Slot' },
        outputs: { hdmi: '1x Port', dp: '3x Ports', maxResolution: '7680x4320' },
        maintenanceLogs: [
          { date: '2023.10.12', action: 'FIRMWARE_PATCH' },
          { date: '2023.08.05', action: 'THERMAL_CHECK' },
          { date: '2023.01.20', action: 'IMPLANTAÇÃO_INICIAL' }
        ],
        memoryUsage: 42,
        loadIntensity: 89
      }
    ];
    fs.writeFileSync(COMPONENTS_FILE, JSON.stringify(defaultComponents, null, 2), 'utf-8');
  }
}

// Call preloader database
initializeDatabase();

// Middleware
app.use(express.json());

// Helper reading methods
function getUsers() {
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveUsers(users: any) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function getComponents() {
  const data = fs.readFileSync(COMPONENTS_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveComponents(comps: any) {
  fs.writeFileSync(COMPONENTS_FILE, JSON.stringify(comps, null, 2), 'utf-8');
}

function getConfig() {
  const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveConfig(config: any) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

// REST APIs
// Users Registration
app.post('/api/auth/register', (req, res) => {
  try {
    const { fullName, email, accessKey } = req.body;
    if (!fullName || !email || !accessKey) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    const users = getUsers();
    const exists = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'Um usuário com este e-mail já existe.' });
    }

    const newUser = { fullName, email, accessKey };
    users.push(newUser);
    saveUsers(users);

    return res.status(201).json({ message: 'Registrado com sucesso!', user: { fullName, email } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Users Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, accessKey } = req.body;
    if (!email || !accessKey) {
      return res.status(400).json({ error: 'E-mail e chave de acesso necessários.' });
    }

    const users = getUsers();
    const matched = users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.accessKey === accessKey
    );

    if (!matched) {
      return res.status(401).json({ error: 'Credenciais inválidas ou e-mail incorreto.' });
    }

    return res.json({ message: 'Login efetuado com sucesso!', user: { fullName: matched.fullName, email: matched.email } });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Components Fetch List
app.get('/api/components', (req, res) => {
  try {
    const comps = getComponents();
    return res.json(comps);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Save or Update Component
app.post('/api/components', (req, res) => {
  try {
    const {
      id,
      name,
      category,
      marketValue,
      technicalObservation,
      status,
      image,
      clockSpeed,
      vram,
      thermalState,
      specs,
      dimensions,
      outputs,
      maintenanceLogs,
      memoryUsage,
      loadIntensity
    } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Nome e Categoria são obrigatórios.' });
    }

    const comps = getComponents();
    const inputId = id || 'comp_' + Math.random().toString(36).substring(2, 9);
    const existingIndex = comps.findIndex((c: any) => c.id === inputId);

    const dataObj = {
      id: inputId,
      name,
      category,
      marketValue: Number(marketValue) || 0,
      technicalObservation: technicalObservation || '',
      status: status || 'EM ESTOQUE',
      image: image || 'https://images.unsplash.com/photo-1587202372496-e32a61a02c2d?auto=format&fit=crop&q=80&w=400',
      clockSpeed: clockSpeed || 'N/A',
      vram: vram || 'N/A',
      thermalState: thermalState || '50 °C',
      specs: specs || [
        { label: 'Arquitetura', value: 'Padrão' },
        { label: 'TDP (Power Draw)', value: 'N/A' }
      ],
      dimensions: dimensions || { length: 'N/A', width: 'N/A', slots: 'N/A' },
      outputs: outputs || { hdmi: 'N/A', dp: 'N/A', maxResolution: 'N/A' },
      maintenanceLogs: maintenanceLogs || [{ date: new Date().toISOString().substring(0, 10).replace(/-/g, '.'), action: 'CADASTRO_INICIAL' }],
      memoryUsage: Number(memoryUsage) || 0,
      loadIntensity: Number(loadIntensity) || 0
    };

    if (existingIndex > -1) {
      comps[existingIndex] = dataObj;
    } else {
      comps.push(dataObj);
    }

    saveComponents(comps);
    return res.json({ message: 'Componente gravado com sucesso!', component: dataObj });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Update single component
app.put('/api/components/:id', (req, res) => {
  try {
    const { id } = req.params;
    const comps = getComponents();
    const idx = comps.findIndex((c: any) => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Componente não encontrado.' });
    }

    comps[idx] = { ...comps[idx], ...req.body };
    saveComponents(comps);
    return res.json({ message: 'Atualizado com sucesso!', component: comps[idx] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Delete component
app.delete('/api/components/:id', (req, res) => {
  try {
    const { id } = req.params;
    const comps = getComponents();
    const filtered = comps.filter((c: any) => c.id !== id);
    if (comps.length === filtered.length) {
      return res.status(404).json({ error: 'Componente não encontrado.' });
    }
    saveComponents(filtered);
    return res.json({ message: 'Componente excluído com sucesso!' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Layout Config Interfaces
app.get('/api/config', (req, res) => {
  try {
    const config = getConfig();
    return res.json(config);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/config', (req, res) => {
  try {
    const currentConfig = getConfig();
    const updated = { ...currentConfig, ...req.body };
    saveConfig(updated);
    return res.json({ message: 'Configuração atualizada com sucesso!', config: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Vite Setup on port 3000
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
