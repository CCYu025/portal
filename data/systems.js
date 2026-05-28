export const CATEGORIES = [
  { id: 'production', label: '生產系統', icon: 'factory' },
  { id: 'documents', label: '文件資源', icon: 'folder' },
  { id: 'records', label: '專案紀錄', icon: 'checkSquare' }
];

export const SYSTEMS = [
  {
    id: 'mes-v2',
    name: 'MES System V2',
    desc: '機械手臂生產監控與製程狀態入口',
    url: 'http://100.82.186.54:8000',
    category: 'production',
    icon: 'briefcase',
    vpn: true,
    healthCheck: true,
    keywords: ['mes', 'production', 'manufacturing', 'robot']
  },
  {
    id: 'yf-production',
    name: 'YF 生產儀表板',
    desc: '六機台生產日報、趨勢分析與製程明細',
    url: 'http://100.82.186.54:3001/',
    category: 'production',
    icon: 'factory',
    vpn: true,
    healthCheck: true,
    keywords: ['production', 'dashboard', 'report', 'trend', 'yf']
  },
  {
    id: 'yf-event-monitor',
    name: 'YF 事件監控',
    desc: 'PLC 即時串流、設備事件與異常監看',
    url: 'http://100.85.98.22:8001/dashboard',
    category: 'production',
    icon: 'activity',
    vpn: true,
    healthCheck: true,
    keywords: ['plc', 'dashboard', 'event', 'monitor']
  },
  {
    id: 'company-docs',
    name: '公司文件庫',
    desc: '內部文件索引、操作手冊與維運文件',
    url: 'http://100.82.186.54:8000/doc/文件導覽.html',
    healthUrl: 'http://100.82.186.54:8000',
    category: 'documents',
    icon: 'folder',
    vpn: true,
    healthCheck: true,
    keywords: ['docs', 'manual', 'document']
  },
  {
    id: 'project-records',
    name: '專案紀錄',
    desc: '專案進度、驗收紀錄與交付追蹤',
    url: 'https://ccyu025.github.io/ProjectRecords/',
    category: 'records',
    icon: 'checkSquare',
    vpn: false,
    healthCheck: false,
    keywords: ['project', 'records', 'delivery']
  }
];
