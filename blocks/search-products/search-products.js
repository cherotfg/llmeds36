// synthetic fixture — no sample data available from Action Planner
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: 'Samba OG Shoes', price: 'A$160', category: 'Shoes', gender: 'Unisex', image_url: 'https://assets.adidas.com/images/samba-og.jpg', product_url: 'https://www.adidas.com.au/samba-og' },
  { name: 'Adicolor Classics Tee', price: 'A$45', category: 'Clothing', gender: 'Men', image_url: 'https://assets.adidas.com/images/adicolor-tee.jpg', product_url: 'https://www.adidas.com.au/adicolor-tee' },
  { name: 'Ultraboost Light Running Shoes', price: 'A$260', category: 'Shoes', gender: 'Women', image_url: 'https://assets.adidas.com/images/ultraboost-light.jpg', product_url: 'https://www.adidas.com.au/ultraboost-light' },
];

// Brand palette from BuildWidgetRequest (empty for this action).
// getThemedCardBg() darkens palette[0] to luminance <= 0.12 so white text has WCAG AA contrast.
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
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m; }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const ACCENT = '#2563eb';
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.products — bare array outputSchema; key derived from actionName "search_products"
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderItems(block, items, bridge);

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

function renderItems(block, items, bridge) {
  if (!items || items.length === 0) {
    renderSearchForm(block, bridge);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'search-products-carousel-wrap';

  const track = document.createElement('div');
  track.className = 'search-products-track';

  items.slice(0, 5).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'search-products-card';

    const imageBox = document.createElement('div');
    imageBox.className = 'search-products-image';
    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };
    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imageBox.appendChild(img);
    } else {
      imageBox.appendChild(colorDiv());
    }
    card.appendChild(imageBox);

    const info = document.createElement('div');
    info.className = 'search-products-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const name = document.createElement('div');
    name.className = 'search-products-name';
    name.textContent = item.name || '';
    info.appendChild(name);

    const meta = document.createElement('div');
    meta.className = 'search-products-meta';

    const price = document.createElement('span');
    price.className = 'search-products-price';
    price.textContent = item.price || '';
    meta.appendChild(price);

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'search-products-badge';
      badge.textContent = item.category;
      meta.appendChild(badge);
    }
    info.appendChild(meta);

    const cta = document.createElement('button');
    cta.className = 'search-products-cta';
    cta.type = 'button';
    cta.textContent = 'Shop Now';
    cta.addEventListener('click', () => {
      if (bridge && item.product_url) bridge.openLink(item.product_url);
      else if (bridge) bridge.sendMessage(`Tell me more about ${item.name}`);
    });
    info.appendChild(cta);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'search-products-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;`;
  wrapper.appendChild(fade);

  const leftBtn = document.createElement('button');
  leftBtn.className = 'search-products-nav search-products-nav-left';
  leftBtn.type = 'button';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.textContent = '◀';

  const rightBtn = document.createElement('button');
  rightBtn.className = 'search-products-nav search-products-nav-right';
  rightBtn.type = 'button';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.textContent = '▶';

  const scrollByCard = (dir) => track.scrollBy({ left: dir * 236, behavior: 'smooth' });
  leftBtn.addEventListener('click', () => scrollByCard(-1));
  rightBtn.addEventListener('click', () => scrollByCard(1));
  [leftBtn, rightBtn].forEach((btn) => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });

  const updateArrows = () => {
    const atStart = track.scrollLeft <= 2;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    leftBtn.style.display = atStart ? 'none' : 'flex';
    rightBtn.style.display = atEnd ? 'none' : 'flex';
  };
  track.addEventListener('scroll', updateArrows);
  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);
  block.appendChild(wrapper);
  requestAnimationFrame(updateArrows);
}

function renderSearchForm(block, bridge) {
  const card = document.createElement('div');
  card.className = 'search-products-form';
  card.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  const heading = document.createElement('div');
  heading.className = 'search-products-form-title';
  heading.textContent = 'Search products';
  card.appendChild(heading);

  const query = document.createElement('input');
  query.type = 'text';
  query.className = 'search-products-input';
  query.placeholder = 'Search products…';
  card.appendChild(query);

  const category = document.createElement('input');
  category.type = 'text';
  category.className = 'search-products-input';
  category.placeholder = 'Category (e.g. Shoes)';
  card.appendChild(category);

  const btn = document.createElement('button');
  btn.className = 'search-products-cta search-products-form-cta';
  btn.type = 'button';
  btn.textContent = 'Search';
  btn.addEventListener('click', () => {
    if (!bridge) return;
    const parts = [];
    if (query.value.trim()) parts.push(query.value.trim());
    if (category.value.trim()) parts.push(`in ${category.value.trim()}`);
    bridge.sendMessage(`Search for products ${parts.join(' ')}`.trim());
  });
  card.appendChild(btn);

  block.appendChild(card);
}
