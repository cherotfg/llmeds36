// synthetic fixture — no sample data available from Action Planner
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'adidas Sydney CBD',
    address: 'Shop 42, Pitt Street Mall, Sydney NSW 2000',
    phone: '(02) 9221 4455',
    hours: 'Mon-Sat 9am-7pm, Sun 10am-6pm',
  },
  {
    name: 'adidas Bondi Junction',
    address: 'Westfield, 500 Oxford St, Bondi Junction NSW 2022',
    phone: '(02) 9387 1122',
    hours: 'Mon-Sun 9am-6pm',
  },
];

// Brand palette from BuildWidgetRequest (empty for this action).
// getThemedCardBg() darkens palette[0] to luminance <= 0.12 for WCAG AA contrast.
const PALETTE = [];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (rr, gg, bb) => 0.2126 * lum(rr) + 0.7152 * lum(gg) + 0.0722 * lum(bb);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0; let hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo); const dg = Math.round(g * lo); const db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);
const CARD_BG = theme?.bg ?? '#1a3a5c';
const CARD_FG = theme?.fg ?? '#ffffff';
const ACCENT = '#2563eb';

function pinIcon(size, color) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', color);
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p1.setAttribute('d', 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z');
  const c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c1.setAttribute('cx', '12'); c1.setAttribute('cy', '10'); c1.setAttribute('r', '3');
  svg.appendChild(p1); svg.appendChild(c1);
  return svg;
}

function renderEmptyState(block, bridge) {
  const card = document.createElement('div');
  card.className = 'find-store-empty';
  card.style.cssText = `background:${CARD_BG};color:${CARD_FG}`;

  const iconWrap = document.createElement('div');
  iconWrap.className = 'find-store-empty-icon';
  iconWrap.appendChild(pinIcon(40, CARD_FG));
  card.appendChild(iconWrap);

  const heading = document.createElement('h3');
  heading.className = 'find-store-empty-heading';
  heading.textContent = 'Find a store near you';
  card.appendChild(heading);

  const form = document.createElement('form');
  form.className = 'find-store-form';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'find-store-input';
  input.placeholder = 'Enter suburb or postcode…';
  input.setAttribute('aria-label', 'Suburb or postcode');
  form.appendChild(input);

  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.className = 'find-store-btn';
  btn.textContent = 'Find Stores';
  btn.style.cssText = `background:${ACCENT};color:#fff`;
  form.appendChild(btn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const loc = input.value.trim();
    if (bridge && loc) {
      bridge.sendMessage(`Find an adidas store near ${loc}`);
    }
  });

  card.appendChild(form);
  block.appendChild(card);
}

function renderStores(block, stores, bridge) {
  const row = document.createElement('div');
  row.className = 'find-store-row';

  stores.slice(0, 2).forEach((store) => {
    const card = document.createElement('div');
    card.className = 'find-store-card';
    card.style.cssText = `background:${CARD_BG};color:${CARD_FG}`;

    const pinWrap = document.createElement('div');
    pinWrap.className = 'find-store-pin';
    pinWrap.appendChild(pinIcon(18, CARD_FG));
    card.appendChild(pinWrap);

    const name = document.createElement('h3');
    name.className = 'find-store-name';
    name.textContent = store.name || '';
    card.appendChild(name);

    if (store.address) {
      const addr = document.createElement('p');
      addr.className = 'find-store-address';
      addr.textContent = store.address;
      card.appendChild(addr);
    }

    if (store.phone) {
      const phone = document.createElement('p');
      phone.className = 'find-store-phone';
      phone.textContent = store.phone;
      phone.style.color = ACCENT;
      card.appendChild(phone);
    }

    if (store.hours) {
      const hours = document.createElement('p');
      hours.className = 'find-store-hours';
      hours.textContent = store.hours;
      card.appendChild(hours);
    }

    if (bridge && store.name) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'find-store-more';
      btn.textContent = 'More info';
      btn.style.cssText = `background:${ACCENT};color:#fff`;
      btn.addEventListener('click', () => bridge.sendMessage(`Tell me more about ${store.name}`));
      card.appendChild(btn);
    }

    row.appendChild(card);
  });

  block.appendChild(row);
}

export default async function decorate(block, bridge) {
  let stores;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      stores = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.stores — bare array outputSchema; key derived from actionName "find_store"
      stores = structuredContent?.stores || [];
    }
  } else {
    stores = SAMPLE_DATA;
  }

  block.textContent = '';
  if (Array.isArray(stores) && stores.length > 0) {
    renderStores(block, stores, bridge);
  } else {
    renderEmptyState(block, bridge);
  }

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}
