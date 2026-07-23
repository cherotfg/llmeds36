// synthetic fixture — no sample data available from Action Planner
// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    name: 'GEL-KAYANO 31',
    price: 'SGD 179.00',
    original_price: 'SGD 259.00',
    discount_percentage: '30% OFF',
    category: 'Running Shoes',
    image_url: '',
  },
  {
    name: 'GT-2000 13',
    price: 'SGD 129.00',
    original_price: 'SGD 189.00',
    discount_percentage: '32% OFF',
    category: 'Running Shoes',
    image_url: '',
  },
  {
    name: 'NOVABLAST 5',
    price: 'SGD 109.00',
    original_price: 'SGD 159.00',
    discount_percentage: '31% OFF',
    category: 'Running Shoes',
    image_url: '',
  },
];

// Brand palette from BuildWidgetRequest (empty for this action — helper falls back).
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
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

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
      // structuredContent.deals — bare array outputSchema; key derived from actionName "get_current_deals"
      items = structuredContent?.deals || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderDeals(block, items, bridge);

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

function renderDeals(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'get-current-deals-wrapper';

  const track = document.createElement('div');
  track.className = 'get-current-deals-track';

  items.slice(0, 8).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'get-current-deals-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'get-current-deals-image';

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
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    if (item.discount_percentage) {
      const badge = document.createElement('span');
      badge.className = 'get-current-deals-badge';
      badge.textContent = item.discount_percentage;
      imageContainer.appendChild(badge);
    }
    card.appendChild(imageContainer);

    const info = document.createElement('div');
    info.className = 'get-current-deals-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    if (item.name) {
      const name = document.createElement('h3');
      name.className = 'get-current-deals-name';
      name.textContent = item.name;
      info.appendChild(name);
    }

    const priceRow = document.createElement('div');
    priceRow.className = 'get-current-deals-price-row';
    if (item.original_price) {
      const orig = document.createElement('span');
      orig.className = 'get-current-deals-orig';
      orig.textContent = item.original_price;
      priceRow.appendChild(orig);
    }
    if (item.price) {
      const sale = document.createElement('span');
      sale.className = 'get-current-deals-sale';
      sale.textContent = item.price;
      priceRow.appendChild(sale);
    }
    info.appendChild(priceRow);

    const btn = document.createElement('button');
    btn.className = 'get-current-deals-cta';
    btn.type = 'button';
    btn.textContent = 'View Deal';
    if (bridge) {
      btn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name || 'this deal'}`);
      });
    }
    info.appendChild(btn);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'get-current-deals-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `get-current-deals-arrow get-current-deals-arrow-${dir}`;
    b.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    b.textContent = dir === 'left' ? '◀' : '▶';
    b.addEventListener('click', () => {
      const cardWidth = track.querySelector('.get-current-deals-card')?.offsetWidth || 220;
      track.scrollBy({ left: dir === 'left' ? -(cardWidth + 16) : cardWidth + 16, behavior: 'smooth' });
    });
    return b;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    leftArrow.style.display = track.scrollLeft <= 2 ? 'none' : 'flex';
    rightArrow.style.display = track.scrollLeft >= maxScroll - 2 ? 'none' : 'flex';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
