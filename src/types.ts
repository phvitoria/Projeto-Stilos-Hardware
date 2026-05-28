export interface HardwareLog {
  date: string;
  action: string;
}

export interface HardwareSpec {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface HardwareComponent {
  id: string;
  name: string;
  category: string;
  marketValue: number;
  technicalObservation: string;
  status: 'EM ESTOQUE' | 'ESTOQUE BAIXO' | 'ESGOTADO';
  image: string;
  clockSpeed: string;
  vram: string;
  thermalState: string;
  specs: HardwareSpec[];
  dimensions: {
    length: string;
    width: string;
    slots: string;
  };
  outputs: {
    hdmi: string;
    dp: string;
    maxResolution: string;
  };
  maintenanceLogs: HardwareLog[];
  memoryUsage: number; // 0-100
  loadIntensity: number; // 0-100
}

export interface User {
  fullName: string;
  email: string;
  accessKey: string;
}

export interface SystemConfig {
  brandingName: string;
  accentColor: 'green' | 'cyan' | 'blue' | 'amber' | 'red' | 'purple';
  targetTemp: number; // e.g. 42
  activeQueueCount: number; // e.g. 12
  energyFluxMax: number; // e.g. 780
  showSystemLogs: boolean;
}
