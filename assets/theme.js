/* ==========================================================================
   DYNAMIC SHOPIFY THEME - MAIN JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCartDrawer();
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
        <div class="cart-item-details">
          <div class="cart-item-title">${item.product_title}</div>
          ${item.variant_title ? `<div class="cart-item-variant">${item.variant_title}</div>` : ''}
          <div style="font-weight:700; margin-top:0.25rem;">${formattedPrice}</div>
          <div class="cart-item-qty">
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
