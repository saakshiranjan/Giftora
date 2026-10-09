/* ===================================================
   GIFTORA — Premium E-Commerce JavaScript (app.js)
   Features: Cart, Wishlist, Filter, POS, Theme Toggle,
             Carousel, Modal, Toast, Search, Animations
   =================================================== */

'use strict';

/* ========== DATA — PRODUCTS ========== */
const PRODUCTS = [
  {
    id: 1,
    name: 'Pastel Dream Bouquet',
    category: 'bouquets',
    categoryLabel: 'Pipe-Cleaner Flowers',
    desc: 'A dreamy arrangement of pastel pink and purple pipe-cleaner roses with lavender sprigs.',
    price: 649,
    original: 849,
    rating: 4.9,
    reviews: 128,
    image: 'pipe_cleaner_bouquet_1791536893162.jpg',
    label: 'bestseller',
    colors: ['#f4a8c7', '#c89ee0', '#a8c4f4', '#f4e1a8'],
    customizable: true,
  },
  {
    id: 2,
    name: 'Luxury Gift Hamper',
    category: 'hampers',
    categoryLabel: 'Gift Hampers',
    desc: 'A curated luxury hamper filled with candles, botanicals, artisan chocolates, and handmade keepsakes.',
    price: 1299,
    original: 1699,
    rating: 5.0,
    reviews: 87,
    image: 'gift_hamper_1791536905323.jpg',
    label: 'bestseller',
    colors: ['#7c4d33', '#2c3e50', '#d4af6e'],
    customizable: true,
  },
  {
    id: 3,
    name: 'Rainbow Crochet Bouquet',
    category: 'crochet',
    categoryLabel: 'Crochet Flowers',
    desc: 'Vibrant handmade crochet tulips, roses, and daisies in a cheerful rainbow palette.',
    price: 549,
    original: 699,
    rating: 4.8,
    reviews: 63,
    image: 'crochet_flowers_1791536921665.jpg',
    label: 'new',
    colors: ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6'],
    customizable: true,
  },
  {
    id: 4,
    name: 'Charm Keychain Collection',
    category: 'keychains',
    categoryLabel: 'Keychains',
    desc: 'Set of 3 personalized resin keychains — hearts, stars, moons — with custom name tags.',
    price: 299,
    original: 399,
    rating: 4.7,
    reviews: 201,
    image: 'keychains_collection_1791536934252.jpg',
    label: 'bestseller',
    colors: ['#e8a0bf', '#a0c4e8', '#a0e8b8', '#f0e68c'],
    customizable: true,
  },
  {
    id: 5,
    name: 'Birthday Bliss Box',
    category: 'birthday',
    categoryLabel: 'Birthday Gifts',
    desc: 'A stunning pink and gold birthday gift box with handmade paper flowers, confetti, and a personalized message card.',
    price: 899,
    original: 1199,
    rating: 5.0,
    reviews: 156,
    image: 'birthday_gift_box_1791536960110.jpg',
    label: 'bestseller',
    colors: ['#f4a8c7', '#d4af6e', '#fff'],
    customizable: true,
  },
  {
    id: 6,
    name: 'Anniversary Velvet Set',
    category: 'anniversary',
    categoryLabel: 'Anniversary Gifts',
    desc: 'Deep burgundy velvet anniversary box with roses, gold-accented jewelry, candles, and a heartfelt card.',
    price: 1499,
    original: 1999,
    rating: 5.0,
    reviews: 94,
    image: 'anniversary_gift_1791536973917.jpg',
    label: 'limited',
    colors: ['#8b0000', '#d4af6e', '#2c2c2c'],
    customizable: true,
  },
  {
    id: 7,
    name: 'Mini Crochet Sunflowers',
    category: 'crochet',
    categoryLabel: 'Crochet Flowers',
    desc: 'Adorable mini sunflower bunch in bright yellow and golden yarn — perfect desk decor.',
    price: 349,
    original: 449,
    rating: 4.6,
    reviews: 45,
    image: 'crochet_flowers_1791536921665.jpg',
    label: 'new',
    colors: ['#f1c40f', '#e67e22', '#2ecc71'],
    customizable: false,
  },
  {
    id: 8,
    name: 'Personalized Gift Hamper',
    category: 'hampers',
    categoryLabel: 'Gift Hampers',
    desc: 'Fully customizable hamper — pick your items, colors, theme, and we craft it with love.',
    price: 799,
    original: 1099,
    rating: 4.9,
    reviews: 72,
    image: 'gift_hamper_1791536905323.jpg',
    label: 'custom',
    colors: ['#e8a0bf', '#7c4d33', '#2c3e50'],
    customizable: true,
  },
];

/* ========== STATE ========== */
let cart = JSON.parse(localStorage.getItem('giftora_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('giftora_wishlist') || '[]');
let currentFilter = 'all';
let currentSort = 'default';
let filteredProducts = [...PRODUCTS];
let currentTestimonial = 0;
let modalProduct = null;
let modalQty = 1;
let modalColor = null;
let testimonialAutoplay = null;

/* ========== DOM REFERENCES ========== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initAnnouncement();
  renderProducts(PRODUCTS);
  initFilterBar();
  initSortSelect();
  initCart();
  initWishlist();
  initSearch();
  initTestimonials();
  initScrollReveal();
  initBackToTop();
  initContactForm();
  initCheckout();
  updateCartBadge();
  updateWishlistBadge();
  initClerkAuth(); // Clerk authentication
});

/* ========== CLERK AUTHENTICATION ========== */
let clerkIsLoaded = false;

async function ensureClerkLoaded() {
  if (clerkIsLoaded && window.Clerk) return window.Clerk;
  
  // Wait for script to load if it hasn't
  let retries = 0;
  while (!window.Clerk && retries < 20) {
    await new Promise(r => setTimeout(r, 100));
    retries++;
  }

  const clerk = window.Clerk;
  if (!clerk) {
    showToast('⚠️ Authentication service is unavailable right now.', 'error');
    return null;
  }

  try {
    await clerk.load();
    clerkIsLoaded = true;
    return clerk;
  } catch (err) {
    console.error('Error loading Clerk:', err);
    return null;
  }
}

async function initClerkAuth() {
  const clerk = await ensureClerkLoaded();
  if (!clerk) {
    console.warn('Clerk not loaded. Running in offline mode.');
    document.getElementById('clerkSignInBtn').style.display = 'inline-flex';
    document.getElementById('clerkSignUpBtn').style.display = 'inline-flex';
    return;
  }

  const signInBtn = document.getElementById('clerkSignInBtn');
  const signUpBtn = document.getElementById('clerkSignUpBtn');
  const userBtnContainer = document.getElementById('clerkUserBtn');

  function updateAuthUI() {
    if (clerk.user) {
      signInBtn.style.display = 'none';
      signUpBtn.style.display = 'none';
      userBtnContainer.style.display = 'flex';
      userBtnContainer.innerHTML = '';
      clerk.mountUserButton(userBtnContainer, {
        appearance: { elements: { userButtonAvatarBox: { width: '36px', height: '36px' } } },
      });
      showToast(`👋 Welcome back, ${clerk.user.firstName || 'Gifter'}!`, 'success');
    } else {
      signInBtn.style.display = 'inline-flex';
      signUpBtn.style.display = 'inline-flex';
      userBtnContainer.style.display = 'none';
    }
  }

  updateAuthUI();
  clerk.addListener(({ user }) => updateAuthUI());
}

async function openClerkSignIn() {
  const clerk = await ensureClerkLoaded();
  if (!clerk) return;
  clerk.openSignIn();
}
window.openClerkSignIn = openClerkSignIn;

async function openClerkSignUp() {
  const clerk = await ensureClerkLoaded();
  if (!clerk) return;
  clerk.openSignUp();
}
window.openClerkSignUp = openClerkSignUp;


/* ========== THEME TOGGLE ========== */
function initTheme() {
  const saved = localStorage.getItem('giftora_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);

  const btn = $('#themeToggle');
  btn.addEventListener('click', () => {
    const curr = document.documentElement.getAttribute('data-theme');
    const next = curr === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('giftora_theme', next);
    showToast(next === 'light' ? '☀️ Light mode activated' : '🌙 Dark mode activated', 'info');
  });
}

/* ========== NAVBAR ========== */
function initNavbar() {
  const navbar = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');
  const links = $$('.nav-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateActiveLink();
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  navLinks.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-link')) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    }
  });
}

function updateActiveLink() {
  const sections = ['home', 'products', 'categories', 'customize', 'about', 'contact'];
  const links = $$('.nav-link');
  let active = 'home';

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && window.scrollY >= el.offsetTop - 120) {
      active = id;
    }
  });

  links.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${active}`);
  });
}

/* ========== ANNOUNCEMENT BAR ========== */
function initAnnouncement() {
  const closeBtn = $('#closeAnnouncement');
  const bar = $('#announcementBar');
  closeBtn.addEventListener('click', () => {
    bar.style.display = 'none';
  });
}

/* ========== PRODUCT RENDERING ========== */
function renderProducts(products) {
  const grid = $('#productsGrid');
  const count = $('#productCount');
  count.textContent = `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`;

  if (products.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">
      <div style="font-size:3rem;margin-bottom:12px;">🔍</div>
      <p>No products found for this filter.</p>
    </div>`;
    return;
  }

  grid.innerHTML = products.map(p => createProductCard(p)).join('');
  attachProductCardListeners();
}

function createProductCard(product) {
  const wishlisted = wishlist.includes(product.id);
  const discount = Math.round(((product.original - product.price) / product.original) * 100);
  const stars = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 >= 0.5 ? '½' : '');

  return `
    <article class="product-card reveal" data-id="${product.id}" data-category="${product.category}">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
        ${product.label ? `<span class="product-label label-${product.label}">${labelText(product.label)}</span>` : ''}
        <div class="product-actions">
          <button class="product-action-btn wishlist-toggle ${wishlisted ? 'wishlisted' : ''}" 
            data-id="${product.id}" aria-label="Add to wishlist" title="Wishlist">
            ${wishlisted ? '❤️' : '🤍'}
          </button>
          <button class="product-action-btn quick-view-btn" data-id="${product.id}" aria-label="Quick view" title="Quick View">
            👁️
          </button>
        </div>
      </div>
      <div class="product-info">
        <span class="product-category">${product.categoryLabel}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.desc}</p>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.floor(product.rating))}${product.rating % 1 >= 0.5 ? '⭑' : ''}</span>
          <span class="rating-count">${product.rating} (${product.reviews})</span>
          ${discount > 0 ? `<span style="margin-left:auto;font-size:0.72rem;color:#2ecc71;font-weight:600;">-${discount}%</span>` : ''}
        </div>
        <div class="product-footer">
          <div class="product-price">
            <span class="price-current">₹${product.price.toLocaleString('en-IN')}</span>
            ${product.original ? `<span class="price-original">₹${product.original.toLocaleString('en-IN')}</span>` : ''}
          </div>
          <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

function labelText(label) {
  const map = { bestseller: '🔥 Bestseller', new: '✨ New', custom: '✍️ Custom', limited: '⏰ Limited' };
  return map[label] || label;
}

function attachProductCardListeners() {
  // Add to cart buttons
  $$('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      addToCart(id, 1);
    });
  });

  // Wishlist toggle
  $$('.wishlist-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWishlist(parseInt(btn.dataset.id), btn);
    });
  });

  // Quick view / entire card
  $$('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(parseInt(btn.dataset.id));
    });
  });

  $$('.product-card').forEach(card => {
    card.addEventListener('click', () => openModal(parseInt(card.dataset.id)));
  });

  // Re-trigger scroll reveal
  triggerReveal();
}

/* ========== FILTER BAR ========== */
function initFilterBar() {
  const btns = $$('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });
}

function initSortSelect() {
  const sel = $('#sortSelect');
  sel.addEventListener('change', () => {
    currentSort = sel.value;
    applyFilters();
  });
}

function applyFilters() {
  let result = currentFilter === 'all'
    ? [...PRODUCTS]
    : PRODUCTS.filter(p => p.category === currentFilter);

  switch (currentSort) {
    case 'price-low': result.sort((a, b) => a.price - b.price); break;
    case 'price-high': result.sort((a, b) => b.price - a.price); break;
    case 'rating': result.sort((a, b) => b.rating - a.rating); break;
  }

  filteredProducts = result;
  renderProducts(result);
}

/* ========== CART ========== */
function initCart() {
  const cartBtn = $('#cartBtn');
  const cartClose = $('#cartClose');
  const cartOverlay = $('#cartOverlay');
  const clearCartBtn = $('#clearCartBtn');
  const checkoutBtn = $('#checkoutBtn');

  cartBtn.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  clearCartBtn.addEventListener('click', clearCart);
  checkoutBtn.addEventListener('click', () => {
    closeCart();
    openCheckout();
  });

  renderCart();
}

function openCart() {
  $('#cartSidebar').classList.add('active');
  $('#cartOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  $('#cartSidebar').classList.remove('active');
  $('#cartOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function addToCart(productId, qty = 1, color = null) {
  // Enforce Authentication
  const clerk = window.Clerk;
  if (clerk && !clerk.user) {
    showToast('🔒 Please Sign In or Sign Up to add items to your cart!', 'info');
    if (typeof openClerkSignUp === 'function') {
      openClerkSignUp();
    }
    return;
  }

  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty, color: color || product.colors[0] });
  }

  saveCart();
  renderCart();
  updateCartBadge();
  showToast(`🛍️ "${product.name}" added to cart!`, 'success');
  
  // Animate badge
  const badge = $('#cartBadge');
  badge.style.transform = 'scale(1.5)';
  setTimeout(() => badge.style.transform = '', 300);
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  renderCart();
  updateCartBadge();
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCart();
  updateCartBadge();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
  showToast('🗑️ Cart cleared', 'info');
}

function saveCart() {
  localStorage.setItem('giftora_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const total = cart.reduce((acc, i) => acc + i.qty, 0);
  const badge = $('#cartBadge');
  badge.textContent = total || '';
}

function renderCart() {
  const cartItems = $('#cartItems');
  const cartFooter = $('#cartFooter');

  if (cart.length === 0) {
    cartFooter.style.display = 'none';
    cartItems.innerHTML = `
      <div class="cart-empty" id="cartEmpty">
        <div class="cart-empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <button onclick="closeCart()" class="btn btn-outline btn-sm">Start Shopping</button>
      </div>
    `;
    return;
  }

  cartFooter.style.display = 'flex';

  let subtotal = 0;
  cartItems.innerHTML = cart.map(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return '';
    subtotal += product.price * item.qty;
    return `
      <div class="cart-item">
        <img class="cart-item-img" src="${product.image}" alt="${product.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-price">₹${(product.price * item.qty).toLocaleString('en-IN')}</div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="updateQty(${product.id}, -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty(${product.id}, 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${product.id})" aria-label="Remove">✕</button>
      </div>
    `;
  }).join('');

  const shipping = subtotal >= 999 ? 0 : 79;
  const total = subtotal + shipping;

  $('#cartSubtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  $('#cartShipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
  $('#cartTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
}

/* ========== WISHLIST ========== */
function initWishlist() {
  $('#wishlistBtn').addEventListener('click', () => {
    if (wishlist.length === 0) {
      showToast('💔 Your wishlist is empty! Add some products.', 'info');
    } else {
      showToast(`❤️ You have ${wishlist.length} item${wishlist.length > 1 ? 's' : ''} in your wishlist!`, 'info');
    }
  });
}

function toggleWishlist(productId, btn) {
  const idx = wishlist.indexOf(productId);
  const product = PRODUCTS.find(p => p.id === productId);
  if (idx === -1) {
    wishlist.push(productId);
    btn.innerHTML = '❤️';
    btn.classList.add('wishlisted');
    showToast(`❤️ "${product.name}" added to wishlist!`, 'success');
  } else {
    wishlist.splice(idx, 1);
    btn.innerHTML = '🤍';
    btn.classList.remove('wishlisted');
    showToast(`💔 "${product.name}" removed from wishlist`, 'info');
  }
  localStorage.setItem('giftora_wishlist', JSON.stringify(wishlist));
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const badge = $('#wishlistBadge');
  badge.textContent = wishlist.length || '';
}

/* ========== PRODUCT MODAL ========== */
function openModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  modalProduct = product;
  modalQty = 1;
  modalColor = product.colors[0];

  const discount = Math.round(((product.original - product.price) / product.original) * 100);
  const wishlisted = wishlist.includes(product.id);

  $('#modalContent').innerHTML = `
    <div class="modal-grid">
      <div class="modal-img-wrap">
        <img src="${product.image}" alt="${product.name}" />
        ${product.label ? `<span class="product-label label-${product.label}" style="top:16px;left:16px;">${labelText(product.label)}</span>` : ''}
        ${discount > 0 ? `<span style="position:absolute;top:16px;right:16px;background:#2ecc71;color:#fff;font-size:0.72rem;font-weight:700;padding:4px 10px;border-radius:50px;">-${discount}% OFF</span>` : ''}
      </div>
      <div class="modal-info">
        <span class="modal-category">${product.categoryLabel}</span>
        <h2 class="modal-name">${product.name}</h2>
        <div class="modal-rating">
          <span class="stars">${'★'.repeat(Math.floor(product.rating))}</span>
          <span style="font-size:0.85rem;color:var(--text-muted)">${product.rating} · ${product.reviews} reviews</span>
        </div>
        <p class="modal-desc">${product.desc}</p>
        <div class="modal-price-row">
          <span class="modal-price">₹${product.price.toLocaleString('en-IN')}</span>
          ${product.original ? `<span class="modal-original">₹${product.original.toLocaleString('en-IN')}</span>` : ''}
        </div>
        ${product.customizable ? `<div style="font-size:0.82rem;color:var(--accent);background:rgba(232,160,191,0.1);border:1px solid rgba(232,160,191,0.2);border-radius:50px;padding:6px 14px;display:inline-block;">✍️ Customization available</div>` : ''}
        <div class="modal-options">
          <h4>Color / Theme</h4>
          <div class="color-options">
            ${product.colors.map((c, i) => `
              <div class="color-swatch ${i === 0 ? 'active' : ''}" 
                style="background:${c};" 
                data-color="${c}" 
                title="${c}"
                onclick="selectColor(this, '${c}')"></div>
            `).join('')}
          </div>
        </div>
        <div class="modal-qty">
          <span class="modal-qty-label">Quantity:</span>
          <div class="modal-qty-controls">
            <button class="modal-qty-btn" onclick="changeModalQty(-1)">−</button>
            <span class="modal-qty-num" id="modalQtyNum">1</span>
            <button class="modal-qty-btn" onclick="changeModalQty(1)">+</button>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="addToCartFromModal()" id="modalAddCart">
            🛍️ Add to Cart — ₹${product.price.toLocaleString('en-IN')}
          </button>
          <button class="btn btn-outline" onclick="toggleWishlistModal(${product.id})" id="modalWishlistBtn">
            ${wishlisted ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  `;

  $('#modalOverlay').classList.add('active');
  $('#productModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('#modalOverlay').classList.remove('active');
  $('#productModal').classList.remove('active');
  document.body.style.overflow = '';
}

function selectColor(el, color) {
  $$('.color-swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  modalColor = color;
}

function changeModalQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  const el = $('#modalQtyNum');
  if (el) el.textContent = modalQty;
  const btn = $('#modalAddCart');
  if (btn && modalProduct) {
    btn.textContent = `🛍️ Add to Cart — ₹${(modalProduct.price * modalQty).toLocaleString('en-IN')}`;
  }
}

function addToCartFromModal() {
  if (!modalProduct) return;
  addToCart(modalProduct.id, modalQty, modalColor);
  closeModal();
}

function toggleWishlistModal(productId) {
  const btn = $('#modalWishlistBtn');
  const idx = wishlist.indexOf(productId);
  const product = PRODUCTS.find(p => p.id === productId);
  if (idx === -1) {
    wishlist.push(productId);
    if (btn) btn.textContent = '❤️ In Wishlist';
    showToast(`❤️ "${product.name}" added to wishlist!`, 'success');
  } else {
    wishlist.splice(idx, 1);
    if (btn) btn.textContent = '🤍 Add to Wishlist';
    showToast(`💔 "${product.name}" removed from wishlist`, 'info');
  }
  localStorage.setItem('giftora_wishlist', JSON.stringify(wishlist));
  updateWishlistBadge();
  // Update product grid cards
  const gridBtn = $(`.wishlist-toggle[data-id="${productId}"]`);
  if (gridBtn) {
    gridBtn.innerHTML = idx === -1 ? '❤️' : '🤍';
    gridBtn.classList.toggle('wishlisted', idx === -1);
  }
}

$('#modalClose').addEventListener('click', closeModal);
$('#modalOverlay').addEventListener('click', closeModal);

// Expose to inline handlers
window.selectColor = selectColor;
window.changeModalQty = changeModalQty;
window.addToCartFromModal = addToCartFromModal;
window.toggleWishlistModal = toggleWishlistModal;
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;

/* ========== SEARCH ========== */
function initSearch() {
  const overlay = $('#searchOverlay');
  const input = $('#searchInput');
  const results = $('#searchResults');

  $('#searchBtn').addEventListener('click', () => {
    overlay.classList.add('active');
    setTimeout(() => input.focus(), 100);
  });

  $('#searchClose').addEventListener('click', () => overlay.classList.remove('active'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.classList.remove('active');
  });

  // Show popular tags by default
  results.innerHTML = ['Bouquets', 'Hampers', 'Keychains', 'Birthday Gifts', 'Anniversary', 'Crochet'].map(tag =>
    `<div class="search-result-item" onclick="searchFor('${tag}')">${tag}</div>`
  ).join('');

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) {
      results.innerHTML = ['Bouquets', 'Hampers', 'Keychains', 'Birthday Gifts', 'Anniversary', 'Crochet'].map(tag =>
        `<div class="search-result-item" onclick="searchFor('${tag}')">${tag}</div>`
      ).join('');
      return;
    }
    const found = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.includes(q) ||
      p.desc.toLowerCase().includes(q)
    );
    if (found.length === 0) {
      results.innerHTML = `<p style="color:var(--text-muted);padding:8px;">No results found for "${q}"</p>`;
    } else {
      results.innerHTML = found.map(p =>
        `<div class="search-result-item" onclick="searchGo(${p.id})">
          ${p.name} — <span style="color:var(--accent)">₹${p.price.toLocaleString('en-IN')}</span>
        </div>`
      ).join('');
    }
  });
}

function searchFor(tag) {
  $('#searchOverlay').classList.remove('active');
  // Map tags to filters
  const tagMap = {
    'Bouquets': 'bouquets', 'Hampers': 'hampers', 'Keychains': 'keychains',
    'Birthday Gifts': 'birthday', 'Anniversary': 'anniversary', 'Crochet': 'crochet'
  };
  const filter = tagMap[tag] || 'all';
  setFilter(filter);
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function searchGo(productId) {
  $('#searchOverlay').classList.remove('active');
  openModal(productId);
}

function setFilter(filter) {
  currentFilter = filter;
  $$('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  applyFilters();
}

window.searchFor = searchFor;
window.searchGo = searchGo;

/* ========== TESTIMONIALS CAROUSEL ========== */
function initTestimonials() {
  const track = $('#testimonialTrack');
  const dots = $('#carouselDots');
  const cards = $$('.testimonial-card');
  const total = cards.length;

  // Create dots
  dots.innerHTML = Array.from({ length: total }, (_, i) =>
    `<button class="dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Testimonial ${i+1}"></button>`
  ).join('');

  $$('.dot').forEach(dot => {
    dot.addEventListener('click', () => goToTestimonial(parseInt(dot.dataset.index)));
  });

  $('#prevBtn').addEventListener('click', () => {
    goToTestimonial((currentTestimonial - 1 + total) % total);
  });

  $('#nextBtn').addEventListener('click', () => {
    goToTestimonial((currentTestimonial + 1) % total);
  });

  // Autoplay
  testimonialAutoplay = setInterval(() => {
    goToTestimonial((currentTestimonial + 1) % total);
  }, 5000);

  // Touch support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goToTestimonial(diff > 0
        ? (currentTestimonial + 1) % total
        : (currentTestimonial - 1 + total) % total);
    }
  });
}

function goToTestimonial(index) {
  const track = $('#testimonialTrack');
  const cards = $$('.testimonial-card');
  const total = cards.length;
  currentTestimonial = index;

  // On desktop show 3, mobile show 1
  const isMobile = window.innerWidth < 768;
  const offset = isMobile ? index * 100 : index * (100 / 3);
  track.style.transform = `translateX(-${Math.min(offset, (isMobile ? (total - 1) : (total - 3)) * (100 / (isMobile ? 1 : 3)))}%)`;

  $$('.dot').forEach((dot, i) => dot.classList.toggle('active', i === index));

  // Reset autoplay
  if (testimonialAutoplay) {
    clearInterval(testimonialAutoplay);
    testimonialAutoplay = setInterval(() => {
      goToTestimonial((currentTestimonial + 1) % total);
    }, 5000);
  }
}

/* ========== CONTACT FORM ========== */
function initContactForm() {
  const form = $('#contactForm');
  const success = $('#formSuccess');
  const resetBtn = $('#resetForm');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = $('#submitBtn');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    // Simulate async send
    setTimeout(() => {
      form.style.display = 'none';
      success.style.display = 'block';
      showToast('✅ Message sent successfully!', 'success');
    }, 1500);
  });

  resetBtn.addEventListener('click', () => {
    form.style.display = 'flex';
    success.style.display = 'none';
    form.reset();
    const btn = $('#submitBtn');
    btn.innerHTML = `<span>Send Message</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>`;
    btn.disabled = false;
  });
}

/* ========== CHECKOUT / POS ========== */
function initCheckout() {
  const modal = $('#checkoutModal');
  const closeBtn = $('#checkoutClose');
  const placeOrderBtn = $('#placeOrderBtn');

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  placeOrderBtn.addEventListener('click', () => {
    const checkoutForm = $('#checkoutForm');
    if (!checkoutForm.checkValidity()) {
      checkoutForm.reportValidity();
      return;
    }
    placeOrder();
  });

  $('#closeOrderSuccess').addEventListener('click', () => {
    $('#orderSuccessOverlay').style.display = 'none';
    document.body.style.overflow = '';
    showToast('🎁 Thank you! We\'ll start crafting your gift right away!', 'success');
  });
}

function openCheckout() {
  if (cart.length === 0) {
    showToast('🛒 Your cart is empty!', 'error');
    return;
  }

  // Populate checkout summary
  const items = $('#checkoutItems');
  let subtotal = 0;
  items.innerHTML = cart.map(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return '';
    const lineTotal = product.price * item.qty;
    subtotal += lineTotal;
    return `
      <div class="checkout-item">
        <img src="${product.image}" alt="${product.name}" />
        <span class="checkout-item-name">${product.name} × ${item.qty}</span>
        <span class="checkout-item-price">₹${lineTotal.toLocaleString('en-IN')}</span>
      </div>
    `;
  }).join('');

  const shipping = subtotal >= 999 ? 0 : 79;
  const total = subtotal + shipping;
  $('#checkoutSubtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
  $('#checkoutTotal').textContent = `₹${total.toLocaleString('en-IN')}`;

  $('#checkoutModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function placeOrder() {
  const orderId = 'GFT-' + Date.now().toString(36).toUpperCase();
  $('#orderId').textContent = orderId;

  // Close checkout
  $('#checkoutModal').classList.remove('active');

  // Show success
  const overlay = $('#orderSuccessOverlay');
  overlay.style.display = 'flex';

  // Clear cart
  cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
  document.body.style.overflow = 'hidden';
}

/* ========== SCROLL ANIMATIONS ========== */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  // Add reveal classes to major sections
  const revealEls = [
    '.section-header',
    '.category-card',
    '.product-card',
    '.step-card',
    '.why-card',
    '.testimonial-card',
    '.contact-card',
    '.feature-left',
    '.feature-right',
    '.about-content',
    '.about-image',
    '.contact-form-wrapper',
    '.footer-brand',
    '.footer-links',
  ];

  revealEls.forEach(sel => {
    $$(sel).forEach((el, i) => {
      if (!el.classList.contains('reveal') && !el.classList.contains('reveal-left') && !el.classList.contains('reveal-right')) {
        el.classList.add('reveal');
        el.style.transitionDelay = `${(i % 4) * 0.1}s`;
      }
      observer.observe(el);
    });
  });
}

function triggerReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  $$('.product-card').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    observer.observe(el);
  });
}

/* ========== BACK TO TOP ========== */
function initBackToTop() {
  const btn = $('#backToTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ========== TOAST NOTIFICATIONS ========== */
function showToast(message, type = 'info') {
  const container = $('#toastContainer');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastIn 0.4s ease reverse forwards';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ========== KEYBOARD SHORTCUTS ========== */
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
    const active = document.activeElement;
    if (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA') {
      e.preventDefault();
      $('#searchOverlay').classList.add('active');
      setTimeout(() => $('#searchInput').focus(), 100);
    }
  }
  if (e.key === 'Escape') {
    $('#searchOverlay').classList.remove('active');
    closeModal();
    $('#checkoutModal').classList.remove('active');
    closeCart();
    document.body.style.overflow = '';
  }
});

/* ========== SMOOTH SCROLLING FOR ALL ANCHOR LINKS ========== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ========== CATEGORY CARD FILTER INTEGRATION ========== */
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {
    const filter = card.dataset.filter;
    if (filter) {
      setFilter(filter);
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ========== FLOATING PARTICLES (DECORATIVE) ========== */
(function initParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const particles = ['🌸', '✨', '🎀', '💫', '🌟'];
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: absolute;
      font-size: ${Math.random() * 1 + 0.6}rem;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      opacity: ${Math.random() * 0.15 + 0.05};
      animation: float-particle ${Math.random() * 8 + 8}s ease-in-out infinite;
      animation-delay: ${Math.random() * 5}s;
      pointer-events: none;
      z-index: 0;
      user-select: none;
    `;
    p.textContent = particles[Math.floor(Math.random() * particles.length)];
    hero.appendChild(p);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes float-particle {
      0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.08; }
      33% { transform: translateY(-30px) rotate(10deg); opacity: 0.15; }
      66% { transform: translateY(15px) rotate(-8deg); opacity: 0.06; }
    }
  `;
  document.head.appendChild(style);
})();

/* ========== WINDOW RESIZE ========== */
window.addEventListener('resize', () => {
  goToTestimonial(0);
});
