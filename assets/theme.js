/* ==========================================================================
   DYNAMIC SHOPIFY THEME - MAIN JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSearchDrawer();
  initCartDrawer();
  initAccountDrawer();
  initFilterDrawer();
  initAddToCartForms();
  initVariantSelectors();
});

/* --------------------------------------------------------------------------
   Mobile Navigation Toggle
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggleBtn = document.querySelector('[data-mobile-menu-toggle]');
  const navMenu = document.querySelector('[data-header-nav]');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
}

/* --------------------------------------------------------------------------
   Search Drawer Overlay Toggle
   -------------------------------------------------------------------------- */
function initSearchDrawer() {
  const toggleBtn = document.querySelector('[data-toggle-search]');
  const closeBtn = document.querySelector('[data-close-search]');
  const searchDrawer = document.querySelector('[data-search-drawer]');

  if (toggleBtn && searchDrawer) {
    toggleBtn.addEventListener('click', () => {
      searchDrawer.classList.toggle('active');
      if (searchDrawer.classList.contains('active')) {
        const input = searchDrawer.querySelector('input[type="search"]');
        if (input) input.focus();
      }
    });
  }

  if (closeBtn && searchDrawer) {
    closeBtn.addEventListener('click', () => {
      searchDrawer.classList.remove('active');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchDrawer && searchDrawer.classList.contains('active')) {
      searchDrawer.classList.remove('active');
    }
  });
}

/* --------------------------------------------------------------------------
   AJAX Cart Drawer Engine
   -------------------------------------------------------------------------- */
function initCartDrawer() {
  const drawerOverlay = document.querySelector('[data-cart-drawer-overlay]');
  const drawer = document.querySelector('[data-cart-drawer]');
  const openBtns = document.querySelectorAll('[data-open-cart-drawer]');
  const closeBtns = document.querySelectorAll('[data-close-cart-drawer]');

  function openDrawer() {
    if (drawerOverlay && drawer) {
      drawerOverlay.classList.add('active');
      drawer.classList.add('active');
      fetchCartAndRender();
    }
  }

  function closeDrawer() {
    if (drawerOverlay && drawer) {
      drawerOverlay.classList.remove('active');
      drawer.classList.remove('active');
    }
  }

  openBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  }));

  closeBtns.forEach(btn => btn.addEventListener('click', closeDrawer));
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  window.openCartDrawer = openDrawer;
  window.fetchCartAndRender = fetchCartAndRender;
}

/* --------------------------------------------------------------------------
   Account Drawer Toggle
   -------------------------------------------------------------------------- */
function initAccountDrawer() {
  const drawerOverlay = document.querySelector('[data-account-drawer-overlay]');
  const drawer = document.querySelector('[data-account-drawer]');
  const openBtns = document.querySelectorAll('[data-open-account-drawer]');
  const closeBtns = document.querySelectorAll('[data-close-account-drawer]');

  function openDrawer() {
    if (drawerOverlay && drawer) {
      drawerOverlay.classList.add('active');
      drawer.classList.add('active');
    }
  }

  function closeDrawer() {
    if (drawerOverlay && drawer) {
      drawerOverlay.classList.remove('active');
      drawer.classList.remove('active');
    }
  }

  openBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  }));

  closeBtns.forEach(btn => btn.addEventListener('click', closeDrawer));
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  window.openAccountDrawer = openDrawer;
  window.closeAccountDrawer = closeDrawer;
}

/* --------------------------------------------------------------------------
   Filter Drawer Toggle (Left Side)
   -------------------------------------------------------------------------- */
function initFilterDrawer() {
  const drawerOverlay = document.querySelector('[data-filter-drawer-overlay]');
  const drawer = document.querySelector('[data-filter-drawer]');
  const openBtns = document.querySelectorAll('[data-open-filter-drawer]');
  const closeBtns = document.querySelectorAll('[data-close-filter-drawer]');

  function openDrawer() {
    if (drawerOverlay && drawer) {
      drawerOverlay.classList.add('active');
      drawer.classList.add('active');
    }
  }

  function closeDrawer() {
    if (drawerOverlay && drawer) {
      drawerOverlay.classList.remove('active');
      drawer.classList.remove('active');
    }
  }

  openBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openDrawer();
  }));

  closeBtns.forEach(btn => btn.addEventListener('click', closeDrawer));
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  window.openFilterDrawer = openDrawer;
  window.closeFilterDrawer = closeDrawer;
}

async function fetchCartAndRender() {
  try {
    const response = await fetch('/cart.js');
    const cart = await response.json();
    renderCartItems(cart);
    updateCartCountBadge(cart.item_count);
  } catch (err) {
    console.error('Error fetching cart:', err);
  }
}

function renderCartItems(cart) {
  const bodyEl = document.querySelector('[data-cart-drawer-body]');
  const totalEl = document.querySelector('[data-cart-drawer-total]');
  const shippingThreshold = parseFloat(bodyEl?.dataset?.shippingThreshold || 100);

  if (!bodyEl) return;

  if (cart.item_count === 0) {
    bodyEl.innerHTML = '<div style="text-align: center; padding: 3rem 0; opacity: 0.7;"><p>Your cart is empty.</p></div>';
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  let html = '';

  // Free shipping progress calculation
  const totalAmount = cart.total_price / 100;
  if (shippingThreshold > 0) {
    const diff = shippingThreshold - totalAmount;
    if (diff <= 0) {
      html += '<div style="background:#dcfce7; color:#166534; padding:0.75rem; border-radius:8px; font-size:0.875rem; margin-bottom:1rem; text-align:center;">🎉 You unlocked <strong>FREE Shipping!</strong></div>';
    } else {
      const pct = Math.min((totalAmount / shippingThreshold) * 100, 100);
      html += `
        <div style="margin-bottom:1.25rem;">
          <div style="font-size:0.85rem; margin-bottom:0.4rem; display:flex; justify-content:space-between;">
            <span>Add $${diff.toFixed(2)} more for <strong>FREE Shipping</strong></span>
          </div>
          <div style="background:#e2e8f0; height:6px; border-radius:999px; overflow:hidden;">
            <div style="background:var(--color-accent, #2563eb); width:${pct}%; height:100%; transition:width 0.3s;"></div>
          </div>
        </div>
      `;
    }
  }

  cart.items.forEach(item => {
    const formattedPrice = '$' + (item.final_line_price / 100).toFixed(2);
    html += `
      <div class="cart-item" data-key="${item.key}">
        <img src="${item.image || ''}" alt="${item.title}" class="cart-item-img">
        <div class="cart-item-details" style="position: relative; width: 100%;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
            <div class="cart-item-title">${item.product_title}</div>
            <button type="button" class="cart-item-remove-btn" onclick="updateCartItemQty('${item.key}', 0)" aria-label="Remove item" title="Remove item" style="background: none; border: none; cursor: pointer; color: #94a3b8; padding: 0.2rem; line-height: 1; transition: color 0.2s;" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
          ${item.variant_title ? `<div class="cart-item-variant">${item.variant_title}</div>` : ''}
          <div style="font-weight:700; margin-top:0.25rem;">${formattedPrice}</div>
          <div class="cart-item-qty" style="margin-top: 0.5rem;">
            <button class="qty-btn" onclick="updateCartItemQty('${item.key}', ${item.quantity - 1})">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartItemQty('${item.key}', ${item.quantity + 1})">+</button>
          </div>
        </div>
      </div>
    `;
  });

  bodyEl.innerHTML = html;
  if (totalEl) totalEl.textContent = '$' + (cart.total_price / 100).toFixed(2);
}

function updateCartCountBadge(count) {
  const badgeEls = document.querySelectorAll('[data-cart-count]');
  badgeEls.forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

window.updateCartItemQty = async function(key, newQty) {
  if (newQty < 0) return;
  try {
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: newQty })
    });
    fetchCartAndRender();
  } catch (err) {
    console.error('Error updating quantity:', err);
  }
};

/* --------------------------------------------------------------------------
   AJAX Add to Cart Forms
   -------------------------------------------------------------------------- */
function initAddToCartForms() {
  document.addEventListener('submit', async (e) => {
    const form = e.target;
    if (form && form.matches('[data-add-to-cart-form]')) {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';
      }

      try {
        const formData = new FormData(form);
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          body: formData,
          headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });

        if (res.ok) {
          if (window.openCartDrawer) {
            window.openCartDrawer();
          } else {
            window.location.href = '/cart';
          }
        }
      } catch (err) {
        console.error('Error adding to cart:', err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    }
  });
}

/* --------------------------------------------------------------------------
   Product Variant Selector Listener
   -------------------------------------------------------------------------- */
function initVariantSelectors() {
  const variantSelect = document.querySelector('[data-variant-select]');
  if (variantSelect) {
    variantSelect.addEventListener('change', (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      const price = selectedOption.dataset.price;
      const comparePrice = selectedOption.dataset.comparePrice;
      const imageSrc = selectedOption.dataset.image;

      const priceEl = document.querySelector('[data-product-price]');
      const compareEl = document.querySelector('[data-product-compare-price]');
      const mainImg = document.querySelector('[data-main-product-image]');

      if (priceEl && price) priceEl.textContent = price;
      if (compareEl && comparePrice) compareEl.textContent = comparePrice;
      if (mainImg && imageSrc) mainImg.src = imageSrc;
    });
  }
}
