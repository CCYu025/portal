import { CATEGORIES, SYSTEMS } from '../data/systems.js';

const STORAGE_KEY = 'yf-portal-preferences-v1';
const HEALTH_TIMEOUT = 2000;
const MAX_FAVORITES = 4;

const categoryMap = new Map(CATEGORIES.map((category) => [category.id, category]));
const elements = {
  nav: document.querySelector('#categoryNav'),
  filters: document.querySelector('#filterGroup'),
  sections: document.querySelector('#portalSections'),
  sectionTemplate: document.querySelector('#sectionTemplate'),
  cardTemplate: document.querySelector('#systemCardTemplate'),
  searchTrigger: document.querySelector('#searchTrigger'),
  palette: document.querySelector('#palette'),
  paletteInput: document.querySelector('#paletteInput'),
  paletteResults: document.querySelector('#paletteResults'),
  clearPrefs: document.querySelector('#clearPrefs'),
  vpnState: document.querySelector('#vpnState'),
  vpnStateText: document.querySelector('#vpnStateText')
};

const iconPaths = {
  activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2 12h20"/>',
  checkSquare: '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  factory: '<path d="M2 20h20"/><path d="M3 20V8l7 5V8l7 5V4h4v16"/><path d="M7 17h1"/><path d="M12 17h1"/><path d="M17 17h1"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>'
};

let preferences = loadPreferences();
let activeCategory = 'all';
let searchResults = [];
let selectedSearchIndex = 0;

init();

function init() {
  renderNavigation();
  renderFilters();
  renderPortal();
  bindEvents();
  runHealthChecks();
}

function loadPreferences() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      pins: Array.isArray(parsed.pins) ? parsed.pins : [],
      usage: parsed.usage && typeof parsed.usage === 'object' ? parsed.usage : {}
    };
  } catch {
    return { pins: [], usage: {} };
  }
}

function savePreferences() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

function renderNavigation() {
  const fragment = document.createDocumentFragment();
  const favoriteCount = getFavoriteSystems().length;

  if (favoriteCount) {
    fragment.append(createNavLink('#favorites', '我的常用', favoriteCount));
  }

  CATEGORIES.forEach((category) => {
    const count = SYSTEMS.filter((system) => system.category === category.id).length;
    fragment.append(createNavLink(`#cat-${category.id}`, category.label, count));
  });

  elements.nav.replaceChildren(fragment);
}

function createNavLink(href, label, count) {
  const link = document.createElement('a');
  link.href = href;
  link.innerHTML = `<span>${label}</span><span>${count}</span>`;
  return link;
}

function renderFilters() {
  const options = [{ id: 'all', label: '全部' }, ...CATEGORIES];
  const fragment = document.createDocumentFragment();

  options.forEach((option) => {
    const button = document.createElement('button');
    button.className = 'filter-chip';
    button.type = 'button';
    button.dataset.category = option.id;
    button.setAttribute('aria-pressed', String(activeCategory === option.id));
    button.textContent = option.label;
    button.addEventListener('click', () => {
      activeCategory = option.id;
      renderFilters();
      renderPortal();
    });
    fragment.append(button);
  });

  elements.filters.replaceChildren(fragment);
}

function renderPortal() {
  const fragment = document.createDocumentFragment();
  const visibleSystems = activeCategory === 'all'
    ? SYSTEMS
    : SYSTEMS.filter((system) => system.category === activeCategory);

  if (activeCategory === 'all') {
    const favorites = getFavoriteSystems();
    if (favorites.length) {
      fragment.append(renderSection('favorites', '我的常用', favorites));
    }
  }

  CATEGORIES.forEach((category) => {
    if (activeCategory !== 'all' && activeCategory !== category.id) return;
    const systems = visibleSystems.filter((system) => system.category === category.id);
    if (systems.length) {
      fragment.append(renderSection(`cat-${category.id}`, category.label, systems));
    }
  });

  if (!fragment.childNodes.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '沒有符合條件的系統。';
    fragment.append(empty);
  }

  elements.sections.replaceChildren(fragment);
  observeCards();
}

function renderSection(id, title, systems) {
  const section = elements.sectionTemplate.content.firstElementChild.cloneNode(true);
  const heading = section.querySelector('h2');
  const count = section.querySelector('.section-count');
  const grid = section.querySelector('.system-grid');

  section.id = id;
  section.setAttribute('aria-labelledby', `${id}-title`);
  heading.id = `${id}-title`;
  heading.textContent = title;
  count.textContent = `${systems.length} 項`;

  const cards = document.createDocumentFragment();
  systems.forEach((system) => cards.append(renderCard(system)));
  grid.replaceChildren(cards);

  return section;
}

function renderCard(system) {
  const card = elements.cardTemplate.content.firstElementChild.cloneNode(true);
  const link = card.querySelector('.system-link');
  const icon = card.querySelector('.system-icon');
  const title = card.querySelector('.system-title');
  const badges = card.querySelector('.badges');
  const desc = card.querySelector('.system-desc');
  const meta = card.querySelector('.system-meta');
  const pinButton = card.querySelector('.pin-button');

  card.dataset.id = system.id;
  card.dataset.health = system.healthCheck ? 'checking' : 'online';
  card.title = system.healthCheck ? '正在偵測連線狀態' : '公開入口';
  link.href = system.url;
  link.setAttribute('aria-label', `${system.name}${system.vpn ? '，需 VPN' : '，公開入口'}`);
  icon.innerHTML = renderIcon(system.icon);
  title.textContent = system.name;
  desc.textContent = system.desc;
  meta.textContent = buildMeta(system);

  badges.append(createBadge(system.vpn ? '需 VPN' : '公開', system.vpn ? 'vpn' : 'public'));
  badges.append(createBadge(categoryMap.get(system.category)?.label || '未分類'));

  link.addEventListener('click', () => recordUsage(system.id));

  const isPinned = preferences.pins.includes(system.id);
  pinButton.setAttribute('aria-pressed', String(isPinned));
  pinButton.querySelector('.sr-only').textContent = isPinned ? `取消釘選 ${system.name}` : `釘選 ${system.name}`;
  pinButton.addEventListener('click', () => togglePin(system.id));

  return card;
}

function renderIcon(name) {
  const paths = iconPaths[name] || iconPaths.folder;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function createBadge(label, type = '') {
  const badge = document.createElement('span');
  badge.className = `badge ${type}`.trim();
  badge.textContent = label;
  return badge;
}

function buildMeta(system) {
  const usage = preferences.usage[system.id];
  if (usage?.lastOpened) {
    return `最近開啟：${formatRelativeTime(usage.lastOpened)}，累計 ${usage.count || 1} 次`;
  }
  return system.vpn ? '內網服務，需先連線 VPN' : '可直接開啟';
}

function getFavoriteSystems() {
  const pinned = preferences.pins
    .map((id) => SYSTEMS.find((system) => system.id === id))
    .filter(Boolean);

  const used = SYSTEMS
    .filter((system) => !preferences.pins.includes(system.id) && preferences.usage[system.id]?.count)
    .sort((a, b) => {
      const usageA = preferences.usage[a.id];
      const usageB = preferences.usage[b.id];
      return (usageB.count - usageA.count) || (usageB.lastOpened - usageA.lastOpened);
    });

  return [...pinned, ...used].slice(0, MAX_FAVORITES);
}

function recordUsage(systemId) {
  const current = preferences.usage[systemId] || { count: 0, lastOpened: 0 };
  preferences.usage[systemId] = {
    count: current.count + 1,
    lastOpened: Date.now()
  };
  savePreferences();
}

function togglePin(systemId) {
  const set = new Set(preferences.pins);
  if (set.has(systemId)) {
    set.delete(systemId);
  } else {
    set.add(systemId);
  }
  preferences.pins = [...set];
  savePreferences();
  renderNavigation();
  renderPortal();
}

function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.max(1, Math.round(diff / 60000));
  if (minutes < 60) return `${minutes} 分鐘前`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;
  return `${Math.round(hours / 24)} 天前`;
}

function bindEvents() {
  elements.searchTrigger.addEventListener('click', openPalette);
  elements.clearPrefs.addEventListener('click', () => {
    preferences = { pins: [], usage: {} };
    savePreferences();
    renderNavigation();
    renderPortal();
  });

  elements.palette.addEventListener('click', (event) => {
    if (event.target === elements.palette) closePalette();
  });

  elements.paletteInput.addEventListener('input', () => renderPaletteResults(elements.paletteInput.value));
  elements.paletteInput.addEventListener('keydown', handlePaletteKeydown);

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openPalette();
    }
    if (event.key === 'Escape' && !elements.palette.hidden) {
      closePalette();
    }
  });
}

function openPalette() {
  elements.palette.hidden = false;
  elements.paletteInput.value = '';
  selectedSearchIndex = 0;
  renderPaletteResults('');
  requestAnimationFrame(() => elements.paletteInput.focus());
}

function closePalette() {
  elements.palette.hidden = true;
  elements.searchTrigger.focus();
}

function renderPaletteResults(query) {
  searchResults = filterSystems(query);
  selectedSearchIndex = Math.min(selectedSearchIndex, Math.max(searchResults.length - 1, 0));

  const fragment = document.createDocumentFragment();
  searchResults.forEach((system, index) => {
    const option = document.createElement('button');
    option.className = 'palette-option';
    option.type = 'button';
    option.role = 'option';
    option.setAttribute('aria-selected', String(index === selectedSearchIndex));
    option.innerHTML = `
      <span class="system-icon" aria-hidden="true">${renderIcon(system.icon)}</span>
      <span><strong>${escapeHtml(system.name)}</strong><span>${escapeHtml(system.desc)}</span></span>
      <span>${system.vpn ? 'VPN' : '公開'}</span>
    `;
    option.addEventListener('click', () => openSystem(system));
    fragment.append(option);
  });

  if (!searchResults.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '找不到符合的系統。';
    fragment.append(empty);
  }

  elements.paletteResults.replaceChildren(fragment);
}

function filterSystems(query) {
  const normalized = query.trim().toLowerCase();
  const sorted = [...SYSTEMS].sort((a, b) => {
    const pinDelta = Number(preferences.pins.includes(b.id)) - Number(preferences.pins.includes(a.id));
    if (pinDelta) return pinDelta;
    return (preferences.usage[b.id]?.count || 0) - (preferences.usage[a.id]?.count || 0);
  });

  if (!normalized) return sorted;

  return sorted.filter((system) => {
    const category = categoryMap.get(system.category)?.label || '';
    const haystack = [system.name, system.desc, category, ...(system.keywords || [])]
      .join(' ')
      .toLowerCase();
    return normalized.split(/\s+/).every((part) => haystack.includes(part));
  });
}

function handlePaletteKeydown(event) {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    selectedSearchIndex = Math.min(selectedSearchIndex + 1, searchResults.length - 1);
    renderPaletteResults(elements.paletteInput.value);
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    selectedSearchIndex = Math.max(selectedSearchIndex - 1, 0);
    renderPaletteResults(elements.paletteInput.value);
  }
  if (event.key === 'Enter' && searchResults[selectedSearchIndex]) {
    event.preventDefault();
    openSystem(searchResults[selectedSearchIndex]);
  }
}

function openSystem(system) {
  recordUsage(system.id);
  window.open(system.url, '_blank', 'noopener');
  closePalette();
  renderNavigation();
  renderPortal();
}

function observeCards() {
  const cards = document.querySelectorAll('.system-card');
  if (!('IntersectionObserver' in window)) {
    cards.forEach((card) => card.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  cards.forEach((card, index) => {
    card.style.transitionDelay = `${Math.min(index * 35, 180)}ms`;
    observer.observe(card);
  });
}

async function runHealthChecks() {
  const targets = SYSTEMS.filter((system) => system.healthCheck);
  if (!targets.length) {
    setVpnState('online', '公開入口');
    return;
  }

  const results = await Promise.all(targets.map(async (system) => {
    const result = await ping(system);
    updateCardHealth(system.id, result);
    return result;
  }));

  if (results.includes('online')) {
    setVpnState('online', '已連線 VPN');
  } else if (results.includes('blocked')) {
    setVpnState('limited', '需 VPN');
  } else {
    setVpnState('limited', 'VPN 未連線');
  }
}

async function ping(url) {
  const target = new URL(url.healthUrl || url.url || url, window.location.href);
  const isMixedContent = window.location.protocol === 'https:' && target.protocol === 'http:';

  if (isMixedContent) {
    return 'blocked';
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT);

  try {
    await fetch(target.href, {
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });
    return 'online';
  } catch {
    return 'offline';
  } finally {
    clearTimeout(timeout);
  }
}

function updateCardHealth(systemId, health) {
  document.querySelectorAll(`.system-card[data-id="${CSS.escape(systemId)}"]`).forEach((card) => {
    card.dataset.health = health;
    if (health === 'online') {
      card.title = '已連線';
    } else if (health === 'blocked') {
      card.title = 'GitHub Pages HTTPS 無法偵測 HTTP 內網服務，可直接開啟';
    } else {
      card.title = '目前無法連線，請確認 VPN';
    }
  });
}

function setVpnState(state, text) {
  elements.vpnState.dataset.state = state;
  elements.vpnStateText.textContent = text;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
