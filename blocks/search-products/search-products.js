// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  { name: "Nike Solo Fleece Men's Pullover Hoodie", description: "Men's fleece pullover hoodie for everyday warmth.", image_url: 'https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_1.0/h_599,c_limit/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/eacfc8ef-8c8f-4a10-82d6-c4d352c1525e/M+NK+SOLO+BB+PO+HD.png', price: '$115', category: 'Hoodies & Sweatshirts' },
  { name: "Nike Solo Fleece Men's Cuffed Trousers", description: "Men's cuffed fleece trousers with a relaxed fit.", image_url: 'https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_1.0/h_599,c_limit/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/c10c5891-cb8b-4634-b4b2-854befda3121/M+NK+SOLO+BB+CUFF+PANT.png', price: '$110', category: 'Pants' },
  { name: "Nike Pre-Game Fleece Women's Oversized Hoodie", description: "Women's oversized fleece hoodie for laid-back layering.", image_url: 'https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_1.0/h_599,c_limit/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/5569961d-3a1b-4d2c-bc2e-11e2348b9a85/W+NSW+ARTICLE+FLC+HDY+2.png', price: '$170', category: 'Hoodies & Sweatshirts' },
  { name: "Nike Pre-Game Fleece Women's Loose Mid-Rise Trousers", description: "Women's loose mid-rise fleece trousers.", image_url: 'https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_1.0/h_599,c_limit/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/b1d7174d-633b-474c-9558-810c83e73b24/W+NSW+ARTICLE+FLC+TROUSER.png', price: '$170', category: 'Pants' },
  { name: "Nike Solo Swoosh Men's Fleece Quarter-Zip Top", description: "Men's fleece quarter-zip top with Solo Swoosh branding.", image_url: 'https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_1.0/h_599,c_limit/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/63e6bcd5-4131-451a-bc17-8dda2d7fc52d/M+NL+SOLO+SWSH+BB+QUARTER+ZIP.png', price: '$130', category: 'Hoodies & Sweatshirts' },
  { name: "Nike Solo Swoosh Men's Cuffed Fleece Trousers", description: "Men's cuffed fleece trousers with Solo Swoosh detailing.", image_url: 'https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_1.0/h_599,c_limit/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/b6448c13-813b-4bad-9348-7fd872b769e1/M+NL+SOLO+SWSH+BB+CF+PANT.png', price: '$130', category: 'Pants' },
  { name: "Nike Sportswear Tech Fleece Older Kids' Full-Zip Hoodie", description: "Older kids' full-zip Tech Fleece hoodie.", image_url: 'https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_1.0/h_599,c_limit/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/5bc861d6-73b0-41f4-a39c-cf348536b163/B+NSW+TCH+FLC+FZ+-+PD.png', price: '$130', category: 'Kids Clothing' },
  { name: "Nike Sportswear Tech Fleece Older Kids' Joggers", description: "Older kids' Tech Fleece joggers.", image_url: 'https://static.nike.com/a/images/q_auto:eco/t_product_v1/f_auto/dpr_1.0/h_599,c_limit/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/c0ffd9ac-7728-4f14-9f86-d4c27eb36d6d/B+NSW+TCH+FLC+JGGR+-+PD.png', price: '$110', category: 'Kids Clothing' },
];

// Brand palette from BuildWidgetRequest — empty here, so theme falls back to #1a1a1a / #fff.
const PALETTE = [];
function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s=c/255; return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4); };
  const relLum = (r,g,b) => 0.2126*lum(r)+0.7152*lum(g)+0.0722*lum(b);
  if (relLum(r,g,b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo=0, hi=1;
  for (let i=0; i<20; i++) { const m=(lo+hi)/2; if (relLum(Math.round(r*m),Math.round(g*m),Math.round(b*m)) > 0.12) hi=m; else lo=m; }
  const dr=Math.round(r*lo), dg=Math.round(g*lo), db=Math.round(b*lo);
  return { bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`, fg:'#ffffff' };
}
const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

export default async function decorate(block, bridge) {
  let products;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      products = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.products — bare array outputSchema; key derived from actionName "search_products"
      products = structuredContent?.products || [];
    }
  } else {
    products = SAMPLE_DATA;
  }

  block.textContent = '';
  renderProducts(block, products, bridge);

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

function renderProducts(block, products, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'search-products-wrapper';

  const track = document.createElement('div');
  track.className = 'search-products-track';

  products.slice(0, 10).forEach((product, i) => {
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
    if (product.image_url) {
      const img = document.createElement('img');
      img.src = product.image_url;
      img.alt = product.name || '';
      img.loading = 'lazy';
      img.onerror = () => img.parentNode && img.parentNode.replaceChild(colorDiv(), img);
      imageBox.appendChild(img);
    } else {
      imageBox.appendChild(colorDiv());
    }
    card.appendChild(imageBox);

    const info = document.createElement('div');
    info.className = 'search-products-info';
    info.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const title = document.createElement('h3');
    title.className = 'search-products-name';
    title.textContent = product.name || '';
    info.appendChild(title);

    if (product.description) {
      const desc = document.createElement('p');
      desc.className = 'search-products-desc';
      desc.textContent = product.description;
      info.appendChild(desc);
    }

    const meta = document.createElement('div');
    meta.className = 'search-products-meta';
    const price = document.createElement('span');
    price.className = 'search-products-price';
    price.textContent = product.price || '';
    meta.appendChild(price);
    if (product.category) {
      const badge = document.createElement('span');
      badge.className = 'search-products-badge';
      badge.textContent = product.category;
      meta.appendChild(badge);
    }
    info.appendChild(meta);

    const cta = document.createElement('button');
    cta.className = 'search-products-cta';
    cta.type = 'button';
    cta.textContent = 'View Details';
    if (bridge) {
      cta.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${product.name}`);
      });
    }
    info.appendChild(cta);

    card.appendChild(info);
    track.appendChild(card);
  });

  wrapper.appendChild(track);

  const fade = document.createElement('div');
  fade.className = 'search-products-fade';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  const mkArrow = (dir) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `search-products-arrow search-products-arrow-${dir}`;
    btn.textContent = dir === 'left' ? '◀' : '▶';
    btn.setAttribute('aria-label', dir === 'left' ? 'Scroll left' : 'Scroll right');
    const scroll = () => {
      const cardEl = track.querySelector('.search-products-card');
      const amount = cardEl ? cardEl.offsetWidth + 16 : 236;
      track.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    };
    btn.addEventListener('click', scroll);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scroll(); }
    });
    return btn;
  };
  const leftArrow = mkArrow('left');
  const rightArrow = mkArrow('right');
  wrapper.appendChild(leftArrow);
  wrapper.appendChild(rightArrow);

  const updateArrows = () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    leftArrow.style.display = track.scrollLeft <= 2 ? 'none' : 'flex';
    rightArrow.style.display = track.scrollLeft >= maxScroll - 2 ? 'none' : 'flex';
    fade.style.display = track.scrollLeft >= maxScroll - 2 ? 'none' : 'block';
  };
  track.addEventListener('scroll', updateArrows);
  requestAnimationFrame(updateArrows);

  block.appendChild(wrapper);
}
