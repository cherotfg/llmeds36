// synthetic fixture — no sample data available from Action Planner
// Detail concept: a single product object. In production this comes from bridge.toolResult.
// image_url omitted intentionally — the CARD_COLORS fallback renders a solid color panel.
const SAMPLE_ITEM = {
  name: 'Ultraboost Light Running Shoes',
  description: 'Experience epic energy with the new Ultraboost Light, our lightest Ultraboost ever. The magic lies in the Light BOOST midsole, a new generation of adidas BOOST.',
  price: 'A$280.00',
  category: 'Running',
  sizes: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
  colors: ['Core Black', 'Cloud White', 'Solar Red'],
  image_url: '',
};

// Brand palette from BuildWidgetRequest (empty here → fallbacks used).
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
const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let item;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      item = SAMPLE_ITEM;
    } else {
      // Detail concept — structuredContent IS the item (flat). No wrapper key.
      const _result = await bridge.toolResult;
      item = (_result?.structuredContent || _result) || {};
    }
  } else {
    item = SAMPLE_ITEM;
  }

  block.textContent = '';
  const hasProduct = item && (item.name || item.price || item.description);
  if (hasProduct) {
    renderDetail(block, item, bridge);
  } else {
    renderLookup(block, bridge);
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

function renderDetail(block, item, bridge) {
  const card = document.createElement('div');
  card.className = 'product-detail-card';

  // Image (left)
  const imageWrap = document.createElement('div');
  imageWrap.className = 'pd-image';
  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${CARD_COLORS[0]};`;
    return d;
  };
  if (item.image_url) {
    const img = document.createElement('img');
    img.src = item.image_url;
    img.alt = item.name || '';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
    imageWrap.appendChild(img);
  } else {
    imageWrap.appendChild(colorDiv());
  }
  card.appendChild(imageWrap);

  // Content (right)
  const content = document.createElement('div');
  content.className = 'pd-content';
  content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  if (item.category) {
    const cat = document.createElement('span');
    cat.className = 'pd-category';
    cat.textContent = item.category;
    content.appendChild(cat);
  }

  const name = document.createElement('h3');
  name.className = 'pd-name';
  name.textContent = item.name || 'Product';
  content.appendChild(name);

  if (item.description) {
    const desc = document.createElement('p');
    desc.className = 'pd-desc';
    desc.textContent = item.description;
    content.appendChild(desc);
  }

  if (item.price) {
    const price = document.createElement('div');
    price.className = 'pd-price';
    price.textContent = item.price;
    content.appendChild(price);
  }

  const chipRow = (label, values) => {
    if (!Array.isArray(values) || values.length === 0) return;
    const wrap = document.createElement('div');
    wrap.className = 'pd-chip-group';
    const lbl = document.createElement('span');
    lbl.className = 'pd-chip-label';
    lbl.textContent = label;
    wrap.appendChild(lbl);
    const chips = document.createElement('div');
    chips.className = 'pd-chips';
    values.forEach((v) => {
      const chip = document.createElement('span');
      chip.className = 'pd-chip';
      chip.textContent = v;
      chips.appendChild(chip);
    });
    wrap.appendChild(chips);
    content.appendChild(wrap);
  };
  chipRow('Sizes', item.sizes);
  chipRow('Colors', item.colors);

  const cta = document.createElement('button');
  cta.className = 'pd-cta';
  cta.textContent = 'Add to Bag';
  if (bridge) {
    cta.addEventListener('click', () => {
      bridge.sendMessage(`Add ${item.name || 'this product'} to my bag`);
    });
  }
  content.appendChild(cta);

  card.appendChild(content);
  block.appendChild(card);
}

function renderLookup(block, bridge) {
  const card = document.createElement('div');
  card.className = 'pd-lookup';

  const title = document.createElement('h3');
  title.className = 'pd-lookup-title';
  title.textContent = 'Find a product';
  card.appendChild(title);

  const input = document.createElement('input');
  input.className = 'pd-lookup-input';
  input.type = 'text';
  input.placeholder = 'Enter product code or name…';
  card.appendChild(input);

  const btn = document.createElement('button');
  btn.className = 'pd-lookup-btn';
  btn.textContent = 'Search';
  const submit = () => {
    const q = input.value.trim();
    if (q && bridge) bridge.sendMessage(`Show me product details for ${q}`);
  };
  btn.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  card.appendChild(btn);

  block.appendChild(card);
}
